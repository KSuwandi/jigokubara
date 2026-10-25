import {
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import {
  useNavigate,
} from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import EmptyState from "../components/common/EmptyState";
import FamilyHierarchy from "../components/FamilyHierarchy";

const ITEMS_PER_PAGE = 9;

export default function WardrobePage() {

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
  selectedOutfit,
  setSelectedOutfit,
] = useState(null);

const [
  selectedImage,
  setSelectedImage,
] = useState(null);

const [
  showcaseIndex,
  setShowcaseIndex,
] = useState(0);

const [activeTab, setActiveTab] =
  useState("wardrobe");

const navigate =
  useNavigate();

  const [musicOn, setMusicOn] =
  useState(true);

const [volume, setVolume] =
  useState(30); // 0 - 100

const audioRef =
  useRef(null);

  // =====================================
  // OUTFITS DATA
  // GANTI URL FOTO SESUAI BAJU KAMU
  // =====================================

 const outfits = [
  {
    id: 1,
    title: "Jigokubara Black Executive Suit",
    access: "Oyabun & High Command",
    category: "Executive",
    image: "https://i.imgur.com/BIrDV3x.png",

    images: [
    "https://i.imgur.com/BIrDV3x.png",
    "https://i.imgur.com/ltqYQ22.png",
    "https://i.imgur.com/3S5Sskg.png",
  ],

     code: "JGK-EX-001",

  acquisition:
    "Family Headquarters",

  rarity:
    "Legendary",

  version:
    "Season 1",

  description:
    "Formal executive attire reserved for the highest leadership of the Jigokubara Family."
  },

  {
    id: 2,
    title: "Jigokubara White Executive Suit",
    access: "Hashira & Aniki",
    category: "Executive",
    image: "https://i.imgur.com/Z7ojl31.png",
    images: [
    "https://i.imgur.com/Z7ojl31.png",
    "https://i.imgur.com/r9tmtOw.png",
    "https://i.imgur.com/EfZcjXw.png",
  ],
    code: "JGK-EX-002",

acquisition:
  "Leadership Reward",

rarity:
  "Epic",

version:
  "Season 1",

description:
  "White executive suit representing authority and prestige inside the family.",
  },

  {
    id: 3,
    title: "Jigokubara Black Dress Shirt",
    access: "All Members",
    category: "Uniform",
    image: "https://i.imgur.com/5JPm3AL.png",
images: [
    "https://i.imgur.com/5JPm3AL.png",
    "https://i.imgur.com/7so7FMi.png",
  ],
    code: "JGK-UN-001",

acquisition:
  "Family Supply",

rarity:
  "Common",

version:
  "Season 1",

description:
  "Standard black dress shirt used by active family members.",
  },

  {
    id: 4,
    title: "Jigokubara White-A Dress Shirt",
    access: "All Members",
    category: "Uniform",
    image: "https://i.imgur.com/AE0df0f.png",
images: [
    "https://i.imgur.com/AE0df0f.png",
    "https://i.imgur.com/9ihCHLh.png",
  ],
    code: "JGK-UN-001",

acquisition:
  "Family Supply",

rarity:
  "Common",

version:
  "Season 1",

description:
  "Standard White-A dress shirt used by active family members.",
  },
  {
    id: 5,
    title: "Jigokubara White-B Dress Shirt",
    access: "All Members",
    category: "Uniform",
    image: "https://i.imgur.com/JkBVH9g.png",
images: [
    "https://i.imgur.com/JkBVH9g.png",
    "https://i.imgur.com/YRZeynZ.png",
  ],
    code: "JGK-UN-001",

acquisition:
  "Family Supply",

rarity:
  "Common",

version:
  "Season 1",

description:
  "Standard White-B dress shirt used by active family members.",
  },

  {
    id: 6,
    title: "Jigokubara Purple-Black Dress Shirt",
    access: "All Members",
    category: "Uniform",
    image: "https://i.imgur.com/nvrluYg.png",
    images: [
      "https://i.imgur.com/nvrluYg.png",
      "https://i.imgur.com/YFsHlxa.png",
    ],
    code: "JGK-UN-001",
    acquisition: "Family Supply",
    rarity: "Common",
    version: "Season 1",
    description: "Standard purple-black dress shirt used by active family members.",
  },

  {
    id: 7,
    title: "Jigokubara White Tracksuit",
    access: "All Members",
    category: "Casual",
    image: "https://i.imgur.com/rV2a8xH.png",
    images: [
      "https://i.imgur.com/rV2a8xH.png",
      "https://i.imgur.com/Qbk2Eqv.png",
      "https://i.imgur.com/yQ4gdxi.png",
    ],
    code: "JGK-CS-001",
    acquisition: "Family Supply",
    rarity: "Common",
    version: "Season 1",
    description: "Standard white tracksuit used by active family members.",
  },

  {
    id: 8,
    title: "Jigokubara Black Tracksuit",
    access: "All Members",
    category: "Casual",
    image: "https://i.imgur.com/A55yJMp.png",
    images: [
      "https://i.imgur.com/A55yJMp.png",
      "https://i.imgur.com/xiP3YQo.png",
      "https://i.imgur.com/9EibzvR.png",
    ],
    code: "JGK-CS-001",
    acquisition: "Family Supply",
    rarity: "Common",
    version: "Season 1",
    description: "Standard black tracksuit used by active family members.",
  },

  {
    id: 9,
    title: "Jigokubara Purple-White Tracksuit",
    access: "All Members",
    category: "Casual",
    image: "https://i.imgur.com/seMC8v2.png",
    images: [
      "https://i.imgur.com/seMC8v2.png",
      "https://i.imgur.com/bFqubMl.png",
      "https://i.imgur.com/EvfUsPO.png",
    ],
    code: "JGK-CS-001",
    acquisition: "Family Supply",
    rarity: "Common",
    version: "Season 1",
    description: "Standard purple-white tracksuit used by active family members.",
  },

  {
    id: 10,
    title: "Jigokubara Purple-Black Tracksuit",
    access: "All Members",
    category: "Casual",
    image: "https://i.imgur.com/Y7vdC1y.png",
    images: [
      "https://i.imgur.com/Y7vdC1y.png",
      "https://i.imgur.com/vtiF97j.png",
      "https://i.imgur.com/m6GvXli.png",
    ],
    code: "JGK-CS-001",
    acquisition: "Family Supply",
    rarity: "Common",
    version: "Season 1",
    description: "Standard purple-black tracksuit used by active family members.",
  },
  {
    id: 11,
    title: "Jigokubara Armor",
    access: "All Members",
    category: "Combat",
    image: "https://i.imgur.com/db4qF58.png",
    code: "JGK-CB-001",

acquisition:
  "Combat Division",

rarity:
  "Legendary",

version:
  "Season 1",

description:
  "Heavy combat armor issued during high-risk operations and warfare.",
  },
];

  const categories = [
  "All",
  "Executive",
  "Uniform",
  "Casual",
  "Combat",
];


const showcaseOutfits = [
  outfits[0],
  outfits[1],
  outfits[9],
];


useEffect(() => {

  const interval =
    setInterval(() => {

      setShowcaseIndex(
        (prev) =>
          prev ===
          showcaseOutfits.length - 1
            ? 0
            : prev + 1
      );

    }, 5000);

  return () =>
    clearInterval(interval);

}, []);

const currentShowcase =
  showcaseOutfits[showcaseIndex];

useEffect(() => {

  const audio =
    audioRef.current;

  if (!audio) return;

  if (musicOn) {

  audio.volume = volume / 100;

  audio.play().catch(() => {
    console.log(
      "Autoplay blocked by browser"
    );
  });

} else {

    audio.pause();

  }

}, [musicOn]);

useEffect(() => {

  if (!audioRef.current) return;

  audioRef.current.volume =
    volume / 100;

}, [volume]);

useEffect(() => {

  const startMusic = () => {

    if (
      audioRef.current &&
      musicOn
    ) {

      audioRef.current
        .play()
        .catch(() => {});

    }

    window.removeEventListener(
      "click",
      startMusic
    );

  };

  window.addEventListener(
    "click",
    startMusic
  );

  return () =>
    window.removeEventListener(
      "click",
      startMusic
    );

}, [musicOn]);

  // =====================================
  // FILTER
  // =====================================


  
  const filteredOutfits =
    useMemo(() => {

      let data =
        [...outfits];

      if (
        filter !== "All"
      ) {

        data =
          data.filter(
            (
              item
            ) =>
              item.category ===
              filter
          );
      }

      if (
        search.trim()
      ) {

        data =
          data.filter(
            (
              item
            ) =>
               item.title
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    item.access
      .toLowerCase()
      .includes(search.toLowerCase())
          );
      }

      return data;

    }, [
      search,
      filter,
    ]);

  const totalPages =
    Math.ceil(
      filteredOutfits.length /
        ITEMS_PER_PAGE
    );

  const paginatedItems =
    useMemo(() => {

      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      return filteredOutfits.slice(
        start,
        start +
          ITEMS_PER_PAGE
      );

    }, [
      filteredOutfits,
      currentPage,
    ]);

  return (

    <AppLayout>

    <audio
  ref={audioRef}
  loop
  autoPlay
>
  <source
    src="https://res.cloudinary.com/dpyhp3o66/video/upload/v1780386974/Jigokubara_Gumi_1_nitksm.mp3"
    type="audio/mpeg"
  />
</audio>

      <div className="relative min-h-screen overflow-hidden text-white">

        {/* BACKGROUND */}

        <div className="absolute inset-0 bg-gradient-to-br from-[#070707]
via-[#130909]
to-[#000000]" />

        <div className="absolute top-0 left-0 w-full max-w-[600px] min-h-[600px] bg-red-900/20 blur-[200px] rounded-full" />

        <div className="absolute bottom-0 right-0 w-full max-w-[500px] min-h-[500px] bg-yellow-600/10 blur-[180px] rounded-full" />

        <div className="relative z-10 p-6">

          {/* HERO */}

          <div
className="
relative
overflow-hidden
bg-gradient-to-br
from-[#1b0828]
via-[#12061f]
to-[#09030f]
backdrop-blur-xl
border
border-fuchsia-700/30
rounded-3xl
px-8
py-8
mb-8
shadow-[0_0_60px_rgba(168,85,247,0.15)]
"
>

  {/* Background Accent */}

  <div className="absolute inset-0 opacity-20">

    <div
  className="
  absolute
  top-0
  right-0
  w-full max-w-[400px]
  min-h-[400px]
  bg-fuchsia-700/25
  blur-[150px]
  rounded-full
  "
/>

  </div>

  <div
    className="
    relative
    flex
    flex-col
    lg:flex-row
    items-center
    gap-8
    "
  >

    {/* LOGO */}

    <div
      className="
      shrink-0
      w-32
      h-32
      rounded-full
      border
      border-fuchsia-600/40
      bg-black/50
      flex
      items-center
      justify-center
      shadow-[0_0_40px_rgba(168,85,247,0.35)]
      "
    >

      <img
        src="https://i.ibb.co.com/WWgcd7nf/Asset-18.png"
        alt="Jigokubara"
        className="w-24 h-24 object-contain"
      />

    </div>

    {/* CONTENT */}

    <div className="flex-1">

      <p
        className="
        text-fuchsia-400
        uppercase
        tracking-[0.8em]
        text-xs
        mb-2
        "
      >
        極道原組
      </p>

      <h1
        className="
        text-4xl
        lg:text-5xl
        font-black
        text-white
        tracking-wider
        "
      >
        JIGOKUBARA
      </h1>

      <p
        className="
        text-yellow-500
        tracking-[0.4em]
        uppercase
        text-sm
        mt-2
        "
      >
        Loyalty • Honor • Power
      </p>

      <div
        className="
        w-24
        min-h-[2px]
        bg-gradient-to-r
        from-fuchsia-500
to-purple-700
        mt-4
        mb-4
        "
      />

      <p
        className="
        text-gray-400
        max-w-3xl
        leading-relaxed
        "
      >
        Official wardrobe archive of the
        Jigokubara Family. Browse executive
        suits, combat armor, ceremonial
        uniforms, and exclusive outfits
        reserved for family members.
      </p>

    </div>

    {/* SIDE INFO */}

    {/* RIGHT SIDE */}

<div
  className="
  hidden
  xl:flex
  items-center
  gap-8
  "
>

  {/* BIG LOGO */}

  <img
    src="https://i.ibb.co.com/TDpRVV6Q/Asset-19.png"
    alt="Jigokubara Symbol"
    className="
      w-56
      h-56
      object-contain
      opacity-90
      drop-shadow-[0_0_40px_rgba(168,85,247,0.45)]
    "
  />

  {/* INFO BADGES */}

  <div
    className="
    flex
    flex-col
    gap-3
    "
  >

    <span
      className="
      px-4
      py-2
      rounded-xl
      bg-red-900/20
      border
      border-red-700/30
      text-red-300
      text-sm
      "
    >
      GTA V Roleplay
    </span>

    <span
      className="
      px-4
      py-2
      rounded-xl
      bg-yellow-900/10
      border
      border-yellow-700/30
      text-yellow-300
      text-sm
      "
    >
      Family Archive
    </span>

    <button
  onClick={() =>
    setMusicOn(!musicOn)
  }
  className="
    px-4
    py-2
    rounded-xl
    bg-fuchsia-900/20
    border
    border-fuchsia-500/30
    text-fuchsia-300
    text-sm
    hover:bg-fuchsia-700/20
    transition-all
  "
>
  {musicOn
    ? "🔊 Music ON"
    : "🔇 Music OFF"}
</button>
<div
  className="
    bg-black/30
    border
    border-fuchsia-500/20
    rounded-xl
    px-3
    py-3
  "
>

  <div
    className="
      flex
      justify-between
      items-center
      mb-2
    "
  >

    <span
      className="
        text-xs
        text-fuchsia-300
      "
    >
      Volume
    </span>

    <span
      className="
        text-xs
        text-fuchsia-200
        font-bold
      "
    >
      {volume}%
    </span>

  </div>

  <input
    type="range"
    min="0"
    max="100"
    value={volume}
    onChange={(e) =>
      setVolume(
        Number(
          e.target.value
        )
      )
    }
    className="
      w-full
      cursor-pointer
    "
  />

</div>

  </div>

</div>

  </div>

</div>

{/* NAVIGATION TABS */}

<div
  className="
    flex
    items-center
    gap-4
    mb-10
    bg-white/5
    border
    border-purple-900/40
    rounded-3xl
    p-3
    backdrop-blur-xl
  "
>

  <button
    onClick={() =>
      setActiveTab("wardrobe")
    }
    className={`
      flex-1
      py-4
      rounded-2xl
      font-bold
      transition-all
      ${
        activeTab === "wardrobe"
          ? "bg-gradient-to-r from-purple-700 to-fuchsia-700 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)]"
          : "text-gray-400 hover:text-white"
      }
    `}
  >
    👘 Wardrobe
  </button>

  <button
    onClick={() =>
      setActiveTab("hierarchy")
    }
    className={`
      flex-1
      py-4
      rounded-2xl
      font-bold
      transition-all
      ${
        activeTab === "hierarchy"
          ? "bg-gradient-to-r from-purple-700 to-fuchsia-700 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)]"
          : "text-gray-400 hover:text-white"
      }
    `}
  >
    🏯 Family Hierarchy
  </button>

</div>

{activeTab === "wardrobe" && (
  <>

    {/* CURRENT SHOWCASE */}

<div
  className="
    relative
    overflow-hidden
    rounded-[40px]
    border
    border-purple-800/40
    bg-gradient-to-br
    from-[#0B0714]
    via-[#12081F]
    to-[#050508]
    backdrop-blur-2xl
    mb-10
  "
>

  <div className="grid lg:grid-cols-2">

    {/* IMAGE */}

    <div className="relative">

      <img
        src={currentShowcase.image}
        alt={currentShowcase.title}
        className="
          w-full
          min-h-[600px]
          object-cover
        "
      />

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-transparent
          via-transparent
          to-black
        "
      />

    </div>

    {/* CONTENT */}

    <div
      className="
        p-10
        flex
        flex-col
        justify-center
      "
    >

      <p
        className="
          text-fuchsia-400
          uppercase
          tracking-[0.4em]
          text-sm
          mb-4
        "
      >
        Featured Uniform
      </p>

      <h2
        className="
          text-5xl
          font-black
          leading-tight
          mb-6
        "
      >
        {currentShowcase.title}
      </h2>

      <p
        className="
          text-gray-300
          text-lg
          leading-relaxed
        "
      >
        {currentShowcase.description}
      </p>

      <div
        className="
          grid
          grid-cols-2
          gap-4
          mt-8
        "
      >

        <div className="bg-white/5 rounded-2xl p-4">
          <p className="text-purple-400 text-xs">
            CATEGORY
          </p>

          <h3 className="font-bold mt-2">
            {currentShowcase.category}
          </h3>
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <p className="text-purple-400 text-xs">
            RARITY
          </p>

          <h3 className="font-bold mt-2 text-yellow-300">
            {currentShowcase.rarity}
          </h3>
        </div>

      </div>

      <button
        onClick={() =>
          setSelectedOutfit(
            currentShowcase
          )
        }
        className="
          mt-8
          w-fit
          px-8
          py-4
          rounded-2xl
          bg-gradient-to-r
          from-purple-700
          to-fuchsia-700
          font-bold
          hover:scale-105
          transition-all
        "
      >
        View Details
      </button>

    </div>

  </div>

</div>


          {/* STATS */}

 </>
)}
    {activeTab === "hierarchy" && (
  <FamilyHierarchy />
)}

{activeTab === "wardrobe" && (
<>
          {/* SEARCH */}

          <div className="mb-6">

            <input
              type="text"
              placeholder="Search wardrobe..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full md:w-[400px] bg-[#12081F]/70 border border-purple-700/30 rounded-2xl px-5 py-4 outline-none focus:border-fuchsia-500"
            />

          </div>

          {/* FILTER */}

          <div className="flex flex-wrap gap-3 mb-10">

            {categories.map(
              (
                category
              ) => (

                <button
                  key={
                    category
                  }
                  onClick={() =>
                    setFilter(
                      category
                    )
                  }
                  className={`px-5 py-3 rounded-2xl transition-all font-semibold ${
                    filter ===
                    category
                      ? "bg-gradient-to-r from-purple-700 to-fuchsia-700"
                      : "bg-[#12081F]/70 border border-purple-700/30"
                  }`}
                >
                  {category}
                </button>

              )
            )}

          </div>

                    {/* OUTFIT GRID */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {paginatedItems.map(
              (item) => (

                <div
  key={item.id}
  onClick={() => {
  setSelectedOutfit(item);

  setSelectedImage(
    item.images?.[0] ||
    item.image
  );
}}
  className="
group
relative
cursor-pointer
overflow-hidden
bg-gradient-to-br
from-[#0B0714]
via-[#12081F]
to-[#050508]
backdrop-blur-2xl
border
border-purple-700/30
hover:border-fuchsia-500/70
rounded-[32px]
transition-all
duration-500
hover:-translate-y-2
hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]
"
>
                  <div
    className="
      absolute
      inset-0
      opacity-0
      group-hover:opacity-100
      transition-all
      duration-500
      bg-gradient-to-br
      from-fuchsia-500/10
      via-transparent
      to-purple-500/10
    "
  />

                  {/* IMAGE */}

                  <div className="relative overflow-hidden">

                    <img
                      src={
  item.image ||
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f"
}
                      alt={item.title}
                      className="w-full min-h-[450px] object-cover group-hover:scale-125 transition-all duration-700"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute top-4 right-4">

                      <span className="px-3 py-1 rounded-full bg-purple-900/70 backdrop-blur-xl border border-purple-500/30 text-xs font-semibold">
                        {item.category}
                      </span>

                    </div>

                  </div>

                  {/* CONTENT */}

                  <div className="p-6">

  <h2 className="text-2xl font-black text-white mb-4">
    {item.title}
  </h2>

  <div className="space-y-4">

    <div>

      <p className="text-xs uppercase tracking-widest text-purple-400">
        Category
      </p>

      <p className="font-semibold">
        {item.category}
      </p>

    </div>

    <div>

      <p className="text-xs uppercase tracking-widest text-purple-400">
        Authorized Rank
      </p>

      <span
  className="
    inline-flex
    px-3
    py-2
    rounded-full
    bg-red-900/20
    border
    border-purple-500/30
    text-fuchsia-200
    font-semibold
  "
>
  {item.access}
</span>

    </div>

    <div>

      <p className="text-xs uppercase tracking-widest text-purple-400">
        Status
      </p>

      <span className="inline-flex px-3 py-1 rounded-full bg-purple-700/30 border border-purple-500/30 text-purple-200 text-sm">
        Official Uniform
      </span>

      <div className="mt-4">

  <span
    className="
      px-4
      py-2
      rounded-full
      bg-gradient-to-r
      from-purple-700
      to-fuchsia-700
      text-white
      text-xs
      tracking-widest
      uppercase
      font-bold
    "
  >
    Jigokubara Family
  </span>

</div>

    </div>

  </div>

</div>

                </div>

              )
            )}

          </div>

          {/* EMPTY */}

          {filteredOutfits.length === 0 && (

            <div className="mt-10">

              <EmptyState
                title="No wardrobe found"
              />

            </div>

          )}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">

            <div className="bg-[#12081F]/70 border border-purple-900/40 rounded-3xl p-5">
              <p className="text-gray-400">
                Total Outfits
              </p>
              <h2 className="text-4xl font-black mt-2">
                {outfits.length}
              </h2>
            </div>

            <div className="bg-[#12081F]/70 border border-purple-900/40 rounded-3xl p-5">
              <p className="text-gray-400">
                Executive
              </p>
              <h2 className="text-4xl font-black mt-2">
                {
                  outfits.filter(
                    (x) =>
                      x.category ===
                      "Executive"
                  ).length
                }
              </h2>
            </div>

            <div className="bg-[#12081F]/70 border border-purple-900/40 rounded-3xl p-5">
              <p className="text-gray-400">
                Uniform
              </p>
              <h2 className="text-4xl font-black mt-2">
                {
                  outfits.filter(
                    (x) =>
                      x.category ===
                      "Uniform"
                  ).length
                }
              </h2>
            </div>

            <div className="bg-[#12081F]/70 border border-purple-900/40 rounded-3xl p-5">
              <p className="text-gray-400">
                Casual
              </p>
              <h2 className="text-4xl font-black mt-2">
                {
                  outfits.filter(
                    (x) =>
                      x.category ===
                      "Casual"
                  ).length
                }
              </h2>
            </div>

            <div className="bg-[#12081F]/70 border border-purple-900/40 rounded-3xl p-5">

  <p className="text-gray-400">
    Combat
  </p>

  <h2 className="text-4xl font-black mt-2 text-red-400">
    {
      outfits.filter(
        (x) =>
          x.category ===
          "Combat"
      ).length
    }
  </h2>

</div>

<div className="bg-[#12081F]/70 border border-purple-900/40 rounded-3xl p-5">

  <p className="text-gray-400">
    Exclusive Rank
  </p>

  <h2 className="text-4xl font-black mt-2 text-yellow-300">
    {
      outfits.filter(
        (x) =>
          x.access !==
          "All Members"
      ).length
    }
  </h2>

</div>
</div>
          {/* PAGINATION */}

          {totalPages > 1 && (

            <div className="flex justify-center items-center gap-4 mt-12">

              <button
                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      Math.max(
                        prev - 1,
                        1
                      )
                  )
                }
                disabled={
                  currentPage === 1
                }
                className="px-5 py-3 rounded-2xl bg-white/5 border border-purple-900/40 disabled:opacity-40 hover:border-purple-500 transition-all"
              >
                Previous
              </button>

              <span className="font-semibold text-purple-200">

                Page {currentPage}
                {" "}
                of
                {" "}
                {totalPages}

              </span>

              <button
                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      Math.min(
                        prev + 1,
                        totalPages
                      )
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                className="px-5 py-3 rounded-2xl bg-white/5 border border-purple-900/40 disabled:opacity-40 hover:border-purple-500 transition-all"
              >
                Next
              </button>

            </div>

          )}
          </>
)}
        </div>

      </div>

          {selectedOutfit && (

  <div
    className="
      fixed
      inset-0
      z-[999]
      bg-black/80
      backdrop-blur-xl
      flex
      items-center
      justify-center
      p-6
    "
    onClick={() => {
  setSelectedOutfit(null);
  setSelectedImage(null);
}}
  >

    <div
      onClick={(e) =>
        e.stopPropagation()
      }
      className="
        w-full
        max-w-6xl
        bg-gradient-to-br
        from-[#070707]
via-[#130909]
to-[#000000]
        border
        border-fuchsia-500/30
        rounded-[40px]
        overflow-hidden
        shadow-[0_0_60px_rgba(168,85,247,0.35)]
      "
    >

      <div className="grid lg:grid-cols-2">

        {/* IMAGE */}

        <div className="relative">

          <img
  src={
    selectedImage ||
    selectedOutfit.image
  }
  alt={selectedOutfit.title}
  className="
    w-full
    h-full
    object-cover
    min-h-[700px]
  "
/>

          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div
  className="
    absolute
    bottom-5
    left-1/2
    -translate-x-1/2
    flex
    gap-3
    z-20
  "
>
  {(selectedOutfit.images ||
    [selectedOutfit.image])
      .slice(0, 3)
      .map((img, index) => (

    <img
      key={index}
      src={img}
      alt=""
      onClick={() =>
        setSelectedImage(img)
      }
      className={`
        w-20
        h-20
        rounded-xl
        object-cover
        cursor-pointer
        border-2
        transition-all
        ${
          selectedImage === img
            ? "border-fuchsia-500 scale-110"
            : "border-white/20"
        }
      `}
    />

  ))}
</div>

        </div>

        {/* CONTENT */}

        <div className="p-10 flex flex-col">

          <div className="mb-6">

            <span
              className="
                px-4
                py-2
                rounded-full
                bg-fuchsia-700/30
                border
                border-fuchsia-500/30
                text-fuchsia-200
                text-sm
              "
            >
              {selectedOutfit.category}
            </span>

          </div>

          <h2
            className="
              text-5xl
              font-black
              text-white
              leading-tight
            "
          >
            {selectedOutfit.title}
          </h2>

          <p
  className="
    mt-6
    text-gray-300
    leading-relaxed
  "
>
  {selectedOutfit.description}
</p>

<div
  className="
    mt-8
    grid
    grid-cols-2
    gap-4
  "
>

  <div className="bg-white/5 rounded-2xl p-4">
    <p className="text-xs text-purple-400 uppercase">
      Outfit Code
    </p>

    <h3 className="font-bold mt-2">
      {selectedOutfit.code}
    </h3>
  </div>

  <div className="bg-white/5 rounded-2xl p-4">
    <p className="text-xs text-purple-400 uppercase">
      Rarity
    </p>

    <h3 className="font-bold mt-2 text-yellow-300">
      {selectedOutfit.rarity}
    </h3>
  </div>

  <div className="bg-white/5 rounded-2xl p-4">
    <p className="text-xs text-purple-400 uppercase">
      Acquisition
    </p>

    <h3 className="font-bold mt-2">
      {selectedOutfit.acquisition}
    </h3>
  </div>

  <div className="bg-white/5 rounded-2xl p-4">
    <p className="text-xs text-purple-400 uppercase">
      Version
    </p>

    <h3 className="font-bold mt-2">
      {selectedOutfit.version}
    </h3>
  </div>

</div>

          <div className="mt-8 space-y-5">

            <div>

              <p className="text-purple-400 text-sm uppercase tracking-widest">
                Authorized Rank
              </p>

              <h3 className="text-xl font-bold mt-2">
                {selectedOutfit.access}
              </h3>

            </div>

            <div>

              <p className="text-purple-400 text-sm uppercase tracking-widest">
                Status
              </p>

              <h3 className="text-xl font-bold mt-2 text-green-400">
                Official Uniform
              </h3>

            </div>

          </div>

          <div className="mt-auto pt-10">

            <div
              className="
                inline-flex
                px-5
                py-3
                rounded-full
                bg-gradient-to-r
                from-purple-700
                to-fuchsia-700
                font-bold
              "
            >
              JIGOKUBARA FAMILY
            </div>

          </div>

          <button
  onClick={() => {
    setSelectedOutfit(null);
    setSelectedImage(null);
  }}
            className="
              mt-10
              bg-red-700
              hover:bg-red-800
              px-6
              py-4
              rounded-2xl
              font-bold
              transition-all
            "
          >
            Close
          </button>

        </div>

      </div>

    </div>

  </div>

)}


    </AppLayout>

  );
}