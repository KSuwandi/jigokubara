import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";


export default function HomePage() {

const [loading, setLoading] = useState(true);
const [selectedImage, setSelectedImage] = useState(null);

const [isPlaying, setIsPlaying] = useState(false);
const [volume, setVolume] = useState(30);

const particles = useMemo(
  () =>
    Array.from({ length: 60 }, () => ({
      left: Math.random() * 100,
      size: 2 + Math.random() * 5,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
    })),
  []
);
   const audioRef = useRef(null);



useEffect(() => {
  const audio = audioRef.current;

  if (!audio) return;

  audio.volume = volume / 100;

  audio.play()
    .then(() => setIsPlaying(true))
    .catch(() => {});
}, []);

useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false);
  }, 3000);

  return () => clearTimeout(timer);
}, []);

const toggleMusic = () => {
  const audio = audioRef.current;

  if (!audio) return;

  if (audio.paused) {
    audio.play();
    setIsPlaying(true);
  } else {
    audio.pause();
    setIsPlaying(false);
  }
};

const handleVolume = (e) => {
  const value = Number(e.target.value);

  setVolume(value);

  if (audioRef.current) {
    audioRef.current.volume = value / 100;
  }
};

if (loading) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-purple-700/30 blur-[180px] rounded-full" />

      <div className="relative z-10 text-center animate-fadeIn">

        <h1 className="text-6xl md:text-8xl font-black tracking-[0.3em] text-white">
          JIGOKUBARA
        </h1>

        <p className="mt-4 text-3xl text-purple-400">
          極道
        </p>

        <div className="mt-10 w-72 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">

          <div
  className="h-full w-0 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-red-500 animate-loading"
/>
        </div>

        <p className="mt-6 text-gray-400 tracking-[0.3em] uppercase">
          Loading...
        </p>

      </div>

    </div>
  );
}


  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* BACKGROUND EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#120012] via-black to-[#09000f]" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

{particles.map((particle, i) => (
  <span
    key={i}
    className="particle"
    style={{
      left: `${particle.left}%`,
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      animationDuration: `${3 + Math.random() * 4}s`,
animationDelay: `${Math.random() * 2}s`,
      background: "#a855f7",
      boxShadow: "0 0 10px #a855f7",
    }}
  />
))}

</div>

      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute w-full max-w-[500px] min-h-[500px] bg-purple-700 blur-[180px] rounded-full top-[-150px] left-[-100px]" />
        <div className="absolute w-full max-w-[400px] min-h-[400px] bg-fuchsia-700 blur-[160px] rounded-full bottom-[-120px] right-[-80px]" />
      </div>

      {/* MAIN */}
      <div className="relative z-10">
        <div
  className="
  fixed
  bottom-6
  right-6
  z-50
  w-[280px]
  bg-white/5
  backdrop-blur-xl
  border
  border-purple-700/30
  rounded-3xl
  p-4
  shadow-[0_0_30px_rgba(168,85,247,0.25)]
"
>

  <div className="flex items-center gap-4">

    <div
      className={`
      text-3xl
      ${isPlaying ? "animate-spin" : ""}
    `}
      style={{
        animationDuration: "6s",
      }}
    >
      🎵
    </div>

    <div className="flex-1">

      <p className="font-bold text-purple-300">
        Jigokubara Theme
      </p>

      <p className="text-xs text-gray-400">
        {isPlaying ? "Now Playing" : "Paused"}
      </p>

    </div>

    <button
      onClick={toggleMusic}
      className="
      px-4
      py-2
      rounded-xl
      bg-purple-700
      hover:bg-purple-600
      transition-all
    "
    >
      {isPlaying ? "❚❚" : "▶"}
    </button>

  </div>

  <input
    type="range"
    min="0"
    max="100"
    value={volume}
    onChange={handleVolume}
    className="w-full mt-4"
  />

</div>
        <audio
  ref={audioRef}
  loop
>
  <source
    src="https://res.cloudinary.com/dpyhp3o66/video/upload/v1780497295/Jigokubara_Gumi_jzwu4f.mp3"
    type="audio/mpeg"
  />
