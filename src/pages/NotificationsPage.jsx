import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  Bell,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import { db } from "../services/firebase/config";

import { useAuth } from "../contexts/AuthContext";

export default function NotificationsPage() {

  const { role, user } =
    useAuth();

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    type,
    setType,
  ] = useState("Announcement");

  // =====================================
  // PAGINATION
  // =====================================
  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const ITEMS_PER_PAGE = 5;

  // =====================================
  // LOAD NOTIFICATIONS
  // =====================================
  useEffect(() => {

    const q = query(
      collection(
        db,
        "notification"
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
                ...doc.data(),
              })
            );

          setNotifications(
            data
          );
        }
      );

    return () =>
      unsubscribe();

  }, []);

  // =====================================
  // CREATE ANNOUNCEMENT
  // =====================================
  const createAnnouncement =
    async () => {

      try {

        if (
          !title.trim() ||
          !message.trim()
        ) {

          toast.error(
            "Please fill all fields"
          );

          return;
        }

        setLoading(true);

        await addDoc(
          collection(
            db,
            "notification"
          ),
          {

            title:
              title.trim(),

            message:
              message.trim(),

            type,

            createdBy:
              user?.rpName ||
              user?.displayName,

            createdAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Announcement created"
        );

        setTitle("");
        setMessage("");
        setType(
          "Announcement"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed create announcement"
        );

      } finally {

        setLoading(false);
      }
    };

  // =====================================
  // DELETE ANNOUNCEMENT
  // =====================================
  const deleteNotification =
    async (id) => {

      try {

        await deleteDoc(
          doc(
            db,
            "notification",
            id
          )
        );

        toast.success(
          "Announcement deleted"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed delete announcement"
        );
      }
    };

  // =====================================
  // PAGINATION DATA
  // =====================================
  const totalPages =
    Math.ceil(
      notifications.length /
        ITEMS_PER_PAGE
    );

  const paginatedNotifications =
    useMemo(() => {

      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      const end =
        start +
        ITEMS_PER_PAGE;

      return notifications.slice(
        start,
        end
      );

    }, [
      notifications,
      currentPage,
    ]);

  return (

    <AppLayout>

      <div className="relative min-h-screen overflow-hidden text-white">

        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-black" />

        <div className="absolute top-[-150px] left-[-100px] [450px] h-[450px] bg-fuchsia-700/20 blur-[140px] rounded-full" />

        <div className="absolute bottom-[-150px] right-[-100px] w-full max-w-[450px] h-[450px] bg-purple-700/20 blur-[140px] rounded-full" />

        {/* CONTENT */}
        <div className="relative z-10">

          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">

            <div>

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-700 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.45)]">

                  <Bell size={28} />

                </div>

                <div>

                  <h1 className="text-5xl font-black tracking-[0.12em]">

                    NOTIFICATIONS

                  </h1>

                  <p className="text-purple-200/60 mt-2">

                    Jigokubara family announcement center

                  </p>

                </div>

              </div>

            </div>

            {/* STATUS */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-purple-500/20 rounded-3xl px-6 py-4">

              <p className="text-xs uppercase tracking-[0.3em] text-purple-300">

                Current Role

              </p>

              <h2 className="text-2xl font-bold mt-2">

                {role}

              </h2>

            </div>

          </div>

          {/* CREATE ANNOUNCEMENT */}
          {role ===
            "Oyabun" && (

            <div className="mb-10 bg-white/[0.04] backdrop-blur-2xl border border-purple-500/20 rounded-[32px] p-8 shadow-[0_0_40px_rgba(168,85,247,0.12)]">

              <div className="flex items-center gap-3 mb-8">

                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-700 flex items-center justify-center">

                  <Plus size={20} />

                </div>

                <div>

                  <h2 className="text-2xl font-bold">
                    Create Announcement
                  </h2>

                  <p className="text-gray-400 text-sm mt-1">
                    Publish family news or important information
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* TITLE */}
                <div>

                  <label className="text-sm text-purple-300 tracking-[0.15em] uppercase">
                    Title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(
                        e.target.value
                      )
                    }
                    placeholder="Announcement title..."
                    className="w-full mt-3 bg-[#120d1b] border border-purple-500/20 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 text-white"
                  />

                </div>

                {/* TYPE */}
                <div>

                  <label className="text-sm text-purple-300 tracking-[0.15em] uppercase">
                    Type
                  </label>

                  <select
                    value={type}
                    onChange={(e) =>
                      setType(
                        e.target.value
                      )
                    }
                    className="w-full mt-3 bg-[#120d1b] border border-purple-500/20 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 text-white"
                  >

                    <option value="Announcement">
                      Announcement
                    </option>

                    <option value="News">
                      News
                    </option>

                    <option value="Warning">
                      Warning
                    </option>

                    <option value="Event">
                      Event
                    </option>

                  </select>

                </div>

              </div>

              {/* MESSAGE */}
              <div className="mt-5">

                <label className="text-sm text-purple-300 tracking-[0.15em] uppercase">
                  Message
                </label>

                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  placeholder="Write announcement..."
                  className="w-full mt-3 bg-[#120d1b] border border-purple-500/20 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 text-white resize-none"
                />

              </div>

              {/* BUTTON */}
              <button
                disabled={loading}
                onClick={
                  createAnnouncement
                }
                className="mt-6 bg-gradient-to-r from-purple-700 via-fuchsia-700 to-purple-700 hover:scale-[1.02] transition-all duration-300 px-8 py-4 rounded-2xl font-bold shadow-[0_0_30px_rgba(168,85,247,0.35)] disabled:opacity-50"
              >

                {loading
                  ? "Publishing..."
                  : "Publish Announcement"}

              </button>

            </div>

          )}

          {/* ANNOUNCEMENT LIST */}
          <div className="space-y-6">

            {paginatedNotifications.map(
              (item) => (

                <div
                  key={item.id}
                  className="group relative overflow-hidden bg-white/[0.04] backdrop-blur-2xl border border-purple-500/15 rounded-[32px] p-7 hover:border-purple-400/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
                >

                  {/* GLOW */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r from-purple-600/5 via-fuchsia-500/5 to-transparent" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                    {/* LEFT */}
                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <span className="px-4 py-2 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-200 text-xs uppercase tracking-[0.2em]">

                          {item.type}

                        </span>

                        <span className="text-gray-500 text-sm">

                          by {item.createdBy || "Unknown"}

                        </span>

                      </div>

                      <h2 className="text-3xl font-black mt-5">

                        {item.title}

                      </h2>

                      <p className="text-gray-300 leading-8 mt-5 whitespace-pre-wrap">

                        {item.message}

                      </p>

                    </div>

                    {/* ACTION */}
                    {role ===
                      "Oyabun" && (

                      <button
                        onClick={() =>
                          deleteNotification(
                            item.id
                          )
                        }
                        className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-300 px-5 py-3 rounded-2xl transition-all"
                      >

                        <Trash2 size={18} />

                        Delete

                      </button>

                    )}

                  </div>

                </div>
              )
            )}

            {/* EMPTY */}
            {notifications.length ===
              0 && (

              <div className="bg-white/[0.03] border border-dashed border-purple-500/20 rounded-[32px] p-16 text-center">

                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto">

                  <Bell
                    size={40}
                    className="text-purple-300"
                  />

                </div>

                <h2 className="text-3xl font-bold mt-8">
                  No Notifications
                </h2>

                <p className="text-gray-400 mt-4">
                  There are currently no announcements from the family leadership.
                </p>

              </div>

            )}

          </div>

          {/* PAGINATION */}
          {notifications.length >
            ITEMS_PER_PAGE && (

            <div className="flex items-center justify-center gap-4 mt-10">

              {/* PREV */}
              <button
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      prev - 1
                  )
                }
                className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-purple-500/20 flex items-center justify-center hover:bg-purple-500/10 transition-all disabled:opacity-40"
              >

                <ChevronLeft size={20} />

              </button>

              {/* PAGE */}
              <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-700/30 to-fuchsia-700/30 border border-purple-500/20 font-bold tracking-[0.2em]">

                {currentPage} / {totalPages}

              </div>

              {/* NEXT */}
              <button
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      prev + 1
                  )
                }
                className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-purple-500/20 flex items-center justify-center hover:bg-purple-500/10 transition-all disabled:opacity-40"
              >

                <ChevronRight size={20} />

              </button>

            </div>

          )}

        </div>

      </div>

    </AppLayout>
  );
}