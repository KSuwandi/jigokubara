import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";
import EmptyState from "../components/common/EmptyState";

import { useAuth } from "../contexts/AuthContext";
import { db } from "../services/firebase/config";

export default function CraftingLogsPage() {
  const { user } = useAuth();

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!user) return;

    const logsRef = query(
      collection(
        db,
        "users",
        user.uid,
        "craftingLogs"
      ),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      logsRef,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        setLogs(data);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <AppLayout>
      <div className="text-white w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Crafting Logs
          </h1>

          <p className="text-gray-400 mt-2">
            Real-time crafting history
          </p>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-5"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold">
                    {log.resultItem}
                  </h2>

                  <p className="text-gray-400 mt-1">
                    Crafted by{" "}
                    <span className="text-white">
                      {log.craftedBy}
                    </span>
                  </p>
                </div>

                <span className="bg-[#7A0019]/20 text-red-300 px-4 py-2 rounded-full text-sm">
                  {log.role}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-black rounded-2xl p-4">
                  <p className="text-gray-400 text-sm">
                    Recipe
                  </p>

                  <h3 className="text-xl font-bold mt-1">
                    {log.recipeName}
                  </h3>
                </div>

                <div className="bg-black rounded-2xl p-4">
                  <p className="text-gray-400 text-sm">
                    Amount
                  </p>

                  <h3 className="text-xl font-bold mt-1">
                    {log.resultAmount}
                  </h3>
                </div>

                <div className="bg-black rounded-2xl p-4">
                  <p className="text-gray-400 text-sm">
                    Status
                  </p>

                  <h3 className="text-green-400 text-xl font-bold mt-1">
                    Success
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="mt-6">
            <EmptyState title="No crafting logs found" />
          </div>
        )}
      </div>
    </AppLayout>
  );
}