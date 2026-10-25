import {
  useEffect,
  useMemo,
  useState,
} from "react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import toast from "react-hot-toast";
import axios from "axios";

import {
  addDoc,
  collection,
  doc,
  increment,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import AppLayout from "../layouts/AppLayout";
import EmptyState from "../components/common/EmptyState";

import { useAuth } from "../contexts/AuthContext";
import { db } from "../services/firebase/config";
import { INVENTORY_CATEGORIES } from "../utils/constants";
import { createActivityLog } from "../utils/activityLogger";

const ITEMS_PER_PAGE = 9;

// CLOUDINARY
const CLOUDINARY_CLOUD_NAME =
  "dpyhp3o66";

const CLOUDINARY_UPLOAD_PRESET =
  "jigokubara";

export default function InventoryPage() {

  const { role, user } =
    useAuth();

  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);

  const [filter, setFilter] =
    useState("All");

  const [search, setSearch] =
    useState("");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [form, setForm] =
    useState({
      name: "",
      category: "DISNAKER",
      stock: "",
    });

  // =========================
  // NORMALIZE CATEGORY
  // =========================
  const normalizeCategory = (
    category
  ) => {

    if (!category)
      return "";

    const value = String(
      category
    )
      .trim()
      .toUpperCase();

    if (
      value ===
        "PREPAREAN" ||
      value ===
        "PERSENJATAAN" ||
      value === "PREPARE"
    ) {

      return "PREPAREAN";
    }

    return value;
  };

  // =========================
  // REALTIME INVENTORY
  // =========================
  useEffect(() => {

  const loadInventory =
    async () => {

      try {

        const snapshot =
          await getDocs(
            query(
              collection(
                db,
                "inventory"
              ),
              orderBy(
                "createdAt",
                "desc"
              )
            )
          );

        const data =
          snapshot.docs
            .map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
                category:
                  normalizeCategory(
                    doc.data()
                      .category
                  ),
              })
            )
            .filter(
              (item) =>
                !item.deleted
            );

        setItems(data);

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed load inventory"
        );
      }
    };

  loadInventory();

}, []);

  useEffect(() => {

    setCurrentPage(1);

  }, [filter, search]);

  // =========================
  // FILTER
  // =========================
  const filteredItems =
    useMemo(() => {

      let filtered = [
        ...items,
      ];

      if (
        filter !== "All"
      ) {

        filtered =
          filtered.filter(
            (item) =>
              normalizeCategory(
                item.category
              ) ===
              normalizeCategory(
                filter
              )
          );
      }

      if (
        search.trim()
      ) {

        filtered =
          filtered.filter(
            (item) =>
              item.name
                ?.toLowerCase()
                .includes(
                  search.toLowerCase()
                ) ||
              item.category
                ?.toLowerCase()
                .includes(
                  search.toLowerCase()
                )
          );
      }

      return filtered;

    }, [
      items,
      filter,
      search,
    ]);

  const totalPages =
    Math.ceil(
      filteredItems.length /
        ITEMS_PER_PAGE
    );

  const paginatedItems =
    useMemo(() => {

      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      return filteredItems.slice(
        start,
        start +
          ITEMS_PER_PAGE
      );

    }, [
      filteredItems,
      currentPage,
    ]);

  // =========================
  // ADD ITEM
  // =========================
  const handleAddItem =
    async (e) => {

      e.preventDefault();

      if (role === "Shatei") {
    toast.error("Shatei tidak memiliki akses menambah item");
    return;
  }

      if (
        !form.name ||
        !form.stock
      ) {

        toast.error(
          "Complete all fields"
        );

        return;
      }

      try {

        setLoading(true);

        const normalizedCategory =
          normalizeCategory(
            form.category
          );

        // REQUEST
        if (
          role !== "Oyabun"
        ) {

          await addDoc(
            collection(
              db,
              "inventory_requests"
            ),
            {
              type:
                "ADD_ITEM",
              name:
                form.name,
              category:
                normalizedCategory,
              stock:
                Number(
                  form.stock
                ),
              requestedBy:
                user?.rpName ||
                "Unknown",
              status:
                "pending",
              createdAt:
                serverTimestamp(),
            }
          );

          toast.success(
            "Request sent to Oyabun"
          );

          setForm({
            name: "",
            category:
              "DISNAKER",
            stock: "",
          });

          return;
        }

        // DIRECT ADD
        await addDoc(
          collection(
            db,
            "inventory"
          ),
          {
            name:
              form.name,
            category:
              normalizedCategory,
            stock:
              Number(
                form.stock
              ),
            imageUrl: "",
            createdAt:
              serverTimestamp(),
          }
        );

        await createActivityLog({
          action:
            "ADD_INVENTORY",
          user:
            user?.rpName ||
            "Unknown",
          role,
          target:
            form.name,
        });

        toast.success(
          "Item added"
        );

        setForm({
          name: "",
          category:
            "DISNAKER",
          stock: "",
        });

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed to add item"
        );

      } finally {

        setLoading(false);

      }
    };

  // =========================
  // UPDATE STOCK
  // =========================
  const updateStock =
    async (
      item,
      type
    ) => {

      const input = prompt(
        type === "add"
          ? `Add stock for ${item.name}`
          : `Reduce stock for ${item.name}`
      );

      if (!input)
        return;

      const amount =
        Number(input);

      if (
        isNaN(amount) ||
        amount <= 0
      ) {

        toast.error(
          "Invalid amount"
        );

        return;
      }

      try {

        // REQUEST
        if (
          role !== "Oyabun"
        ) {

          await addDoc(
            collection(
              db,
              "inventory_requests"
            ),
            {
              type:
                type ===
                "add"
                  ? "ADD_STOCK"
                  : "REDUCE_STOCK",
              itemId:
                item.id,
              itemName:
                item.name,
              amount,
              requestedBy:
                user?.rpName ||
                "Unknown",
              status:
                "pending",
              createdAt:
                serverTimestamp(),
            }
          );

          toast.success(
            "Request sent to Oyabun"
          );

          return;
        }

        const finalAmount =
          type === "add"
            ? amount
            : -amount;

        const nextStock =
          Number(
            item.stock || 0
          ) + finalAmount;

        if (
          nextStock < 0
        ) {

          toast.error(
            "Stock cannot be below 0"
          );

          return;
        }

        await updateDoc(
          doc(
            db,
            "inventory",
            item.id
          ),
          {
            stock:
              increment(
                finalAmount
              ),
          }
        );

        toast.success(
          type === "add"
            ? "Stock added"
            : "Stock reduced"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Failed update stock"
        );

      }
    };

  // =========================
  // CLOUDINARY UPLOAD
  // =========================
  const handleUploadPhoto =
    async (
      item,
      file
    ) => {

      if (!file)
        return;

      if (
        role !== "Oyabun"
      ) {

        toast.error(
          "Only Oyabun can upload photo"
        );

        return;
      }

      try {

        setUploadingImage(
          true
        );

        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        formData.append(
          "upload_preset",
          CLOUDINARY_UPLOAD_PRESET
        );

        const response =
          await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
          );

        const imageUrl =
          response.data
            .secure_url;

        await updateDoc(
          doc(
            db,
            "inventory",
            item.id
          ),
          {
            imageUrl,
          }
        );

        toast.success(
          "Photo uploaded"
        );

      } catch (error) {

        console.error(
          error
        );

        toast.error(
          "Upload failed"
        );

      } finally {

        setUploadingImage(
          false
        );

      }
    };

  // =========================
  // EDIT ITEM
  // =========================
  const handleEditItem =
    async (item) => {

      if (
        role !== "Oyabun"
      ) {

        toast.error(
          "Only Oyabun can edit"
        );

        return;
      }

      const newName =
        prompt(
          "Edit item name",
          item.name
        );

      const newStock =
        prompt(
          "Edit stock",
          item.stock
        );

      if (
        !newName ||
        !newStock
      )
        return;

      await updateDoc(
        doc(
          db,
          "inventory",
          item.id
        ),
        {
          name: newName,
          stock:
            Number(
              newStock
            ),
        }
      );

      toast.success(
        "Item updated"
      );
    };

  // =========================
  // DELETE ITEM
  // =========================
  const deleteItem =
    async (item) => {

      if (
        role !== "Oyabun"
      ) {

        toast.error(
          "Only Oyabun can delete"
        );

        return;
      }

      await updateDoc(
        doc(
          db,
          "inventory",
          item.id
        ),
        {
          deleted: true,
          deletedAt:
            serverTimestamp(),
        }
      );

      toast.success(
        "Item deleted"
      );
    };

  return (

    <AppLayout>

      <div className="text-white relative overflow-hidden min-h-screen px-2">

        {/* BACKGROUND */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#120018] via-[#1b0126] to-black opacity-95" />

        <div className="absolute top-0 left-0 w-full max-w-[500px] h-[500px] bg-purple-700/20 blur-[180px] rounded-full" />

        <div className="absolute bottom-0 right-0 w-full max-w-[400px] h-[400px] bg-fuchsia-700/20 blur-[160px] rounded-full" />

        <div className="relative z-10">

          {/* HEADER */}
          <div className="mb-10">

            <p className="text-purple-300 tracking-[0.3em] uppercase text-sm mb-3">
              JIGOKUBARA WAREHOUSE
            </p>

            <h1 className="text-5xl font-black bg-gradient-to-r from-purple-200 via-fuchsia-300 to-purple-500 bg-clip-text text-transparent">
              Inventory System
            </h1>

          </div>

          {/* FILTER */}
          <div className="flex gap-3 flex-wrap mb-8">

            {INVENTORY_CATEGORIES.map(
              (
                category
              ) => (

                <button
                  key={
                    category
                  }
                  onClick={() =>
                    setFilter(
                      category
                    )
                  }
                  className={`px-5 py-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 font-semibold ${
                    normalizeCategory(
                      filter
                    ) ===
                    normalizeCategory(
                      category
                    )
                      ? "bg-gradient-to-r from-purple-700 to-fuchsia-700 border-purple-400 shadow-lg shadow-purple-900/40 scale-105"
                      : "bg-white/5 border-purple-900/40 hover:border-purple-500 hover:bg-purple-900/20"
                  }`}
                >
                  {category}
                </button>
              )
            )}

          </div>

          {/* SEARCH */}
          <div className="mb-8">

            <input
              type="text"
              placeholder="Search inventory..."
              value={search}
              onChange={(
                e
              ) =>
                setSearch(
                  e.target
                    .value
                )
              }
              className="md:w-full max-w-[420px] bg-white/5 backdrop-blur-xl border border-purple-900/40 rounded-2xl px-5 py-4 outline-none focus:border-fuchsia-500 transition-all"
            />

          </div>

          {/* FORM */}
{role !== "Shatei" && (
  <form
    onSubmit={handleAddItem}
    className="bg-white/5 backdrop-blur-2xl border border-purple-900/40 rounded-[32px] p-6 mb-10 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-2xl shadow-purple-950/20"
  >

    <input
      type="text"
      placeholder="Item Name"
      value={form.name}
      onChange={(e) =>
        setForm({
          ...form,
          name: e.target.value,
        })
      }
      className="bg-black/40 border border-purple-900/40 rounded-2xl px-5 py-4 outline-none focus:border-fuchsia-500 transition-all"
    />

    <select
      value={form.category}
      onChange={(e) =>
        setForm({
          ...form,
          category: e.target.value,
        })
      }
      className="bg-black/40 border border-purple-900/40 rounded-2xl px-5 py-4 outline-none focus:border-fuchsia-500 transition-all"
    >
      {INVENTORY_CATEGORIES
        .filter((c) => c !== "All")
        .map((category) => (
          <option
            key={category}
            value={category}
          >
            {category}
          </option>
        ))}
    </select>

    <input
      type="number"
      placeholder="Stock"
      value={form.stock}
      onChange={(e) =>
        setForm({
          ...form,
          stock: e.target.value,
        })
      }
      className="bg-black/40 border border-purple-900/40 rounded-2xl px-5 py-4 outline-none focus:border-fuchsia-500 transition-all"
    />

    <button
      type="submit"
      disabled={loading}
      className="bg-gradient-to-r from-purple-700 to-fuchsia-700 hover:scale-[1.02] active:scale-100 transition-all rounded-2xl px-4 py-4 font-bold shadow-lg shadow-purple-900/40"
    >
      {loading
        ? "Loading..."
        : role === "Oyabun"
        ? "Add Item"
        : "Request Item"}
    </button>

  </form>
)}

          {/* ITEMS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {paginatedItems.map(
              (item) => (

                <div
                  key={
                    item.id
                  }
                  className="group bg-white/5 backdrop-blur-2xl border border-purple-900/30 hover:border-fuchsia-500/60 rounded-[32px] p-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-950/40"
                >

                  {/* IMAGE */}
                  <div className="mb-5 relative overflow-hidden rounded-3xl">

                    {item.imageUrl ? (

                      <img
                        src={
                          item.imageUrl
                        }
                        alt={
                          item.name
                        }
                        referrerPolicy="no-referrer"
                        onError={(
                          e
                        ) => {
                          e.target.src =
                            "https://i.pravatar.cc/300";
                        }}
                        className="w-full h-56 object-cover rounded-3xl group-hover:scale-110 transition-all duration-700"
                      />

                    ) : (

                      <div className="w-full h-56 border border-dashed border-purple-900/40 rounded-3xl flex items-center justify-center text-purple-300 bg-black/30">
                        No Photo
                      </div>

                    )}

                  </div>

                  {/* TITLE */}
                  <div className="flex justify-between items-start gap-3">

                    <div>

                      <h2 className="text-2xl font-black leading-tight">
                        {item.name}
                      </h2>

                      <p className="text-purple-300 text-sm mt-2">
                        Japanese Clan Supply
                      </p>

                    </div>

                    <span className="text-xs bg-gradient-to-r from-purple-700/30 to-fuchsia-700/30 border border-purple-500/30 text-purple-200 px-3 py-1 rounded-full">
                      {item.category}
                    </span>

                  </div>

                  {/* STOCK */}
                  <div className="mt-6 bg-black/30 border border-purple-900/20 rounded-2xl p-4">

                    <p className="text-gray-400 text-sm">
                      Current Stock
                    </p>

                    <h3 className="text-5xl font-black mt-2 bg-gradient-to-r from-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
                      {item.stock}
                    </h3>

                  </div>

                  {/* BUTTONS */}
                  {role !==
                    "Shatei" && (

                    <div className="flex gap-3 mt-5">

                      <button
                        onClick={() =>
                          updateStock(
                            item,
                            "add"
                          )
                        }
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:scale-[1.03] transition-all rounded-2xl py-3 font-semibold"
                      >
                        + Stock
                      </button>

                      <button
                        onClick={() =>
                          updateStock(
                            item,
                            "reduce"
                          )
                        }
                        className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-700 hover:scale-[1.03] transition-all rounded-2xl py-3 font-semibold"
                      >
                        - Stock
                      </button>

                    </div>
                  )}

                  {/* OYABUN */}
                  {role ===
                    "Oyabun" && (

                    <div className="flex flex-col gap-3 mt-4">

                      <button
                        onClick={() =>
                          handleEditItem(
                            item
                          )
                        }
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:scale-[1.02] transition-all rounded-2xl py-3 font-semibold"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteItem(
                            item
                          )
                        }
                        className="bg-gradient-to-r from-red-700 to-rose-800 hover:scale-[1.02] transition-all rounded-2xl py-3 font-semibold"
                      >
                        Delete
                      </button>

                      <label className="bg-gradient-to-r from-purple-700 to-fuchsia-700 hover:scale-[1.02] transition-all rounded-2xl py-3 text-center cursor-pointer font-semibold">

                        {uploadingImage
                          ? "Uploading..."
                          : "Upload Photo"}

                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(
                            e
                          ) =>
                            handleUploadPhoto(
                              item,
                              e
                                .target
                                .files[0]
                            )
                          }
                        />

                      </label>

                    </div>
                  )}

                </div>
              )
            )}

          </div>

          {/* PAGINATION */}
          {totalPages >
            1 && (

            <div className="flex justify-center items-center gap-4 mt-12">

              <button
                onClick={() =>
                  setCurrentPage(
                    (p) =>
                      Math.max(
                        p - 1,
                        1
                      )
                  )
                }
                disabled={
                  currentPage ===
                  1
                }
                className="px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-purple-900/40 disabled:opacity-40 hover:border-purple-500 transition-all"
              >
                Prev
              </button>

              <span className="text-purple-200 font-semibold">
                Page{" "}
                {currentPage} of{" "}
                {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(
                    (p) =>
                      Math.min(
                        p + 1,
                        totalPages
                      )
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                className="px-5 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-purple-900/40 disabled:opacity-40 hover:border-purple-500 transition-all"
              >
                Next
              </button>

            </div>
          )}

          {/* EMPTY */}
          {filteredItems.length ===
            0 && (

            <div className="mt-10">

              <EmptyState title="No inventory items found" />

            </div>
          )}

        </div>

      </div>

    </AppLayout>
  );
}

