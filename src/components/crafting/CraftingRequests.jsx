import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import AppLayout from "../../layouts/AppLayout";

import EmptyState from "../common/EmptyState";

import { useAuth } from "../../contexts/AuthContext";

import { db } from "../../services/firebase/config";

export default function CraftingRequestsPage() {
  const { user, role } = useAuth();

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user) return;

    const requestsRef = query(
      collection(
        db,
        "users",
        user.uid,
        "craftingRequests"
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
  }, [user]);

  const approveRequest = async (
    request
  ) => {
    try {
      /*
        REDUCE MATERIALS
      */

      for (const material of request.materials) {
        const inventoryQuery = query(
          collection(
            db,
            "users",
            user.uid,
            "inventory"
          ),
          where(
            "name",
            "==",
            material.item
          )
        );

        const inventorySnap =
          await getDocs(
            inventoryQuery
          );

        inventorySnap.forEach(
          async (inventoryDoc) => {
            await updateDoc(
              doc(
                db,
                "users",
                user.uid,
                "inventory",
                inventoryDoc.id
              ),
              {
                stock: increment(
                  -Number(
                    material.amount
                  )
                ),
              }
            );
          }
        );
      }

      /*
        ADD RESULT ITEM
      */

      const craftedItemQuery =
        query(
          collection(
            db,
            "users",
            user.uid,
            "inventory"
          ),
          where(
            "name",
            "==",
            request.resultItem
          )
        );

      const craftedItemSnap =
        await getDocs(
          craftedItemQuery
        );

      if (
        craftedItemSnap.empty
      ) {
        await addDoc(
          collection(
            db,
            "users",
            user.uid,
            "inventory"
          ),
          {
            name: request.resultItem,
            category:
              request.category,
            stock: Number(
              request.resultAmount
            ),
            createdAt:
              serverTimestamp(),
          }
        );
      } else {
        craftedItemSnap.forEach(
          async (craftedDoc) => {
            await updateDoc(
              doc(
                db,
                "users",
                user.uid,
                "inventory",
                craftedDoc.id
              ),
              {
                stock: increment(
                  Number(
                    request.resultAmount
                  )
                ),
              }
            );
          }
        );
      }

      /*
        UPDATE REQUEST STATUS
      */

      await updateDoc(
        doc(
          db,
          "users",
          user.uid,
          "craftingRequests",
          request.id
        ),
        {
          status: "Approved",
          approvedBy:
            user.displayName,
        }
      );

      /*
        CREATE LOG
      */

      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "craftingLogs"
        ),
        {
          recipeName:
            request.recipeName,

          craftedBy:
            request.requestedBy,

          approvedBy:
            user.displayName,

          resultItem:
            request.resultItem,

          resultAmount:
            request.resultAmount,

          createdAt:
            serverTimestamp(),
        }
      );

      toast.success(
        "Craft approved"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to approve"
      );
    }
  };

  const rejectRequest = async (
    request
  ) => {
    try {
      await updateDoc(
        doc(
          db,
          "users",
          user.uid,
          "craftingRequests",
          request.id
        ),
        {
          status: "Rejected",
          approvedBy:
            user.displayName,
        }
      );

      toast.success(
        "Request rejected"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to reject"
      );
    }
  };

  return (
    <AppLayout>
      <div className="text-white">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Crafting Requests
          </h1>

          <p className="text-gray-400 mt-2">
            Approval system for
            Jigokubara crafting
          </p>
        </div>

        <div className="space-y-5">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {
                      request.recipeName
                    }
                  </h2>

                  <p className="text-gray-400 mt-1">
                    Requested by{" "}
                    {
                      request.requestedBy
                    }
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm ${
                    request.status ===
                    "Approved"
                      ? "bg-green-500/20 text-green-400"
                      : request.status ===
                        "Rejected"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {request.status}
                </span>
              </div>

              <div className="mt-6">
                <p className="text-gray-400 text-sm">
                  Craft Result
                </p>

                <h3 className="text-3xl font-bold mt-1">
                  {
                    request.resultItem
                  }{" "}
                  x
                  {
                    request.resultAmount
                  }
                </h3>
              </div>

              <div className="mt-6">
                <p className="text-gray-400 mb-3">
                  Materials
                </p>

                <div className="space-y-2">
                  {request.materials?.map(
                    (
                      material,
                      index
                    ) => (
                      <div
                        key={index}
                        className="bg-black rounded-xl px-4 py-3 flex items-center justify-between"
                      >
                        <span>
                          {
                            material.item
                          }
                        </span>

                        <span className="text-red-300">
                          {
                            material.amount
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {role ===
                "Oyabun" &&
                request.status ===
                  "Pending" && (
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() =>
                        approveRequest(
                          request
                        )
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl py-3 font-semibold"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        rejectRequest(
                          request
                        )
                      }
                      className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl py-3 font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>

        {requests.length ===
          0 && (
          <div className="mt-6">
            <EmptyState title="No crafting requests" />
          </div>
        )}
      </div>
    </AppLayout>
  );
}