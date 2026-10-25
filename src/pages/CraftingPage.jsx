import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  deleteDoc,
  getDocs,
  runTransaction,
  limit,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";

import StatCard from "../components/common/StatCard";

import { useAuth } from "../contexts/AuthContext";

import { db } from "../services/firebase/config";

// ============================================
// CRAFTING RECIPES
// ============================================
const CRAFTING_RECIPES = [
  {
    name: "Small Armor",
    outputAmount: 1,
    materials: [
      { item: "Paketan Jamur", qty: 8 },
      { item: "Botol", qty: 4 },
      { item: "Kulit Jadi", qty: 5 },
      { item: "Alumunium Powder", qty: 5 },
      { item: "Iron Powder", qty: 5 },
      { item: "Baju", qty: 5 },
      { item: "Emas", qty: 3 },
      { item: "Baja", qty: 5 },
      { item: "Alumunium", qty: 5 },
      { item: "MetalScrap", qty: 5 },
      { item: "Kain", qty: 5 },
      { item: "Besi", qty: 10 },
      { item: "Tembaga", qty: 25 },
      { item: "Kayu Kemasan", qty: 20 },
    ],
  },

  {
    name: "Medium Armor",
    outputAmount: 1,
    materials: [
      { item: "Paketan Jamur", qty: 7 },
      { item: "Botol", qty: 6 },
      { item: "Kulit Jadi", qty: 7 },
      { item: "Alumunium Powder", qty: 5 },
      { item: "Iron Powder", qty: 5 },
      { item: "Baju", qty: 10 },
      { item: "Emas", qty: 7 },
      { item: "Baja", qty: 5 },
      { item: "Alumunium", qty: 5 },
      { item: "MetalScrap", qty: 5 },
      { item: "Kain", qty: 10 },
      { item: "Besi", qty: 20 },
      { item: "Tembaga", qty: 30 },
      { item: "Kayu Kemasan", qty: 20 },
    ],
  },

  {
    name: "Peluru .44 Magnum",
    outputAmount: 16,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 6 },
      { item: "Paketan Borax", qty: 3 },
      { item: "Kaca", qty: 10 },
      { item: "Besi", qty: 25 },
      { item: "Tembaga", qty: 30 },
    ],
  },

  {
    name: "Peluru 9mm",
    outputAmount: 35,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 5 },
      { item: "Paketan Borax", qty: 3 },
      { item: "Kaca", qty: 10 },
      { item: "Besi", qty: 20 },
      { item: "Tembaga", qty: 25 },
    ],
  },

  {
    name: "Peluru Double Action",
    outputAmount: 16,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 3 },
      { item: "Paketan Borax", qty: 6 },
      { item: "Kaca", qty: 10 },
      { item: "Tembaga", qty: 25 },
      { item: "Besi", qty: 30 },
    ],
  },

  {
    name: "Peluru Ak-47",
    outputAmount: 45,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 6 },
      { item: "Paketan Borax", qty: 5 },
      { item: "Kaca", qty: 15 },
      { item: "Besi", qty: 30 },
      { item: "Tembaga", qty: 35 },
    ],
  },

  {
    name: "Peluru .50 MBG",
    outputAmount: 5,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 6 },
      { item: "Paketan Borax", qty: 5 },
      { item: "Kaca", qty: 15 },
      { item: "Besi", qty: 35 },
      { item: "Tembaga", qty: 40 },
    ],
  },

  {
    name: "Lockpick",
    outputAmount: 1,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 2 },
      { item: "Paketan Singkong", qty: 3 },
      { item: "Besi", qty: 5 },
      { item: "Botol", qty: 15 },
      { item: "Tembaga", qty: 15 },
    ],
  },

  {
    name: "Alat Peretas",
    outputAmount: 1,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 4 },
      { item: "Emas", qty: 5 },
      { item: "Besi", qty: 11 },
      { item: "Tembaga", qty: 56 },
    ],
  },

  {
    name: "Thermite",
    outputAmount: 1,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Jamur", qty: 2 },
      { item: "Paketan Borax", qty: 3 },
      { item: "Plastik", qty: 10 },
      { item: "Tembaga", qty: 27 },
    ],
  },

  {
    name: "Drill",
    outputAmount: 1,
    materials: [
      { item: "Berlian", qty: 1 },
      { item: "Paketan Borax", qty: 3 },
      { item: "Paketan Jamur", qty: 3 },
      { item: "Botol", qty: 10 },
      { item: "Tembaga", qty: 27 },
    ],
  },
];

