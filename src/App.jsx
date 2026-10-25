import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import FinancePage from "./pages/FinancePage";
import MembersPage from "./pages/MembersPage";
import CraftingPage from "./pages/CraftingPage";
import CraftingRequestsPage from "./pages/CraftingRequestsPage";
import CraftingLogsPage from "./pages/CraftingLogsPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import RecycleBinPage from "./pages/RecycleBinPage";
import InventoryApprovalPage from "./pages/InventoryApprovalPage";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import RequestsPage from "./pages/RequestsPage";
import FinanceApprovalPage from "./pages/FinanceApprovalPage";
import RoleRequestPage from "./pages/RoleRequestPage";
import RoleApprovalPage from "./pages/RoleApprovalPage";
import ProfileJGBPage from "./pages/ProfileJGBPage";
import WardrobePage from "./pages/WardrobePage";

import {
  useAuth,
} from "./contexts/AuthContext";

export default function App() {

  const {
    user,
    role,
    loading,
  } = useAuth();

  // =====================================
  // WAIT FIREBASE AUTH
  // =====================================
  ///console.log("APP JSX LOADED");
///console.log("ROLE =", role);
  if (loading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0714]">

      <div className="relative">

        <div className="w-20 h-20 rounded-full border-4 border-purple-900" />

        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />

      </div>

      <h2 className="mt-6 text-xl font-bold text-white">
        Jigokubara Family
      </h2>

      <p className="text-gray-400 text-sm mt-2">
        Memuat data...
      </p>

    </div>
  );
}

  // =====================================
  // PENDING USER
  // =====================================
  const isPending =
    user &&
    role === "Pending";

  return (

    <Routes>

      <Route
  path="/test-role"
  element={
    <div
      style={{
        color: "white",
        fontSize: "50px",
        padding: "100px",
      }}
    >
      TEST ROLE PAGE
    </div>
  }
/>

      {/* HOME */}
      <Route
        path="/"
        element={<HomePage />}
      />

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <LoginPage />
          )
        }
      />

      {/* ROLE REQUEST */}
      <Route
        path="/request-role"
        element={
          user ? (
            <RoleRequestPage />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* ROLE APPROVAL */}
      <Route
  path="/role-approval"
  element={<RoleApprovalPage />}
/>

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <DashboardPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* INVENTORY */}
      <Route
        path="/inventory"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <InventoryPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* FINANCE */}
      <Route
        path="/finance"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <FinancePage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* MEMBERS */}
      <Route
        path="/members"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <MembersPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* CRAFTING */}
      <Route
        path="/crafting"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <CraftingPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* CRAFTING REQUESTS */}
      <Route
        path="/crafting-requests"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <CraftingRequestsPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* CRAFTING LOGS */}
      <Route
        path="/crafting-logs"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <CraftingLogsPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* PROFILE */}
      <Route
        path="/profile"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <ProfilePage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* NOTIFICATIONS */}
      <Route
        path="/notifications"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <NotificationsPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* RECYCLE BIN */}
      <Route
        path="/recycle-bin"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <RecycleBinPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* INVENTORY APPROVAL */}
      <Route
        path="/inventory-approval"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <InventoryApprovalPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* ACTIVITY LOGS */}
      <Route
        path="/activity-logs"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <ActivityLogsPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* REQUESTS */}
      <Route
        path="/requests"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <RequestsPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* FINANCE APPROVAL */}
      <Route
        path="/finance-approval"
        element={
          user ? (
            isPending ? (
              <Navigate to="/request-role" />
            ) : (
              <FinanceApprovalPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
<Route
  path="/profile-jgb"
  element={<ProfileJGBPage />}
/>
<Route
  path="/wardrobe"
  element={<WardrobePage />}
/>

    </Routes>
  );
}