import { collection, getDocs } from "firebase/firestore";

// Shared in-memory cache to avoid rereading the same inventory collection
// when navigating between InventoryPage and FinancePage in one session.
const CACHE_TTL_MS = 60 * 1000;
let cachedInventory = null;
let cachedAt = 0;
let pendingRequest = null;

export async function getCachedInventory(db) {
  const now = Date.now();

  if (cachedInventory && now - cachedAt < CACHE_TTL_MS) {
    return cachedInventory;
  }

  if (pendingRequest) {
    return pendingRequest;
  }

  pendingRequest = getDocs(collection(db, "inventory"))
    .then((snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      cachedInventory = data;
      cachedAt = Date.now();
      return data;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}

export function invalidateInventoryCache() {
  cachedInventory = null;
  cachedAt = 0;
  pendingRequest = null;
}