import {
  LayoutDashboard,
  Boxes,
  Wallet,
  Hammer,
  Users,
  User,
  LogOut,
  ClipboardList,
  Bell,
  Trash2,
  ShieldCheck,
  History,
  BadgeDollarSign,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  db,
} from "../../services/firebase/config";

export default function Sidebar() {

  const {
    user,
    role,
    logout,
  } = useAuth();

  // =====================================
  // NOTIFICATION STATES
  // =====================================
  const [
    craftingNotif,
    setCraftingNotif,
  ] = useState(0);

  const [
    financeNotif,
    setFinanceNotif,
  ] = useState(0);

  const [
  roleNotif,
  setRoleNotif,
] = useState(0);

  // =====================================
  // CRAFTING REQUEST NOTIFICATION
  // =====================================
  useEffect(() => {

    const craftingQuery =
      query(
        collectionGroup(
          db,
          "crafting_requests"
        ),
        where(
          "status",
          "==",
          "Pending"
        )
      );

    const unsubscribe =
      onSnapshot(
        craftingQuery,
        (snapshot) => {

          setCraftingNotif(
            snapshot.size
          );
        }
      );

    return () =>
      unsubscribe();

  }, []);

  // =====================================
  // FINANCE APPROVAL NOTIFICATION
  // =====================================
  useEffect(() => {

    const financeQuery =
      query(
        collectionGroup(
          db,
          "finance"
        ),
        where(
          "status",
          "==",
          "Pending"
        )
      );

    const unsubscribe =
      onSnapshot(
        financeQuery,
        (snapshot) => {

          setFinanceNotif(
            snapshot.size
          );
        }
      );

    return () =>
      unsubscribe();

  }, []);

  // =====================================
// ROLE APPROVAL NOTIFICATION
// =====================================
useEffect(() => {

  const roleQuery =
    query(
      collection(
        db,
        "role_requests"
      ),
      where(
        "status",
        "==",
        "pending"
      )
    );

  const unsubscribe =
    onSnapshot(
      roleQuery,
      (snapshot) => {

        setRoleNotif(
          snapshot.size
        );

      }
    );

  return () =>
    unsubscribe();

}, []);

  // =====================================
  // MENU
  // =====================================
  const menu = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },

    {
      name: "Inventory",
      icon: Boxes,
      path: "/inventory",
    },

    {
      name: "Crafting",
      icon: Hammer,
      path: "/crafting",
    },

    {
      name: "Craft Requests",
      icon: ClipboardList,
      path: "/crafting-requests",
      roles: ["Oyabun"],
      notification:
        craftingNotif,
    },
    {
      name: "Deposit / Withdraw",
      icon: Wallet,
      path: "/finance",
    },

    {
      name: "Depo / WD Approval",
      icon: BadgeDollarSign,
      path: "/finance-approval",
      roles: ["Oyabun"],
      notification:
        financeNotif,
    },

    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
    },

    {
      name: "Profile",
      icon: User,
      path: "/profile",
    },

    {
      name: "Recycle Bin",
      icon: Trash2,
      path: "/recycle-bin",
      roles: ["Oyabun"],
    },

    {
      name: "Activity Logs",
      icon: History,
      path: "/activity-logs",
      roles: ["Oyabun"],
    },

    {
      name: "Inventory Approval",
      icon: ShieldCheck,
      path: "/inventory-approval",
      roles: ["Oyabun"],
    },
    {
  name: "Role Approval",
  icon: ShieldCheck,
  path: "/role-approval",
  roles: ["Oyabun"],
  notification:
    roleNotif,
},
  ];

 // =====================
