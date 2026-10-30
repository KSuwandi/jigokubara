import { useEffect, useMemo, useState } from "react";
import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";

import {
  Boxes,
  Wallet,
  Hammer,
  AlertTriangle,
  Bell,
  X,
  Package,
  Layers3,
  ArrowUpRight,
  Activity,
} from "lucide-react";

import AppLayout from "../layouts/AppLayout";
import { db } from "../services/firebase/config";
import { useAuth } from "../contexts/AuthContext";

const formatNumber = (value) => Number(value || 0).toLocaleString("id-ID");

const inventoryThemes = {
  DISNAKER: {
    accent: "text-orange-300",
    iconBg: "bg-orange-400/10",
    border: "border-orange-400/20",
    glow: "from-orange-500/15",
    bar: "bg-orange-400",
    dot: "bg-orange-400",
  },
  BARHAM: {
    accent: "text-rose-300",
    iconBg: "bg-rose-400/10",
    border: "border-rose-400/20",
    glow: "from-rose-500/15",
    bar: "bg-rose-400",
    dot: "bg-rose-400",
  },
  PREPAREAN: {
    accent: "text-sky-300",
    iconBg: "bg-sky-400/10",
    border: "border-sky-400/20",
    glow: "from-sky-500/15",
    bar: "bg-sky-400",
    dot: "bg-sky-400",
  },
};

