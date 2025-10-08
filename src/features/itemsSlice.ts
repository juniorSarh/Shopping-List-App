import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { ShoppingItem } from "../types/Shopping";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const nid = () => Math.random().toString(36).slice(2, 10);
async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

type ItemsState = {
  byList: Record<string, ShoppingItem[]>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ItemsState = {
  byList: {},
  status: "idle",
  error: null,
};

/* ── Thunks ────────────────────────────────────────────────────────── */

// Load ALL items once; components select by listId
export const fetchItems = createAsyncThunk<ShoppingItem[]>(
  "items/fetchAll",
  async () => {
    const res = await fetch(`${API_BASE}/items`);
    return asJson<ShoppingItem[]>(res);
  }
);

export const fetchItemsByList = createAsyncThunk<
  { listId: string; items: ShoppingItem[] },
  { listId: string | number }
>("items/fetchByList", async ({ listId }) => {
  const id = String(listId);
  const res = await fetch(`${API_BASE}/items?listId=${id}`);
  const items = await asJson<ShoppingItem[]>(res);
  return { listId: id, items };
});

export const addItemToList = createAsyncThunk<
  ShoppingItem,
  {
    listId: string | number;
    name: string;
    quantity: number;
    category?: string;
    notes?: string;
    images?: string[];
  }
>("items/add", async ({ listId, name, quantity, category, notes, images }) => {
  const payload: ShoppingItem = {
    id: nid(),
    listId: String(listId),
    name,
    quantity: Math.max(1, quantity),
    purchased: false,
    category,
    notes,
    images,
    createdAt: Date.now(),
  };
  const res = await fetch(`${API_BASE}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return asJson<ShoppingItem>(res);
});

export const updateListItem = createAsyncThunk<
  { listId: string; itemId: string; changes: Partial<ShoppingItem> },
  { listId: string | number; itemId: string; changes: Partial<ShoppingItem> }
>("items/update", async ({ listId, itemId, changes }) => {
  const res = await fetch(`${API_BASE}/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
  await asJson(res);
  return { listId: String(listId), itemId, changes };
});

export const togglePurchased = createAsyncThunk<
  { listId: string; itemId: string },
  { listId: string | number; itemId: string }
>("items/togglePurchased", async ({ listId, itemId }) => {
  const getRes = await fetch(`${API_BASE}/items/${itemId}`);
  const item = await asJson<ShoppingItem>(getRes);
  const res = await fetch(`${API_BASE}/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ purchased: !item.purchased }),
  });
  await asJson(res);
  return { listId: String(listId), itemId };
});

export const deleteListItem = createAsyncThunk<
  { listId: string; itemId: string },
  { listId: string | number; itemId: string }
>("items/delete", async ({ listId, itemId }) => {
  const res = await fetch(`${API_BASE}/items/${itemId}`, { method: "DELETE" });
  await asJson(res);
  return { listId: String(listId), itemId };
});

/* ── Slice ─────────────────────────────────────────────────────────── */

const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchItems.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchItems.fulfilled, (s, { payload }) => {
      s.status = "succeeded";
      s.byList = {};
      payload.forEach((it) => {
        s.byList[it.listId] = s.byList[it.listId] || [];
        s.byList[it.listId].push(it);
      });
    });
    b.addCase(fetchItems.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.error.message || "Failed to load items";
    });

    b.addCase(fetchItemsByList.fulfilled, (s, { payload }) => {
      s.byList[payload.listId] = payload.items;
    });

    b.addCase(addItemToList.pending, (s) => {
      s.status = "loading";
    });
    b.addCase(addItemToList.fulfilled, (s, { payload }) => {
      s.status = "succeeded";
      const lid = payload.listId;
      s.byList[lid] = s.byList[lid] || [];
      s.byList[lid].push(payload);
    });
    b.addCase(addItemToList.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.error.message || "Failed to add item";
    });

    b.addCase(updateListItem.fulfilled, (s, { payload }) => {
      const arr = s.byList[payload.listId];
      if (!arr) return;
      const i = arr.findIndex((x) => x.id === payload.itemId);
      if (i !== -1) arr[i] = { ...arr[i], ...payload.changes };
    });

    b.addCase(togglePurchased.fulfilled, (s, { payload }) => {
      const it = s.byList[payload.listId]?.find((x) => x.id === payload.itemId);
      if (it) it.purchased = !it.purchased;
    });

    b.addCase(deleteListItem.fulfilled, (s, { payload }) => {
      const arr = s.byList[payload.listId];
      if (!arr) return;
      s.byList[payload.listId] = arr.filter((i) => i.id !== payload.itemId);
    });
  },
});

export default itemsSlice.reducer;

/* ── Selectors ─────────────────────────────────────────────────────── */

export const selectItemsStatus = (s: RootState) => s.items.status;
export const selectItemsError = (s: RootState) => s.items.error;

export const selectItemsByListId =
  (listId: string | number) => (s: RootState) =>
    s.items.byList[String(listId)] || [];