// MEMBERS
// =====================
menu.push({
  name: "Members",
  icon: Users,
  path: "/members",
});

  // =====================================
  // FILTER ROLE
  // =====================================
  const filteredMenu =
    menu.filter(
      (item) => {

        if (!item.roles)
          return true;

        return item.roles.includes(
          role
        );
      }
    );

  return (

    <aside className="w-full max-w-[320px] min-h-screen bg-gradient-to-b from-[#17051f] via-[#120318] to-black border-r border-[#9333EA]/30 p-6 hidden md:flex flex-col relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 pointer-events-none">

        <div className="absolute top-[-120px] left-[-80px] w-full max-w-[260px] min-h-[260px] bg-fuchsia-500/20 blur-3xl rounded-full" />

        <div className="absolute bottom-[-120px] right-[-80px] w-full max-w-[260px] min-h-[260px] bg-purple-500/20 blur-3xl rounded-full" />

        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_top,#ffffff_0%,transparent_55%)]" />

      </div>

      {/* JAPANESE DECORATION */}
      <div className="absolute right-[-30px] top-[120px] rotate-90 text-[80px] font-black text-white/[0.03] tracking-[0.5em] select-none pointer-events-none">

        地獄薔薇

      </div>

      {/* HEADER */}
      <div className="relative z-10">

        <div className="border border-purple-500/20 rounded-3xl bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)]">

          <h1 className="text-[#f5e9ff] text-[28px] leading-none font-black tracking-[0.12em] whitespace-nowrap">

            JIGOKUBARA

          </h1>

          <div className="mt-3 flex items-center gap-3">

            <div className="min-h-[1px] flex-1 bg-gradient-to-r from-purple-500 to-transparent" />

            <span className="text-[10px] text-purple-300 tracking-[0.4em]">

              地獄薔薇

            </span>

          </div>

          <p className="text-purple-200/70 mt-3 text-xs tracking-[0.25em] uppercase">

            OHAYOU GOZAIMASU, {user?.rpName?.toUpperCase() || "GUEST"}-SAN

          </p>

        </div>

      </div>

      {/* PROFILE */}
      <div className="relative z-10 mt-8 bg-white/[0.04] backdrop-blur-xl border border-purple-400/20 rounded-3xl p-4 shadow-[0_0_30px_rgba(168,85,247,0.15)]">

        <div className="flex items-center gap-4">

          <div className="relative">

            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-40 rounded-full" />

            <img
  src={
    user?.photo ||
    "https://i.pravatar.cc/150"
  }
  alt="profile"
  referrerPolicy="no-referrer"
  className="relative w-14 h-14 rounded-full border-2 border-purple-400 object-cover"
/>

          </div>

          <div className="flex flex-col min-w-0">

            <h2 className="text-white font-bold text-sm truncate">
              {user?.rpName ||
                "Unknown User"}
            </h2>

            <p className="text-gray-400 text-xs truncate">
    {(() => {

      const email =
        user?.email || "";

      if (!email.includes("@"))
        return "No Email";

      const [name, domain] =
        email.split("@");

      const first =
        name.charAt(0);

      const lastTwo =
        name.slice(-2);

      const stars =
        "*".repeat(
          Math.max(
            name.length - 3,
            5
          )
        );

      return `${first}${stars}${lastTwo}@${domain}`;

    })()}
  </p>

            <span
              className={`mt-2 text-[10px] px-3 py-1 rounded-full w-fit border ${
                role ===
                "Oyabun"
                  ? "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/30"
                  : "bg-purple-500/20 text-purple-200 border-purple-400/30"
              }`}
            >
              {role}
            </span>

          </div>

        </div>

      </div>

      {/* MENU */}
      <div className="relative z-10 mt-10 flex flex-col gap-3">

        {filteredMenu.map(
          (item) => (

            <NavLink
              key={item.name}
              to={item.path}
              className={({

                isActive,

              }) =>

                `group flex items-center justify-between px-4 py-4 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#6d28d9]/40 to-[#c026d3]/30 border-purple-400/40 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                    : "bg-white/[0.02] border-white/5 text-purple-100/70 hover:bg-purple-500/10 hover:border-purple-400/20 hover:text-white"
                }`
              }
            >

              <div className="flex items-center gap-4">

                <item.icon
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />

                <span className="font-medium tracking-wide">
                  {item.name}
                </span>

              </div>

              {/* NOTIFICATION */}
              {item.notification >
                0 && (

                <div className="bg-gradient-to-r from-fuchsia-500 to-purple-600 min-w-[24px] h-6 px-2 rounded-full flex items-center justify-center text-xs font-bold animate-pulse text-white shadow-lg shadow-fuchsia-500/30">

                  {
                    item.notification
                  }

                </div>

              )}

            </NavLink>
          )
        )}

      </div>

      {/* JAPANESE QUOTE */}
      <div className="relative z-10 mt-auto mb-6">

        <div className="border border-purple-500/10 bg-white/[0.03] rounded-3xl p-4 backdrop-blur-xl">

          <p className="text-purple-200 text-sm tracking-[0.25em] text-center">

            鬼 ・ 狐 ・ 薔薇

          </p>

          <p className="text-gray-500 text-[10px] text-center mt-2 tracking-[0.2em] uppercase">

            Demon • Fox • Rose

          </p>

        </div>

      </div>

      {/* FOOTER */}
      <div className="relative z-10">

        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-purple-200 hover:bg-purple-500/10 transition-all border border-transparent hover:border-purple-400/20 bg-white/[0.02]"
        >

          <LogOut size={20} />

          Logout

        </button>

      </div>

    </aside>
  );
}