export default function CraftingPage() {

  const { role, user } =
    useAuth();

  const [inventory, setInventory] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [selectedRecipe, setSelectedRecipe] =
    useState("Light Armor");

  const [successQuantity, setSuccessQuantity] =
    useState(1);

  const [failedQuantity, setFailedQuantity] =
    useState(0);

  const [
    craftingHistory,
    setCraftingHistory,
  ] = useState([]);

  const [
    historyPage,
    setHistoryPage,
  ] = useState(1);

  const HISTORY_LIMIT = 5;

  // ============================================
  // REALTIME INVENTORY
  // ============================================
  useEffect(() => {

    const q = query(
      collection(
        db,
        "inventory"
      ),
      orderBy("name")
    );

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {

          const data =
            snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter(
                (item) =>
                  !item.deleted
              );

          setInventory(data);
        },
        (error) => {

          console.error(
            error
          );

          toast.error(
            "Failed loading inventory"
          );
        }
      );

    return () => unsubscribe();

  }, []);

  // ============================================
  // REALTIME HISTORY
  // ============================================
  useEffect(() => {

    const q = query(
  collection(
    db,
    "crafting_history"
  ),
  orderBy(
    "createdAt",
    "desc"
  ),
  limit(20)
);

    const unsubscribe =
      onSnapshot(
        q,
        (snapshot) => {

          const data =
            snapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );

          setCraftingHistory(
            data
          );
        }
      );

    return () =>
      unsubscribe();

  }, []);

  // ============================================
  // SELECTED RECIPE
  // ============================================
  const recipe = useMemo(() => {

    return CRAFTING_RECIPES.find(
      (item) =>
        item.name ===
        selectedRecipe
    );

  }, [selectedRecipe]);

  // ============================================
  // SAFE NUMBER
  // ============================================
  const successQty =
    parseInt(successQuantity) || 0;

  const failedQty =
    parseInt(failedQuantity) || 0;

  const outputPerCraft =
    parseInt(recipe?.outputAmount) || 0;

  const totalCraftProcess =
    successQty + failedQty;

  const totalOutput =
  successQty *
  outputPerCraft;

  // ============================================
  // FIND INVENTORY ITEM
  // ============================================
  const findInventoryItem =
    (itemName) => {

      return inventory.find(
        (inv) =>
          inv.name
            ?.toLowerCase()
            .trim() ===
          itemName
            ?.toLowerCase()
            .trim()
      );
    };

  // ============================================
  // CHECK MATERIALS
  // ============================================
  const checkMaterials = (
    recipeData,
    qtyMultiplier = 1
  ) => {

    for (const material of recipeData.materials) {

      const inventoryItem =
        findInventoryItem(
          material.item
        );

      const requiredQty =
        Number(material.qty) *
        Number(qtyMultiplier);

      const currentStock =
        Number(
          inventoryItem?.stock || 0
        );

      if (
        !inventoryItem ||
        currentStock < requiredQty
      ) {

        return {
          success: false,
          missing: material.item,
        };
      }
    }

    return {
      success: true,
    };
  };

  // ============================================
