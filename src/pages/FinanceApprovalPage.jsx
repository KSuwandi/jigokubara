import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  collection,
  collectionGroup,
  onSnapshot,
  where,
  query,
  runTransaction,
  serverTimestamp,
  doc,
  increment,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../services/firebase/config";

// =====================================
// HELPERS
// =====================================
const normalizeItemName = (value = "") =>
  String(value)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");

const getUnitsPerPackage = (item = {}) => {
  if (Number(item.unitsPerPackage) > 0) {
    return Number(item.unitsPerPackage);
  }

  const name = normalizeItemName(
    item.priceTitle || item.itemName || item.name || ""
  );

  const packageMultipliers = {
    [normalizeItemName("PELURU 9MM")]: 150,
    [normalizeItemName("PELURU .44 (MAGNUM)")]: 50,
    [normalizeItemName("PELURU Double Action")]: 50,
  };

  return packageMultipliers[name] || 1;
};

const getWithdrawItems = (transactionData = {}) => {
  const items = transactionData.withdrawItems || transactionData.items || [];
  return Array.isArray(items) ? items : [];
};

const getInventoryQuantity = (item = {}) => {
  if (item.inventoryQuantity !== undefined && item.inventoryQuantity !== null) {
    return Number(item.inventoryQuantity);
  }

  return Number(item.quantity || 0) * getUnitsPerPackage(item);
};

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("id-ID");

