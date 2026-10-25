import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../services/firebase/config";

export default function MemberPage() {

  const { role } = useAuth();

  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState("");

  const [financeData, setFinanceData] = useState([]);
  const [craftingData, setCraftingData] = useState([]);
  const [activeTab, setActiveTab] = useState("finance");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // =========================
// DELETE MEMBER
// =========================
const deleteMember = async (member) => {
  try {

    const memberName =
      member.rpName ||
      member.displayName ||
      member.name ||
      member.email?.split("@")[0] ||
      "Unknown";

    const confirmation = prompt(
      `PERINGATAN!\n\n` +
      `Kamu akan menghapus member:\n` +
      `${memberName}\n\n` +
      `Ketik nama member dengan tepat untuk melanjutkan:`
    );

    if (confirmation === null) {  
      return;
    }

    if (confirmation.trim() !== memberName) {
      alert(
        `Nama tidak cocok!\n\nKetik persis: ${memberName}`
      );
      return;
    }

    await deleteDoc(
      doc(db, "users", member.id)
    );

    if (
      selectedMember?.id === member.id
    ) {
      setSelectedMember(null);
    }

    alert(
      `Member ${memberName} berhasil dihapus`
    );

  } catch (error) {

    console.error(error);

    alert(
      "Gagal menghapus member"
    );
  }
};

const changeRole = async (
  member,
  newRole
) => { 
  try {

    const memberName =
      member.rpName ||
      member.displayName ||
      member.name ||
      member.email?.split("@")[0] ||
      "Unknown";

    if (
      member.role === newRole
    ) {
      alert(
        `${memberName} sudah memiliki role ${newRole}`
      );
      return;
    }

    const confirmation = prompt(
      `PERINGATAN!\n\n` +
      `Kamu akan mengubah role:\n` +
      `${memberName}\n\n` +
      `Dari: ${member.role}\n` +
      `Menjadi: ${newRole}\n\n` +
      `Ketik "${newRole}" untuk melanjutkan:`
    );

    if (confirmation === null) {
      return;
    }

    if (
      confirmation.trim() !==
      newRole
    ) {
      alert(
        `Konfirmasi gagal!\n\nKetik persis: ${newRole}`
      );
      return;
    }

    await updateDoc(
      doc(
        db,
        "users",
        member.id
      ),
      {
        role: newRole,
      }
    );

    alert(
      `${memberName} berhasil diubah menjadi ${newRole}`
    );

  } catch (error) {

    console.error(error);

    alert(
      "Gagal mengubah role"
    );
  }
}; 
const paySalary = async () => {

  try {

    if (!selectedMember)
      return;

    if (salaryDebt <= 0) {

      alert(
        "Tidak ada hutang gaji"
      );

      return;
    }

    const input = prompt(
      `Hutang Gaji Saat Ini:\nRp ${salaryDebt.toLocaleString("id-ID")}\n\nMasukkan nominal pembayaran:`
    );

    if (
      input === null
    ) {
      return;
    }

    const nominal =
      Number(input);

    if (
      isNaN(nominal) ||
      nominal <= 0
    ) {

      alert(
        "Nominal tidak valid"
      );

      return;
    }

    if (
      nominal >
      salaryDebt
    ) {

      alert(
        "Nominal melebihi hutang gaji"
      );

      return;
    }

    await addDoc(
      collection(
        db,
        "users",
        selectedMember.id,
        "finance"
      ),
      {

        title:
          "Pembayaran Gaji",

        type:
          "Pembayaran Gaji",

        amount:
          nominal,

        paymentType:
          "Cash",

        status:
          "Approved",

        note:
          "Pembayaran gaji oleh Oyabun",

        createdAt:
          serverTimestamp(),
      }
    );

    alert(
      "Pembayaran gaji berhasil"
    );

  } catch (error) {

    console.error(
      error
    );

    alert(
      "Gagal membayar gaji"
    );

  }

};



  // =========================
  // PHOTO SAFE
  // =========================
  const getPhoto = (user) => {

    return (
      user?.photo ||
      user?.photoURL ||
      user?.imageUrl ||
      `https://ui-avatars.com/api/?name=${
        user?.rpName ||
        user?.displayName ||
        user?.name ||
        "User"
      }&background=7A0019&color=fff`
    );
  };

  // =========================
  // EMAIL MASK
  // =========================
  const maskEmail = (email) => {

    if (!email)
      return "No Email";

    const [name, domain] =
      email.split("@");

    if (!domain)
      return email;

    return (
      name.slice(0, 1) +
      "****" +
      name.slice(-1) +
      "@" +
      domain
    );
  };

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (
    timestamp
  ) => {

    if (
      !timestamp?.seconds
    )
      return "-";

    return new Date(
      timestamp.seconds *
        1000
    ).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================
// LOAD USERS
// =========================
useEffect(() => {

  const unsub =
    onSnapshot(
      collection(
        db,
        "users"
      ),
      (snap) => {

        setMembers(
  snap.docs
    .map((d) => ({
      id: d.id,
      uid: d.data().uid,
      ...d.data(),
    }))
    .sort((a, b) => {

      const nameA =
        (
          a.rpName ||
          a.displayName ||
          a.name ||
          a.email?.split("@")[0] ||
          "Unknown"
        ).toLowerCase();

      const nameB =
        (
          b.rpName ||
          b.displayName ||
          b.name ||
          b.email?.split("@")[0] ||
          "Unknown"
        ).toLowerCase();

      return nameA.localeCompare(nameB);
    })
);
      }
    );

  return () => unsub();

}, []);
  // =========================
  // LOAD FINANCE
  // =========================
  useEffect(() => {

    if (!selectedMember)
      return;

    const unsub =
      onSnapshot(
        collection(
          db,
          "users",
          selectedMember.id,
          "finance"
        ),
        (snap) => {

          const sorted =
            snap.docs
              .map(
                (d) => ({
                  id: d.id,
                  ...d.data(),
                })
              )

              // SORT NEWEST
              .sort(
                (a, b) => {

                  const aTime =
                    a
                      ?.createdAt
                      ?.seconds ||
                    0;

                  const bTime =
                    b
                      ?.createdAt
                      ?.seconds ||
                    0;

                  return (
                    bTime -
                    aTime
                  );
                }
              );

          setFinanceData(
            sorted
          );
        }
      );

    return () => unsub();

  }, [selectedMember]);

  // =========================
  // LOAD CRAFTING
  // =========================
  useEffect(() => {

    if (!selectedMember)
      return;

    const unsub =
      onSnapshot(
        collection(
          db,
          "crafting_history"
        ),
        (snap) => {

          const raw =
            snap.docs.map(
              (d) => ({
                id: d.id,
                ...d.data(),
              })
            );

          const filtered =
            raw
              .filter(
                (
                  item
                ) => {

                  return (
                    item.craftedByUid ===
                    selectedMember.uid
                  );
                }
              )

              // SORT NEWEST
              .sort(
                (a, b) => {

                  const aTime =
                    a
                      ?.createdAt
                      ?.seconds ||
                    0;

                  const bTime =
                    b
                      ?.createdAt
                      ?.seconds ||
                    0;

                  return (
                    bTime -
                    aTime
                  );
                }
              );

          setCraftingData(
            filtered
          );

          setCurrentPage(1);
        }
      );

    return () => unsub();

  }, [selectedMember]);

  // =========================
  // TOTAL FINANCE
  // =========================
  const totalIncome =
  useMemo(() => {

    return financeData
      .filter(
        (i) =>
          i.type ===
            "Pemasukan" &&
          i.status ===
            "Approved"
      )
      .reduce(
        (a, b) =>
          a +
          Number(
            b.amount ||
              0
          ),
        0
      );

  }, [financeData]);

  const totalExpense =
  useMemo(() => {

    return financeData
      .filter(
        (i) =>
          i.type ===
            "Pengeluaran" &&
          i.status ===
            "Approved"
      )
      .reduce(
        (a, b) =>
          a +
          Number(
            b.amount ||
              0
          ),
        0
      );

  }, [financeData]);

  // =========================
  // TOTAL HUTANG
  // =========================
  const totalDebt =
    useMemo(() => {

      const totalHutang =
        financeData
          .filter(
            (
              item
            ) =>
              item.paymentType ===
                "Hutang" &&
              item.type ===
                "Pengeluaran" &&
              item.status ===
                "Approved"
          )
          .reduce(
            (
              acc,
              item
            ) =>
              acc +
              Number(
                item.amount ||
                  0
              ),
            0
          );

      const pembayaranHutang =
        financeData
          .filter(
            (
              item
            ) =>
              item.type ===
                "Pembayaran Hutang" &&
              item.status ===
                "Approved"
          )
          .reduce(
            (
              acc,
              item
            ) =>
              acc +
              Number(
                item.amount ||
                  0
              ),
            0
          );

      return (
        totalHutang -
        pembayaranHutang
      );

    }, [financeData]);

    // =========================
// HUTANG GAJI MEMBER
// =========================
const salaryDebt = useMemo(() => {

  const totalSalaryDebt = financeData
  .filter(
    (item) =>
      ["Pemasukan", "Deposit"].includes(item.type) &&
      item.paymentType === "Hutang" &&
      item.status === "Approved"
  )
    .reduce(
      (acc, item) =>
        acc + Number(item.amount || 0),
      0
    );

  const totalSalaryPaid = financeData
    .filter(
      (item) =>
        item.type === "Pembayaran Gaji" &&
        item.status === "Approved"
    )
    .reduce(
      (acc, item) =>
        acc + Number(item.amount || 0),
      0
    );

  return totalSalaryDebt - totalSalaryPaid;

}, [financeData]);


    const filteredMembers = members.filter((member) => {

  const memberName =
    (
      member.rpName ||
      member.displayName ||
      member.name ||
      member.email?.split("@")[0] ||
      ""
    ).toLowerCase();

  return memberName.includes(
    search.toLowerCase()
  );
});
  // =========================
  // ACTIVE DATA
  // =========================
  const activeData =
    activeTab ===
    "finance"
      ? financeData
      : craftingData;

  const totalPages =
    Math.ceil(
      activeData.length /
        ITEMS_PER_PAGE
    );

  const paginatedData =
    activeData.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage *
        ITEMS_PER_PAGE
    );


  return (

    <AppLayout>

      <div className="text-white">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Member Monitoring
          </h1>

          <p className="text-gray-400 mt-2">
            Monitor finance &
            crafting activity
          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* MEMBER LIST */}
<div className="bg-purple-950/40 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-5 h-fit sticky top-5 shadow-[0_0_35px_rgba(168,85,247,0.25)]">  
<h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
  Members
</h2>
<input
  type="text"
  placeholder="Search member..."
  value={search}
  onChange={(e) =>
    setSearch(e.target.value)
  }
  className="
    w-full
    mb-4
    px-4
    py-3
    rounded-2xl
    bg-purple-900/20
    border
    border-purple-500/20
    text-white
    placeholder-gray-400
    outline-none
    focus:border-purple-400
    focus:ring-2
    focus:ring-purple-500/30
  "
/>

  <div className="member-scroll space-y-2 h-[700px] overflow-y-auto pr-1">

    {filteredMembers.map(
      (m) => (

                  <button
                    key={m.id}
                    onClick={() => {

                      setSelectedMember(
                        m
                      );

                      setCurrentPage(
                        1
                      );
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                      selectedMember?.id ===
                      m.id
                        ? "bg-gradient-to-r from-purple-700 to-fuchsia-700 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.6)]"
                        : "bg-purple-950/20 border-purple-500/20 hover:border-purple-400 hover:bg-purple-900/30"
                    }`}
                  >

                    <img
  src={getPhoto(
    m
  )}
  referrerPolicy="no-referrer"
  className="w-11 h-11 rounded-full object-cover border border-gray-700"
/>

                    <div className="text-left">

                      <p className="font-bold text-sm">
                        {m.rpName ||
                          m.displayName ||
                          m.name ||
                          m.email?.split(
                            "@"
                          )[0] ||
                          "Unknown"}
                      </p>

                      <p className="text-xs text-gray-400">
                        {m.role}
                      </p>

                    </div>

                  </button>

                )
              )}
              {filteredMembers.length === 0 && (
  <div className="text-center text-gray-400 py-10">
    Member tidak ditemukan
  </div>
)}

            </div>

          </div>

          {/* DETAIL */}
          <div className="lg:col-span-3 space-y-6">

            {!selectedMember ? (

              <div className="text-gray-400 bg-[#111] p-10 rounded-3xl border border-gray-800 text-center">

                Pilih member untuk melihat aktivitas

              </div>

            ) : (

              <>

                {/* MEMBER CARD */}
<div className="bg-gradient-to-br from-purple-950/60 to-fuchsia-950/40 border border-purple-500/30 p-6 rounded-3xl flex items-center gap-5 shadow-xl shadow-purple-900/20 backdrop-blur-xl">
                  <img
  src={getPhoto(
    selectedMember
  )}
  referrerPolicy="no-referrer"
 className="w-24 h-24 rounded-3xl object-cover border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
/>

                  <div>

                    <h2 className="text-3xl font-bold">
                      {selectedMember.rpName ||
                        selectedMember.displayName ||
                        selectedMember.name ||
                        selectedMember.email?.split(
                          "@"
                        )[0] ||
                        "Unknown"}
                    </h2>

                    <p className="text-gray-400 text-sm mt-1">
                      {maskEmail(
                        selectedMember.email
                      )}
                    </p>

                    <p className="text-gray-300 text-sm mt-2">
                      📞{" "}
                      {selectedMember.phone ||
                        "No Phone"}
                    </p>

                    <div className="flex gap-3 mt-3 flex-wrap">

  <span className="px-4 py-1 text-xs bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl font-semibold">
    {selectedMember.role}
  </span>

  {role === "Oyabun" && (
    <>
      <button
        onClick={() =>
          changeRole(
            selectedMember,
            "Oyabun"
          )
        }
        className="px-4 py-1 text-xs bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-all"
      >
        Set Oyabun
      </button>

      <button
        onClick={() =>
          changeRole(
            selectedMember,
            "Shatei"
          )
        }
        className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all"
      >
        Set Shatei
      </button>

      <button
        onClick={() =>
          deleteMember(
            selectedMember
          )
        }
        className="px-4 py-1 text-xs bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all"
      >
        Delete Member
      </button>
    </>
  )}

</div>

                  </div>

                </div>

                {/* TAB */}
                <div className="flex gap-3">

                  <button
                    onClick={() => {

                      setActiveTab(
                        "finance"
                      );

                      setCurrentPage(
                        1
                      );
                    }}
                    className={`px-6 py-3 rounded-2xl border font-semibold transition-all ${
                      activeTab ===
                      "finance"
                        ? "bg-gradient-to-r from-purple-700 to-fuchsia-700 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        : "bg-purple-950/20 border-purple-500/20 hover:border-purple-400"
                    }`}
                  >
                    Finance
                  </button>

                  <button
                    onClick={() => {

                      setActiveTab(
                        "crafting"
                      );

                      setCurrentPage(
                        1
                      );
                    }}
                    className={`px-6 py-3 rounded-2xl border font-semibold transition-all ${
                      activeTab ===
                      "crafting"
                        ? "bg-gradient-to-r from-purple-700 to-fuchsia-700 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        : "bg-black border-gray-700 hover:border-[#7A0019]"
                    }`}
                  >
                    Crafting
                  </button>

                </div>

                {/* FINANCE SUMMARY */}
                {activeTab ===
                  "finance" && (

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <div className="bg-purple-950/30 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-[0_0_25px_rgba(168,85,247,0.15)]">

                      <p className="text-gray-400 text-sm">
                        Total Income
                      </p>

                      <p className="text-green-400 text-2xl font-bold mt-2">
                        Rp{" "}
                        {totalIncome.toLocaleString(
                          "id-ID"
                        )}
                      </p>

                    </div>

                    <div className="bg-purple-950/30 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-[0_0_25px_rgba(168,85,247,0.15)]">

                      <p className="text-gray-400 text-sm">
                        Total Expense
                      </p>

                      <p className="text-red-400 text-2xl font-bold mt-2">
                        Rp{" "}
                        {totalExpense.toLocaleString(
                          "id-ID"
                        )}
                      </p>

                    </div>

                    <div className="bg-purple-950/30 backdrop-blur-xl p-5 rounded-3xl border border-purple-500/20 shadow-[0_0_25px_rgba(168,85,247,0.15)]">

                      <p className="text-gray-400 text-sm">
                        Total Hutang
                      </p>

                      <p className="text-yellow-300 text-2xl font-bold mt-2">
                        Rp{" "}
                        {Math.max(
                          totalDebt,
                          0
                        ).toLocaleString(
                          "id-ID"
                        )}
                      </p>

                    </div>
                    <div className="bg-purple-950/30 backdrop-blur-xl p-5 rounded-3xl border border-orange-500/20">

  <p className="text-gray-400 text-sm">
    Hutang Gaji
  </p>

  <p className="text-orange-400 text-2xl font-bold mt-2">
    Rp{" "}
    {Math.max(
      salaryDebt,
      0
    ).toLocaleString(
      "id-ID"
    )}
  </p>

  {role === "Oyabun" &&
    salaryDebt > 0 && (
      <button
        onClick={paySalary}
        className="
          mt-4
          w-full
          px-4
          py-2
          rounded-xl
          bg-green-600
          hover:bg-green-700
          font-semibold
          transition-all
        "
      >
        Bayar Gaji
      </button>
  )}

</div>

                  </div>

                )}

                {/* LIST */}
                <div className="space-y-4">

                  {paginatedData.map(
                    (item) => (

                      <div
                        key={item.id}
                        className={`p-5 rounded-3xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] ${
                          activeTab ===
                          "finance"

                            ? item.type ===
                              "Pemasukan"

                              ? "bg-green-500/10 border-green-500/30"

                              : item.type ===
                                  "Pengeluaran"

                              ? "bg-red-500/10 border-red-500/30"

                              : "bg-yellow-500/10 border-yellow-500/30"

                            : item.status ===
                                "Approved" ||
                              item.status ===
                                "Crafted"

                            ? "bg-green-500/10 border-green-500/30"

                            : item.status ===
                                "Rejected" ||
                              item.status ===
                                "Partial Failed"

                            ? "bg-red-500/10 border-red-500/30"

                            : "bg-yellow-500/10 border-yellow-500/30"
                        }`}
                      >

                        {activeTab ===
                        "finance" ? (

                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                            <div>

                              <div className="flex items-center gap-3 flex-wrap">

                                <h2 className="text-2xl font-bold">
                                  {item.title ||
                                    "Finance"}
                                </h2>

                                <span
                                  className={`px-4 py-1 rounded-full text-xs font-bold ${
                                    item.type ===
                                    "Pemasukan"
                                      ? "bg-green-500/20 text-green-300"
                                      : item.type ===
                                          "Pengeluaran"
                                      ? "bg-red-500/20 text-red-300"
                                      : "bg-yellow-500/20 text-yellow-300"
                                  }`}
                                >
                                  {item.type ||
                                    "-"}
                                </span>

                                {item.status && (
                                  <span
                                    className={`px-4 py-1 rounded-full text-xs font-bold ${
                                      item.status ===
                                      "Approved"
                                        ? "bg-green-500/20 text-green-300"
                                        : item.status ===
                                            "Rejected"
                                        ? "bg-red-500/20 text-red-300"
                                        : "bg-yellow-500/20 text-yellow-300"
                                    }`}
                                  >
                                    {
                                      item.status
                                    }
                                  </span>
                                )}

                              </div>

                              <div className="flex flex-wrap gap-3 mt-4">

                                <div className="bg-purple-900/20 border border-purple-500/20 px-4 py-2 rounded-xl text-sm">
                                  💰 Amount:
                                  {" "}
                                  Rp{" "}
                                  {Number(
                                    item.amount ||
                                      0
                                  ).toLocaleString(
                                    "id-ID"
                                  )}
                                </div>

                                {item.paymentType && (
                                  <div className="bg-purple-900/20 border border-purple-500/20 px-4 py-2 rounded-xl text-sm">
                                    💳 Payment:
                                    {" "}
                                    {
                                      item.paymentType
                                    }
                                  </div>
                                )}

                              </div>

                              {item.note && (
                                <div className="mt-4 bg-purple-900/20 border border-purple-500/20 rounded-2xl p-4">

                                  <p className="text-gray-400 text-sm">
                                    Note
                                  </p>

                                  <p className="mt-2 text-sm leading-relaxed">
                                    {
                                      item.note
                                    }
                                  </p>

                                </div>
                              )}

                            </div>

                            <div className="text-right">

                              <p className="text-gray-400 text-sm">
                                Created At
                              </p>

                              <h3 className="font-bold mt-2 text-lg">
                                {formatDate(
                                  item.createdAt
                                )}
                              </h3>

                            </div>

                          </div>

                        ) : (

                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                            <div>

                              <div className="flex items-center gap-3 flex-wrap">

                                <h2 className="text-2xl font-bold">
                                  {item.recipeName ||
                                    "Crafting"}
                                </h2>

                                <span
                                  className={`px-4 py-1 rounded-full text-xs font-bold ${
                                    item.status ===
                                      "Approved" ||
                                    item.status ===
                                      "Crafted"
                                      ? "bg-green-500/20 text-green-300"
                                      : item.status ===
                                          "Rejected" ||
                                        item.status ===
                                          "Partial Failed"
                                      ? "bg-red-500/20 text-red-300"
                                      : "bg-yellow-500/20 text-yellow-300"
                                  }`}
                                >
                                  {item.status ||
                                    "Pending"}
                                </span>

                              </div>

                              <div className="flex flex-wrap gap-3 mt-4">

                                <div className="bg-purple-900/20 border border-purple-500/20 px-4 py-2 rounded-xl text-sm">
                                  ✅ Success:
                                  {" "}
                                  {item.successQty ||
                                    0}
                                </div>

                                <div className="bg-purple-900/20 border border-purple-500/20 px-4 py-2 rounded-xl text-sm">
                                  ❌ Failed:
                                  {" "}
                                  {item.failedQty ||
                                    0}
                                </div>

                                <div className="bg-purple-900/20 border border-purple-500/20 px-4 py-2 rounded-xl text-sm">
                                  📦 Output:
                                  {" "}
                                  {item.outputQty ||
                                    0}
                                </div>

                              </div>

                            </div>

                            <div className="text-right">

                              <p className="text-gray-400 text-sm">
                                Created At
                              </p>

                              <h3 className="font-bold mt-2 text-lg">
                                {formatDate(
                                  item.createdAt
                                )}
                              </h3>

                            </div>

                          </div>

                        )}

                      </div>

                    )
                  )}

                  {paginatedData.length ===
                    0 && (

                    <div className="bg-[#111] border border-dashed border-gray-700 rounded-3xl p-10 text-center text-gray-400">

                      Tidak ada data

                    </div>

                  )}

                </div>

                {/* PAGINATION */}
                {totalPages >
                  1 && (

                  <div className="flex gap-2 justify-center flex-wrap">

                    <button
                      disabled={
                        currentPage ===
                        1
                      }
                      onClick={() =>
                        setCurrentPage(
                          (
                            p
                          ) =>
                            p - 1
                        )
                      }
                      className="px-5 py-3 bg-black border border-gray-700 rounded-2xl disabled:opacity-40 hover:border-[#7A0019]"
                    >
                      Prev
                    </button>

                    {Array.from({
                      length:
                        totalPages,
                    }).map(
                      (
                        _,
                        i
                      ) => (

                        <button
                          key={i}
                          onClick={() =>
                            setCurrentPage(
                              i +
                                1
                            )
                          }
                          className={`px-5 py-3 rounded-2xl border ${
                            currentPage ===
                            i + 1
                              ? "bg-gradient-to-r from-purple-700 to-fuchsia-700 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                              : "bg-purple-950/20 border-purple-500/20 hover:border-purple-400"
                          }`}
                        >
                          {i + 1}
                        </button>

                      )
                    )}

                    <button
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        setCurrentPage(
                          (
                            p
                          ) =>
                            p + 1
                        )
                      }
                      className="px-5 py-3 bg-black border border-gray-700 rounded-2xl disabled:opacity-40 hover:border-[#7A0019]"
                    >
                      Next
                    </button>

                  </div>

                )}

              </>

            )}

          </div>

        </div>

      </div>

    </AppLayout>
  );
}