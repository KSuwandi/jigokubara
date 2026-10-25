import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  collection,
  collectionGroup,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  doc,
  increment,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import { useAuth } from "../contexts/AuthContext";

import { db } from "../services/firebase/config";

export default function FinanceApprovalPage() {

  const { user, role } =
    useAuth();

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [filter, setFilter] =
    useState("Semua");

  // =====================================
  // GET ALL PENDING
  // =====================================
  useEffect(() => {

    if (
      !user ||
      role !== "Oyabun"
    ) {
      return;
    }

    const q = query(
      collectionGroup(
        db,
        "finance"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {

          const data =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ref:
                  doc.ref,
                ...doc.data(),
              })
            );

          setTransactions(
            data.filter(
              (item) =>
                item.status ===
                "Pending"
            )
          );
        }
      );

    return () =>
      unsubscribe();

  }, [
    user,
    role,
  ]);

  // =====================================
  // FILTERED DATA
  // =====================================
  const filteredTransactions =
    useMemo(() => {

      if (
        filter === "Semua"
      ) {
        return transactions;
      }

      return transactions.filter(
        (item) =>
          item.type ===
            filter ||
          item.paymentType ===
            filter ||
          item.moneyType ===
            filter
      );

    }, [
      transactions,
      filter,
    ]);

 // =====================================
// APPROVE
// =====================================
const approveTransaction =
  async (ref) => {

    let financeData = null;

    try {

      await runTransaction(
        db,
        async (transaction) => {

          const financeDoc =
            await transaction.get(
              ref
            );

          if (
            !financeDoc.exists()
          ) {
            throw new Error(
              "Transaction not found"
            );
          }

          financeData =
            financeDoc.data();

            financeData = financeDoc.data();

console.log(
  "FINANCE DATA:",
  financeData
);

// =====================================
// AUTO TAMBAH INVENTORY
// =====================================

if (
  financeData.type === "Deposit" &&
  financeData.inventoryItemId
) {

  const inventoryRef = doc(
    db,
    "inventory",
    financeData.inventoryItemId
  );

  console.log(
  "QTY",
  financeData.quantity
);

  transaction.update(
    inventoryRef,
    {
      stock: increment(
        Number(
          financeData.quantity || 1
        )
      ),
    }
  );

}

          if (
            financeData.status !==
            "Pending"
          ) {
            throw new Error(
              "Transaction already processed"
            );
          }

          transaction.update(
            ref,
            {
              status:
                "Approved",

              approvedBy:
                user.rpName,

              approvedByUid:
                user.uid,

              approvedAt:
                serverTimestamp(),
            }
          );

          const financeLogRef =
            collection(
              db,
              "finance_logs"
            );

         transaction.set(
  doc(financeLogRef),
  {
    type: "finance",

    action: "Approved",

    requesterName:
      financeData.createdBy,

    rpName:
      user.rpName,

    role:
      financeData.role || "",

    transactionTitle:
      financeData.title,

    transactionType:
      financeData.type,

    paymentType:
      financeData.paymentType,

    moneyType:
      financeData.moneyType,

    amount:
      financeData.amount,

    imageUrl:
      financeData.imageUrl || "",

    status:
      "Approved",

    createdAt:
      serverTimestamp(),
  }
);
        }
      );


      toast.success(
        "Transaksi berhasil di approve"
      );

    } catch (error) {

      console.error(
        error
      );

      toast.error(
        error.message ||
        "Gagal approve transaksi"
      );
    }
  };

  // =====================================
