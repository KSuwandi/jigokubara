import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import {
  db,
} from "../services/firebase/config";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function RoleApprovalPage() {
  const { role, user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearingAll, setClearingAll] = useState(false);

  // =====================================
  // LOAD REQUEST
  // =====================================
  const loadRequests = async () => {
    try {
      const q = query(
        collection(db, "role_requests"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setRequests(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // =====================================
  // APPROVE
  // =====================================
  const approveRequest = async (request) => {
    try {
      const confirmApprove = window.confirm(
        `Approve role ${request.requestedRole} untuk ${request.rpName}?`
      );

      if (!confirmApprove) return;

      await updateDoc(
        doc(db, "users", request.userId),
        {
          role: request.requestedRole,
        }
      );

      await updateDoc(
        doc(db, "role_requests", request.id),
        {
          status: "approved",
          approvedBy: user?.rpName || "Unknown",
          approvedAt: serverTimestamp(),
        }
      );

      toast.success("Role approved");
      await loadRequests();
    } catch (error) {
      console.error(error);
      toast.error("Failed approve role");
    }
  };

  // =====================================
  // REJECT
  // =====================================
  const rejectRequest = async (request) => {
    try {
      const confirmReject = window.confirm(
        `Reject role request ${request.rpName || "this user"}?`
      );

      if (!confirmReject) return;

      await updateDoc(
        doc(db, "role_requests", request.id),
        {
          status: "rejected",
          rejectedBy: user?.rpName || "Unknown",
          rejectedAt: serverTimestamp(),
        }
      );

      toast.success("Request rejected");
      await loadRequests();
    } catch (error) {
      console.error(error);
      toast.error("Failed reject request");
    }
  };

  // =====================================
  // CLEAR REQUEST
  // Same behavior as CraftingRequestsPage:
  // permanently delete completed request.
  // =====================================
  const clearRequest = async (requestId) => {
    try {
      if (role !== "Oyabun") {
        toast.error("Only Oyabun can clear request");
        return;
      }

      const confirmClear = window.confirm(
        "Hapus role request ini secara permanen?"
      );

      if (!confirmClear) return;

      await deleteDoc(
        doc(db, "role_requests", requestId)
      );

      toast.success("Request deleted successfully");
      await loadRequests();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete request");
    }
  };

  // =====================================
  // CLEAR ALL ROLE REQUESTS
  // Only deletes documents in role_requests.
  // User accounts and their assigned roles are untouched.
  // =====================================
  const clearAllRequests = async () => {
    if (role !== "Oyabun") {
      toast.error("Only Oyabun can clear all requests");
      return;
    }

    if (requests.length === 0) {
      toast("No role requests to clear");
      return;
    }

    const confirmClearAll = window.confirm(
      `Hapus SEMUA ${requests.length} role request dari halaman ini?\n\nData akun user dan role mereka TIDAK akan dihapus.`
    );

    if (!confirmClearAll) return;

    setClearingAll(true);

    try {
      // Fetch the current collection to ensure all requests are included.
      const snapshot = await getDocs(collection(db, "role_requests"));
      const docs = snapshot.docs;

      // Firestore batch supports up to 500 writes per batch.
      for (let i = 0; i < docs.length; i += 500) {
        const batch = writeBatch(db);
        docs.slice(i, i + 500).forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }

      toast.success(`Berhasil menghapus ${docs.length} role request`);
      await loadRequests();
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear all requests");
      await loadRequests();
    } finally {
      setClearingAll(false);
    }
  };

  // =====================================
  // MASK EMAIL
  // =====================================
  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return "-";

    const [username, domain] = email.split("@");

    if (username.length <= 3) {
      return `${username[0]}*******@${domain}`;
    }

    return `${username[0]}*******${username.slice(-2)}@${domain}`;
  };

  // =====================================
  // ACCESS DENIED
  // =====================================
  if (role !== "Oyabun") {
    return (
      <AppLayout>
        <div className="py-20 text-center text-xl text-white">
          Access Denied
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="text-white">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Role Approval</h1>
            <p className="mt-1 text-sm text-gray-400">
              {requests.length} total request
            </p>
          </div>

          {requests.length > 0 && (
            <button
              type="button"
              onClick={clearAllRequests}
              disabled={clearingAll || loading}
              className="inline-flex items-center justify-center rounded-xl border border-red-500/40 bg-red-600/15 px-5 py-2.5 font-semibold text-red-300 transition-all hover:border-red-500 hover:bg-red-600/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {clearingAll ? "Clearing All..." : `Clear All (${requests.length})`}
            </button>
          )}
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl bg-[#141021] p-10 text-center">
            No Request
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-purple-900/30 bg-[#141021] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {item.rpName || "No RP Name"}
                    </h2>

                    <p className="text-gray-400">
                      {maskEmail(item.email)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-xl bg-purple-900/30 px-3 py-1 text-sm">
                        Request: {item.requestedRole}
                      </span>

                      <span
                        className={`rounded-xl px-3 py-1 text-sm ${
                          item.status === "approved"
                            ? "bg-green-500/20 text-green-300"
                            : item.status === "rejected"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => approveRequest(item)}
                          className="rounded-xl bg-green-600 px-5 py-2 transition-all hover:bg-green-700"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => rejectRequest(item)}
                          className="rounded-xl bg-red-600 px-5 py-2 transition-all hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {(item.status === "approved" ||
                      item.status === "rejected") && (
                      <button
                        type="button"
                        onClick={() => clearRequest(item.id)}
                        className="rounded-xl border border-gray-700 bg-gray-800 px-5 py-2 transition-all hover:border-gray-500 hover:bg-gray-900"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
