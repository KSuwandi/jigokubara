import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import { useAuth } from "../contexts/AuthContext";

import { db } from "../services/firebase/config";

import { createActivityLog } from "../utils/activityLogger";

export default function RequestsPage() {

  const { role, user } = useAuth();

  const [requests, setRequests] =
    useState([]);

  const [loadingId, setLoadingId] =
    useState(null);

  // =========================================
  // REALTIME REQUESTS
  // =========================================
  useEffect(() => {

    const requestsRef = query(
      collection(
        db,
        "inventory_requests"
      ),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      requestsRef,
      (snapshot) => {

        const data = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        setRequests(data);
      }
    );

    return () => unsubscribe();

  }, []);

  // =========================================
  // NOTIFICATION
  // =========================================
  const createNotification =
    async (title, message) => {

      try {

        await addDoc(
          collection(
            db,
            "notifications"
          ),
          {
            title,
            message,
            type: "request",
            read: false,
            createdAt:
              serverTimestamp(),
          }
        );

      } catch (error) {

        console.error(error);
      }
    };

  // =========================================
  // APPROVE REQUEST
  // =========================================
  const approveRequest = async (
    request
  ) => {

    try {

      if (role !== "Oyabun") {

        toast.error(
          "Only Oyabun can approve"
        );

        return;
      }

      setLoadingId(request.id);

      // =====================================
      // ADD ITEM
      // =====================================
      if (
        request.type === "ADD_ITEM"
      ) {

        await addDoc(
          collection(db, "inventory"),
          {
            name: request.name,

            category:
              request.category,

            stock:
              Number(
                request.stock
              ),

            createdAt:
              serverTimestamp(),
          }
        );
      }

      // =====================================
      // ADD STOCK
      // =====================================
      if (
        request.type ===
        "ADD_STOCK"
      ) {

        await updateDoc(
          doc(
            db,
            "inventory",
            request.itemId
          ),
          {
            stock: increment(
              Number(
                request.amount
              )
            ),
          }
        );
      }

      // =====================================
      // REDUCE STOCK
      // =====================================
      if (
        request.type ===
        "REDUCE_STOCK"
      ) {

        await updateDoc(
          doc(
            db,
            "inventory",
            request.itemId
          ),
          {
            stock: increment(
              -Number(
                request.amount
              )
            ),
          }
        );
      }

      // =====================================
      // EDIT ITEM
      // =====================================
      if (
        request.type ===
        "EDIT_ITEM"
      ) {

        await updateDoc(
          doc(
            db,
            "inventory",
            request.itemId
          ),
          {
            name:
              request.newName,

            stock: Number(
              request.newStock
            ),
          }
        );
      }

      // =====================================
      // UPDATE REQUEST STATUS
      // =====================================
      await updateDoc(
        doc(
          db,
          "inventory_requests",
          request.id
        ),
        {
          status: "approved",

          approvedBy:
            user?.rpName ||
              user?.displayName ||
            "Oyabun",

          approvedAt:
            serverTimestamp(),
        }
      );

      // =====================================
      // ACTIVITY LOG
      // =====================================
      await createActivityLog({
        action:
          "APPROVE_REQUEST",

        user:
          user?.rpName ||
              user?.displayName ||
          "Unknown",

        role,

        target:
          request.itemName ||
          request.name,
      });

      // =====================================
      // NOTIFICATION
      // =====================================
      await createNotification(
        "Request Approved",
        `${request.type} approved`
      );

      toast.success(
        "Request approved"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to approve request"
      );

    } finally {

      setLoadingId(null);
    }
  };

  // =========================================
  // REJECT REQUEST
  // =========================================
  const rejectRequest = async (
    request
  ) => {

    try {

      if (role !== "Oyabun") {

        toast.error(
          "Only Oyabun can reject"
        );

        return;
      }

      setLoadingId(request.id);

      await updateDoc(
        doc(
          db,
          "inventory_requests",
          request.id
        ),
        {
          status: "rejected",

          rejectedBy:
            user?.rpName ||
              user?.displayName ||
            "Oyabun",

          rejectedAt:
            serverTimestamp(),
        }
      );

      await createActivityLog({
        action:
          "REJECT_REQUEST",

        user:
          user?.rpName ||
              user?.displayName ||
          "Unknown",

        role,

        target:
          request.itemName ||
          request.name,
      });

      await createNotification(
        "Request Rejected",
        `${request.type} rejected`
      );

      toast.success(
        "Request rejected"
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to reject request"
      );

    } finally {

      setLoadingId(null);
    }
  };

  // =========================================
  // STATUS BADGE
  // =========================================
  const statusColor = (status) => {

    if (status === "approved") {
      return "bg-green-600";
    }

    if (status === "rejected") {
      return "bg-red-600";
    }

    return "bg-yellow-500";
  };

  return (
    <AppLayout>

      <div className="text-white">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Request Approval Center
          </h1>

          <p className="text-gray-400 mt-2">
            Manage inventory requests
          </p>

        </div>

        {/* REQUESTS */}
        <div className="space-y-5">

          {requests.map((request) => (

            <div
              key={request.id}
              className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6"
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <div>

                  <div className="flex items-center gap-3 flex-wrap">

                    <h2 className="text-2xl font-bold">
                      {request.itemName ||
                        request.name}
                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${statusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>

                  </div>

                  <div className="mt-4 space-y-2 text-gray-300">

                    <p>
                      <span className="font-semibold">
                        Type:
                      </span>{" "}
                      {request.type}
                    </p>

                    <p>
                      <span className="font-semibold">
                        Request By:
                      </span>{" "}
                      {
                        request.requestedBy
                      }
                    </p>

                    {request.amount && (
                      <p>
                        <span className="font-semibold">
                          Amount:
                        </span>{" "}
                        {
                          request.amount
                        }
                      </p>
                    )}

                    {request.stock && (
                      <p>
                        <span className="font-semibold">
                          Stock:
                        </span>{" "}
                        {
                          request.stock
                        }
                      </p>
                    )}

                  </div>

                </div>

                {/* ACTIONS */}
                {request.status ===
                  "pending" &&
                  role ===
                    "Oyabun" && (

                    <div className="flex gap-3">

                      <button
                        onClick={() =>
                          approveRequest(
                            request
                          )
                        }
                        disabled={
                          loadingId ===
                          request.id
                        }
                        className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-2xl font-semibold"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          rejectRequest(
                            request
                          )
                        }
                        disabled={
                          loadingId ===
                          request.id
                        }
                        className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-2xl font-semibold"
                      >
                        Reject
                      </button>

                    </div>
                  )}

              </div>

            </div>
          ))}

        </div>

      </div>

    </AppLayout>
  );
}