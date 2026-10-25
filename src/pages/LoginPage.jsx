import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {

  const { loginWithGoogle } = useAuth();

  return (

    <div className="relative min-h-screen overflow-hidden bg-[#090011] flex items-center justify-center px-6">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#14001f] via-[#090011] to-black" />

      {/* PURPLE GLOW */}
      <div className="absolute top-[-150px] left-[-120px] w-[450px] h-[450px] bg-fuchsia-700/20 blur-3xl rounded-full" />

      <div className="absolute bottom-[-150px] right-[-120px] w-[450px] h-[450px] bg-purple-700/20 blur-3xl rounded-full" />

      {/* JAPANESE GRID */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* JAPANESE TEXT */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 rotate-180 writing-mode-vertical text-purple-300/10 text-6xl font-black tracking-[12px] hidden lg:block">
        地獄薔薇
      </div>

      {/* CARD */}
      <motion.div
        initial={{
          opacity: 0,
          y: 50,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.7,
        }}
        className="relative z-10 w-full max-w-md"
      >

        {/* GLOW */}
        <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-[40px]" />

        {/* MAIN CARD */}
        <div className="relative overflow-hidden rounded-[36px] border border-purple-400/20 bg-white/5 backdrop-blur-2xl p-10 shadow-[0_0_50px_rgba(168,85,247,0.15)]">

          {/* TOP DECOR */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60" />

          {/* LOGO */}
          <div className="flex justify-center">

            <div className="relative">

              <img
  src="https://i.ibb.co.com/tTKwhGt1/Asset-18.png"
  alt="Jigokubara"
  className="w-32 drop-shadow-[0_0_25px_rgba(192,132,252,0.5)]"
/>
              <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />

            </div>

          </div>

          {/* TITLE */}
          <h1 className="mt-6 text-center text-[#f5e6ff] text-4xl font-black tracking-[0.22em]">
            JIGOKUBARA
          </h1>

          {/* JAPANESE */}
          <p className="text-center text-purple-300/70 tracking-[0.5em] mt-2 text-sm">
            地獄薔薇
          </p>

          {/* LINE */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent my-6" />

          {/* DESC */}
          <p className="text-center text-purple-100/60 text-sm leading-7">
            Selamat Datang di Jigokubara-Gumi 
            <br />
            Login using your Google account to continue.
          </p>

          {/* BUTTON */}
          <button
            onClick={loginWithGoogle}
            className="group relative overflow-hidden w-full mt-10 rounded-2xl bg-gradient-to-r from-purple-700 to-fuchsia-700 py-4 text-white font-bold tracking-wider transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          >

            {/* BUTTON GLOW */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/10" />

            <span className="relative z-10">
              LOGIN WITH GOOGLE
            </span>

          </button>

          {/* BOTTOM JAPANESE */}
          <div className="mt-8 text-center">

            <p className="text-[11px] uppercase tracking-[0.35em] text-purple-300/40">
              Ohayou gozaimasu, welcome to Jigokubara
            </p>

          </div>

        </div>

      </motion.div>

    </div>
  );
}