</audio>

        {/* HERO */}
        <section className="min-h-screen flex items-center justify-center px-6 py-20">

          <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT CONTENT */}
            <div>

              <div className="inline-flex items-center gap-3 bg-[#1a001f]/80 border border-purple-700/30 px-5 py-2 rounded-full backdrop-blur-md mb-8">

                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />

                <span className="text-sm tracking-[0.2em] text-purple-200 uppercase">
                  JIGOKUBARA-GUMI FAMILY ROLEPLAY COMMUNITY
                </span>

              </div>

              <h1 className="text-6xl md:text-8xl font-black leading-none tracking-[0.18em]">

                <span className="text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                  JIGOKU
                </span>

                <br />

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-red-500">
                  BARA
                </span>

              </h1>

              <div className="mt-8 w-40 min-h-[3px] bg-gradient-to-r from-purple-500 to-red-500 rounded-full" />

              <p className="text-gray-300 text-lg md:text-xl leading-relaxed mt-10 max-w-2xl">
                Jigokubara-gumi, atau “Mawar Neraka”, adalah organisasi kriminal bergaya Yakuza yang lahir pada era 1980-an oleh Akihiro Ryu setelah kehancuran klannya di Osaka. Dengan filosofi “Yang indah juga bisa menjadi kehancuran”, keluarga ini membangun kekuasaan melalui loyalitas, kehormatan, dan kekuatan tanpa ampun. Kini Jigokubara dikenal sebagai keluarga bawah tanah yang disegani dan diwariskan turun-temurun oleh keturunan Akihiro.
              </p>

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-5 mt-12">

                <Link to="/login">

                  <button className="group relative overflow-hidden bg-gradient-to-r from-[#4d0066] via-[#7A0019] to-[#a0005a] hover:scale-105 transition-all duration-300 px-10 py-5 rounded-2xl text-xl font-bold shadow-[0_0_40px_rgba(168,85,247,0.35)]">

                    <span className="relative z-10">
                      Enter Organization
                    </span>

                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-all" />

                  </button>

                </Link>

                <Link to="/wardrobe">

  <button className="border border-purple-700/40 hover:border-purple-500 bg-white/5 hover:bg-white/10 transition-all duration-300 px-10 py-5 rounded-2xl text-xl font-semibold backdrop-blur-md">

    Explore the Family

  </button>

</Link>

              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-5 mt-16">

                <div className="bg-white/5 border border-purple-700/20 backdrop-blur-xl rounded-3xl p-5">
                  <h2 className="text-3xl font-black text-purple-400">
                    Place
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Roxwood Island
                  </p>
                </div>

                <div className="bg-white/5 border border-purple-700/20 backdrop-blur-xl rounded-3xl p-5">
                  <h2 className="text-3xl font-black text-fuchsia-400">
                    極道
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Japanese Style
                  </p>
                </div>

                <div className="bg-white/5 border border-purple-700/20 backdrop-blur-xl rounded-3xl p-5">
                  <h2 className="text-3xl font-black text-red-400">
                    Server
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Kota Kita Roleplay
                  </p>
                </div>

              </div>

            </div>

            {/* RIGHT CONTENT */}
            <div className="relative flex justify-center">

              {/* GLOW */}
              <div className="absolute w-full max-w-[500px] min-h-[500px] bg-purple-700/30 blur-[120px] rounded-full" />

              {/* LOGO CARD */}
              <div className="relative group">

                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-[40px] blur-xl opacity-40 group-hover:opacity-60 transition-all duration-500" />

                <div className="relative bg-[#0d0d0d]/90 border border-purple-700/30 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl">

                  {/* GANTI DENGAN LOGO KAMU */}
                  <img
  src="https://i.ibb.co.com/tTKwhGt1/Asset-18.png"
  alt="Jigokubara"
  className="
    w-full
    max-w-[500px]
    object-contain
    animate-floating
    drop-shadow-[0_0_35px_rgba(168,85,247,0.45)]
  "
/>

                </div>

              </div>

            </div>

          </div>

        </section>

{/* JAPANESE QUOTE */}

<section className="py-40 px-6 relative">

  <div className="max-w-5xl mx-auto text-center">

    <p className="text-purple-400 tracking-[0.5em] uppercase text-sm mb-6">
      Philosophy
    </p>

    <h2
      className="
      quote-glow
      text-5xl md:text-7xl
      font-black
      leading-tight
      bg-gradient-to-r
      from-purple-300
      via-fuchsia-400
      to-red-400
      bg-clip-text
      text-transparent
    "
    >
      美しいものは破壊
      <br />
      的でもある
    </h2>

    <p className="mt-8 text-gray-300 text-xl italic">
      "Yang indah juga bisa menjadi kehancuran"
    </p>

    <div
      className="
      w-40
      h-[2px]
      mx-auto
      mt-10
      bg-gradient-to-r
      from-purple-500
      to-red-500
    "
    />

  </div>

