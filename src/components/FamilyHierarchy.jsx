import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase/config";

export default function FamilyHierarchy() {
  
    const [users, setUsers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
  
    useEffect(() => {
      loadMembers();
    }, []);
  
    async function loadMembers() {
      try {
        const snapshot = await getDocs(
          collection(db, "users")
        );
  
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    }
  
    const hierarchy = [
      {
        role: "Oyabun",
        members: [
          {
            name: "Izaya Rosevale",
            title: "Supreme Leader",
            photo: "https://res.cloudinary.com/dpyhp3o66/image/upload/v1780164416/Izaya-fix_c2fvli.png",
            description:
              "One of the supreme leaders of the Jigokubara Gumi. Commands absolute authority and oversees all family affairs.",
          },
        ],
      },
      {
        role: "Wakagashira",
        members: [
          {
            name: "Daniel R Hawks",
            title: "Co - Supreme Leader",
            photo: "https://res.cloudinary.com/dpyhp3o66/image/upload/v1780164409/Daniel-Photoroom_jcupp8.png",
            description:
              "Second of the supreme leaders of the Jigokubara Gumi. Commands absolute authority and oversees all family affairs.",
          },
        ],
      },
      {
        role: "Hashira",
        members: [
          {
            name: "Anu Julian Moore",
            title: "Leader of the Hashira",
            photo: "https://res.cloudinary.com/dpyhp3o66/image/upload/v1780164405/julian-fix_rnuyoc.png",
            description:
              "Leader of the Hashira, a key figure in the Jigokubara Gumi.",
          },
          {
            name: "Gogon A Moore",
            title: "Hashira of Finance",
            photo: "https://res.cloudinary.com/dpyhp3o66/image/upload/v1780164411/gogon-Photoroom_zekavs.png",
            description:
              "Leader of the Hashira, a key figure in the Jigokubara Gumi.",
          },
          {
            name: "Abay B Bowscale",
            title: "Hashira of Inventory",
            photo: "https://res.cloudinary.com/dpyhp3o66/image/upload/v1780164418/abay-Photoroom_nks6zt.png",
            description:
              "Elite executive of the Jigokubara Gumi.",
          },
          {
            name: "Doo Sukaroam",
            title: "Hashira of Business",
            photo: "https://res.cloudinary.com/dpyhp3o66/image/upload/v1780164414/Doo-fix_nb0j8g.png",
            description:
              "Elite executive of the Jigokubara Gumi.",
          },
          {
            name: "Gig George",
            title: "Hashira of Inventory",
            photo: "https://res.cloudinary.com/dpyhp3o66/image/upload/v1780164410/gig-Photoroom_sgtvzr.png",
            description:
              "Elite executive of the Jigokubara Gumi.",
          },
          {
            name: "Enzo Deluca",
            title: "Hashira of Finance",
            photo: "https://res.cloudinary.com/dpyhp3o66/image/upload/v1780164416/Enzo-Photoroom_hpldai.png",
            description:
              "Elite executive of the Jigokubara Gumi.",
          },
          {
            name: "Eki Saltia",
            title: "Hashira of Business",
            photo: "https://res.cloudinary.com/dpyhp3o66/image/upload/v1780164409/eki-Photoroom_sog6mx.png",
            description:
              "Elite executive of the Jigokubara Gumi.",
          },
          {
            name: "Fabian Elandya",
            title: "Hashira of Finance",
            photo: "https://res.cloudinary.com/dpyhp3o66/image/upload/v1780164410/Fabian-Photoroom_bbtfbp.png",
            description:
              "Elite executive of the Jigokubara Gumi.",
          },
        ],
      },
    ];
  
    const activeMember =
      selectedMember || hierarchy[0].members[0];
  
    const shateiMembers = users.filter(
      (u) => u.role === "Shatei"
    );
  
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
  
        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#120012] via-black to-[#09000f]" />
  
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute w-full max-w-[500px] h-[500px] bg-purple-700 blur-[180px] rounded-full top-[-150px] left-[-100px]" />
          <div className="absolute w-full max-w-[400px] h-[400px] bg-fuchsia-700 blur-[160px] rounded-full bottom-[-120px] right-[-80px]" />
        </div>
  
        <div className="relative z-10 flex h-screen">
  
          {/* SIDEBAR */}
          <div
    className="
      jgb-scrollbar
      w-full max-w-[320px]
      border-r
      border-purple-500/20
      bg-black/50
      backdrop-blur-xl
      p-6
      overflow-y-auto
      shadow-[0_0_50px_rgba(168,85,247,0.15)]
    "
  >
  
            <img
              src="https://i.ibb.co.com/tTKwhGt1/Asset-18.png"
              alt=""
              className="w-32 mx-auto mb-6"
            />
  
            <h1
    className="
      text-center
      text-2xl
      font-black
      tracking-widest
      mb-10
      bg-gradient-to-r
      from-white
      via-fuchsia-300
      to-purple-500
      bg-clip-text
      text-transparent
      drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]
    "
  >
    JIGOKUBARA GUMI
  </h1>
  
            {hierarchy.map((group) => (
              <div
                key={group.role}
                className="mb-8"
              >
                <h2 className="text-purple-400 font-black tracking-[0.3em] uppercase mb-4">
                  {group.role}
                </h2>
  
                <div className="space-y-2">
  
                  {group.members.map((member) => (
                    <button
                      key={member.name}
                      onClick={() =>
                        setSelectedMember(member)
                      }
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                        activeMember.name === member.name
                          ? "bg-purple-700/30 border border-purple-500"
                          : "bg-white/5 border border-purple-700/20"
                      }`}
                    >
                      <p className="font-bold">
                        {member.name}
                      </p>
  
                      <p className="text-xs text-purple-300">
                        {member.title}
                      </p>
                    </button>
                  ))}
  
                </div>
              </div>
            ))}
  
            {/* SHATEI */}
            <div>
  
              <h2 className="text-purple-400 font-black tracking-[0.3em] uppercase mb-4">
                Aniki
              </h2>
  
              <div className="space-y-2">
  
                {shateiMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 bg-white/5 border border-purple-700/20 rounded-xl p-2"
                  >
                    <img
                      src={member.photo}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border border-purple-500"
                    />
  
                    <div>
                      <p className="font-semibold text-sm">
                        {member.rpName}
                      </p>
  
                      <p className="text-xs text-purple-300">
                        Shatei
                      </p>
                    </div>
  
                  </div>
                ))}
  
              </div>
  
            </div>
  
          </div>
  
          {/* CONTENT */}
          <div className="flex-1 relative overflow-hidden">
  
            {/* WATERMARK */}
            <div className="absolute inset-0 pointer-events-none">
  
              <h1
                className="
                  absolute
                  top-10
                  left-10
                  text-[220px]
                  font-black
                  uppercase
                  text-white/[0.03]
                  tracking-[0.15em]
                "
              >
                {activeMember.name}
              </h1>
  
              <img
                src="https://i.ibb.co.com/tTKwhGt1/Asset-18.png"
                alt=""
                className="
                  absolute
                  right-[-250px]
                  top-1/2
                  -translate-y-1/2
                  w-full max-w-[1100px]
                  opacity-[0.03]
                "
              />
  
            </div>
  
            <div className="relative z-10 h-full">
  
              <div className="h-full max-w-[1800px] mx-auto px-10">
  
                <div className="grid lg:grid-cols-[850px_1fr] h-full items-center gap-12">
  
                  {/* FOTO */}
                  <div className="relative flex justify-center items-center">
  
                    <div className="absolute w-full max-w-[800px] h-[800px] bg-purple-700/30 blur-[220px] rounded-full" />
  
                    <img
                      src={activeMember.photo}
                      alt=""
                      className="
                        relative
                        h-[900px]
                        xl:h-[1000px]
                        object-contain
                        drop-shadow-[0_0_90px_rgba(168,85,247,0.8)]
                      "
                    />
  
                  </div>
  
                  {/* INFO */}
                  <div>
  
                    <p className="tracking-[0.4em] text-purple-400 uppercase">
                      Jigokubara Family
                    </p>
  
                    <h1 className="text-[6rem] xl:text-[7rem] font-black leading-none mt-4">
                      {activeMember.name}
                    </h1>
  
                    <div className="mt-6 inline-flex items-center gap-3 bg-purple-900/30 border border-purple-500/40 px-6 py-3 rounded-full">
  
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
  
                      <span className="uppercase tracking-[0.3em] text-purple-300">
                        {activeMember.title}
                      </span>
  
                    </div>
  
                    <div className="w-48 h-[4px] rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-red-500 mt-8" />
  
                    <p className="text-gray-300 text-xl leading-relaxed mt-10 max-w-3xl">
                      {activeMember.description}
                    </p>
  
                    <div className="grid grid-cols-2 gap-6 mt-12">
  
                      <div className="bg-white/5 border border-purple-700/20 rounded-3xl p-6 backdrop-blur-xl">
  
                        <h3 className="text-purple-400 text-sm font-bold tracking-[0.2em]">
                          POSITION
                        </h3>
  
                        <p className="mt-3 text-2xl font-bold">
                          {activeMember.title}
                        </p>
  
                      </div>
  
                      <div className="bg-white/5 border border-purple-700/20 rounded-3xl p-6 backdrop-blur-xl">
  
                        <h3 className="text-purple-400 text-sm font-bold tracking-[0.2em]">
                          ORGANIZATION
                        </h3>
  
                        <p className="mt-3 text-2xl font-bold">
                          Jigokubara
                        </p>
  
                      </div>
  
                    </div>
  
                  </div>
  
                </div>
  
              </div>
  
            </div>
  
          </div>
  
        </div>
  
      </div>
    );
  }