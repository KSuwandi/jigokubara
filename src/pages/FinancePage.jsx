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
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";
import imageCompression from "browser-image-compression";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../services/firebase/config";


const PRICE_LIST = [

  // =========================
  // SENJATA
  // =========================

  {
    category: "Senjata",
    title: "PELURU 9MM",
    merah: 150000,
    putih: 150000,
  },

  {
    category: "Senjata",
    title: "PELURU .44 (MAGNUM)",
    merah: 70000,
    putih: 70000,
  },

  {
    category: "Senjata",
    title: "PELURU Double Action",
    merah: 75000,
    putih: 75000,
  },

  {
    category: "Senjata",
    title: "VEST",
    merah: 80000,
    putih: 70000,
  },

  {
    category: "Senjata",
    title: "COMBAT PISTOL",
    merah: 200000,
    putih: 180000,
  },

  {
    category: "Senjata",
    title: "SMG MK2",
    merah: 500000,
    putih: 450000,
  },

  {
    category: "Senjata",
    title: "MINI SMG",
    merah: 450000,
    putih: 415000,
  },

  {
    category: "Senjata",
    title: "PYTHON",
    merah: 400000,
    putih: 360000,
  },

  {
    category: "Senjata",
    title: "AK 47",
    merah: 650000,
    putih: 585000,
  },

  {
    category: "Senjata",
    title: "HEAVY SNIPER",
    merah: 1250000,
    putih: 1125000,
  },

  {
    category: "Senjata",
    title: "DOUBLE ACTION",
    merah: 450000,
    putih: 370000,
  },

  {
    category: "Senjata",
    title: "WM",
    merah: 150000,
    putih: 130000,
  },

    // =========================
  // PAKET
  // =========================

  {
    category: "Paket",
    title: "1 SET FULL CASH",
    merah: 1590000,
    putih: 1300000,
  },

  {
    category: "Paket",
    title: "1 SET PYTHON",
    merah: 790000,
    putih: 710000,
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

        const snapshot =
          await getDocs(
            collection(
              db,
              "inventory"
            )
          );

        setInventoryItems(
          snapshot.docs.map(
            doc => ({
              id: doc.id,
              ...doc.data(),
            })
          )
        );

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
  const handleSubmit =
    async (e) => {

      e.preventDefault();

      if (!user) return;

      if (
        !form.title.trim()
      ) {

        toast.error(
          "Judul transaksi wajib diisi"
        );

        return;
      }

      if (
        !form.amount
      ) {

        toast.error(
          "Jumlah uang wajib diisi"
        );

        return;
      }

      if (!form.note.trim()) {

        toast.error(
          "Catatan transaksi wajib diisi"
        );

        return;
      }

      if (
      form.type ===
        "Deposit" &&
      !form.imageUrl
    ) {

      toast.error(
        "Foto bukti deposit wajib diupload"
      );

      return;
    }

      const amount =
        Number(form.amount);

      if (
        amount <= 0
      ) {

        toast.error(
          "Jumlah uang tidak valid"
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

            inventoryItemId:
              form.inventoryItemId,

            quantity:
              Number(form.quantity || 1),

            type:
              form.type,

            paymentType:
              form.paymentType,

            moneyType:
              form.moneyType,

            role: 
              role || "",

            title:
              form.title.trim(),

            amount,

            note:
              form.note.trim(),

            imageUrl:
             form.imageUrl || "",

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
          `${form.type} berhasil dikirim untuk approval`
        );

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

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Gagal menambahkan transaksi"
        );

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

  try {

    if (role !== "Oyabun") {

      toast.error(
        "Hanya Oyabun yang bisa approve"
      );

      return;
    }

    const transactionRef = doc(
      db,
      "users",
      item.createdByUid || user.uid,
      "finance",
      item.id
    );

    await updateDoc(
      transactionRef,
      {
        status: "Approved",
        approvedBy: user.rpName,
        approvedAt: serverTimestamp(),
      }
    );

    // =====================================
    // AUTO TAMBAH INVENTORY
    // =====================================

    if (
      item.type === "Deposit" &&
      item.inventoryItemId
    ) {

      const inventoryRef = doc(
        db,
        "inventory",
        item.inventoryItemId
      );

      await updateDoc(
  inventoryRef,
  {
    stock: increment(
      Number(item.quantity || 1)
    ),
  }
);

    }

    toast.success(
      "Transaksi berhasil di approve"
    );

  } catch (error) {

    console.error(error);

    toast.error(
      "Gagal approve transaksi"
    );

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
              onChange={(e) =>
                setForm({
                  ...form,
                  type:
                    e.target
                      .value,
                })
              }
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

    setForm(prev => {

      let amount =
        prev.amount;

      if (selectedPriceItem) {

        const selectedItem =
          PRICE_LIST.find(
            item =>
              item.title ===
              selectedPriceItem
          );

        if (selectedItem) {

          amount =
            moneyType === "Uang Merah"
              ? selectedItem.merah
              : selectedItem.putih;

        }

      }

      return {
        ...prev,
        moneyType,
        amount,
      };

    });

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

<select
  value={selectedPriceItem}
  onChange={(e) => {

    const value = e.target.value;

    setSelectedPriceItem(value);

    const selectedItem =
      PRICE_LIST.find(
        item => item.title === value
      );

    if (!selectedItem) return;

    const price =
      form.moneyType === "Uang Merah"
        ? selectedItem.merah
        : selectedItem.putih;

    setForm(prev => ({
      ...prev,
      title: selectedItem.title,
      amount: price,
    }));

  }}
  className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
>

  <option value="">
    Pilih Dari Pricelist
  </option>

  <optgroup label="Senjata">
    {PRICE_LIST
      .filter(item => item.category === "Senjata")
      .map(item => (
        <option
          key={item.title}
          value={item.title}
        >
          {item.title}
        </option>
      ))}
  </optgroup>

  <optgroup label="Paket">
    {PRICE_LIST
      .filter(item => item.category === "Paket")
      .map(item => (
        <option
          key={item.title}
          value={item.title}
        >
          {item.title}
        </option>
      ))}
  </optgroup>

</select>

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


            <input
              type="text"
              placeholder="Judul Transaksi"
              value={
                form.title
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  title:
                    e.target
                      .value,
                })
              }
              className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
            />

            <input
              type="number"
              placeholder="Harga"
              value={
                form.amount
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  amount:
                    e.target
                      .value,
                })
              }
              className="bg-[#0F0B18] border border-purple-900/30 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
            />
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

        {/* FILTER */}
        <div className="flex flex-wrap gap-2 mb-6">

          {[
            "Semua",
            "Deposit",
            "Withdraw",
            "Cash",
            "Hutang",
            "Uang Putih",
            "Uang Merah",
            "Pending",
            "Approved",
          ].map((type) => (

            <button
              key={type}
              onClick={() => {

  setFilter(type);

}}
              className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                filter === type
                  ? "bg-gradient-to-r from-purple-700 to-violet-700 border-transparent"
                  : "bg-[#141021] border-purple-900/30 hover:border-purple-500/40"
              }`}
            >
              {type}
            </button>

          ))}

        </div>

        {/* HISTORY */}
        <div className="space-y-4">

          {filteredTransactions.map(
            (item) => (

              <div
                key={item.id}
                className="bg-[#141021] border border-purple-900/30 rounded-3xl p-5 hover:border-purple-500/30 transition-all"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  {/* LEFT */}
                  <div className="flex-1">

                    <div className="flex items-center gap-2 flex-wrap">

                      <h2 className="text-xl font-bold">
                        {
                          item.title
                        }
                      </h2>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.type ===
                          "Deposit"
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

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status ===
                          "Approved"
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {
                          item.status
                        }
                      </span>

                    </div>

                    <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                      {item.note ||
                        "Tidak ada catatan"}
                    </p>
                    {item.imageUrl && (

  <img
  loading="lazy"
  src={item.imageUrl}
    alt="bukti"
    className="mt-4 w-56 rounded-2xl border border-purple-500/30 object-cover"
  />

)}

                    <div className="flex flex-wrap gap-2 mt-4">

                      <span className="bg-[#0F0B18] border border-purple-900/20 px-3 py-2 rounded-xl text-xs">
                        {
                          item.paymentType
                        }
                      </span>

                      {item.quantity && (

  <span className="bg-[#0F0B18] border border-purple-900/20 px-3 py-2 rounded-xl text-xs">
    Qty {item.quantity}
  </span>

)}

                      <span className="bg-[#0F0B18] border border-purple-900/20 px-3 py-2 rounded-xl text-xs">
                        {
                          item.moneyType
                        }
                      </span>

                      <span className="bg-[#0F0B18] border border-purple-900/20 px-3 py-2 rounded-xl text-xs">
                        By{" "}
                        {
                          item.createdBy
                        }
                      </span>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col items-start lg:items-end gap-3">

                    <h3
                      className={`text-3xl font-bold ${
                        item.type ===
                        "Deposit"
                          ? "text-green-400"
                          : item.type ===
                            "Pembayaran Hutang"
                          ? "text-yellow-300"
                          : "text-red-400"
                      }`}
                    >
                      {item.type ===
                      "Deposit"
                        ? "+"
                        : "-"}
                      Rp{" "}
                      {Number(
                        item.amount
                      ).toLocaleString(
                        "id-ID"
                      )}
                    </h3>

                    <div className="flex gap-2 flex-wrap">

                      {/* APPROVE */}
                      {role ===
                        "Oyabun" &&
                        item.status ===
                          "Pending" && (

                        <button
                          onClick={() =>
                            approvePayment(item)
                          }
                          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl text-sm transition-all"
                        >
                          Approve
                        </button>

                      )}

                      {/* DELETE */}
                      {role ===
                        "Oyabun" && (

                        <button
  onClick={() =>
    deleteTransaction(item)
  }
  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm transition-all"
>
  Hapus
</button>

                      )}

                    </div>

                  </div>

                </div>

              </div>
            )
          )}

          {/* EMPTY */}
          {filteredTransactions.length ===
            0 && (

            <div className="bg-[#141021] border border-dashed border-purple-900/30 rounded-3xl p-10 text-center text-gray-400">

              Tidak ada history transaksi

            </div>

          )}
          {/* LOAD MORE */}
{hasMore && (

  <div className="flex justify-center mt-6">

    <button
  onClick={loadMoreTransactions}
  disabled={loadingMore}
  className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 transition-all px-6 py-3 rounded-2xl font-semibold"
>
  {loadingMore
    ? "Loading..."
    : "Load More"}
</button>

  </div>

)}

        </div>

        

      </div>

    </AppLayout>
  );
}