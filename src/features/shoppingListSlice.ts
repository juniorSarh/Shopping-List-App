import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { ShoppingList } from "../types/Shopping";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const nid = () => Math.random().toString(36).slice(2, 10);
async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

type ListsState = {
  entities: Record<string, ShoppingList>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ListsState = {
  entities: {},
  status: "idle",
  error: null,
};

/* ── Thunks ────────────────────────────────────────────────────────── */

export const fetchShoppingListsByUser = createAsyncThunk<
  ShoppingList[],
  string
>("shoppingLists/fetchByUser", async (userId) => {
  const res = await fetch(
    `${API_BASE}/lists?userId=${encodeURIComponent(userId)}`
  );
  return asJson<ShoppingList[]>(res);
});

export const createShoppingList = createAsyncThunk<
  ShoppingList,
  { userId: string; title: string }
>("shoppingLists/create", async ({ userId, title }) => {
  const payload: ShoppingList = {
    id: nid(),
    userId,
    title,
    createdAt: Date.now(),
  };
  const res = await fetch(`${API_BASE}/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return asJson<ShoppingList>(res);
});

export const renameShoppingList = createAsyncThunk<
  { listId: string; title: string },
  { listId: string | number; title: string }
>("shoppingLists/rename", async ({ listId, title }) => {
  const id = String(listId);
  const res = await fetch(`${API_BASE}/lists/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  await asJson(res);
  return { listId: id, title };
});

/** Delete list + cascade delete its items */
export const deleteShoppingList = createAsyncThunk<string, string | number>(
  "shoppingLists/delete",
  async (listId) => {
    const id = String(listId);
    // delete items first
    const itemsRes = await fetch(`${API_BASE}/items?listId=${id}`);
    const items = await asJson<{ id: string }[]>(itemsRes);
    await Promise.all(
      items.map((it) =>
        fetch(`${API_BASE}/items/${it.id}`, { method: "DELETE" })
      )
    );
    // delete the list
    const res = await fetch(`${API_BASE}/lists/${id}`, { method: "DELETE" });
    await asJson(res);
    return id;
  }
);

/** Ensure a share code exists on a list (for /share/:listId route) */
export const ensureShareCode = createAsyncThunk<
  { listId: string; shareCode: string },
  { listId: string | number }
>("shoppingLists/ensureShareCode", async ({ listId }) => {
  const id = String(listId);
  const res = await fetch(`${API_BASE}/lists/${id}`);
  const list = await asJson<ShoppingList>(res);
  const shareCode = list.shareCode || nid() + nid();
  if (!list.shareCode) {
    const patch = await fetch(`${API_BASE}/lists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareCode }),
    });
    await asJson(patch);
  }
  return { listId: id, shareCode };
});

/* ── Slice ─────────────────────────────────────────────────────────── */

const shoppingListsSlice = createSlice({
  name: "shoppingLists",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchShoppingListsByUser.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchShoppingListsByUser.fulfilled, (s, { payload }) => {
      s.status = "succeeded";
      s.entities = {};
      payload.forEach((l) => (s.entities[l.id] = l));
    });
    b.addCase(fetchShoppingListsByUser.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.error.message || "Failed to load lists";
    });

    b.addCase(createShoppingList.fulfilled, (s, { payload }) => {
      s.entities[payload.id] = payload;
    });

    b.addCase(renameShoppingList.fulfilled, (s, { payload }) => {
      if (s.entities[payload.listId])
        s.entities[payload.listId]!.title = payload.title;
    });

    b.addCase(deleteShoppingList.fulfilled, (s, { payload: id }) => {
      delete s.entities[id];
    });

    b.addCase(ensureShareCode.fulfilled, (s, { payload }) => {
      if (s.entities[payload.listId])
        s.entities[payload.listId]!.shareCode = payload.shareCode;
    });
  },
});


export default shoppingListsSlice.reducer;

/* ── Selectors ─────────────────────────────────────────────────────── */

export const selectListsStatus = (s: RootState) => s.shoppingLists.status;
export const selectListsError = (s: RootState) => s.shoppingLists.error;

export const selectShoppingListById =
  (listId: string | number) => (s: RootState) =>
    s.shoppingLists.entities[String(listId)] || null;

export const selectShoppingListsByUser = (userId: string) => (s: RootState) =>
  Object.values(s.shoppingLists.entities).filter((l) => l.userId === userId);