</section>

{/* GALLERY */}

<section className="px-6 pb-32">

          <div className="max-w-7xl mx-auto">

            {/* TITLE */}
            <div className="text-center mb-20">

              <p className="text-purple-400 tracking-[0.3em] uppercase text-sm">
                Gallery
              </p>

              <h2 className="text-5xl font-black mt-5">
                Jigokubara Moments
              </h2>

              <div className="w-32 min-h-[3px] bg-gradient-to-r from-purple-500 to-red-500 rounded-full mx-auto mt-8" />

            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              {/* IMAGE 1 */}
              <div
  onClick={() =>
    setSelectedImage(
      "https://i.ibb.co.com/JRW6WTsH/jgb.png"
    )
  }
  className="group relative overflow-hidden rounded-[32px] border border-purple-700/20 bg-[#111111] cursor-pointer"
>

                <img
                  src="https://i.ibb.co.com/JRW6WTsH/jgb.png"
                  alt=""
                  className="w-full min-h-[420px] object-cover group-hover:scale-110 transition-all duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 p-6">

                  <p className="text-purple-300 text-sm tracking-[0.2em] uppercase">
                    Roxwood
                  </p>

                  <h3 className="text-2xl font-bold mt-2">
                    Underground Family
                  </h3>

                </div>

              </div>

              {/* IMAGE 2 */}
              <div
  onClick={() =>
    setSelectedImage(
      "https://i.ibb.co.com/p6GzdCtP/Five-M-GTAProcess-2026-02-10-15-05-02.png"
    )
  }
  className="group relative overflow-hidden rounded-[32px] border border-purple-700/20 bg-[#111111] cursor-pointer"
>

                <img
                  src="https://i.ibb.co.com/p6GzdCtP/Five-M-GTAProcess-2026-02-10-15-05-02.png"
                  alt=""
                  className="w-full min-h-[420px] object-cover group-hover:scale-110 transition-all duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 p-6">

                  <p className="text-fuchsia-300 text-sm tracking-[0.2em] uppercase">
                    Mafia
                  </p>

                  <h3 className="text-2xl font-bold mt-2">
                    Elite Organization
                  </h3>

                </div>

              </div>

              {/* IMAGE 3 */}
              <div
  onClick={() =>
    setSelectedImage(
      "https://i.ibb.co.com/vWYnGbH/Five-M-GTAProcess-2026-02-07-15-40-45.png"
    )
  }
  className="group relative overflow-hidden rounded-[32px] border border-purple-700/20 bg-[#111111] cursor-pointer"
>

                <img
                  src="https://i.ibb.co.com/vWYnGbH/Five-M-GTAProcess-2026-02-07-15-40-45.png"
                  alt=""
                  className="w-full min-h-[420px] object-cover group-hover:scale-110 transition-all duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 p-6">

                  <p className="text-red-300 text-sm tracking-[0.2em] uppercase">
                    Power
                  </p>

                  <h3 className="text-2xl font-bold mt-2">
                    Shadow Empire
                  </h3>

                </div>

              </div>

              {/* IMAGE 4 */}
              <div
  onClick={() =>
    setSelectedImage(
      "https://i.ibb.co.com/zWSYTMLS/Five-M-GTAProcess-2026-02-10-15-03-28.png"
    )
  }
  className="group relative overflow-hidden rounded-[32px] border border-purple-700/20 bg-[#111111] cursor-pointer"
>

                <img
                  src="https://i.ibb.co.com/zWSYTMLS/Five-M-GTAProcess-2026-02-10-15-03-28.png"
                  alt=""
                  className="w-full min-h-[420px] object-cover group-hover:scale-110 transition-all duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 p-6">

                  <p className="text-yellow-300 text-sm tracking-[0.2em] uppercase">
                    Japanese Style
                  </p>

                  <h3 className="text-2xl font-bold mt-2">
                    Jigokubara Clan
                  </h3>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>


      {selectedImage && (
  <div
    onClick={() => setSelectedImage(null)}
    className="
      fixed
      inset-0
      z-[9999]
      bg-black/90
      backdrop-blur-md
      flex
      items-center
      justify-center
      p-6
      animate-fadeIn
    "
  >
    <img
      src={selectedImage}
      alt=""
      className="
        max-w-[95vw]
        max-h-[90vh]
        rounded-3xl
        shadow-[0_0_60px_rgba(168,85,247,0.5)]
      "
    />
  </div>
)}

    </div>
  );
}