const formatDate = (timestamp) => {
  if (!timestamp) return "Tanggal tidak tersedia";

  const date = timestamp?.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function FinanceApprovalPage() {
  const { user, role } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [processingIds, setProcessingIds] = useState([]);

  // =====================================
  // GET ALL PENDING
  // =====================================
  useEffect(() => {
    if (!user || role !== "Oyabun") return undefined;

    const q = query(
      collectionGroup(db, "finance"),
      where("status", "==", "Pending")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((financeDoc) => ({
          id: financeDoc.id,
          ref: financeDoc.ref,
          ...financeDoc.data(),
        }));

        // Urutkan di client agar query cukup memakai satu filter dan tidak
        // memerlukan composite index tambahan.
        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds ?? (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
          const bTime = b.createdAt?.seconds ?? (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
          return bTime - aTime;
        });

        setTransactions(data);
      },
      (error) => {
        console.error("Gagal mengambil transaksi finance:", error);
        toast.error("Gagal memuat transaksi approval");
      }
    );

    return () => unsubscribe();
  }, [user, role]);

  // =====================================
  // FILTERED DATA
  // =====================================
  const filteredTransactions = useMemo(() => {
    if (filter === "Semua") return transactions;

    return transactions.filter(
      (item) =>
        item.type === filter ||
        item.paymentType === filter ||
        item.moneyType === filter
    );
  }, [transactions, filter]);

  // =====================================
  // APPROVE
  // =====================================
  const approveTransaction = async (ref, transactionId) => {
    if (!ref) {
      toast.error("Referensi transaksi tidak ditemukan");
      return;
    }

    setProcessingIds((previous) => [...previous, transactionId]);

    try {
      await runTransaction(db, async (transaction) => {
        const financeDoc = await transaction.get(ref);

        if (!financeDoc.exists()) {
          throw new Error("Transaksi tidak ditemukan");
        }

        const financeData = financeDoc.data();

        if (financeData.status !== "Pending") {
          throw new Error("Transaksi sudah diproses");
        }

        // Semua pembacaan inventory dilakukan sebelum penulisan transaksi.
        let inventoryUpdates = [];

        if (
          financeData.type === "Withdraw" &&
          getWithdrawItems(financeData).length > 0
        ) {
          const quantityByInventoryId = new Map();
          const itemNameByInventoryId = new Map();

          for (const withdrawItem of getWithdrawItems(financeData)) {
            const inventoryId =
              withdrawItem.itemId || withdrawItem.inventoryItemId;
            const quantity = getInventoryQuantity(withdrawItem);

            if (!inventoryId) {
              throw new Error(
                `ID inventory tidak tersedia untuk ${withdrawItem.itemName || "barang withdraw"}`
              );
            }

            if (!Number.isFinite(quantity) || quantity <= 0) {
              throw new Error(
                `Jumlah withdraw tidak valid untuk ${withdrawItem.itemName || "barang"}`
              );
            }

            quantityByInventoryId.set(
              inventoryId,
              (quantityByInventoryId.get(inventoryId) || 0) + quantity
            );
            itemNameByInventoryId.set(
              inventoryId,
              withdrawItem.itemName || withdrawItem.name || "Barang"
            );
          }

          for (const [inventoryId, quantity] of quantityByInventoryId) {
            const inventoryRef = doc(db, "inventory", inventoryId);
            const inventoryDoc = await transaction.get(inventoryRef);

            if (!inventoryDoc.exists()) {
              throw new Error(
                `Barang ${itemNameByInventoryId.get(inventoryId)} tidak ditemukan di inventory`
              );
            }

            const currentStock = Number(inventoryDoc.data().stock || 0);

            if (currentStock < quantity) {
              throw new Error(
                `Stok ${itemNameByInventoryId.get(inventoryId)} tidak cukup. Tersedia ${formatNumber(currentStock)}, dibutuhkan ${formatNumber(quantity)}.`
              );
            }

            inventoryUpdates.push({ ref: inventoryRef, quantity });
          }
        }

        // Deposit: tambah stok inventory.
        if (
          financeData.type === "Deposit" &&
          financeData.inventoryItemId
        ) {
          const inventoryRef = doc(
            db,
            "inventory",
            financeData.inventoryItemId
          );

          // Deposit inventory juga dibaca sebelum penulisan agar transaksi konsisten.
          const inventoryDoc = await transaction.get(inventoryRef);
          if (!inventoryDoc.exists()) {
            throw new Error("Barang inventory untuk deposit tidak ditemukan");
          }

          inventoryUpdates.push({
            ref: inventoryRef,
            quantity: -Number(financeData.quantity || 1),
            isDeposit: true,
          });
        }

        // Tulis perubahan stok setelah seluruh pembacaan selesai.
        for (const update of inventoryUpdates) {
          if (update.isDeposit) {
            transaction.update(update.ref, {
              stock: increment(Math.abs(update.quantity)),
            });
          } else {
            transaction.update(update.ref, {
              stock: increment(-update.quantity),
            });
          }
        }

        transaction.update(ref, {
          status: "Approved",
          approvedBy: user?.rpName || user?.displayName || "Oyabun",
          approvedByUid: user?.uid || "",
          approvedAt: serverTimestamp(),
        });

        const financeLogRef = doc(collection(db, "finance_logs"));
        transaction.set(financeLogRef, {
          type: "finance",
          action: "Approved",
          requesterName:
            financeData.createdBy || financeData.requesterName || "",
          rpName: user?.rpName || user?.displayName || "",
          role: financeData.role || "",
          transactionTitle: financeData.title || "",
          transactionType: financeData.type || "",
          paymentType: financeData.paymentType || "",
          moneyType: financeData.moneyType || "",
          amount: Number(financeData.amount || 0),
          imageUrl: financeData.imageUrl || "",
          items: getWithdrawItems(financeData),
          note: financeData.note || "",
          status: "Approved",
          createdAt: serverTimestamp(),
        });
      });

      toast.success("Transaksi berhasil di-approve");
    } catch (error) {
      console.error("Gagal approve transaksi:", error);
      toast.error(error.message || "Gagal approve transaksi");
    } finally {
      setProcessingIds((previous) =>
        previous.filter((id) => id !== transactionId)
      );
    }
  };

  // =====================================
  // REJECT
  // =====================================
  const rejectTransaction = async (ref, transactionId) => {
    if (!ref) {
      toast.error("Referensi transaksi tidak ditemukan");
      return;
    }

    setProcessingIds((previous) => [...previous, transactionId]);

    try {
      await runTransaction(db, async (transaction) => {
        const financeDoc = await transaction.get(ref);

        if (!financeDoc.exists()) {
          throw new Error("Transaksi tidak ditemukan");
        }

        const financeData = financeDoc.data();

        if (financeData.status !== "Pending") {
          throw new Error("Transaksi sudah diproses");
        }

        transaction.update(ref, {
          status: "Rejected",
          rejectedBy: user?.rpName || user?.displayName || "Oyabun",
          rejectedByUid: user?.uid || "",
          rejectedAt: serverTimestamp(),
        });

        const financeLogRef = doc(collection(db, "finance_logs"));
        transaction.set(financeLogRef, {
          type: "finance",
          action: "Rejected",
          requesterName:
            financeData.createdBy || financeData.requesterName || "",
          rpName: user?.rpName || user?.displayName || "",
          role: financeData.role || "",
          transactionTitle: financeData.title || "",
          transactionType: financeData.type || "",
          paymentType: financeData.paymentType || "",
          moneyType: financeData.moneyType || "",
          amount: Number(financeData.amount || 0),
          imageUrl: financeData.imageUrl || "",
          items: getWithdrawItems(financeData),
          note: financeData.note || "",
          status: "Rejected",
          createdAt: serverTimestamp(),
        });
      });

      toast.success("Transaksi berhasil ditolak");
    } catch (error) {
      console.error("Gagal reject transaksi:", error);
      toast.error(error.message || "Gagal reject transaksi");
    } finally {
      setProcessingIds((previous) =>
        previous.filter((id) => id !== transactionId)
      );
    }
  };

  // =====================================
  // ACCESS DENIED
  // =====================================
  if (role !== "Oyabun") {
    return (
      <AppLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="rounded-3xl border border-purple-500/20 bg-[#111111] p-10 text-center text-white">
            <h1 className="text-4xl font-bold text-purple-400">
              ACCESS DENIED
            </h1>
            <p className="mt-4 text-gray-400">
              Hanya Oyabun yang dapat mengakses halaman approval finance.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full text-white">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-400">
              JIGOKUBARA • MANAGEMENT
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Finance <span className="text-purple-400">Approval</span>
            </h1>
            <p className="mt-2 text-gray-400">
              Periksa transaksi, barang withdraw, dan pengajuan member sebelum menyetujui.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-950/50 to-[#111111] px-6 py-4">
            <p className="text-sm text-gray-400">Total Pending</p>
            <h2 className="mt-1 text-3xl font-black text-fuchsia-300">
              {filteredTransactions.length}
            </h2>
          </div>
        </div>

        {/* FILTER */}
        <div className="mb-8 flex flex-wrap gap-3">
          {[
            "Semua",
            "Pemasukan",
            "Pengeluaran",
            "Pembayaran Hutang",
            "Deposit",
            "Withdraw",
            "Cash",
            "Hutang",
            "Uang Putih",
            "Uang Merah",
          ].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                filter === type
                  ? "border-purple-500 bg-purple-600/30 text-white shadow-lg shadow-purple-950/30"
                  : "border-gray-800 bg-[#111111] text-gray-400 hover:border-purple-500/50 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* TRANSACTIONS */}
        <div className="space-y-5">
          {filteredTransactions.map((item) => {
            const isWithdraw = item.type === "Withdraw";
            const withdrawItems = getWithdrawItems(item);
            const isProcessing = processingIds.includes(item.id);

            return (
              <article
                key={`${item.ref?.path || "finance"}-${item.id}`}
                className={`overflow-hidden rounded-3xl border bg-[#111111] shadow-xl shadow-black/10 ${
                  isWithdraw
                    ? "border-purple-500/30"
                    : "border-purple-500/15"
                }`}
              >
                {/* TRANSACTION TOP */}
                <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="break-words text-xl font-bold sm:text-2xl">
                        {item.title ||
                          (isWithdraw ? "Pengambilan Barang" : "Transaksi Finance")}
                      </h2>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${
                          isWithdraw
                            ? "border-purple-500/30 bg-purple-500/15 text-fuchsia-300"
                            : item.type === "Deposit" || item.type === "Pemasukan"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                        }`}
                      >
                        {item.type || "Finance"}
                      </span>

                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                        Pending
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      {formatDate(item.createdAt)}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-gray-400">
                      {item.note || "Tidak ada catatan dari pemohon."}
                    </p>

                    {/* WITHDRAW DETAILS */}
                    {isWithdraw && (
                      <section className="mt-5 overflow-hidden rounded-2xl border border-purple-500/25 bg-gradient-to-br from-[#1B1029] via-[#111111] to-[#09090B]">
                        <div className="flex flex-col gap-4 border-b border-purple-500/15 bg-purple-500/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-300">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="23"
                                height="23"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m21 16-9 5-9-5V8l9-5 9 5z" />
                                <path d="m3.3 7.5 8.7 5 8.7-5" />
                                <path d="M12 22V12.5" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400">
                                Withdraw Request
                              </p>
                              <h3 className="mt-1 text-lg font-bold text-white">
                                Detail Barang Diambil
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-5 rounded-xl border border-purple-500/20 bg-black/30 px-4 py-3 sm:min-w-[145px]">
                            <div>
                              <p className="text-xs text-gray-500">Jenis barang</p>
                              <p className="mt-1 text-2xl font-black text-white">
                                {withdrawItems.length}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Total qty</p>
                              <p className="mt-1 text-2xl font-black text-fuchsia-300">
                                {formatNumber(
                                  withdrawItems.reduce(
                                    (total, barang) =>
                                      total + Number(barang.quantity || 0),
                                    0
                                  )
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 p-4 sm:p-5">
                          {withdrawItems.length > 0 ? (
                            withdrawItems.map((barang, index) => {
                              const quantity = Number(barang.quantity || 0);
                              const unitsPerPackage = getUnitsPerPackage(barang);
                              const inventoryQuantity = getInventoryQuantity(barang);
                              const itemName =
                                barang.itemName ||
                                barang.name ||
                                barang.priceTitle ||
                                "Barang tanpa nama";

                              return (
                                <div
                                  key={`${barang.itemId || barang.inventoryItemId || itemName}-${index}`}
                                  className="flex flex-col gap-3 rounded-xl border border-white/5 bg-black/30 p-4 transition-colors hover:border-purple-500/25 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div className="flex min-w-0 items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-sm font-black text-fuchsia-300">
                                      {String(index + 1).padStart(2, "0")}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="break-words font-semibold text-white">
                                        {itemName}
                                      </p>
                                      <p className="mt-1 break-all text-xs text-gray-500">
                                        Inventory ID: {barang.itemId || barang.inventoryItemId || "Tidak tersedia"}
                                      </p>
                                      {unitsPerPackage > 1 && (
                                        <p className="mt-1 text-xs text-fuchsia-300">
                                          {formatNumber(unitsPerPackage)} pcs per paket
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 items-center justify-between gap-4 rounded-xl border border-purple-500/15 bg-purple-500/5 px-4 py-3 sm:min-w-[135px] sm:flex-col sm:items-end sm:gap-1">
                                    <span className="text-xs text-gray-400">
                                      Jumlah diambil
                                    </span>
                                    <span className="text-xl font-black text-fuchsia-300">
                                      ×{formatNumber(quantity)}
                                    </span>
                                    {unitsPerPackage > 1 && (
                                      <span className="text-xs text-gray-400">
                                        {formatNumber(inventoryQuantity)} pcs total
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="rounded-xl border border-dashed border-purple-500/25 px-4 py-8 text-center">
                              <p className="font-semibold text-gray-300">
                                Detail barang belum tersedia
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                Transaksi ini tidak memiliki daftar withdrawItems atau items.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 border-t border-purple-500/15 bg-black/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-gray-500">
                              Diajukan oleh
                            </p>
                            <p className="mt-1 font-semibold text-white">
                              {item.createdBy || item.requesterName || item.rpName || "Nama tidak tersedia"}
                            </p>
                            {item.role && (
                              <p className="mt-1 text-xs text-gray-500">
                                Role: {item.role}
                              </p>
                            )}
                          </div>
                          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 sm:text-right">
                            <p className="text-xs text-gray-500">Total jumlah paket/unit</p>
                            <p className="mt-1 text-2xl font-black text-fuchsia-300">
                              {formatNumber(
                                withdrawItems.reduce(
                                  (total, barang) => total + Number(barang.quantity || 0),
                                  0
                                )
                              )}
                            </p>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* OPTIONAL RECEIPT */}
                    {item.imageUrl && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Bukti transaksi
                        </p>
                        <a href={item.imageUrl} target="_blank" rel="noreferrer">
                          <img
                            src={item.imageUrl}
                            alt="Bukti transaksi"
                            loading="lazy"
                            className="max-h-72 w-full max-w-sm rounded-2xl border border-purple-500/20 object-cover transition-opacity hover:opacity-90"
                          />
                        </a>
                      </div>
                    )}

                    {/* TAGS */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.paymentType && (
                        <span className="rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-xs text-gray-300">
                          {item.paymentType}
                        </span>
                      )}
                      {item.moneyType && (
                        <span className="rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-xs text-gray-300">
                          {item.moneyType}
                        </span>
                      )}
                      {!isWithdraw && (
                        <span className="rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-xs text-gray-300">
                          By {item.createdBy || item.requesterName || "Tidak diketahui"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex shrink-0 flex-col gap-4 lg:w-[230px] lg:items-end">
                    {!isWithdraw && (
                      <div className="lg:text-right">
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Nominal transaksi
                        </p>
                        <h3
                          className={`mt-1 text-3xl font-black ${
                            item.type === "Pemasukan" || item.type === "Deposit"
                              ? "text-emerald-400"
                              : item.type === "Pembayaran Hutang"
                              ? "text-yellow-300"
                              : "text-fuchsia-300"
                          }`}
                        >
                          Rp {formatNumber(item.amount)}
                        </h3>
                      </div>
                    )}

                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:flex-col">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => approveTransaction(item.ref, item.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-3 font-bold text-white shadow-lg shadow-purple-950/30 transition-all hover:from-purple-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? "Memproses..." : "✓ Approve"}
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => rejectTransaction(item.ref, item.id)}
                        className="inline-flex items-center justify-center rounded-xl border border-red-500/25 bg-red-500/5 px-5 py-3 font-semibold text-red-300 transition-all hover:border-red-500/40 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {filteredTransactions.length === 0 && (
            <div className="rounded-3xl border border-dashed border-purple-500/20 bg-[#111111] p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-2xl text-fuchsia-300">
                ◇
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">
                Tidak ada transaksi pending
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Pengajuan baru akan muncul di halaman ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}