// REDUCE MATERIALS
// ============================================
const processCraftingTransaction =
  async ({
    recipe,
    totalCraftProcess,
    totalOutput,
  }) => {

    await runTransaction(
      db,
      async (transaction) => {

        const materialDocs = [];

        // ====================================
        // READ ALL MATERIALS FIRST
        // ====================================
        for (const material of recipe.materials) {

          const inventoryItem =
            findInventoryItem(
              material.item
            );

          if (!inventoryItem) {

            throw new Error(
              `${material.item} not found`
            );
          }

          const itemRef = doc(
            db,
            "inventory",
            inventoryItem.id
          );

          const itemSnap =
            await transaction.get(
              itemRef
            );

          if (!itemSnap.exists()) {

            throw new Error(
              `${material.item} missing`
            );
          }

          materialDocs.push({
            material,
            itemRef,
            data: itemSnap.data(),
          });
        }

        // ====================================
        // READ RESULT ITEM
        // ====================================
        const craftedItem =
          findInventoryItem(
            recipe.name
          );

        let craftedRef = null;
        let craftedSnap = null;

        if (craftedItem) {

          craftedRef = doc(
            db,
            "inventory",
            craftedItem.id
          );

          craftedSnap =
            await transaction.get(
              craftedRef
            );
        }

        // ====================================
        // VALIDATE STOCK
        // ====================================
        for (const item of materialDocs) {

          const currentStock =
            Number(
              item.data.stock || 0
            );

          const required =
            Number(item.material.qty) *
            Number(totalCraftProcess);

          if (
            currentStock < required
          ) {

            throw new Error(
              `Stock ${item.material.item} insufficient`
            );
          }
        }

        // ====================================
        // UPDATE MATERIALS
        // ====================================
        for (const item of materialDocs) {

          const currentStock =
            Number(
              item.data.stock || 0
            );

          const required =
            Number(item.material.qty) *
            Number(totalCraftProcess);

          transaction.update(
            item.itemRef,
            {
              stock:
                currentStock -
                required,
            }
          );
        }

        // ====================================
        // UPDATE RESULT ITEM
        // ====================================
        if (craftedSnap?.exists()) {

          const currentCraftedStock =
            Number(
              craftedSnap.data()
                .stock || 0
            );

          transaction.update(
            craftedRef,
            {
              stock:
                currentCraftedStock +
                Number(totalOutput),
            }
          );

        } else {

          const newItemRef =
            doc(
              collection(
                db,
                "inventory"
              )
            );

          transaction.set(
            newItemRef,
            {
              name:
                recipe.name,

              category:
                "CRAFTING",

              stock:
                Number(
                  totalOutput
                ),

              imageUrl: "",

              createdAt:
                serverTimestamp(),
            }
          );
        }
      }
    );
  };


  // ============================================
  // ADD HISTORY
  // ============================================
  const addCraftingHistory =
    async ({
      recipeName,
      successQty,
      failedQty,
      outputQty,
      status,
    }) => {

      await addDoc(
        collection(
          db,
          "crafting_history"
        ),
        {
          recipeName,

          successQty:
            Number(successQty),

          failedQty:
            Number(failedQty),

          outputQty:
            Number(outputQty),

          totalProcess:
            Number(successQty) +
            Number(failedQty),

          status,

          craftedBy:
  user?.rpName ||
  user?.name ||
  user?.displayName ||
  user?.email?.split("@")[0] ||
  "Unknown",

          craftedByUid:
            user?.uid,

          role,

          createdAt:
            serverTimestamp(),
        }
      );
    };

  // ============================================
  // ADD ACTIVITY LOG
  // ============================================
  const addActivityLog =
    async ({
      type,
      action,
      target,
      quantity,
      description,
    }) => {

      await addDoc(
        collection(
          db,
          "activity_logs"
        ),
        {
          type,

          action,

          target,

          quantity,

          description,

          role,

          userId:
            user?.uid,

          userName:
  user?.rpName ||
  user?.name ||
  user?.displayName ||
  user?.email?.split("@")[0] ||
  "Unknown",

          createdAt:
            serverTimestamp(),
        }
      );
    };

  // ============================================
  // CREATE CRAFTING
  // ============================================
  const handleCreateCrafting =
    async () => {

      try {

        setLoading(true);

        if (
          totalCraftProcess <= 0
        ) {

          toast.error(
            "Masukkan quantity crafting"
          );

          return;
        }

        const validation =
          checkMaterials(
            recipe,
            totalCraftProcess
          );

        if (
          !validation.success
        ) {

          toast.error(
            `Stock ${validation.missing} tidak cukup`
          );

          return;
        }

        if (role === "Oyabun") {

  await processCraftingTransaction({
    recipe,
    totalCraftProcess,
    totalOutput,
  });

  await addCraftingHistory({
    recipeName: recipe.name,
    successQty,
    failedQty,
    outputQty: totalOutput,
    status:
      failedQty > 0
        ? "Success With Failures"
        : "Crafted",
  });

  await addActivityLog({
    type:
      failedQty > 0
        ? "crafting_failed"
        : "crafting_completed",

    action:
      failedQty > 0
        ? "Craft Partial Failed"
        : "Craft Completed",

    target: recipe.name,

    quantity: totalOutput,

    description:
      `${user?.rpName || user?.name} crafted ${recipe.name} with ${successQty} success and ${failedQty} failed`,
  });

  toast.success(
    "Crafting berhasil diproses"
  );

  setSuccessQuantity(1);
  setFailedQuantity(0);

  return;
}

        await addActivityLog({
          type:
            failedQty > 0
              ? "crafting_failed"
              : "crafting_approved",

          action:
            failedQty > 0
              ? "Craft Partial Failed"
              : "Craft Completed",

          target:
            recipe.name,

          quantity:
            totalOutput,

          description:
            `${user?.rpName || user?.name} crafted ${recipe.name} with ${successQty} success and ${failedQty} failed`,
        });

        await addDoc(
          collection(
            db,
            "crafting_requests"
          ),
          {
            recipeName:
              recipe.name,

            resultItem:
              recipe.name,

            resultAmount:
              Number(totalOutput),

            category:
              "CRAFTING",

            successQty:
              Number(successQuantity),

            failedQty:
              Number(failedQuantity),

            totalProcess:
              totalCraftProcess,

            materials:
              recipe.materials.map(
                (
                  material
                ) => ({
                  item:
                    material.item,

                  amount:
                    Number(
                      material.qty
                    ) *
                    Number(
                      totalCraftProcess
                    ),
                })
              ),

            requestedBy:
              user?.rpName ||
              user?.name,

            requestedByUid:
              user?.uid,

            status:
              "Pending",

            createdAt:
              serverTimestamp(),
          }
        );

        await addActivityLog({
          type:
            "crafting_request",

          action:
            "Craft Request",

          target:
            recipe.name,

          quantity:
            totalOutput,

          description:
            `${user?.rpName || user?.name} requested crafting ${recipe.name} with ${successQty} success and ${failedQty} failed`,
        });

        await addCraftingHistory({
          recipeName:
            recipe.name,

          successQty:
            successQty,

          failedQty:
            failedQty,

          outputQty:
            Number(totalOutput),

          status:
            "Pending",
        });

        toast.success(
          "Request crafting dikirim"
        );

        setSuccessQuantity(1);

        setFailedQuantity(0);

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed create crafting"
        );

      } finally {

        setLoading(false);
      }
    };

  // ============================================
  // CLEAR HISTORY
  // ============================================
  const handleClearHistory = async () => {

    if (role !== "Oyabun") {
      toast.error("Only Oyabun can clear history");
      return;
    }

    const confirmDelete = window.confirm(
      "Yakin ingin menghapus semua crafting history?"
    );

    if (!confirmDelete) return;

    try {

      setLoading(true);

      const snapshot = await getDocs(
        collection(db, "crafting_history")
      );

      const promises = snapshot.docs.map((item) =>
        deleteDoc(
          doc(db, "crafting_history", item.id)
        )
      );

      await Promise.all(promises);

      toast.success("Crafting history cleared");

    } catch (error) {

      console.error(error);

      toast.error("Failed clear history");

    } finally {

      setLoading(false);
    }
  };

  // ============================================
  // PAGINATION HISTORY
  // ============================================
  const totalHistoryPages =
    Math.ceil(
      craftingHistory.length /
        HISTORY_LIMIT
    );

  const paginatedHistory =
    craftingHistory.slice(
      (historyPage - 1) *
        HISTORY_LIMIT,
      historyPage *
        HISTORY_LIMIT
    );

  return (

    <AppLayout>

      <div className="text-white">

        {/* HEADER */}
        <div className="mb-6">

          <h1 className="text-3xl font-black bg-gradient-to-r from-purple-300 to-fuchsia-500 bg-clip-text text-transparent">
            Crafting System
          </h1>

          <p className="text-sm text-purple-200/60 mt-1">
            Jigokubara crafting management
          </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          <StatCard
            title="Recipes"
            value={
              CRAFTING_RECIPES.length
            }
          />

          <StatCard
            title="Role"
            value={role}
          />

        </div>

        {/* MAIN */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="xl:col-span-2 space-y-6">

            {/* CREATE */}
            <div className="bg-gradient-to-br from-[#14051f] to-[#0b0614] border border-purple-500/20 rounded-3xl p-5">

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-xl font-bold">
                  Create Crafting
                </h2>

                <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                  {role}
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="md:col-span-2">

                  <label className="text-xs text-purple-200/60">
                    Recipe
                  </label>

                  <select
                    value={
                      selectedRecipe
                    }
                    onChange={(e) =>
                      setSelectedRecipe(
                        e.target.value
                      )
                    }
                    className="w-full mt-2 bg-[#0b0812] border border-purple-500/20 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
                  >

                    {CRAFTING_RECIPES.map(
                      (
                        recipe
                      ) => (

                        <option
                          key={
                            recipe.name
                          }
                          value={
                            recipe.name
                          }
                        >
                          {
                            recipe.name
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <label className="text-xs text-green-300">
                      Success
                    </label>

                    <input
                      type="number"
                      min={0}
                      value={
                        successQuantity
                      }
                      onChange={(e) =>
                        setSuccessQuantity(
                          Math.max(
                            0,
                            Number(
                              e.target.value
                            )
                          )
                        )
                      }
                      className="w-full mt-2 bg-[#0b0812] border border-green-500/20 rounded-2xl px-3 py-3"
                    />

                  </div>

                  <div>

                    <label className="text-xs text-red-300">
                      Failed
                    </label>

                    <input
                      type="number"
                      min={0}
                      value={
                        failedQuantity
                      }
                      onChange={(e) =>
                        setFailedQuantity(
                          Math.max(
                            0,
                            Number(
                              e.target.value
                            )
                          )
                        )
                      }
                      className="w-full mt-2 bg-[#0b0812] border border-red-500/20 rounded-2xl px-3 py-3"
                    />

                  </div>

                </div>

              </div>

              {/* OUTPUT */}
              <div className="grid grid-cols-3 gap-3 mt-5">

                <div className="bg-black/30 border border-purple-500/10 rounded-2xl p-4 text-center">

                  <p className="text-xs text-gray-400">
                    Success
                  </p>

                  <h2 className="text-2xl font-black text-green-400 mt-1">
                    {successQty}
                  </h2>

                </div>

                <div className="bg-black/30 border border-purple-500/10 rounded-2xl p-4 text-center">

                  <p className="text-xs text-gray-400">
                    Failed
                  </p>

                  <h2 className="text-2xl font-black text-red-400 mt-1">
                    {failedQty}
                  </h2>

                </div>

                <div className="bg-black/30 border border-purple-500/10 rounded-2xl p-4 text-center">

                  <p className="text-xs text-gray-400">
                    Output
                  </p>

                  <h2 className="text-2xl font-black text-purple-300 mt-1">
                    {totalOutput}
                  </h2>

                </div>

              </div>

              <button
                onClick={
                  handleCreateCrafting
                }
                disabled={loading}
                className="w-full mt-5 bg-gradient-to-r from-purple-700 to-fuchsia-700 hover:opacity-90 transition-all rounded-2xl py-4 font-bold shadow-lg shadow-purple-900/30"
              >

                {loading
                  ? "Loading..."
                  : role ===
                    "Oyabun"
                  ? "Craft Now"
                  : "Request Crafting"}

              </button>

            </div>

            {/* MATERIALS */}
            <div className="bg-gradient-to-br from-[#14051f] to-[#0b0614] border border-purple-500/20 rounded-3xl p-5">

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-xl font-bold">
                  Materials
                </h2>

                <span className="text-xs text-purple-300">
                  {recipe?.materials.length} Items
                </span>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {recipe?.materials.map(
                  (
                    material,
                    index
                  ) => {

                    const inventoryItem =
                      findInventoryItem(
                        material.item
                      );

                    const required =
                      Number(
                        material.qty
                      ) *
                      Number(
                        totalCraftProcess
                      );

                    const currentStock =
                      Number(
                        inventoryItem?.stock ||
                          0
                      );

                    const enough =
                      currentStock >=
                      required;

                    return (

                      <div
                        key={index}
                        className="bg-black/30 border border-purple-500/10 rounded-2xl px-4 py-3 flex items-center justify-between"
                      >

                        <div>

                          <h4 className="font-semibold text-sm">
                            {
                              material.item
                            }
                          </h4>

                          <p className="text-xs text-gray-400 mt-1">
                            Need {required}
                          </p>

                        </div>

                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            enough
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {currentStock}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div>

            <div className="bg-gradient-to-br from-[#14051f] to-[#0b0614] border border-purple-500/20 rounded-3xl p-5">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h2 className="text-xl font-bold">
                    History
                  </h2>

                  <p className="text-xs text-purple-200/50 mt-1">
                    Recent crafting activity
                  </p>

                </div>

                {role === "Oyabun" && (

                  <button
                    onClick={handleClearHistory}
                    disabled={loading}
                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-300 px-3 py-2 rounded-xl text-xs"
                  >
                    Clear
                  </button>

                )}

              </div>

              <div className="space-y-3">

                {paginatedHistory.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="bg-black/30 border border-purple-500/10 rounded-2xl p-4"
                    >

                      <div className="flex items-center justify-between gap-3">

                        <div>

                          <h3 className="font-bold text-sm">
                            {
                              item.recipeName
                            }
                          </h3>

                          <p className="text-xs text-gray-400 mt-1">
                            {
                              item.craftedBy
                            }
                          </p>

                        </div>

                        <span
                          className={`text-[10px] px-2 py-1 rounded-full ${
                            item.status ===
                            "Crafted"
                              ? "bg-green-500/20 text-green-300"
                              : item.status ===
                                "Partial Failed"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {
                            item.status
                          }
                        </span>

                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4">

                        <div className="bg-[#130d1c] rounded-xl p-2 text-center">

                          <p className="text-[10px] text-gray-400">
                            S
                          </p>

                          <h4 className="font-bold text-green-400 text-sm mt-1">
                            {
                              item.successQty
                            }
                          </h4>

                        </div>

                        <div className="bg-[#130d1c] rounded-xl p-2 text-center">

                          <p className="text-[10px] text-gray-400">
                            F
                          </p>

                          <h4 className="font-bold text-red-400 text-sm mt-1">
                            {
                              item.failedQty
                            }
                          </h4>

                        </div>

                        <div className="bg-[#130d1c] rounded-xl p-2 text-center">

                          <p className="text-[10px] text-gray-400">
                            OUT
                          </p>

                          <h4 className="font-bold text-purple-300 text-sm mt-1">
                            {
                              item.outputQty
                            }
                          </h4>

                        </div>

                      </div>

                    </div>
                  )
                )}

                {paginatedHistory.length ===
                  0 && (

                  <div className="bg-black/20 border border-dashed border-purple-500/20 rounded-2xl p-6 text-center text-sm text-gray-400">

                    No crafting history

                  </div>

                )}

              </div>

              {/* PAGINATION */}
              {totalHistoryPages >
                1 && (

                <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">

                  <button
                    disabled={
                      historyPage === 1
                    }
                    onClick={() =>
                      setHistoryPage(
                        (
                          prev
                        ) =>
                          prev - 1
                      )
                    }
                    className="bg-black/30 border border-purple-500/20 px-3 py-2 rounded-xl text-sm disabled:opacity-40"
                  >
                    Prev
                  </button>

                  {Array.from({
                    length:
                      totalHistoryPages,
                  }).map(
                    (_, index) => (

                      <button
                        key={index}
                        onClick={() =>
                          setHistoryPage(
                            index + 1
                          )
                        }
                        className={`w-10 h-10 rounded-xl text-sm font-bold ${
                          historyPage ===
                          index + 1
                            ? "bg-gradient-to-r from-purple-700 to-fuchsia-700"
                            : "bg-black/30 border border-purple-500/20"
                        }`}
                      >
                        {index + 1}
                      </button>

                    )
                  )}

                  <button
                    disabled={
                      historyPage ===
                      totalHistoryPages
                    }
                    onClick={() =>
                      setHistoryPage(
                        (
                          prev
                        ) =>
                          prev + 1
                      )
                    }
                    className="bg-black/30 border border-purple-500/20 px-3 py-2 rounded-xl text-sm disabled:opacity-40"
                  >
                    Next
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </AppLayout>
  );
}