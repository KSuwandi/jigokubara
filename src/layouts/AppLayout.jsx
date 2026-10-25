import Sidebar from "../components/layout/Sidebar";
import { useLocation } from "react-router-dom";

export default function AppLayout({
  children,
}) {

  const location = useLocation();

  const hideSidebar =
    location.pathname === "/wardrobe";

  return (

    <div className="min-h-screen flex text-white bg-[radial-gradient(circle_at_top,#2a1240_0%,#12091c_45%,#09040f_100%)]">

      {/* JAPANESE PATTERN OVERLAY */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asanoha-400px.png')]" />

      {!hideSidebar && <Sidebar />}

      <main
        className={`overflow-y-auto relative z-10 ${
          hideSidebar
            ? "w-full p-0"
            : "flex-1 p-4 md:p-8"
        }`}
      >
        {children}
      </main>

    </div>
  );
}