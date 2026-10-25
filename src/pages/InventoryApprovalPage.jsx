import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  increment,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import AppLayout from "../layouts/AppLayout";

import { db } from "../services/firebase/config";

import { useAuth } from "../contexts/AuthContext";

export default function InventoryApprovalPage() {

  const { role } = useAuth();

  const [requests, setRequests] =
    useState([]);

  useEffect(() => {

    // ONLY OYABUN
    if (role !== "Oyabun") return;

    const q = query(
      collection(
        db,
        "inventory_requests"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const data =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setRequests(data);
      });

    return () => unsubscribe();

  }, [role]);

  // =====================================
  // APPROVE
  // =====================================
  const approveRequest =
    async (request) => {

      try {

        // UPDATE STOCK
        await updateDoc(
          doc(
            db,
            "inventory",
            request.itemId
          ),
          {
            stock: increment(
              request.amount
            ),
          }
        );

        // UPDATE REQUEST STATUS
        await updateDoc(
          doc(
            db,
            "inventory_requests",
            request.id
          ),
          {
            status: "approved",
            approvedAt:
              serverTimestamp(),
          }
        );

        // NOTIFICATION
        await addDoc(
          collection(
            db,
            "notifications"
          ),
          {
            title:
              "Inventory Approved",

            message:
              `${request.itemName} approved by Oyabun`,

            type:
              "inventory",

            read: false,

            createdAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Request approved"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed approve request"
        );
      }
    };

  // =====================================
  // REJECT
  // =====================================
  const rejectRequest =
    async (request) => {

      try {

        await updateDoc(
          doc(
            db,
            "inventory_requests",
            request.id
          ),
          {
            status: "rejected",
            rejectedAt:
              serverTimestamp(),
          }
        );

        await addDoc(
          collection(
            db,
            "notifications"
          ),
          {
            title:
              "Inventory Rejected",

            message:
              `${request.itemName} rejected by Oyabun`,

            type:
              "inventory",

            read: false,

            createdAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Request rejected"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed reject request"
        );
      }
    };

  // =====================================
  // BLOCK SHATEI
  // =====================================
  if (role !== "Oyabun") {
    return (
      <AppLayout>
        <div className="text-white">
          <h1 className="text-3xl font-bold">
            Access Denied
          </h1>

          <p className="text-gray-400 mt-3">
            Only Oyabun can access
            inventory approvals.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>

      <div className="text-white">

        {/* HEADER */}
        <div className="mb-10">

          <h1 className="text-4xl font-bold">
            Inventory Approval
          </h1>

          <p className="text-gray-400 mt-2">
            Approve inventory
            changes from Shatei
          </p>

        </div>

        {/* REQUESTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {requests.map((request) => (

            <div
              key={request.id}
              className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-5"
            >

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-2xl font-bold">
                    {request.itemName}
                  </h2>

                  <p className="text-gray-400 mt-3">
                    Requested By:
                    {" "}
                    <span className="text-white">
                      {request.requestedBy ||
                        "Unknown"}
                    </span>
                  </p>

                  <p className="text-gray-400">
                    Amount:
                    {" "}
                    <span className="text-white">
                      {request.amount}
                    </span>
                  </p>

                  <p className="text-gray-400">
                    Type:
                    {" "}
                    <span className="text-white">
                      {request.type}
                    </span>
                  </p>

                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm ${
                    request.status ===
                    "pending"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : request.status ===
                        "approved"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {request.status}
                </span>

              </div>

              {request.status ===
                "pending" && (

                <div className="flex gap-3 mt-6">

                  <button
                    onClick={() =>
                      approveRequest(
                        request
                      )
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700 px-5 py-3 rounded-2xl font-semibold"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      rejectRequest(
                        request
                      )
                    }
                    className="flex-1 bg-red-600 hover:bg-red-700 px-5 py-3 rounded-2xl font-semibold"
                  >
                    Reject
                  </button>

                </div>
              )}

            </div>
          ))}

        </div>

        {/* EMPTY */}
        {requests.length === 0 && (
          <div className="mt-10 text-center text-gray-400">
            No inventory requests
          </div>
        )}

      </div>

    </AppLayout>
  );
}