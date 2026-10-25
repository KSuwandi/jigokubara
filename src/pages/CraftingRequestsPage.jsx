import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import { useAuth } from "../contexts/AuthContext";

import { db } from "../services/firebase/config";

export default function CraftingRequestsPage() {

  const { user, role } =
    useAuth();

  // =========================================
  // ACCESS DENIED
  // =========================================
  if (
    role === "Shatei"
  ) {

    return (

      <AppLayout>

        <div className="flex items-center justify-center min-h-[70vh]">

          <div className="bg-[#111111] border border-red-500/20 rounded-3xl p-10 text-center text-white">

            <h1 className="text-4xl font-bold text-red-400">
              ACCESS DENIED
            </h1>

            <p className="text-gray-400 mt-4">
              Shatei tidak memiliki akses ke halaman crafting requests
            </p>

          </div>

        </div>

      </AppLayout>
    );
  }

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // =========================================
  // PAGINATION
  // =========================================
  const ITEMS_PER_PAGE = 5;

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  // =========================================
  // REALTIME REQUESTS
  // =========================================
  useEffect(() => {

    const requestRef = query(
      collection(
        db,
        "crafting_requests"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(
        requestRef,
        (snapshot) => {

          const data =
            snapshot.docs.map(
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
  // PAGINATION LOGIC
  // =========================================
  const totalPages =
    Math.ceil(
      requests.length /
        ITEMS_PER_PAGE
    );

  const paginatedRequests =
    useMemo(() => {

      const startIndex =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      const endIndex =
        startIndex +
        ITEMS_PER_PAGE;

      return requests.slice(
        startIndex,
        endIndex
      );

    }, [
      requests,
      currentPage,
    ]);

  // =========================================
  // CREATE ACTIVITY LOG
  // =========================================
  const createActivityLog =
    async ({
      type,
      action,
      target,
      quantity,
      description,
      requestedBy,
      requestedByUid,
    }) => {

      await addDoc(
        collection(
          db,
          "activity_logs"
        ),
        {
          type,

          action,

          user:
  user?.rpName ||
  user?.name ||
  user?.displayName ||
  user?.email?.split("@")[0] ||
  "Unknown",

userName:
  user?.rpName ||
  user?.name ||
  user?.displayName ||
  user?.email?.split("@")[0] ||
  "Unknown",

          userId:
            user?.uid ||
            null,

          role:
            role || "-",

          target,

          quantity,

          requestedBy:
            requestedBy ||
            null,

          requestedByUid:
            requestedByUid ||
            null,

          description,

          createdAt:
            serverTimestamp(),
        }
      );
      
    };

  // =========================================
  // APPROVE REQUEST
  // =========================================
  const approveRequest =
    async (request) => {

      try {

        if (!user) return;

        if (
          role !== "Oyabun"
        ) {

          toast.error(
            "Only Oyabun can approve"
          );

          return;
        }

        setLoading(true);

        // =====================================
        // REDUCE MATERIALS
        // =====================================
        for (const material of request.materials) {

          const inventoryQuery =
            query(
              collection(
                db,
                "inventory"
              ),
              where(
                "name",
                "==",
                material.item
              )
            );

          const snapshot =
            await getDocs(
              inventoryQuery
            );

          snapshot.forEach(
            async (
              document
            ) => {

              await updateDoc(
                doc(
                  db,
                  "inventory",
                  document.id
                ),
                {
                  stock:
                    increment(
                      -Number(
                        material.amount
                      )
                    ),
                }
              );

              // ============================
              // LOG REDUCE MATERIAL
              // ============================
              await createActivityLog({
                type:
                  "inventory_update",

                action:
                  "Material Reduced",

                target:
                  material.item,

                quantity:
                  material.amount,

                description:
                  `${user.rpName} reduced ${material.item} stock by ${material.amount} for crafting ${request.recipeName}`,
              });
            }
          );
        }

        // =====================================
        // ADD RESULT ITEM
        // =====================================
        const craftedQuery =
          query(
            collection(
              db,
              "inventory"
            ),
            where(
              "name",
              "==",
              request.resultItem
            )
          );

        const craftedSnap =
          await getDocs(
            craftedQuery
          );

        if (
          craftedSnap.empty
        ) {

          await addDoc(
            collection(
              db,
              "inventory"
            ),
            {
              name:
                request.resultItem,

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

          craftedSnap.forEach(
            async (
              document
            ) => {

              await updateDoc(
                doc(
                  db,
                  "inventory",
                  document.id
                ),
                {
                  stock:
                    increment(
                      Number(
                        request.resultAmount
                      )
                    ),
                }
              );
            }
          );
        }

        // =====================================
        // LOG RESULT ITEM
        // =====================================
        await createActivityLog({
          type:
            "inventory_add",

          action:
            "Crafted Item Added",

          target:
            request.resultItem,

          quantity:
            request.resultAmount,

          description:
            `${user.rpName} added crafted item ${request.resultItem} x${request.resultAmount} into inventory`,
        });

        // =====================================
        // UPDATE STATUS
        // =====================================
        await updateDoc(
          doc(
            db,
            "crafting_requests",
            request.id
          ),
          {
            status:
              "Approved",

            approvedBy:
              user.rpName,

            approvedAt:
              serverTimestamp(),
          }
        );

        // =====================================
// UPDATE CRAFTING HISTORY
// =====================================
const historyQuery = query(
  collection(db, "crafting_history"),
  where(
    "craftedByUid",
    "==",
    request.requestedByUid
  )
);

const historySnapshot =
  await getDocs(historyQuery);

historySnapshot.forEach(
  async (historyDoc) => {

    const historyData =
      historyDoc.data();

    if (
      historyData.recipeName === request.recipeName &&
      historyData.status === "Pending"
    ) {

      await updateDoc(
        doc(
          db,
          "crafting_history",
          historyDoc.id
        ),
        {
          status:
            request.failedQty > 0
              ? "Partial Failed"
              : "Crafted",

          approvedBy:
            user.rpName,

          approvedAt:
            serverTimestamp(),
        }
      );
    }
  }
);

        // =====================================
        // ACTIVITY LOG
        // =====================================
        await createActivityLog({
          type:
            "crafting_approved",

          action:
            "Craft Request Approved",

          target:
            request.recipeName,

          quantity:
            request.resultAmount,

          requestedBy:
            request.requestedBy,

          requestedByUid:
            request.requestedByUid,

          description:
            `${user.rpName} approved crafting ${request.recipeName} requested by ${
              request.requestedBy ||
              "Unknown"
            }`,
        });

        // =====================================
        // CRAFTING LOG
        // =====================================
        await addDoc(
          collection(
            db,
            "crafting_logs"
          ),
          {
            recipeName:
              request.recipeName,

            craftedBy:
              request.requestedBy,

            craftedByUid:
              request.requestedByUid,

            approvedBy:
              user.rpName,

            approvedByUid:
              user.uid,

            resultItem:
              request.resultItem,

            resultAmount:
              request.resultAmount,

            createdAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Craft approved successfully"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed to approve craft"
        );

      } finally {

        setLoading(false);
      }
    };

  // =========================================
  // REJECT REQUEST
  // =========================================
  const rejectRequest =
    async (request) => {

      try {

        await updateDoc(
          doc(
            db,
            "crafting_requests",
            request.id
          ),
          {
            status:
              "Rejected",

            rejectedBy:
              user?.rpName ||
              "Unknown",

            rejectedAt:
              serverTimestamp(),
          }
        );

        // =====================================
        // ACTIVITY LOG
        // =====================================
        await createActivityLog({
          type:
            "crafting_rejected",

          action:
            "Craft Request Rejected",

          target:
            request.recipeName,

          quantity:
            request.resultAmount,

          requestedBy:
            request.requestedBy,

          requestedByUid:
            request.requestedByUid,

          description:
            `${user?.rpName} rejected crafting ${request.recipeName} requested by ${
              request.requestedBy ||
              "Unknown"
            }`,
        });

        toast.success(
          "Craft request rejected"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed to reject request"
        );
      }
    };

  // =========================================
  // CLEAR REQUEST
  // =========================================
  const clearRequest =
    async (requestId) => {

      try {

        if (
          role !== "Oyabun"
        ) {

          toast.error(
            "Only Oyabun can clear request"
          );

          return;
        }

        await deleteDoc(
          doc(
            db,
            "crafting_requests",
            requestId
          )
        );

        toast.success(
          "Request deleted successfully"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed to delete request"
        );
      }
    };

  return (

    <AppLayout>

      <div className="text-white">

        {/* HEADER */}
        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Crafting Requests
          </h1>

          <p className="text-gray-400 mt-2">
            Approval system for
            Jigokubara crafting
          </p>

        </div>

        {/* REQUESTS */}
        <div className="space-y-5">

          {paginatedRequests.map(
            (request) => (

              <div
                key={
                  request.id
                }
                className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6"
              >

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                  <div>

                    <div className="flex items-center gap-3">

                      <h2 className="text-2xl font-bold">
                        {
                          request.recipeName
                        }
                      </h2>

                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          request.status ===
                          "Approved"
                            ? "bg-green-500/20 text-green-300"
                            : request.status ===
                              "Rejected"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {
                          request.status
                        }
                      </span>

                    </div>

                    <p className="text-gray-400 mt-2">
                      Requested by{" "}
                      {
                        request.requestedBy
                      }
                    </p>

                    <p className="text-red-300 mt-2">
                      Result:
                      {" "}
                      {
                        request.resultItem
                      }
                      {" x"}
                      {
                        request.resultAmount
                      }
                    </p>

                  </div>

                  <div className="flex gap-3 flex-wrap">

                    {request.status ===
                      "Pending" &&
                      role ===
                        "Oyabun" && (

                        <>
                          <button
                            disabled={
                              loading
                            }
                            onClick={() =>
                              approveRequest(
                                request
                              )
                            }
                            className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl transition-all"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              rejectRequest(
                                request
                              )
                            }
                            className="bg-red-700 hover:bg-red-800 px-5 py-3 rounded-xl transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}

                    {(request.status ===
                      "Approved" ||
                      request.status ===
                        "Rejected") &&
                      role ===
                        "Oyabun" && (

                        <button
                          onClick={() =>
                            clearRequest(
                              request.id
                            )
                          }
                          className="bg-gray-800 hover:bg-gray-900 px-5 py-3 rounded-xl transition-all border border-gray-700"
                        >
                          Clear
                        </button>

                      )}

                  </div>

                </div>

              </div>
            )
          )}

          {requests.length ===
            0 && (

            <div className="bg-[#111111] border border-dashed border-gray-700 rounded-3xl p-10 text-center text-gray-400">
              No crafting requests
            </div>
          )}

        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (

          <div className="flex items-center justify-center gap-3 mt-10 flex-wrap">

            <button
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    prev - 1
                )
              }
              className="bg-[#111111] border border-gray-700 px-5 py-3 rounded-2xl disabled:opacity-40 hover:border-[#7A0019] transition-all"
            >
              Previous
            </button>

            {Array.from({
              length:
                totalPages,
            }).map(
              (_, index) => (

                <button
                  key={index}
                  onClick={() =>
                    setCurrentPage(
                      index + 1
                    )
                  }
                  className={`px-5 py-3 rounded-2xl transition-all ${
                    currentPage ===
                    index + 1
                      ? "bg-[#7A0019] text-white"
                      : "bg-[#111111] border border-gray-700 hover:border-[#7A0019]"
                  }`}
                >
                  {index + 1}
                </button>

              )
            )}

            <button
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    prev + 1
                )
              }
              className="bg-[#111111] border border-gray-700 px-5 py-3 rounded-2xl disabled:opacity-40 hover:border-[#7A0019] transition-all"
            >
              Next
            </button>

          </div>

        )}

      </div>

    </AppLayout>
  );
}