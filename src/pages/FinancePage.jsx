import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  limit,
  getDocs,
  startAfter,
  where,
  increment,
  runTransaction,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";
import imageCompression from "browser-image-compression";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../services/firebase/config";
import { getCachedInventory, invalidateInventoryCache } from "../services/firebase/inventoryCache";


const PRICE_LIST = [

  // =========================
  // SENJATA
  // =========================

  {
    category: "Senjata",
    title: "Peluru 9mm",
    merah: 150000,
    putih: 150000,
  },

  {
    category: "Senjata",
    title: "Peluru .44 Magnum",
    merah: 70000,
    putih: 70000,
  },

  {
    category: "Senjata",
    title: "Peluru Double Action",
    merah: 75000,
    putih: 75000,
  },

  {
    category: "Senjata",
    title: "Medium Armor",
    merah: 130000,
    putih: 105000,
  },

  {
    category: "Senjata",
    title: "Combat",
    merah: 160000,
    putih: 130000,
  },

  {
    category: "Senjata",
    title: "SMG MK2",
    merah: 460000,
    putih: 370000,
  },

  {
    category: "Senjata",
    title: "MINI SMG",
    merah: 410000,
    putih: 330000,
  },

  {
    category: "Senjata",
    title: "Python",
    merah: 360000,
    putih: 290000,
  },

  {
    category: "Senjata",
    title: "AK-47",
    merah: 610000,
    putih: 460000,
  },

  {
    category: "Senjata",
    title: "Heavy Sniper",
    merah: 1300000,
    putih: 1050000,
  },

  {
    category: "Senjata",
    title: "Double Action",
    merah: 450000,
    putih: 370000,
  },

  {
    category: "Senjata",
    title: "WM",
    merah: 110000,
    putih: 90000,
  },


];

export default function FinancePage() {

  const { user, role } =
    useAuth();

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [
  inventoryItems,
  setInventoryItems,
] = useState([]);

const [
  showInventoryDropdown,
  setShowInventoryDropdown,
] = useState(false);

const [
  inventorySearch,
  setInventorySearch,
] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
  useState(false);

  const [filter, setFilter] =
    useState("Semua");

  const [
    showWeaponPriceList,
    setShowWeaponPriceList,
  ] = useState(false);

  const [
    showDisnakerPriceList,
    setShowDisnakerPriceList,
  ] = useState(false);

  const currentPageLimit = 5;

  const [lastDoc, setLastDoc] =
  useState(null);

const [firstLoading, setFirstLoading] =
  useState(true);

const [hasMore, setHasMore] =
  useState(true);

  const [loadingMore, setLoadingMore] =
  useState(false);

 const [form, setForm] =
useState({
  type: "Deposit",
  paymentType: "Cash",
  moneyType: "Uang Putih",

  inventoryItemId: "",
  quantity: 1,

  title: "",
  amount: "",
  note: "",
  imageUrl: "",
});

  const [selectedPriceItem, setSelectedPriceItem] =
  useState("");

  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [priceSearch, setPriceSearch] = useState("");

  const [selectedPriceQuantity, setSelectedPriceQuantity] =
    useState(1);

  const [withdrawCart, setWithdrawCart] =
    useState([]);

  const withdrawCartTotal = useMemo(
    () => withdrawCart.reduce(
      (total, item) => total + Number(item.unitPrice || 0) * Number(item.quantity || 0),
      0
    ),
    [withdrawCart]
  );

  const normalizeItemName = (value = "") =>
    value.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

  const findInventoryMatch = (priceTitle) => {
    const normalizedTitle = normalizeItemName(priceTitle);
    return inventoryItems.find(
      (inventoryItem) => normalizeItemName(inventoryItem.name) === normalizedTitle
    );
  };

  // Jumlah unit fisik yang dipotong dari inventory untuk setiap paket pricelist.
  // Barang selain peluru tetap menggunakan rasio 1:1.
  const getUnitsPerPackage = (priceTitle) => {
    const normalizedTitle = normalizeItemName(priceTitle);
    const packageMultipliers = {
      [normalizeItemName("PELURU 9MM")]: 150,
      [normalizeItemName("PELURU .44 (MAGNUM)")]: 50,
      [normalizeItemName("PELURU Double Action")]: 50,
    };
    return packageMultipliers[normalizedTitle] || 1;
  };

  const handleAddWithdrawItem = () => {
    const priceItem = PRICE_LIST.find((item) => item.title === selectedPriceItem);
    const quantity = Number(selectedPriceQuantity);
    // Inventory dipetakan otomatis berdasarkan nama barang; pengguna tidak perlu memilih inventory manual.
    const inventoryItem = findInventoryMatch(priceItem?.title || selectedPriceItem);

    if (!priceItem) {
      toast.error("Pilih barang dari pricelist terlebih dahulu");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      toast.error("Jumlah barang minimal 1 dan harus berupa angka bulat");
      return;
    }

    if (!inventoryItem) {
      toast.error("Barang ini belum cocok dengan nama di inventory. Samakan nama barang di inventory agar stok bisa dipotong otomatis.");
      return;
    }

    const unitPrice = form.moneyType === "Uang Merah" ? priceItem.merah : priceItem.putih;
    const unitsPerPackage = getUnitsPerPackage(priceItem.title);
    const alreadyAdded = withdrawCart.find((item) => item.priceTitle === priceItem.title);
    const requestedQuantity = quantity + Number(alreadyAdded?.quantity || 0);
    const requestedInventoryUnits = requestedQuantity * unitsPerPackage;

    if (alreadyAdded && alreadyAdded.inventoryItemId !== inventoryItem.id) {
      toast.error("Barang pricelist ini sudah ada di keranjang dengan mapping inventory berbeda");
      return;
    }

    if (Number(inventoryItem.stock || 0) < requestedInventoryUnits) {
      toast.error(
        `Stok ${inventoryItem.name} tidak cukup. Dibutuhkan: ${requestedInventoryUnits} pcs, tersedia: ${Number(inventoryItem.stock || 0)} pcs`
      );
      return;
    }

    if (alreadyAdded) {
      setWithdrawCart((previous) => previous.map((item) => {
        if (item.priceTitle !== priceItem.title) return item;
        const newQuantity = Number(item.quantity || 0) + quantity;
        return {
          ...item,
          quantity: newQuantity,
          unitsPerPackage,
          inventoryQuantity: newQuantity * unitsPerPackage,
          lineTotal: unitPrice * newQuantity,
        };
      }));
    } else {
      setWithdrawCart((previous) => [
        ...previous,
        {
          priceTitle: priceItem.title,
          itemName: inventoryItem.name,
          inventoryItemId: inventoryItem.id,
          quantity,
          unitsPerPackage,
          inventoryQuantity: quantity * unitsPerPackage,
          unitPrice,
          lineTotal: unitPrice * quantity,
        },
      ]);
    }

    setSelectedPriceQuantity(1);
    setSelectedPriceItem("");
    setShowPriceDropdown(false);
    setPriceSearch("");
    toast.success(`${priceItem.title} ditambahkan ke keranjang`);
  };

  const removeWithdrawCartItem = (priceTitle) => {
    setWithdrawCart((previous) => previous.filter((item) => item.priceTitle !== priceTitle));
  };

  // =====================================
  // CREATE ACTIVITY LOG
  // =====================================
  const handleImageUpload =
  async (e) => {

    try {

      const file =
        e.target.files?.[0];

      if (!file) return;

      const allowed = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];

      if (
        !allowed.includes(
          file.type
        )
      ) {

        toast.error(
          "Format gambar tidak didukung"
        );

        return;
      }

      setUploadingImage(true);

      // COMPRESS IMAGE
      const compressedFile =
        await imageCompression(
          file,
          {
            maxSizeMB: 0.4,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
          }
        );

      const body =
        new FormData();

      body.append(
        "file",
        compressedFile
      );

      body.append(
        "upload_preset",
        "jigokubara"
      );

      const response =
        await fetch(
          "https://api.cloudinary.com/v1_1/dpyhp3o66/image/upload",
          {
            method: "POST",
            body,
          }
        );

      const data =
        await response.json();

      if (!data.secure_url) {

        throw new Error(
          "Upload gagal"
        );
      }

      setForm((prev) => ({
        ...prev,
       imageUrl:
      data.secure_url.replace(
    "/upload/",
    "/upload/f_auto,q_auto/"
  )
      }));

      toast.success(
        "Foto berhasil diupload"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Upload foto gagal"
      );

    } finally {

      setUploadingImage(false);
    }
  };

  const loadTransactions =
  async () => {

    try {

      if (!user) return;

      setFirstLoading(true);

      // QUERY FIRESTORE
      const q = query(

        collection(
          db,
          "users",
          user.uid,
          "finance"
        ),

        orderBy(
          "createdAt",
          "desc"
        ),

        limit(currentPageLimit)

      );

      // AMBIL DATA
      const snapshot =
        await getDocs(q);

      // UBAH DATA FIRESTORE
      // MENJADI ARRAY
      const data =
        snapshot.docs.map(
          (doc) => ({

            id: doc.id,

            ...doc.data(),

          })
        );

      // SIMPAN KE STATE
      setTransactions(data);

      // AMBIL DOCUMENT TERAKHIR
      const lastVisible =
        snapshot.docs[
          snapshot.docs.length - 1
        ];

      // SIMPAN lastDoc
      setLastDoc(lastVisible);

      // CEK MASIH ADA DATA ATAU TIDAK
      setHasMore(
        snapshot.docs.length ===
          currentPageLimit
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Gagal load transaksi"
      );

    } finally {

      setFirstLoading(false);

    }
    };

  useEffect(() => {

    if (!user) return;

  loadTransactions();

}, [user]);

