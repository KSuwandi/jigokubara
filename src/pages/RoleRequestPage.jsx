import {
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import {
  db,
} from "../services/firebase/config";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function RoleRequestPage() {

  const {
    user,
    role,
  } = useAuth();

  const [
    requestedRole,
    setRequestedRole,
  ] = useState("Shatei");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
  rpName,
  setRpName,
] = useState(
  user?.rpName || ""
);

  // =====================================
  // SUBMIT REQUEST
  // =====================================
  const submitRequest =
  async () => {

    try {

      if (!rpName.trim()) {

        toast.error(
          "RP Name wajib diisi"
        );

        return;
      }

      setLoading(true);

      await addDoc(
          collection(
            db,
            "role_requests"
          ),
          {
  userId:
    user.uid,

  rpName:
    rpName.trim(),

    email:
      user.email,

  requestedRole,

  status:
    "pending",

  createdAt:
    serverTimestamp(),
}
        );

        toast.success(
          "Role request submitted"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed submit request"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <AppLayout>

      <div className="min-h-screen relative overflow-hidden text-white flex items-center justify-center px-6 py-16">

        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-black" />

        <div className="absolute top-[-150px] left-[-100px] w-full max-w-[400px] min-h-[400px] bg-purple-700/30 blur-[140px] rounded-full" />

        <div className="absolute bottom-[-150px] right-[-100px] w-full max-w-[400px] min-h-[400px] bg-fuchsia-700/20 blur-[140px] rounded-full" />

        {/* CARD */}
        <div className="relative z-10 w-full max-w-2xl">

          <div className="bg-[#0f0b16]/90 backdrop-blur-2xl border border-purple-700/30 rounded-[40px] p-10 shadow-[0_0_60px_rgba(168,85,247,0.15)]">

            {/* TOP */}
            <div className="text-center">

              <div className="inline-flex items-center gap-3 bg-purple-900/20 border border-purple-700/30 px-5 py-2 rounded-full mb-8">

                <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />

                <span className="text-purple-300 tracking-[0.2em] uppercase text-xs">
                  Jigokubara Family
                </span>

              </div>

              <h1 className="text-5xl font-black tracking-[0.15em]">

                <span className="text-white">
                  ROLE
                </span>

                <br />

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-red-500">
                  REQUEST
                </span>

              </h1>

              <div className="w-32 min-h-[3px] bg-gradient-to-r from-purple-500 to-red-500 rounded-full mx-auto mt-8" />

              <p className="text-gray-400 mt-8 text-lg leading-relaxed">
                Your account is currently awaiting approval
                from the Jigokubara leadership.
              </p>

            </div>

            {/* FORM */}
            <div className="mt-12">

            <label className="text-sm text-purple-300 tracking-[0.15em] uppercase">
  RP Name
</label>

<input
  type="text"
  value={rpName}
  onChange={(e) =>
    setRpName(
      e.target.value
    )
  }
  placeholder="Masukkan nama karakter GTA RP"
  className="w-full mt-4 bg-[#120d1b] border border-purple-700/30 rounded-3xl px-6 py-5 outline-none text-white focus:border-purple-500 transition-all"
/>

<div className="mt-3 mb-8 text-xs text-gray-400">
  Nama ini akan terlihat oleh Oyabun dan digunakan sebagai identitas karakter RP.
</div>

              <label className="text-sm text-purple-300 tracking-[0.15em] uppercase">
                Select Position
              </label>

              <div className="relative mt-4">

                <select
                  value={
                    requestedRole
                  }
                  onChange={(e) =>
                    setRequestedRole(
                      e.target.value
                    )
                  }
                  className="w-full bg-[#120d1b] border border-purple-700/30 rounded-3xl px-6 py-5 outline-none text-white appearance-none focus:border-purple-500 transition-all"
                >

                  <option value="Shatei">
                    Shatei
                  </option>

                  <option value="Oyabun">
                    Oyabun
                  </option>

                </select>

                {/* ICON */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
                  ▼
                </div>

              </div>

            </div>

            {/* STATUS */}
            <div className="mt-8 bg-[#140f1d] border border-purple-700/20 rounded-3xl p-5">

              <p className="text-gray-400 text-sm uppercase tracking-[0.15em]">
                Current Status
              </p>

              <div className="flex items-center justify-between mt-4">

                <span className="text-2xl font-bold">
                  {role}
                </span>

                <span className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 text-sm font-semibold">
                  Pending
                </span>

              </div>

            </div>

            {/* BUTTON */}
            <button
              disabled={
                loading
              }
              onClick={
                submitRequest
              }
              className="group relative overflow-hidden w-full mt-10 bg-gradient-to-r from-[#4d0066] via-[#7A0019] to-[#a0005a] hover:scale-[1.02] transition-all duration-300 py-5 rounded-3xl text-lg font-bold shadow-[0_0_35px_rgba(168,85,247,0.35)] disabled:opacity-50"
            >

              <span className="relative z-10">

                {loading
                  ? "Submitting..."
                  : "Submit Request"}

              </span>

              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-all" />

            </button>

            {/* FOOTER */}
            <div className="mt-10 text-center">

              <p className="text-gray-500 text-sm italic">
                「美しいものは破壊的でもある」
              </p>

              <p className="text-purple-400 text-xs tracking-[0.25em] mt-2 uppercase">
                Jigokubara-gumi
              </p>

            </div>

          </div>

        </div>

      </div>

    </AppLayout>
  );
}