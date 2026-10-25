import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import {
  db,
} from "../services/firebase/config";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function RoleApprovalPage() {

  const { role, user } =
    useAuth();

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // =====================================
  // LOAD REQUEST
  // =====================================
  const loadRequests =
    async () => {

      try {

        const q = query(
          collection(
            db,
            "role_requests"
          ),
          orderBy(
            "createdAt",
            "desc"
          )
        );

        const snapshot =
          await getDocs(q);

        const data =
          snapshot.docs.map(
            (docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            })
          );

        setRequests(data);

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed load requests"
        );

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
  const approveRequest =
    async (request) => {

      try {

        const confirmApprove =
          window.confirm(
  `Approve role ${request.requestedRole} untuk ${request.rpName}?`
);
        if (!confirmApprove)
          return;

        await updateDoc(
          doc(
            db,
            "users",
            request.userId
          ),
          {
            role:
              request.requestedRole,
          }
        );

        await updateDoc(
          doc(
            db,
            "role_requests",
            request.id
          ),
          {
            status:
              "approved",

            approvedBy:
              user?.rpName || "Unknown",

            approvedAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Role approved"
        );

        loadRequests();

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed approve role"
        );
      }
    };

  // =====================================
  // REJECT
  // =====================================
  const rejectRequest =
    async (request) => {

      try {

        const confirmReject =
          window.confirm(
            `Reject role request ${request.name}?`
          );

        if (!confirmReject)
          return;

        await updateDoc(
          doc(
            db,
            "role_requests",
            request.id
          ),
          {
            status:
              "rejected",

            rejectedBy:
              user?.rpName || "Unknown",

            rejectedAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Request rejected"
        );

        loadRequests();

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed reject request"
        );
      }
    };

    // =====================================
// MASK EMAIL
// =====================================
const maskEmail = (email) => {

  if (!email || !email.includes("@"))
    return "-";

  const [username, domain] =
    email.split("@");

  if (username.length <= 3) {

    return `${username[0]}*******@${domain}`;

  }

  return `${username[0]}*******${username.slice(-2)}@${domain}`;
};


  if (
    role !== "Oyabun"
  ) {

    return (
      <AppLayout>

        <div className="text-white text-center py-20 text-xl">
          Access Denied
        </div>

      </AppLayout>
    );
  }

  return (

    <AppLayout>

      <div className="text-white">

        <h1 className="text-3xl font-bold mb-6">
          Role Approval
        </h1>

        {loading ? (

          <div>
            Loading...
          </div>

        ) : requests.length === 0 ? (

          <div className="bg-[#141021] rounded-3xl p-10 text-center">
            No Request
          </div>

        ) : (

          <div className="space-y-4">

            {requests.map(
              (item) => (

                <div
                  key={item.id}
                  className="bg-[#141021] border border-purple-900/30 rounded-3xl p-5"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    <div>

                      <h2 className="text-xl font-bold">
  {item.rpName || "No RP Name"}
</h2>

                      <p className="text-gray-400">
  {maskEmail(item.email)}
</p>

                      <div className="mt-3 flex gap-2 flex-wrap">

                        <span className="bg-purple-900/30 px-3 py-1 rounded-xl text-sm">
                          Request:{" "}
                          {item.requestedRole}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-xl text-sm ${
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

                    {item.status ===
                      "pending" && (

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            approveRequest(
                              item
                            )
                          }
                          className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-xl"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            rejectRequest(
                              item
                            )
                          }
                          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl"
                        >
                          Reject
                        </button>

                      </div>

                    )}

                  </div>

                </div>
              )
            )}

          </div>

        )}

      </div>

    </AppLayout>
  );
}