function InventoryPanel({ title, subtitle, items, theme }) {
  const totalStock = items.reduce(
    (total, item) => total + Number(item.stock || 0),
    0
  );
  const maxStock = Math.max(
    ...items.map((item) => Number(item.stock || 0)),
    1
  );

  return (
    <section
      className={`relative min-w-0 overflow-hidden rounded-[26px] border ${theme.border} bg-[#101116] shadow-[0_18px_55px_rgba(0,0,0,0.22)]`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${theme.glow} to-transparent opacity-80`}
      />

      <div className="relative border-b border-white/[0.07] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.iconBg} ${theme.accent}`}
            >
              <Layers3 size={22} />
            </div>
            <div className="min-w-0">
              <h2 className={`text-lg font-extrabold tracking-wide ${theme.accent}`}>
                {title}
              </h2>
              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-gray-300">
            {items.length} item
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
              Total item
            </p>
            <p className="mt-1.5 text-xl font-bold text-white">
              {formatNumber(items.length)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
              Total stok
            </p>
            <p className={`mt-1.5 text-xl font-bold ${theme.accent}`}>
              {formatNumber(totalStock)}
            </p>
          </div>
        </div>
      </div>

      <div className="relative p-3 sm:p-4">
        <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
          <span>Nama barang</span>
          <span>Stok tersedia</span>
        </div>

        <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
          {items.length > 0 ? (
            items.map((item, index) => {
              const stock = Number(item.stock || 0);
              const percentage = Math.max(
                0,
                Math.min(100, (stock / maxStock) * 100)
              );

              return (
                <div
                  key={item.id}
                  className="group rounded-2xl border border-white/[0.055] bg-white/[0.025] px-3.5 py-3.5 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.055]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[11px] font-bold text-gray-500 transition-colors group-hover:bg-white/10 group-hover:text-gray-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-200 transition-colors group-hover:text-white">
                          {item.name || "Tanpa nama"}
                        </p>
                        <div className="mt-2 h-1 w-full max-w-[150px] overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className={`h-full rounded-full ${theme.bar} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-xl border ${theme.border} ${theme.iconBg} px-3 py-2 text-sm font-bold tabular-nums ${theme.accent}`}
                    >
                      {formatNumber(stock)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-4 text-center">
              <Package size={25} className="text-gray-600" />
              <p className="mt-3 text-sm font-semibold text-gray-400">
                Belum ada data inventory
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Data kategori ini akan muncul di sini.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-white/[0.06] px-5 py-3.5">
        <span className="text-xs text-gray-500">Inventory overview</span>
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${theme.accent}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
          Realtime data
        </span>
      </div>
    </section>
  );
}

function StatCard({ label, value, description, icon: Icon, theme }) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111217] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-[#15161d] sm:p-6">
      <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full ${theme.glow} blur-2xl transition-all duration-300 group-hover:scale-125`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-400">{label}</p>
          <p className={`mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl ${theme.value}`}>
            {formatNumber(value)}
          </p>
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.iconBg} ${theme.value} transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105`}>
          <Icon size={23} />
        </div>
      </div>
      <div className={`relative mt-5 h-1 overflow-hidden rounded-full bg-white/[0.06]`}>
        <div className={`h-full w-1/2 rounded-full ${theme.bar}`} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [inventory, setInventory] = useState([]);
  const [craftRequests, setCraftRequests] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);

  const [latestNotification, setLatestNotification] = useState(null);
  const [showAnnouncementCard, setShowAnnouncementCard] = useState(true);

  // REALTIME DATA
  useEffect(() => {
    const unsubInventory = onSnapshot(
      query(collection(db, "inventory")),
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((item) => !item.deleted);

        setInventory(data);
      }
    );

    let unsubCraft = () => {};
    let unsubWithdraw = () => {};
    let unsubNotification = () => {};

    if (user) {
      unsubCraft = onSnapshot(
        query(
          collection(db, "crafting_requests"),
          where("status", "==", "Pending")
        ),
        (snapshot) => {
          setCraftRequests(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        }
      );

      unsubWithdraw = onSnapshot(
        query(
          collectionGroup(db, "finance"),
          where("status", "==", "Pending")
        ),
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ref: doc.ref,
            ...doc.data(),
          }));

          const filtered = data.filter(
            (item) =>
              item.status === "Pending" &&
              (item.type === "Pengeluaran" ||
                item.type === "Pembayaran Hutang" ||
                item.paymentType === "Hutang")
          );

          setWithdrawRequests(filtered);
        }
      );
    }

    unsubNotification = onSnapshot(
      query(
        collection(db, "notification"),
        orderBy("createdAt", "desc"),
        limit(1)
      ),
      (snapshot) => {
        if (snapshot.empty) {
          setLatestNotification(null);
          return;
        }

        const latestDoc = snapshot.docs[0];
        setLatestNotification({
          id: latestDoc.id,
          ...latestDoc.data(),
        });
      }
    );

    return () => {
      unsubInventory();
      unsubCraft();
      unsubWithdraw();
      unsubNotification();
    };
  }, [user]);

  const uangMerahStock = useMemo(() => {
    const item = inventory.find(
      (i) => i.name?.toLowerCase().trim() === "uang merah"
    );
    return Number(item?.stock || 0);
  }, [inventory]);

  const uangPutihStock = useMemo(() => {
    const item = inventory.find(
      (i) => i.name?.toLowerCase().trim() === "uang putih"
    );
    return Number(item?.stock || 0);
  }, [inventory]);

  const pendingCrafting = useMemo(
    () => craftRequests.filter((i) => i.status === "Pending").length,
    [craftRequests]
  );

  const pendingWithdraw = useMemo(
    () => withdrawRequests.length,
    [withdrawRequests]
  );

  const disnakerInventory = inventory.filter(
    (item) => item.category === "DISNAKER"
  );

  const barhamInventory = inventory.filter(
    (item) => item.category === "BARHAM"
  );

  const prepareInventory = inventory.filter(
    (item) =>
      item.category === "PREPARE" || item.category === "PREPAREAN"
  );

  const totalInventoryItems =
    disnakerInventory.length + barhamInventory.length + prepareInventory.length;

  return (
    <AppLayout>
      <div className="min-h-full w-full px-4 py-6 text-white sm:px-6 lg:px-8">
        {/* ANNOUNCEMENT */}
        {latestNotification && showAnnouncementCard && (
          <section className="relative mb-8 overflow-hidden rounded-[26px] border border-purple-400/20 bg-[#171222] shadow-[0_18px_55px_rgba(90,40,150,0.12)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-fuchsia-500/[0.10] via-purple-500/[0.06] to-transparent" />
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative flex items-start gap-4 p-5 sm:p-6">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  latestNotification.type === "Warning"
                    ? "bg-red-500/15 text-red-300"
                    : latestNotification.type === "Event"
                    ? "bg-blue-500/15 text-blue-300"
                    : latestNotification.type === "News"
                    ? "bg-green-500/15 text-green-300"
                    : "bg-purple-500/15 text-purple-300"
                }`}
              >
                <Bell size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${
                      latestNotification.type === "Warning"
                        ? "border-red-400/20 bg-red-400/10 text-red-300"
                        : latestNotification.type === "Event"
                        ? "border-blue-400/20 bg-blue-400/10 text-blue-300"
                        : latestNotification.type === "News"
                        ? "border-green-400/20 bg-green-400/10 text-green-300"
                        : "border-purple-400/20 bg-purple-400/10 text-purple-300"
                    }`}
                  >
                    {latestNotification.type || "Announcement"}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Latest notification
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-bold leading-tight text-white sm:text-2xl">
                  {latestNotification.title}
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                  {latestNotification.message}
                </p>
                <p className="mt-4 text-xs text-gray-500">
                  Published by {latestNotification.createdBy || "Unknown"}
                </p>
              </div>

              <button
                type="button"
                aria-label="Tutup pengumuman"
                onClick={() => setShowAnnouncementCard(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>
          </section>
        )}

        {/* PAGE HEADER */}
        <header className="mb-8 flex flex-col justify-between gap-4 border-b border-white/[0.07] pb-7 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
              Overview
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Ringkasan inventory dan aktivitas operasional.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3.5 py-2 text-xs font-medium text-emerald-300">
            <Activity size={14} />
            Live monitoring
          </div>
        </header>

        {/* SUMMARY */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-gray-200">Ringkasan</h2>
              <p className="mt-1 text-xs text-gray-500">
                Informasi utama sistem saat ini
              </p>
            </div>
            <span className="text-[11px] text-gray-600">Realtime</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <StatCard
              label="Uang Merah"
              value={uangMerahStock}
              description="Stok tersedia"
              icon={Boxes}
              theme={{
                value: "text-rose-300",
                iconBg: "bg-rose-400/10",
                glow: "bg-rose-500/15",
                bar: "bg-rose-400",
              }}
            />
            <StatCard
              label="Uang Putih"
              value={uangPutihStock}
              description="Stok tersedia"
              icon={Wallet}
              theme={{
                value: "text-emerald-300",
                iconBg: "bg-emerald-400/10",
                glow: "bg-emerald-500/15",
                bar: "bg-emerald-400",
              }}
            />
            <StatCard
              label="Pending Crafting"
              value={pendingCrafting}
              description="Menunggu proses"
              icon={Hammer}
              theme={{
                value: "text-amber-300",
                iconBg: "bg-amber-400/10",
                glow: "bg-amber-500/15",
                bar: "bg-amber-400",
              }}
            />
            <StatCard
              label="Pending Withdraw"
              value={pendingWithdraw}
              description="Menunggu persetujuan"
              icon={AlertTriangle}
              theme={{
                value: "text-red-300",
                iconBg: "bg-red-400/10",
                glow: "bg-red-500/15",
                bar: "bg-red-400",
              }}
            />
          </div>
        </section>

        {/* INVENTORY */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                <Package size={14} />
                Stock management
              </div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Inventory Overview
              </h2>
              <p className="mt-1.5 text-sm text-gray-500">
                Rincian stok berdasarkan kategori inventory.
              </p>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5">
              <ArrowUpRight size={15} className="text-gray-400" />
              <span className="text-xs text-gray-400">
                {formatNumber(totalInventoryItems)} total item
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
            <InventoryPanel
              title="DISNAKER"
              subtitle="Inventory kategori Disnaker"
              items={disnakerInventory}
              theme={inventoryThemes.DISNAKER}
            />
            <InventoryPanel
              title="BARHAM"
              subtitle="Inventory kategori Barham"
              items={barhamInventory}
              theme={inventoryThemes.BARHAM}
            />
            <InventoryPanel
              title="PREPAREAN"
              subtitle="Inventory kategori Preparean"
              items={prepareInventory}
              theme={inventoryThemes.PREPAREAN}
            />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
