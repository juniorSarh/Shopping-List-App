import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { ShoppingItem } from "../types/Shopping";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const nid = () => Math.random().toString(36).slice(2, 10);
const asJson = async <T>(res: Response) => {
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
};

type ItemsState = {
  entities: Record<string, ShoppingItem>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ItemsState = { entities: {}, status: "idle", error: null };

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
    quantity,
    category,
    notes,
    images,
    purchased: false,
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
  { itemId: string; changes: Partial<ShoppingItem> },
  { listId: string | number; itemId: string; changes: Partial<ShoppingItem> }
>("items/update", async ({ itemId, changes }) => {
  const res = await fetch(`${API_BASE}/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
  await asJson(res);
  return { itemId, changes };
});

export const deleteListItem = createAsyncThunk<
  { listId: string; itemId: string },
  { listId: string | number; itemId: string }
>("items/delete", async ({ listId, itemId }) => {
  const res = await fetch(`${API_BASE}/items/${itemId}`, { method: "DELETE" });
  await asJson(res);
  return { listId: String(listId), itemId };
});

const slice = createSlice({
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
      payload.forEach((i) => (s.entities[i.id] = i));
    });
    b.addCase(fetchItems.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.error.message || "Failed to load items";
    });

    b.addCase(fetchItemsByList.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchItemsByList.fulfilled, (s, { payload }) => {
      s.status = "succeeded";
      payload.items.forEach((i) => (s.entities[i.id] = i));
    });
    b.addCase(fetchItemsByList.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.error.message || "Failed to load list items";
    });

    b.addCase(addItemToList.fulfilled, (s, { payload }) => {
      s.entities[payload.id] = payload;
    });
    b.addCase(updateListItem.fulfilled, (s, { payload }) => {
      const e = s.entities[payload.itemId];
      if (e) Object.assign(e, payload.changes);
    });
    b.addCase(deleteListItem.fulfilled, (s, { payload }) => {
      delete s.entities[payload.itemId];
    });
  },
});

export default slice.reducer;

/* selectors */
export const selectItemsStatus = (s: RootState) => s.items.status;
export const selectItemsByListId =
  (listId: string | number) => (s: RootState) =>
    Object.values(s.items.entities).filter((i) => i.listId === String(listId));
