import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import { db } from "../services/firebase/config";

export default function RecycleBinPage() {
  const [items, setItems] =
    useState([]);

  // =====================================
  // REALTIME RECYCLE BIN
  // =====================================
  useEffect(() => {
    const recycleRef = query(
      collection(db, "inventory"),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(
        recycleRef,
        (snapshot) => {
          const data =
            snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter(
                (item) =>
                  item.deleted
              );

          setItems(data);
        }
      );

    return () => unsubscribe();
  }, []);

  // =====================================
  // RESTORE ITEM
  // =====================================
  const restoreItem =
    async (item) => {
      try {
        await updateDoc(
          doc(
            db,
            "inventory",
            item.id
          ),
          {
            deleted: false,
            deletedAt: null,
          }
        );

        toast.success(
          "Item restored"
        );
      } catch (error) {
        console.error(
          error
        );

        toast.error(
          "Failed to restore item"
        );
      }
    };

  // =====================================
  // PERMANENT DELETE
  // =====================================
  const permanentDelete =
    async (item) => {
      try {
        await deleteDoc(
          doc(
            db,
            "inventory",
            item.id
          )
        );

        toast.success(
          "Item permanently deleted"
        );
      } catch (error) {
        console.error(
          error
        );

        toast.error(
          "Failed to delete item"
        );
      }
    };

  return (
    <AppLayout>
      <div className="text-white">

        <h1 className="text-4xl font-bold mb-8">
          Recycle Bin
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#111111] border border-red-900 rounded-3xl p-5"
            >

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-bold">
                  {item.name}
                </h2>

                <span className="text-xs bg-red-600/20 text-red-300 px-3 py-1 rounded-full">

                  Deleted

                </span>

              </div>

              <div className="mt-5">

                <p className="text-gray-400 text-sm">
                  Category
                </p>

                <h3 className="text-lg font-semibold mt-1">

                  {item.category}

                </h3>

              </div>

              <div className="mt-5">

                <p className="text-gray-400 text-sm">
                  Stock
                </p>

                <h3 className="text-3xl font-bold mt-1">

                  {item.stock}

                </h3>

              </div>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={() =>
                    restoreItem(
                      item
                    )
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl py-3"
                >

                  Restore

                </button>

                <button
                  onClick={() =>
                    permanentDelete(
                      item
                    )
                  }
                  className="flex-1 bg-red-700 hover:bg-red-800 rounded-xl py-3"
                >

                  Delete Forever

                </button>

              </div>

            </div>
          ))}

        </div>

        {items.length ===
          0 && (
          <div className="text-gray-400 mt-10">
            Recycle bin empty
          </div>
        )}

      </div>
    </AppLayout>
  );
}