// REJECT
// =====================================
const rejectTransaction =
  async (ref) => {

    let financeData = null;

    try {

      await runTransaction(
        db,
        async (transaction) => {

          const financeDoc =
            await transaction.get(
              ref
            );

          if (
            !financeDoc.exists()
          ) {
            throw new Error(
              "Transaction not found"
            );
          }

          financeData =
            financeDoc.data();

            financeData = financeDoc.data();

console.log(
  "FINANCE DATA:",
  financeData
);

          if (
            financeData.status !==
            "Pending"
          ) {
            throw new Error(
              "Transaction already processed"
            );
          }

          transaction.update(
            ref,
            {
              status:
                "Rejected",

              rejectedBy:
                user.rpName,

              rejectedByUid:
                user.uid,

              rejectedAt:
                serverTimestamp(),
            }
          );

          const financeLogRef =
            collection(
              db,
              "finance_logs"
            );

          transaction.set(
  doc(financeLogRef),
  {
    type: "finance",

  action: "Rejected",

  requesterName:
    financeData.createdBy,

  rpName:
    user.rpName,

  role:
    financeData.role || "",

  transactionTitle:
    financeData.title,

  transactionType:
    financeData.type,

  paymentType:
    financeData.paymentType,

  moneyType:
    financeData.moneyType,

  amount:
    financeData.amount,

  imageUrl:
    financeData.imageUrl || "",

  status:
    "Rejected",


    createdAt:
      serverTimestamp(),
  }
);
        }
      );

      toast.success(
        "Transaksi berhasil ditolak"
      );

    } catch (error) {

      console.error(
        error
      );

      toast.error(
        error.message ||
        "Gagal reject transaksi"
      );
    }
  };

  // =====================================
  // ACCESS DENIED
  // =====================================
  if (
    role !== "Oyabun"
  ) {

    return (

      <AppLayout>

        <div className="flex items-center justify-center min-h-[70vh]">

          <div className="bg-[#111111] border border-red-500/20 rounded-3xl p-10 text-center text-white">

            <h1 className="text-4xl font-bold text-red-400">
              ACCESS DENIED
            </h1>

            <p className="text-gray-400 mt-4">
              Hanya Oyabun yang dapat mengakses halaman approval finance
            </p>

          </div>

        </div>

      </AppLayout>
    );
  }

  return (

    <AppLayout>

      <div className="text-white w-full">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>

            <h1 className="text-4xl font-bold">
              Finance Approval
            </h1>

            <p className="text-gray-400 mt-2">
              Approval transaksi keuangan & pembayaran hutang user
            </p>

          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-6 py-4">

            <p className="text-sm text-gray-400">
              Total Pending
            </p>

            <h2 className="text-3xl font-bold text-yellow-300 mt-1">
              {
                filteredTransactions.length
              }
            </h2>

          </div>

        </div>

        {/* FILTER */}
        <div className="flex flex-wrap gap-3 mb-8">

          {[
            "Semua",
            "Pemasukan",
            "Pengeluaran",
            "Pembayaran Hutang",
            "Cash",
            "Hutang",
            "Uang Putih",
            "Uang Merah",
          ].map((type) => (

            <button
              key={type}
              onClick={() =>
                setFilter(type)
              }
              className={`px-5 py-3 rounded-2xl border transition-all ${
                filter === type
                  ? "bg-[#7A0019] border-[#7A0019]"
                  : "bg-[#111111] border-gray-700 hover:border-[#7A0019]/50"
              }`}
            >
              {type}
            </button>

          ))}

        </div>

        {/* TRANSACTIONS */}
        <div className="space-y-5">

          {filteredTransactions.map(
            (item) => (

              <div
                key={item.id}
                className="bg-[#111111] border border-yellow-500/20 rounded-3xl p-6"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  {/* LEFT */}
                  <div>

                    <div className="flex items-center gap-3 flex-wrap">

                      <h2 className="text-2xl font-bold">
                        {
                          item.title
                        }
                      </h2>

                      {/* TYPE */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.type ===
                          "Pemasukan"
                            ? "bg-green-500/20 text-green-300"
                            : item.type ===
                              "Pembayaran Hutang"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {
                          item.type
                        }
                      </span>

                      {/* STATUS */}
                      <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
                        Pending
                      </span>

                    </div>

                    {/* NOTE */}
                    <p className="text-gray-400 mt-3">
                      {item.note ||
                        "Tidak ada catatan"}
                    </p>

                    {item.imageUrl && (

  <img
    src={item.imageUrl}
    alt="Bukti"
    loading="lazy"
    className="
      mt-4
      w-72
      rounded-2xl
      border
      border-purple-500/30
      object-cover
    "
  />

)}
                    
                    {/* DEBT INFO */}
{item.isDebtPayment && (

  <div className="mt-4 bg-black rounded-2xl p-4 border border-yellow-500/20">

    <p className="text-sm text-gray-400">
      Total Hutang Sebelum
    </p>

    <h3 className="text-xl font-bold text-yellow-300 mt-1">
      Rp{" "}
      {Number(
        item.previousDebt || 0
      ).toLocaleString(
        "id-ID"
      )}
    </h3>

    <p className="text-sm text-gray-400 mt-4">
      Sisa Hutang Setelah Dibayar
    </p>

    <h3 className="text-xl font-bold text-green-400 mt-1">
      Rp{" "}
      {Number(
        item.remainingDebt || 0
      ).toLocaleString(
        "id-ID"
      )}
    </h3>

  </div>

)}




                    {/* TAGS */}
                    <div className="flex flex-wrap gap-3 mt-4">

                      {/* PAYMENT TYPE */}
                      <span className="bg-black px-4 py-2 rounded-xl text-sm text-gray-300">
                        {
                          item.paymentType
                        }
                      </span>

                      {/* MONEY TYPE */}
                      <span className="bg-black px-4 py-2 rounded-xl text-sm text-gray-300">
                        {
                          item.moneyType
                        }
                      </span>

                      {/* CREATED BY */}
                      <span className="bg-black px-4 py-2 rounded-xl text-sm text-gray-300">
                        By{" "}
                        {
                          item.createdBy
                        }
                      </span>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-end gap-4">

                    {/* AMOUNT */}
                    <h3
                      className={`text-4xl font-bold ${
                        item.type ===
                        "Pemasukan"
                          ? "text-green-400"
                          : item.type ===
                            "Pembayaran Hutang"
                          ? "text-yellow-300"
                          : "text-red-400"
                      }`}
                    >
                      {item.type ===
                      "Pemasukan"
                        ? "+"
                        : "-"}
                      Rp{" "}
                      {Number(
                        item.amount
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </h3>

                    {/* BUTTONS */}
                    <div className="flex gap-3 flex-wrap">

                      <button
  onClick={() =>
    approveTransaction(
      item.ref
    )
  }
  className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-2xl font-semibold transition-all"
>
  Approve
</button>

                      {/* REJECT */}
                      <button
                        onClick={() =>
                          rejectTransaction(
                            item.ref
                          )
                        }
                        className="bg-red-700 hover:bg-red-800 px-5 py-3 rounded-2xl font-semibold transition-all"
                      >
                        Reject
                      </button>

                    </div>

                  </div>

                </div>

              </div>
            )
          )}

          {/* EMPTY */}
          {filteredTransactions.length ===
            0 && (

            <div className="bg-[#111111] border border-dashed border-gray-700 rounded-3xl p-10 text-center text-gray-400">

              Tidak ada transaksi pending

            </div>

          )}

        </div>

      </div>

    </AppLayout>
  );
}