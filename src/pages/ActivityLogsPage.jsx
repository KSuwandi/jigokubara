import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  Shield,
  Activity,
  Hammer,
  Package,
  Trash2,
  Search,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Wallet
} from "lucide-react";

import AppLayout from "../layouts/AppLayout";
import EmptyState from "../components/common/EmptyState";
import { db } from "../services/firebase/config";

export default function ActivityLogsPage() {

  const [logs, setLogs] =
    useState([]);

  const [
  craftingHistory,
  setCraftingHistory,
] = useState([]);

  const [users, setUsers] =
    useState([]);

  const [financeLogs, setFinanceLogs] =
  useState([]);

  // =========================
  // SEARCH
  // =========================
  const [search, setSearch] =
    useState("");

  // =========================
  // PAGINATION
  // =========================
  const [currentPage, setCurrentPage] =
    useState(1);

  const ITEMS_PER_PAGE = 10;

  // =========================
  // LOAD LOGS
  // =========================
  useEffect(() => {

    const q = query(
      collection(
        db,
        "activity_logs"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsub =
      onSnapshot(
        q,
        (snap) => {

          const data =
            snap.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setLogs(data);
        }
      );

    return () => unsub();

  }, []);

  // =========================
// LOAD CRAFTING HISTORY
// =========================
useEffect(() => {

  const q = query(
    collection(
      db,
      "crafting_history"
    ),
    orderBy(
      "createdAt",
      "desc"
    )
  );

  const unsub =
    onSnapshot(
      q,
      (snap) => {

        const data =
          snap.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setCraftingHistory(data);

      }
    );

  return () => unsub();

}, []);

// =========================
// LOAD FINANCE LOGS
// =========================
useEffect(() => {

  const q = query(
    collection(
      db,
      "finance_logs"
    ),
    orderBy(
      "createdAt",
      "desc"
    )
  );

  const unsub =
    onSnapshot(
      q,
      (snap) => {

        const data =
          snap.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setFinanceLogs(data);

      }
    );

  return () => unsub();

}, []);

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

          const data =
            snap.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setUsers(data);
        }
      );

    return () => unsub();

  }, []);

  // =========================
  // CLEAR LOGS
  // =========================
  const clearLogs =
    async () => {

      const confirmDelete =
        window.confirm(
          "Yakin ingin menghapus semua activity logs?"
        );

      if (!confirmDelete)
        return;

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "activity_logs"
            )
          );

        const promises =
          snapshot.docs.map(
            (item) =>
              deleteDoc(
                doc(
                  db,
                  "activity_logs",
                  item.id
                )
              )
          );

        await Promise.all(
          promises
        );

        toast.success(
          "Semua logs berhasil dihapus"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Gagal menghapus logs"
        );
      }
    };

  // =========================
  // USER RESOLVER
  // =========================
  const getUserName = (log) => {

  // langsung dari activity log
  if (log.rpName)
    return log.rpName;

  if (log.userName)
    return log.userName;

  if (log.user)
    return log.user;

  // cari dari collection users
  const found = users.find(
    (u) =>
      u.uid === log.userId ||
      u.id === log.userId
  );

  if (found?.rpName)
    return found.rpName;

  if (found?.name)
    return found.name;

  if (found?.displayName)
    return found.displayName;

  if (found?.email)
    return found.email.split("@")[0];

  return "Unknown User";
};

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (
    date
  ) => {

    if (
      !date?.seconds
    )
      return "-";

    return new Date(
      date.seconds * 1000
    ).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute:
          "2-digit",
      }
    );
  };

  // =========================
  // TYPE COLOR
  // =========================
  const getTypeColor = (
    type
  ) => {

    switch (type) {
      

      case "inventory_add":
        return "from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-300";

      case "inventory_update":
        return "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-300";

      case "inventory_delete":
        return "from-red-500/20 to-rose-500/10 border-red-500/30 text-red-300";

      case "crafting_request":
        return "from-yellow-500/20 to-orange-500/10 border-yellow-500/30 text-yellow-300";

      case "crafting_approved":
        return "from-green-500/20 to-lime-500/10 border-green-500/30 text-green-300";

      case "crafting_rejected":
        return "from-red-500/20 to-pink-500/10 border-red-500/30 text-red-300";

      case "crafting_failed":
  return "from-orange-500/20 to-yellow-500/10 border-orange-500/30 text-orange-300";

case "crafting_completed":
  return "from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-300";

        case "finance_approved":
      return "from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-300";

    case "finance_rejected":
      return "from-red-500/20 to-rose-500/10 border-red-500/30 text-red-300";

      default:
        return "from-gray-500/20 to-gray-500/10 border-gray-500/30 text-gray-300";
    }
  };

  // =========================
  // LABEL
  // =========================
  const getLogLabel = (
    type
  ) => {

    switch (type) {

      case "inventory_add":
        return "Inventory Added";

      case "inventory_update":
        return "Inventory Updated";

      case "inventory_delete":
        return "Inventory Deleted";

      case "crafting_request":
        return "Craft Request";

      case "crafting_approved":
        return "Craft Approved";

      case "crafting_rejected":
        return "Craft Rejected";

      case "crafting_failed":
        return "Craft Partial Failed";

      case "crafting_completed":
  return "Craft Completed";

        case "finance_approved":
      return "Finance Approved";

      case "finance_rejected":
        return "Finance Rejected";

      default:
        return "Activity";
    }
  };

  // =========================
  // ICON
  // =========================
  const getTypeIcon = (
    type
  ) => {

    switch (type) {

      case "inventory_add":
      case "inventory_update":
      case "inventory_delete":
        return (
          <Package size={18} />
        );

      case "crafting_request":
case "crafting_approved":
case "crafting_rejected":
case "crafting_failed":
case "crafting_completed":
  return (
    <Hammer size={18} />
  );
        case "finance_approved":
      case "finance_rejected":
        return (
          <Wallet size={18} />
        );

      default:
        return (
          <Activity size={18} />
        );
    }
  };

  // =========================
  // FILTER SEARCH
  // =========================
  const filteredLogs = useMemo(() => {

  const mergedLogs = [

    ...logs,

    ...craftingHistory.map((item) => ({

      id: `craft-${item.id}`,

      type:
        item.status === "Success With Failures"
          ? "crafting_failed"
          : "crafting_completed",

      action:
        item.status === "Success With Failures"
          ? "Crafting Partial Failed"
          : "Crafting Completed",

      target:
        item.recipeName || "-",

      recipeName:
        item.recipeName || "-",

      role:
        item.role || "-",

      rpName:
        item.craftedBy || "Unknown",

      createdAt:
        item.createdAt,

      successQty:
        item.successQty || 0,

      failedQty:
        item.failedQty || 0,

      totalProcess:
        item.totalProcess || 0,

      description:
        item.status === "Success With Failures"
          ? `${item.successQty || 0} berhasil, ${item.failedQty || 0} gagal`
          : `${item.successQty || 0} item berhasil dibuat`,
    })),
    // finance_logs
  ...financeLogs.map((item) => ({
    id: `finance-${item.id}`,

    type:
      item.action === "Approved"
        ? "finance_approved"
        : "finance_rejected",

    action:
      item.action === "Approved"
        ? "Finance Approved"
        : "Finance Rejected",

    rpName:
      item.rpName,

    requesterName:
      item.requesterName,

    target:
      item.transactionTitle,

    transactionTitle:
      item.transactionTitle,

    transactionType:
      item.transactionType,

    role:
      item.role || "-",

    paymentType:
      item.paymentType,

    moneyType:
      item.moneyType,

    amount:
      item.amount,

    imageUrl:
      item.imageUrl || "",

    createdAt:
      item.createdAt,
  })),
  ];

  mergedLogs.sort(
    (a, b) =>
      (b.createdAt?.seconds || 0) -
      (a.createdAt?.seconds || 0)
  );

  if (!search.trim()) {
    return mergedLogs;
  }

  const searchValue =
    search.toLowerCase();

  return mergedLogs.filter((log) => {

  const userName =
    getUserName(log);

  return (

    log.action
      ?.toLowerCase()
      .includes(searchValue)

    ||

    log.type
      ?.toLowerCase()
      .includes(searchValue)

    ||

    log.target
      ?.toLowerCase()
      .includes(searchValue)

    ||

    log.description
      ?.toLowerCase()
      .includes(searchValue)

    ||

    userName
      ?.toLowerCase()
      .includes(searchValue)

    ||

    log.requesterName
      ?.toLowerCase()
      .includes(searchValue)

    ||

    log.createdBy
      ?.toLowerCase()
      .includes(searchValue)

    ||

    log.transactionTitle
      ?.toLowerCase()
      .includes(searchValue)

    ||

    log.rpName
      ?.toLowerCase()
      .includes(searchValue)

  );

});

}, [
  logs,
  craftingHistory,
  financeLogs,
  search,
  users,
]);

  // =========================
  // STATS
  // =========================
  const stats =
    useMemo(() => {

      return {

        total:
          filteredLogs.length,

        inventory:
          filteredLogs.filter(
            (l) =>
              l.type?.includes(
                "inventory"
              )
          ).length,

        crafting:
          filteredLogs.filter(
            (l) =>
              l.type?.includes(
                "crafting"
              )
          ).length,
          finance:
            filteredLogs.filter(
              (l) =>
                l.type?.includes(
                  "finance"
        )
    ).length,
      };

    }, [filteredLogs]);

  // =========================
  // PAGINATION
  // =========================
  const totalPages =
    Math.ceil(
      filteredLogs.length /
        ITEMS_PER_PAGE
    ) || 1;

  const startIndex =
    (currentPage - 1) *
    ITEMS_PER_PAGE;

  const endIndex =
    startIndex +
    ITEMS_PER_PAGE;

  const paginatedLogs =
    filteredLogs.slice(
      startIndex,
      endIndex
    );

  return (

    <AppLayout>

      <div className="text-white w-full relative">

        {/* BACKGROUND EFFECT */}
        <div className="absolute top-0 right-0 w-full max-w-[400px] min-h-[400px] bg-purple-700/10 blur-3xl rounded-full pointer-events-none" />

        {/* HEADER */}
        <div className="mb-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

          <div>

            <div className="flex items-center gap-3 mb-3">

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-900/40">

                <Shield size={24} />

              </div>

              <div>

                <h1 className="text-5xl font-black tracking-wide bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                  Activity Logs
                </h1>

                <p className="text-purple-300/70 text-sm tracking-[0.3em] uppercase mt-1">
                  地獄薔薇 • System Monitoring
                </p>

              </div>

            </div>

            <p className="text-gray-400 mt-4 max-w-2xl">
              Monitor all inventory movements, crafting activity,
              approvals, and member actions in real-time.
            </p>

          </div>

          <button
            onClick={
              clearLogs
            }
            className="group bg-gradient-to-r from-red-700 to-rose-700 hover:scale-[1.03] transition-all px-6 py-4 rounded-2xl font-semibold shadow-lg shadow-red-900/30 flex items-center gap-3"
          >

            <Trash2
              size={18}
              className="group-hover:rotate-12 transition-all"
            />

            Clear Logs

          </button>

        </div>

        {/* SEARCH */}
        <div className="mb-8 relative">

          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-300/50"
          />

          <input
            type="text"
            placeholder="Search activity logs..."
            value={search}
            onChange={(e) => {

              setSearch(
                e.target.value
              );

              setCurrentPage(
                1
              );
            }}
            className="w-full bg-[#121018]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl pl-14 pr-5 py-5 outline-none focus:border-purple-400 transition-all"
          />

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">

          <div className="bg-gradient-to-br from-[#161122] to-[#0d0b14] border border-purple-500/20 rounded-3xl p-6 shadow-xl">

            <p className="text-gray-400 text-sm">
              Total Activities
            </p>

            <h2 className="text-5xl font-black mt-4">
              {stats.total}
            </h2>

          </div>

          <div className="bg-gradient-to-br from-[#161122] to-[#0d0b14] border border-blue-500/20 rounded-3xl p-6 shadow-xl">

            <p className="text-gray-400 text-sm">
              Inventory Activities
            </p>

            <h2 className="text-5xl font-black mt-4 text-blue-400">
              {stats.inventory}
            </h2>

          </div>

          <div className="bg-gradient-to-br from-[#161122] to-[#0d0b14] border border-yellow-500/20 rounded-3xl p-6 shadow-xl">

            <p className="text-gray-400 text-sm">
              Crafting Activities
            </p>

            <h2 className="text-5xl font-black mt-4 text-yellow-300">
              {stats.crafting}
            </h2>

          </div>

          <div className="bg-gradient-to-br from-emerald-900/20 to-green-900/10 border border-emerald-500/30 rounded-3xl p-6 shadow-xl shadow-emerald-900/20">

  <div className="flex items-center justify-between">

    <div>

      <p className="text-emerald-300 text-sm">
        Finance Activities
      </p>

      <h2 className="text-5xl font-black mt-4 text-emerald-400">
        {stats.finance}
      </h2>

    </div>

    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">

      <Wallet
        size={28}
        className="text-emerald-400"
      />

    </div>

  </div>

</div>

        </div>

        {/* LOGS */}
        {filteredLogs.length === 0 ? (

          <EmptyState
            title="No activity logs found"
          />

        ) : (

          <>

            <div className="space-y-5">

              {paginatedLogs.map(
                (log) => {

                  const userName =
                    getUserName(
                      log
                    );

                  const craftItem =
                    log.target ||
                    log.item ||
                    log.recipeName ||
                    "Item";

                  const description =

  log.type ===
  "crafting_request"

    ? `Crafting ${craftItem} requested by ${userName}`

    : log.type ===
      "crafting_approved"

    ? `${userName} approved crafting ${craftItem}`

    : log.type ===
      "crafting_rejected"
      

    ? `${userName} rejected crafting ${craftItem}`
    : log.type ===
  "crafting_completed"

? `${userName} successfully crafted ${log.successQty || 0}x ${craftItem}`


    : log.type === "finance_approved"

? `${userName} approved finance transaction ${
    log.target || "-"
  } from ${
    log.requesterName ||
    log.createdBy ||
    "Unknown"
  }`

: log.type === "finance_rejected"

? `${userName} rejected finance transaction ${
    log.target || "-"
  } from ${
    log.requesterName ||
    log.createdBy ||
    "Unknown"
  }`

    : log.description;

                  return (

                    <div
                      key={
                        log.id
                      }
                      className={`bg-gradient-to-br ${getTypeColor(
                        log.type
                      )} border rounded-[28px] p-6 backdrop-blur-xl shadow-xl hover:scale-[1.01] transition-all duration-300`}
                    >

                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">

                        {/* LEFT */}
                        <div className="flex-1">

                          <div className="flex items-center gap-4 flex-wrap">

                            <div className="w-12 h-12 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-center">

                              {getTypeIcon(
                                log.type
                              )}

                            </div>

                            <div>

                              <h2 className="text-2xl font-black">
                                {log.action ||
                                  getLogLabel(
                                    log.type
                                  )}
                              </h2>

                              <div className="flex items-center gap-2 mt-2 text-xs uppercase tracking-widest text-white/60">

                                <Clock3 size={13} />

                                Real Time Activity

                              </div>

                            </div>

                            <span className="ml-auto px-4 py-2 rounded-full bg-black/30 border border-white/10 text-xs font-bold">

                              {getLogLabel(
                                log.type
                              )}

                            </span>

                          </div>

                          {/* INFO GRID */}
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 mt-6">

                            <div className="bg-black/25 border border-white/5 rounded-2xl p-4">

                              <p className="text-white/50 text-xs uppercase tracking-widest">
                                User
                              </p>

                              <h3 className="font-bold text-lg mt-2">
                                {
                                  userName
                                }
                              </h3>

                            </div>

                            <div className="bg-black/25 border border-white/5 rounded-2xl p-4">

                              <p className="text-white/50 text-xs uppercase tracking-widest">
                                Role
                              </p>

                              <h3 className="font-bold text-lg mt-2">
                                {log.role ||
                                  "-"}
                              </h3>

                            </div>

                            {log.type?.includes("finance") && (
  <div className="bg-black/25 border border-white/5 rounded-2xl p-4">

    <p className="text-white/50 text-xs uppercase tracking-widest">
      Requester
    </p>

    <h3 className="font-bold text-lg mt-2 text-yellow-300">
      {log.requesterName ||
        log.createdBy ||
        "-"}
    </h3>

  </div>
)}

                            <div className="bg-black/25 border border-white/5 rounded-2xl p-4">

                              <p className="text-white/50 text-xs uppercase tracking-widest">
                                Target
                              </p>

                              <h3 className="font-bold text-lg mt-2">
                                {log.target ||
                                  "-"}
                              </h3>

                            </div>

                            <div className="bg-black/25 border border-white/5 rounded-2xl p-4">
  <p className="text-white/50 text-xs uppercase tracking-widest">
    Amount
  </p>

  <h3 className="font-bold text-lg mt-2">
    Rp {Number(
      log.amount || 0
    ).toLocaleString("id-ID")}
  </h3>
</div>

                            {log.type?.includes("finance") && (
  <>
    <div className="bg-black/25 border border-white/5 rounded-2xl p-4">
      <p className="text-white/50 text-xs uppercase tracking-widest">
        Type
      </p>

      <h3 className="font-bold text-lg mt-2">
        {log.transactionType || "-"}
      </h3>
    </div>

    <div className="bg-black/25 border border-white/5 rounded-2xl p-4">
      <p className="text-white/50 text-xs uppercase tracking-widest">
        Payment
      </p>

      <h3 className="font-bold text-lg mt-2">
        {log.paymentType || "-"}
      </h3>
    </div>

    <div className="bg-black/25 border border-white/5 rounded-2xl p-4">
      <p className="text-white/50 text-xs uppercase tracking-widest">
        Money
      </p>

      <h3 className="font-bold text-lg mt-2">
        {log.moneyType || "-"}
      </h3>
    </div>
  </>
)}

                          </div>

                          {/* DESCRIPTION */}
                          {description && (

                            <div className="mt-5 bg-black/30 border border-white/10 rounded-3xl p-5">

                              <p className="text-white/80 leading-relaxed">
                                {
                                  description
                                }
                              </p>

                            </div>

                          )}

                          {log.imageUrl && (

  <div className="mt-4">

    <img
      src={log.imageUrl}
      alt="Bukti Finance"
      loading="lazy"
      className="
        w-72
        rounded-2xl
        border
        border-white/10
        object-cover
      "
    />

  </div>

)}

                        </div>

                        {/* RIGHT */}
                        <div className="xl:text-right">

                          <div className="bg-black/30 border border-white/10 px-5 py-4 rounded-2xl inline-block">

                            <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
                              Created At
                            </p>

                            <h3 className="font-bold">
                              {formatDate(
                                log.createdAt
                              )}
                            </h3>

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* PAGINATION */}
            <div className="mt-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div className="text-gray-400 text-sm bg-[#121018] border border-purple-500/20 rounded-2xl px-5 py-4">

                Showing{" "}

                <span className="text-white font-bold">
                  {startIndex + 1}
                </span>{" "}

                to{" "}

                <span className="text-white font-bold">
                  {Math.min(
                    endIndex,
                    filteredLogs.length
                  )}
                </span>{" "}

                of{" "}

                <span className="text-white font-bold">
                  {filteredLogs.length}
                </span>

              </div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    setCurrentPage(
                      (p) =>
                        Math.max(
                          p - 1,
                          1
                        )
                    )
                  }
                  className="w-14 h-14 rounded-2xl bg-[#121018] border border-purple-500/20 flex items-center justify-center hover:border-purple-400 transition-all"
                >

                  <ChevronLeft size={20} />

                </button>

                <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-700/20 to-fuchsia-700/20 border border-purple-500/20 text-purple-200 font-bold">

                  {currentPage} /{" "}
                  {totalPages}

                </div>

                <button
                  onClick={() =>
                    setCurrentPage(
                      (p) =>
                        Math.min(
                          p + 1,
                          totalPages
                        )
                    )
                  }
                  className="w-14 h-14 rounded-2xl bg-[#121018] border border-purple-500/20 flex items-center justify-center hover:border-purple-400 transition-all"
                >

                  <ChevronRight size={20} />

                </button>

              </div>

            </div>

          </>

        )}

      </div>

    </AppLayout>
  );
}