import { Navigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

export default function RoleGuard({
  children,
  allow,
}) {
  const { role, loading } =
    useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!allow.includes(role)) {
    return (
      <Navigate to="/dashboard" />
    );
  }

  return children;
}