useEffect(() => {

  const loadInventory =
    async () => {

      try {

        const inventory = await getCachedInventory(db);
        setInventoryItems(inventory);

      } catch (error) {

        console.error(error);

      }

    };

  loadInventory();

}, []);

  const loadMoreTransactions =
  async () => {

    try {

      setLoadingMore(true);

      if (!lastDoc) return;

      const q = query(

        collection(
          db,
          "users",
          user.uid,
          "finance"
        ),

        orderBy(
          "createdAt",
          "desc"
        ),

        startAfter(lastDoc),

        limit(currentPageLimit)

      );

      const snapshot =
        await getDocs(q);

      const newData =
        snapshot.docs.map(
          (doc) => ({

            id: doc.id,

            ...doc.data(),

          })
        );

      // GABUNG DATA LAMA + BARU
      setTransactions((prev) => [
        ...prev,
        ...newData,
      ]);

      // UPDATE lastDoc
      const lastVisible =
        snapshot.docs[
          snapshot.docs.length - 1
        ];

      setLastDoc(lastVisible);

      // CEK MASIH ADA DATA?
      setHasMore(
        snapshot.docs.length ===
          currentPageLimit
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Gagal load data berikutnya"
      );

    } finally {

      setLoadingMore(false);

    }
};

  // =====================================
  // REALTIME TRANSACTIONS
  // =====================================

  // =====================================
  // TOTAL PEMASUKAN
  // =====================================
  const totalIncome =
    useMemo(() => {

      return transactions
        .filter(
          (item) =>
            item.type ===
              "Deposit" &&
            item.status ===
              "Approved"
        )
        .reduce(
          (acc, item) =>
            acc +
            Number(
              item.amount || 0
            ),
          0
        );

    }, [transactions]);

  // =====================================
  // TOTAL PENGELUARAN
  // =====================================
  const totalExpense =
    useMemo(() => {

      return transactions
        .filter(
          (item) =>
            item.type ===
              "Withdraw" &&
            item.status ===
              "Approved"
        )
        .reduce(
          (acc, item) =>
            acc +
            Number(
              item.amount || 0
            ),
          0
        );

    }, [transactions]);

  // =====================================
  // TOTAL HUTANG
  // =====================================
  const totalDebt = useMemo(() => {

  const totalHutang = transactions
    .filter((item) =>
      item.paymentType === "Hutang" &&
      item.type === "Withdraw" &&
      item.status === "Approved"
    )
    .reduce((acc, item) =>
      acc + Number(item.amount || 0),
    0);

  const pembayaranHutang = transactions
    .filter((item) =>
      item.type === "Pembayaran Hutang" &&
      item.status === "Approved"
    )
    .reduce((acc, item) =>
      acc + Number(item.amount || 0),
    0);

    return Math.max(
    totalHutang - pembayaranHutang,
    0
  );

  return totalHutang - pembayaranHutang;

}, [transactions]);

  // =====================================
  // TOTAL SALDO
  // =====================================
  const totalBalance =
    useMemo(() => {

      return (
        totalIncome -
        totalExpense
      );

    }, [
      totalIncome,
      totalExpense,
    ]);

  // =====================================
  // FILTER
  // =====================================
    const filteredInventoryItems =
  inventoryItems.filter((item) =>
    item.name
      ?.toLowerCase()
      .includes(
        inventorySearch.toLowerCase()
      )
  );

  const filteredPriceItems = PRICE_LIST.filter((item) =>
    `${item.title} ${item.category}`.toLowerCase().includes(priceSearch.toLowerCase())
  );

  const selectedPriceDetails = PRICE_LIST.find((item) => item.title === selectedPriceItem);
  const selectedMatchedInventory = selectedPriceDetails
    ? findInventoryMatch(selectedPriceDetails.title)
    : null;

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
            filter ||
          item.status ===
            filter
      );

    }, [
      transactions,
      filter,
    ]);

  // =====================================
  // PAGINATION
  // =====================================

  // =====================================
  // ADD TRANSACTION
  // =====================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const isWithdraw = form.type === "Withdraw";

    if (isWithdraw && withdrawCart.length === 0) {
      toast.error("Tambahkan minimal satu barang ke keranjang withdraw");
      return;
    }

    if (!isWithdraw && !form.title.trim()) {
      toast.error("Judul transaksi wajib diisi");
      return;
    }

    if (!isWithdraw && !form.amount) {
      toast.error("Jumlah uang wajib diisi");
      return;
    }

    if (!form.note.trim()) {
      toast.error("Catatan transaksi wajib diisi");
      return;
    }

    if (form.type === "Deposit" && !form.imageUrl) {
      toast.error("Foto bukti deposit wajib diupload");
      return;
    }

    const amount = isWithdraw ? withdrawCartTotal : Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Jumlah uang tidak valid");
      return;
    }

    try {
      setLoading(true);

      const transactionData = {
        ...(isWithdraw
          ? {
              items: withdrawCart.map((item) => ({
                priceTitle: item.priceTitle,
                itemName: item.itemName,
                inventoryItemId: item.inventoryItemId,
                quantity: Number(item.quantity),
                unitsPerPackage: Number(
                  item.unitsPerPackage || getUnitsPerPackage(item.priceTitle)
                ),
                inventoryQuantity: Number(
                  item.inventoryQuantity ??
                    Number(item.quantity) * getUnitsPerPackage(item.priceTitle)
                ),
                unitPrice: Number(item.unitPrice),
                lineTotal: Number(item.unitPrice) * Number(item.quantity),
              })),
              title: `Withdraw ${withdrawCart.length} barang`,
              quantity: withdrawCart.reduce((sum, item) => sum + Number(item.quantity), 0),
            }
          : {
              inventoryItemId: form.inventoryItemId,
              quantity: Number(form.quantity || 1),
              title: form.title.trim(),
            }),
        type: form.type,
        paymentType: form.paymentType,
        moneyType: form.moneyType,
        role: role || "",
        amount,
        note: form.note.trim(),
        imageUrl: form.imageUrl || "",
        createdBy: user.rpName || "Unknown",
        createdByUid: user.uid,
        status: "Pending",
        createdAt: serverTimestamp(),
      };

      await addDoc(
        collection(db, "users", user.uid, "finance"),
        transactionData
      );

      toast.success(`${form.type} berhasil dikirim untuk approval`);
      setForm({
        type: "Deposit",
        paymentType: "Cash",
        moneyType: "Uang Putih",
        inventoryItemId: "",
        quantity: 1,
        title: "",
        amount: "",
        note: "",
        imageUrl: "",
      });
      setSelectedPriceItem("");
      setSelectedPriceQuantity(1);
      setWithdrawCart([]);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menambahkan transaksi");
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // BAYAR HUTANG
  // =====================================
  const handlePayDebt =
    async () => {

      if (
        totalDebt <= 0
      ) {

        toast.error(
          "Tidak ada hutang"
        );

        return;
      }

      const input =
        prompt(
          `Masukkan nominal pembayaran hutang\n\nTotal Hutang: Rp ${totalDebt.toLocaleString(
            "id-ID"
          )}`
        );

      if (!input) return;

      const amount =
        Number(input);

      if (
        !amount ||
        amount <= 0
      ) {

        toast.error(
          "Jumlah pembayaran tidak valid"
        );

        return;
      }

      if (
        amount >
        totalDebt
      ) {

        toast.error(
          "Pembayaran melebihi total hutang"
        );

        return;
      }

      try {

        setLoading(true);

        await addDoc(
          collection(
            db,
            "users",
            user.uid,
            "finance"
          ),
          {
            type:
              "Pembayaran Hutang",

            role: 
              role || "",

            paymentType:
              "Cash",

            moneyType:
              "Uang Putih",

            title:
              "Pembayaran Hutang",

            amount,

            remainingDebt:
              totalDebt - amount,

            previousDebt:
              totalDebt,

            isDebtPayment:
              true,

            note:
              `Request pembayaran hutang sebesar Rp ${amount.toLocaleString(
                "id-ID"
              )}`,

            createdBy:
              user.rpName ||
              "Unknown",

            createdByUid:
              user.uid,

            status:
              "Pending",

            createdAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Request pembayaran hutang berhasil dikirim"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Gagal request pembayaran hutang"
        );

      } finally {

        setLoading(false);
      }
    };

  // =====================================
  // APPROVE PAYMENT
  // =====================================
  const approvePayment = async (item) => {
    if (role !== "Oyabun") {
      toast.error("Hanya Oyabun yang bisa approve");
      return;
    }

    try {
      setLoading(true);
      const transactionRef = doc(
        db,
        "users",
        item.createdByUid || user.uid,
        "finance",
        item.id
      );
      const borrowedRef = item.type === "Withdraw" && Array.isArray(item.items) && item.items.length
        ? doc(collection(db, "borrowed_items"))
        : null;

      await runTransaction(db, async (transaction) => {
        const transactionSnapshot = await transaction.get(transactionRef);
        if (!transactionSnapshot.exists()) {
          throw new Error("Transaksi tidak ditemukan");
        }
        const freshItem = transactionSnapshot.data();
        if (freshItem.status !== "Pending") {
          throw new Error("Transaksi ini sudah diproses sebelumnya");
        }

        let stockChanges = [];
        if (freshItem.type === "Deposit" && freshItem.inventoryItemId) {
          stockChanges = [{
            id: freshItem.inventoryItemId,
            quantity: Number(freshItem.quantity || 1),
            direction: "add",
          }];
        } else if (freshItem.type === "Withdraw") {
          if (Array.isArray(freshItem.items) && freshItem.items.length) {
            const byInventoryId = new Map();
            freshItem.items.forEach((withdrawItem) => {
              if (!withdrawItem.inventoryItemId) {
                throw new Error(`Barang ${withdrawItem.itemName || withdrawItem.priceTitle} belum terhubung ke inventory`);
              }
              // Transaksi baru menyimpan inventoryQuantity. Transaksi lama yang belum
              // memiliki field tersebut dihitung memakai multiplier berdasarkan pricelist.
              const quantity = Number(
                withdrawItem.inventoryQuantity ??
                  Number(withdrawItem.quantity || 0) *
                    getUnitsPerPackage(withdrawItem.priceTitle || withdrawItem.itemName)
              );
              if (!Number.isInteger(quantity) || quantity < 1) {
                throw new Error("Jumlah barang withdraw tidak valid");
              }
              byInventoryId.set(
                withdrawItem.inventoryItemId,
                (byInventoryId.get(withdrawItem.inventoryItemId) || 0) + quantity
              );
            });
            stockChanges = Array.from(byInventoryId.entries()).map(([id, quantity]) => ({
              id,
              quantity,
              direction: "subtract",
            }));
          } else if (freshItem.inventoryItemId) {
            stockChanges = [{
              id: freshItem.inventoryItemId,
              quantity: Number(freshItem.quantity || 1),
              direction: "subtract",
            }];
          }
        }

        const inventorySnapshots = [];
        for (const change of stockChanges) {
          const inventoryRef = doc(db, "inventory", change.id);
          const inventorySnapshot = await transaction.get(inventoryRef);
          if (!inventorySnapshot.exists()) {
            throw new Error("Barang inventory tidak ditemukan");
          }
          const currentStock = Number(inventorySnapshot.data().stock || 0);
          if (change.direction === "subtract" && currentStock < change.quantity) {
            throw new Error(`Stok ${inventorySnapshot.data().name || "barang"} tidak cukup. Tersedia: ${currentStock}`);
          }
          inventorySnapshots.push({ inventoryRef, change, currentStock });
        }

        inventorySnapshots.forEach(({ inventoryRef, change, currentStock }) => {
          transaction.update(inventoryRef, {
            stock: change.direction === "add"
              ? currentStock + change.quantity
              : currentStock - change.quantity,
          });
        });

        transaction.update(transactionRef, {
          status: "Approved",
          approvedBy: user.rpName || "Oyabun",
          approvedAt: serverTimestamp(),
        });

        if (borrowedRef && freshItem.type === "Withdraw") {
          transaction.set(borrowedRef, {
            userId: freshItem.createdByUid,
            rpName: freshItem.createdBy || "Unknown",
            items: freshItem.items.map((withdrawItem) => ({
              itemId: withdrawItem.inventoryItemId,
              itemName: withdrawItem.itemName,
              quantity: Number(
                withdrawItem.inventoryQuantity ??
                  Number(withdrawItem.quantity || 1) *
                    getUnitsPerPackage(withdrawItem.priceTitle || withdrawItem.itemName)
              ),
              packageQuantity: Number(withdrawItem.quantity || 1),
              unitsPerPackage: Number(
                withdrawItem.unitsPerPackage ||
                  getUnitsPerPackage(withdrawItem.priceTitle || withdrawItem.itemName)
              ),
              priceTitle: withdrawItem.priceTitle || withdrawItem.itemName,
              unitPrice: Number(withdrawItem.unitPrice || 0),
              lineTotal: Number(withdrawItem.lineTotal || 0),
            })),
            status: "Hutang",
            returned: false,
            financeTransactionId: item.id,
            amount: Number(freshItem.amount || 0),
            moneyType: freshItem.moneyType || "Uang Putih",
            paymentType: freshItem.paymentType || "Cash",
            approvedBy: user.rpName || "Oyabun",
            approvedByRole: role,
            approvedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          });
        }
      });

      invalidateInventoryCache();
      await loadTransactions();
      toast.success("Transaksi berhasil di-approve dan stok telah diperbarui");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Gagal approve transaksi");
    } finally {
      setLoading(false);
    }
  };


  // =====================================
// DELETE TRANSACTION
// =====================================
const deleteTransaction = async (item) => {

  if (!user) return;

  if (role !== "Oyabun") {

    toast.error(
      "Hanya Oyabun yang bisa menghapus history"
    );

    return;
  }

  // VALIDASI DATA
  if (!item?.id || !item?.createdByUid) {

    toast.error(
      "Data transaksi tidak valid"
    );

    return;
  }

  // REMINDER DELETE
  const confirmDelete = window.confirm(
`⚠️ KONFIRMASI HAPUS TRANSAKSI

Judul:
${item.title}

Jumlah:
Rp ${Number(item.amount || 0).toLocaleString("id-ID")}

Pembuat:
${item.createdBy || "Unknown"}

Status:
${item.status || "-"}

⚠️ DATA YANG DIHAPUS TIDAK BISA DIKEMBALIKAN LAGI.

Klik OK untuk melanjutkan penghapusan.
Klik Cancel untuk membatalkan.`
  );

  // JIKA CANCEL
  if (!confirmDelete) {

    toast(
      "Penghapusan dibatalkan"
    );

    return;
  }

  try {

    setLoading(true);

    await deleteDoc(
      doc(
        db,
        "users",
        item.createdByUid,
        "finance",
        item.id
      )
    );

    // REFRESH DATA
    await loadTransactions();

    toast.success(
      "History berhasil dihapus"
    );

  } catch (error) {

    console.error(error);

    toast.error(
      "Gagal menghapus history"
    );

  } finally {

    setLoading(false);

  }
};

  return (

    <AppLayout>

      <div className="text-white">

        {/* PRICE LIST SENJATA */}
{showWeaponPriceList && (

  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

    <div className="w-full max-w-5xl max-h-[90vh] bg-[#14091F] border border-purple-700/40 rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/50 flex flex-col">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-900 to-violet-700 px-6 py-5 flex items-center justify-between flex-shrink-0">

        <div>

          <h2 className="text-3xl font-bold">
            PRICE LIST SENJATA
          </h2>

          <p className="text-purple-200 text-sm mt-1">
            Jigokubara Family
          </p>

        </div>

        <button
          onClick={() => setShowWeaponPriceList(false)}
          className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-xl text-xl transition-all"
        >
          ✕
        </button>

      </div>

      {/* CONTENT */}
      <div className="p-6 overflow-y-auto">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="bg-gradient-to-r from-purple-800 to-violet-700 text-white">

                <th className="p-4 text-left border border-purple-500">
                  BARANG
                </th>

                <th className="p-4 text-left border border-purple-500">
                  UANG MERAH
                </th>

                <th className="p-4 text-left border border-purple-500">
                  UANG PUTIH
                </th>

              </tr>

            </thead>

            <tbody>

              {[
                {
                  item: "PELURU 9MM",
                  merah: "150.000/clip [ISI 150x]",
                  putih: "150.000/clip [ISI 150x]",
                },
                {
                  item: "PELURU .44 (MAGNUM)",
                  merah: "70.000/clip [ISI 50x]",
                  putih: "70.000/clip [ISI 50x]",
                },
                {
                  item: "PELURU Double Action",
                  merah: "75.000/clip [ISI 50x]",
                  putih: "75.000/clip [ISI 50x]",
                },
                {
                  item: "PELURU 7.62 (AK-47)",
                  merah: "-",
                  putih: "-",
                },
                {
                  item: "PELURU .50 BMG (SNIPER)",
                  merah: "-",
                  putih: "-",
                },
                {
                  item: "VEST PULAU",
                  merah: "80.000/pcs (MAX 4)",
                  putih: "70.000/pcs (MAX 4)",
                },
                {
                  item: "COMBAT PISTOL",
                  merah: "200.000",
                  putih: "180.000",
                },
                {
                  item: "SMG MK2",
                  merah: "500.000",
                  putih: "450.000",
                },
                {
                  item: "MINI SMG",
                  merah: "450.000",
                  putih: "415.000",
                },
                {
                  item: "PYTHON",
                  merah: "400.000",
                  putih: "360.000",
                },
                {
                  item: "AK 47",
                  merah: "650.000",
                  putih: "585.000",
                },
                {
                  item: "HEAVY SNIPER",
                  merah: "1.250.000",
                  putih: "1.125.000",
                },
                {
                  item: "DOUBLE ACTION",
                  merah: "450.000",
                  putih: "370.000",
                },
                {
                  item: "WM",
                  merah: "150.000",
                  putih: "130.000",
                },
              ].map((row, index) => (

                <tr
                  key={index}
                  className="bg-[#1A1028] hover:bg-[#241437] transition-all"
                >

                  <td className="p-4 border border-purple-900/40 font-semibold">
                    {row.item}
                  </td>

                  <td className="p-4 border border-purple-900/40 text-red-300">
                    {row.merah}
                  </td>

                  <td className="p-4 border border-purple-900/40 text-yellow-200">
                    {row.putih}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* PACKAGE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">

          <div className="bg-gradient-to-br from-red-900/40 to-purple-900/40 border border-red-500/30 rounded-3xl p-5">

            <h3 className="text-xl font-bold text-red-300">
              1 SET FULL CASH UNGMER
            </h3>

            <p className="text-sm text-gray-300 mt-2">
              PYTHON / MK2 / WM / CLIP / VEST
            </p>

            <p className="text-4xl font-black mt-3">
              Rp 1.590.000
            </p>

          </div>

          <div className="bg-gradient-to-br from-yellow-700/30 to-purple-900/40 border border-yellow-400/30 rounded-3xl p-5">

            <h3 className="text-xl font-bold text-yellow-200">
              1 SET FULL CASH UNGPUT
            </h3>

            <p className="text-sm text-gray-300 mt-2">
              PYTHON / MK2 / WM / CLIP / VEST
            </p>

            <p className="text-4xl font-black mt-3">
              Rp 1.300.000
            </p>

          </div>

          <div className="bg-gradient-to-br from-red-900/40 to-purple-900/40 border border-red-500/30 rounded-3xl p-5">

            <h3 className="text-xl font-bold text-red-300">
              1 SET PYTHON UANG MERAH
            </h3>

            <p className="text-4xl font-black mt-3">
              Rp 790.000
            </p>

          </div>

          <div className="bg-gradient-to-br from-yellow-700/30 to-purple-900/40 border border-yellow-400/30 rounded-3xl p-5">

            <h3 className="text-xl font-bold text-yellow-200">
              1 SET PYTHON UANG PUTIH
            </h3>

            <p className="text-4xl font-black mt-3">
              Rp 710.000
            </p>

          </div>

        </div>

      </div>

    </div>

  </div>

)}

        {/* PRICE LIST DISNAKER */}
        {showDisnakerPriceList && (

          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="w-full max-w-4xl bg-[#14091F] border border-purple-700/40 rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/50">

              <div className="bg-gradient-to-r from-purple-900 to-violet-700 px-6 py-5 flex items-center justify-between">

                <div>

                  <h2 className="text-3xl font-bold">
                    PRICE LIST DISNAKER
                  </h2>

                  <p className="text-purple-200 text-sm mt-1">
                    Jigokubara Family
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowDisnakerPriceList(false)
                  }
                  className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-xl text-xl"
                >
                  ✕
                </button>

              </div>

              <div className="p-6 overflow-auto max-h-[80vh]">

                <div className="overflow-x-auto">

                  <table className="w-full border-collapse">

                  <thead>

  <tr className="bg-gradient-to-r from-purple-800 to-violet-700 text-white">

    <th className="p-4 text-left border border-purple-500">
      NAMA BARANG
    </th>

    <th className="p-4 text-center border border-purple-500">
      /PAKET
    </th>

    <th className="p-4 text-left border border-purple-500">
      HARGA
    </th>

  </tr>

</thead>

<tbody>

  {[
    {
      paket: "KAIN",
      perPaket: "80",
      harga: "Rp16.000",
    },
    {
      paket: "BAJU",
      perPaket: "40",
      harga: "Rp17.000",
    },
    {
      paket: "PAKETAN TAMBANG",
      perPaket: "100",
      harga: "Rp6.000",
    },
    {
      paket: "ALUMINIUM POWDER",
      perPaket: "100",
      harga: "Rp12.000",
    },
    {
      paket: "IRON POWDER",
      perPaket: "100",
      harga: "Rp12.000",
    },
    {
      paket: "METALSCRAP",
      perPaket: "100",
      harga: "Rp14.000",
    },
    {
      paket: "ALUMINIUM",
      perPaket: "100",
      harga: "Rp14.000",
    },
    {
      paket: "BERLIAN",
      perPaket: "1",
      harga: "Rp3.000",
    },
    {
      paket: "KACA",
      perPaket: "100",
      harga: "Rp25.000",
    },
    {
      paket: "BOTOL",
      perPaket: "100",
      harga: "Rp25.000",
    },
    {
      paket: "PLASTIK",
      perPaket: "100",
      harga: "Rp14.000",
    },
    {
      paket: "KARET",
      perPaket: "100",
      harga: "Rp12.000",
    },
    {
      paket: "KARUNG",
      perPaket: "100",
      harga: "Rp12.000",
    },
    {
      paket: "BAJA",
      perPaket: "100",
      harga: "Rp14.000",
    },
    {
      paket: "KAYU KEMASAN",
      perPaket: "100",
      harga: "Rp14.000",
    },
    {
      paket: "KOTORAN HEWAN",
      perPaket: "100",
      harga: "Rp14.000",
    },
    {
      paket: "KULIT BABI",
      perPaket: "36",
      harga: "Rp18.000",
    },
    {
      paket: "KULIT RUSA",
      perPaket: "16",
      harga: "Rp15.000",
    },
    {
      paket: "KULIT SINGA",
      perPaket: "1",
      harga: "Rp3.000",
    },
    {
      paket: "KULIT JADI",
      perPaket: "1",
      harga: "Rp800",
    },
    {
      paket: "BULU AYAM",
      perPaket: "100",
      harga: "Rp15.000",
    },
    {
      paket: "BULU BABI",
      perPaket: "100",
      harga: "Rp15.000",
    },
    {
      paket: "BULU RUBAH",
      perPaket: "100",
      harga: "Rp30.000",
    },
  ].map((row, index) => (

    <tr
      key={index}
      className="bg-[#1A1028] hover:bg-[#241437]"
    >

      <td className="p-4 border border-purple-900/40 font-semibold">
        {row.paket}
      </td>

      <td className="p-4 border border-purple-900/40 text-center text-cyan-200">
        {row.perPaket}
      </td>

      <td className="p-4 border border-purple-900/40 text-yellow-200">
        {row.harga}
      </td>

    </tr>

  ))}

</tbody>

                    
                  </table>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* HEADER */}
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

  <div>

    <div className="flex items-center gap-3 flex-wrap">

      <h1 className="text-3xl font-bold tracking-tight">
        Deposit - Withdraw System
      </h1>

      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          role === "Oyabun"
            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
            : "bg-[#1A1330] text-gray-300 border-purple-900/40"
        }`}
      >
        {role}
      </span>

    </div>

    <p className="text-gray-400 mt-2 text-sm">
      Sistem Deposit dan Withdraw Jigokubara Family
    </p>

  </div>

  <div className="flex gap-3 flex-wrap">

    <button
      onClick={() =>
        setShowWeaponPriceList(true)
      }
      className="bg-gradient-to-r from-fuchsia-700 to-purple-700 hover:opacity-90 px-5 py-3 rounded-2xl font-semibold transition-all shadow-lg shadow-purple-900/30"
    >
      Pricelist Senjata
    </button>

    <button
      onClick={() =>
        setShowDisnakerPriceList(true)
      }
      className="bg-gradient-to-r from-indigo-700 to-blue-700 hover:opacity-90 px-5 py-3 rounded-2xl font-semibold transition-all shadow-lg shadow-blue-900/30"
    >
      Pricelist Disnaker
    </button>

    <button
      onClick={
        handlePayDebt
      }
      className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:opacity-90 px-5 py-3 rounded-2xl font-semibold transition-all shadow-lg shadow-yellow-900/30"
    >
      Bayar Hutang
    </button>

  </div>

</div>

{/* STATISTIC CARDS */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

  {/* TOTAL PEMASUKAN */}
  <div className="bg-[#141021] border border-green-500/20 rounded-3xl p-5">

    <p className="text-sm text-gray-400">
      Total Deposit
    </p>

    <h2 className="text-3xl font-black text-green-400 mt-2">
      Rp{" "}
      {totalIncome.toLocaleString(
        "id-ID"
      )}
    </h2>

  </div>

  {/* TOTAL PENGELUARAN */}
  <div className="bg-[#141021] border border-red-500/20 rounded-3xl p-5">

    <p className="text-sm text-gray-400">
      Total Withdraw
    </p>

    <h2 className="text-3xl font-black text-red-400 mt-2">
      Rp{" "}
      {totalExpense.toLocaleString(
        "id-ID"
      )}
    </h2>

  </div>

  {/* TOTAL HUTANG */}
  <div className="bg-[#141021] border border-yellow-500/20 rounded-3xl p-5">

    <p className="text-sm text-gray-400">
      Total Hutang
    </p>

    <h2 className="text-3xl font-black text-yellow-300 mt-2">
      Rp{" "}
      {totalDebt.toLocaleString(
        "id-ID"
      )}
    </h2>

  </div>

</div>

                {/* FORM */}
        <form
          onSubmit={
            handleSubmit
          }
          className="bg-[#141021] border border-purple-900/30 rounded-3xl p-5 mb-6"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">

            <select
              value={
                form.type
              }
              onChange={(e) => {
                const nextType = e.target.value;
                setForm({ ...form, type: nextType });
                if (nextType !== "Withdraw") {
                  setWithdrawCart([]);
                  setSelectedPriceItem("");
                  setSelectedPriceQuantity(1);
                           }
              }}
              className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
            >

              <option>
                Deposit
              </option>

              <option>
                Withdraw
              </option>

            </select>

            <select
              value={
                form.paymentType
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentType:
                    e.target
                      .value,
                })
              }
              className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
            >

              <option>
                Cash
              </option>

              <option>
                Hutang
              </option>

            </select>

            <select
  value={form.moneyType}
  onChange={(e) => {

    const moneyType =
      e.target.value;

    setForm((prev) => ({
      ...prev,
      moneyType,
    }));

    setWithdrawCart((previous) => previous.map((cartItem) => {
      const priceItem = PRICE_LIST.find((price) => price.title === cartItem.priceTitle);
      if (!priceItem) return cartItem;
      const unitPrice = moneyType === "Uang Merah" ? priceItem.merah : priceItem.putih;
      return {
        ...cartItem,
        unitPrice,
        lineTotal: unitPrice * Number(cartItem.quantity || 1),
      };
    }));

  }}
  className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
>

  <option>
    Uang Putih
  </option>

  <option>
    Uang Merah
  </option>

</select>

  {form.type === "Withdraw" && (
    <div className="md:col-span-2 xl:col-span-6 rounded-3xl border border-purple-700/30 bg-gradient-to-br from-[#1A1028] via-[#130D20] to-[#0F0B18] p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white">Tambah Barang Withdraw</h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Pilih barang dari pricelist, tentukan jumlah, lalu masukkan ke keranjang.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-200">
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
          {form.moneyType}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_150px_auto] gap-3 items-end">
        <div className="relative">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-purple-200/80">Barang Pricelist</label>
          <button
            type="button"
            onClick={() => setShowPriceDropdown((open) => !open)}
            className={`flex min-h-[54px] w-full items-center justify-between gap-3 rounded-2xl border bg-[#0B0812] px-4 py-3 text-left transition-all ${showPriceDropdown ? "border-fuchsia-400 ring-2 ring-purple-500/20" : "border-purple-900/60 hover:border-purple-500/70"}`}
            aria-expanded={showPriceDropdown}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-200">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8"><path d="M7 7h10l1 13H6L7 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
              </span>
              <span className="min-w-0">
                <span className={`block truncate font-semibold ${selectedPriceItem ? "text-white" : "text-gray-400"}`}>{selectedPriceItem || "Pilih barang dari pricelist"}</span>
                <span className="mt-0.5 block text-xs text-gray-500">{selectedPriceDetails ? selectedPriceDetails.category : "Senjata dan paket tersedia"}</span>
              </span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" className={`h-5 w-5 shrink-0 text-purple-300 transition-transform ${showPriceDropdown ? "rotate-180" : ""}`} stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          {showPriceDropdown && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-purple-600/40 bg-[#160E23] shadow-2xl shadow-black/50">
              <div className="border-b border-purple-900/50 p-3">
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" stroke="currentColor" strokeWidth="2"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
                  <input
                    type="text"
                    value={priceSearch}
                    onChange={(e) => setPriceSearch(e.target.value)}
                    placeholder="Cari nama barang..."
                    className="w-full rounded-xl border border-purple-900/50 bg-[#0B0812] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {["Senjata", "Paket"].map((category) => {
                  const categoryItems = filteredPriceItems.filter((item) => item.category === category);
                  if (!categoryItems.length) return null;
                  return (
                    <div key={category} className="mb-2 last:mb-0">
                      <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-purple-300/70">{category}</p>
                      {categoryItems.map((priceItem) => {
                        const price = form.moneyType === "Uang Merah" ? priceItem.merah : priceItem.putih;
                        const active = selectedPriceItem === priceItem.title;
                        return (
                          <button
                            type="button"
                            key={priceItem.title}
                            onClick={() => {
                              setSelectedPriceItem(priceItem.title);
                              setShowPriceDropdown(false);
                              setPriceSearch("");
                            }}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${active ? "bg-purple-600/25 text-white" : "text-gray-200 hover:bg-purple-500/10"}`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">{priceItem.title}</span>
                              <span className="mt-0.5 block text-xs text-gray-500">{category}</span>
                            </span>
                            <span className="shrink-0 text-right">
                              <span className="block text-sm font-bold text-purple-200">Rp {Number(price).toLocaleString("id-ID")}</span>
                              {active && <span className="text-[10px] text-fuchsia-300">Dipilih</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
                {filteredPriceItems.length === 0 && <p className="px-3 py-6 text-center text-sm text-gray-500">Barang tidak ditemukan.</p>}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-purple-200/80">Jumlah</label>
          <input
            type="number"
            min="1"
            step="1"
            value={selectedPriceQuantity}
            onChange={(e) => setSelectedPriceQuantity(e.target.value)}
            placeholder="Qty"
            className="min-h-[54px] w-full rounded-2xl border border-purple-900/60 bg-[#0B0812] px-4 py-3 text-white outline-none transition-all focus:border-fuchsia-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <button
          type="button"
          onClick={handleAddWithdrawItem}
          className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-700 via-purple-700 to-violet-700 px-5 py-3 font-bold text-white shadow-lg shadow-purple-950/30 transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg>
          Tambah Barang
        </button>
      </div>

      {selectedPriceDetails && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-purple-900/40 bg-black/20 px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-100">{selectedPriceDetails.title}</p>
              <p className="mt-1 text-xs text-gray-500">
                {selectedMatchedInventory
                  ? `Stok tersedia: ${Number(selectedMatchedInventory.stock || 0)} · stok akan dipotong otomatis saat disetujui`
                  : "Nama barang belum cocok di inventory; samakan nama inventory agar stok dapat dipotong otomatis."}
              </p>
            </div>
          </div>
          <p className="shrink-0 text-lg font-black text-purple-200">Rp {Number(form.moneyType === "Uang Merah" ? selectedPriceDetails.merah : selectedPriceDetails.putih).toLocaleString("id-ID")} <span className="text-xs font-medium text-gray-500">/ item</span></p>
        </div>
      )}
    </div>
  )}

{withdrawCart.length > 0 && (
  <div className="md:col-span-2 xl:col-span-6 bg-[#0F0B18] border border-purple-700/30 rounded-2xl p-4 space-y-3">
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-bold text-purple-200">Keranjang Withdraw ({withdrawCart.length} barang)</h3>
      <button type="button" onClick={() => setWithdrawCart([])} className="text-sm text-purple-300 hover:text-white">Kosongkan</button>
    </div>
    {withdrawCart.map((cartItem) => (
      <div key={cartItem.priceTitle} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/30 pb-3 last:border-0 last:pb-0">
        <div>
          <p className="font-semibold">{cartItem.priceTitle}</p>
          <p className="text-xs text-gray-400">Inventory: {cartItem.itemName} · Qty {cartItem.quantity} · Rp {Number(cartItem.unitPrice).toLocaleString("id-ID")} / unit</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-purple-200">Rp {Number(cartItem.unitPrice * cartItem.quantity).toLocaleString("id-ID")}</span>
          <button type="button" onClick={() => removeWithdrawCartItem(cartItem.priceTitle)} className="text-sm text-red-300 hover:text-red-200">Hapus</button>
        </div>
      </div>
    ))}
    <div className="flex justify-between items-center border-t border-purple-800/40 pt-3">
      <span className="text-gray-300">Total Withdraw</span>
      <span className="text-xl font-black text-purple-200">Rp {withdrawCartTotal.toLocaleString("id-ID")}</span>
    </div>
  </div>
)}



     {form.type === "Deposit" && (

<div className="relative">

  <button
    type="button"
    onClick={() =>
      setShowInventoryDropdown(
        !showInventoryDropdown
      )
    }
    className="
      w-full
      bg-[#0F0B18]
      border
      border-purple-900/30
      rounded-2xl
      px-4
      py-3
      text-left
      hover:border-purple-500
      transition-all
    "
  >

    {form.inventoryItemId
      ? inventoryItems.find(
          item =>
            item.id ===
            form.inventoryItemId
        )?.name
      : "Pilih Barang Inventory"}

  </button>

  {showInventoryDropdown && (

    <div
      className="
        absolute
        top-full
        left-0
        mt-2
        w-full
        bg-[#14091F]
        border
        border-purple-700/30
        rounded-2xl
        shadow-2xl
        z-50
      "
    >

      <div className="p-3 border-b border-purple-900/30">

        <input
          type="text"
          placeholder="Cari Barang..."
          value={inventorySearch}
          onChange={(e) =>
            setInventorySearch(
              e.target.value
            )
          }
          className="
            w-full
            bg-[#0F0B18]
            border
            border-purple-900/30
            rounded-xl
            px-3
            py-2
            outline-none
            focus:border-purple-500
          "
        />

      </div>

      <div
        className="
          max-h-72
          overflow-y-auto
        "
      >

        {filteredInventoryItems.map(
          (item) => (

            <button
              key={item.id}
              type="button"
              onClick={() => {

                setForm(prev => ({
                  ...prev,
                  inventoryItemId:
                    item.id,
                  title:
                    item.name,
                }));

                setShowInventoryDropdown(
                  false
                );

              }}
              className="
                w-full
                text-left
                px-4
                py-3
                hover:bg-purple-700/20
                border-b
                border-purple-900/20
                transition-all
              "
            >

              <div className="font-semibold">
                {item.name}
              </div>

              <div className="text-xs text-gray-400">
                Stock :
                {" "}
                {item.stock || 0}
              </div>

            </button>

          )
        )}

      </div>

    </div>

  )}

</div>

)}


            {form.type === "Deposit" && (
              <input
                type="text"
                placeholder="Judul Transaksi"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
              />
            )}

            {form.type === "Deposit" ? (
              <input
                type="number"
                placeholder="Harga"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
              />
            ) : (
              <div className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 text-purple-200">
                Total otomatis: Rp {withdrawCartTotal.toLocaleString("id-ID")}
              </div>
            )}
            {form.type === "Deposit" && (

  <input
    type="number"
    min="1"
    placeholder="Quantity"
    value={form.quantity}
    onChange={(e) =>
      setForm({
        ...form,
        quantity: e.target.value,
      })
    }
    className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
  />

)}

          </div>

          {/* FOTO DEPOSIT */}
{form.type ===
  "Deposit" && (

  <div className="mt-4">

    <label className="text-sm text-gray-300 block mb-2">

      Upload Bukti Deposit

    </label>

    <input
      type="file"
      accept="image/*"
      onChange={
        handleImageUpload
      }
      className="w-full bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3"
    />

    {uploadingImage && (

      <p className="text-sm text-purple-300 mt-2">
        Uploading...
      </p>

    )}

    {form.imageUrl && (

      <img
        src={
          form.imageUrl
        }
        alt="preview"
        className="mt-4 w-48 rounded-2xl border border-purple-500/30"
      />

    )}

  </div>

)}


          <textarea
            placeholder="Catatan transaksi..."
            value={
              form.note
            }
            onChange={(e) =>
              setForm({
                ...form,
                note:
                  e.target
                    .value,
              })
            }
            className="w-full mt-4 bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 min-h-[110px] outline-none focus:border-purple-500"
          />

          <button
            type="submit"
            disabled={
              loading
            }
            className="mt-4 bg-gradient-to-r from-purple-700 to-violet-700 hover:opacity-90 disabled:opacity-50 rounded-2xl px-5 py-3 font-semibold transition-all shadow-lg shadow-purple-900/30"
          >
            {loading
              ? "Menyimpan..."
              : "Simpan Transaksi"}
          </button>

        </form>

      </div>

    </AppLayout>
  );
}
