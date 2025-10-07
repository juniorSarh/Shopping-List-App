import {
  createSlice,
  createAsyncThunk,
  nanoid,
} from "@reduxjs/toolkit";
import type { RootState } from "../store";

/** ===== API base ===== */
const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ?? "http://localhost:3000";

/** ===== Domain types (mirror DB with safe optionals) ===== */
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
  category?: string;
  notes?: string;
  images?: string[]; // URLs/base64; optional for compatibility
}

export interface ShoppingList {
  id: string | number;
  userId: string;
  title: string;
  ShoppingItems: ShoppingItem[];
}

export interface ShoppingState {
  byId: Record<string, ShoppingList>;
  allIds: string[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initialState: ShoppingState = {
  byId: {},
  allIds: [],
  status: "idle",
  error: undefined,
};

const keyOf = (id: string | number) => String(id);

/** ===== Runtime parsers (no `any`) ===== */
function parseShoppingItem(u: unknown): ShoppingItem {
  const o = (
    typeof u === "object" && u !== null ? (u as Record<string, unknown>) : {}
  ) as Record<string, unknown>;

  const imagesRaw = Array.isArray(o.images) ? o.images : undefined;
  return {
    id: String(o.id ?? nanoid()),
    name: String(o.name ?? ""),
    quantity:
      typeof o.quantity === "number" && Number.isFinite(o.quantity)
        ? o.quantity
        : 1,
    purchased: Boolean(o.purchased),
    category: typeof o.category === "string" ? o.category : undefined,
    notes: typeof o.notes === "string" ? o.notes : undefined,
    images: imagesRaw ? imagesRaw.map((x) => String(x)) : undefined,
  };
}

function parseShoppingList(u: unknown): ShoppingList {
  const o =
    typeof u === "object" && u !== null ? (u as Record<string, unknown>) : {};
  const itemsRaw = Array.isArray(o["ShoppingItems"]) ? o["ShoppingItems"] : [];
  return {
    id: String(o["id"] ?? nanoid()),
    userId: String(o["userId"] ?? ""),
    title: String(o["title"] ?? ""),
    ShoppingItems: itemsRaw.map(parseShoppingItem),
  };
}

/** ===== Thunks ===== */

// Read: all lists for a user
export const fetchShoppingListsByUser = createAsyncThunk<
  ShoppingList[],
  string
>("shopping/fetchByUser", async (userId: string) => {
  const res = await fetch(
    `${API_BASE}/ShoppingList?userId=${encodeURIComponent(userId)}`
  );
  if (!res.ok) throw new Error(`Failed to fetch lists (${res.status})`);
  const data = (await res.json()) as unknown;
  const arr = Array.isArray(data) ? data : [];
  return arr.map(parseShoppingList);
});

// Create: a new list (title only; items added in detail view)
export const createShoppingList = createAsyncThunk<
  ShoppingList,
  { userId: string; title: string }
>("shopping/createList", async ({ userId, title }) => {
  const payload: ShoppingList = {
    id: nanoid(),
    userId,
    title: title.trim(),
    ShoppingItems: [],
  };
  const res = await fetch(`${API_BASE}/ShoppingList`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create list (${res.status})`);
  return parseShoppingList(await res.json());
});

// Update: rename list
export const renameShoppingList = createAsyncThunk<
  ShoppingList,
  { listId: string | number; title: string }
>("shopping/renameList", async ({ listId, title }) => {
  const res = await fetch(`${API_BASE}/ShoppingList/${listId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title.trim() }),
  });
  if (!res.ok) throw new Error(`Failed to rename list (${res.status})`);
  return parseShoppingList(await res.json());
});

// Delete: list
export const deleteShoppingList = createAsyncThunk<
  string | number,
  string | number
>("shopping/deleteList", async (listId) => {
  const res = await fetch(`${API_BASE}/ShoppingList/${listId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete list (${res.status})`);
  return listId;
});

// Create item with full details
export const addItemToList = createAsyncThunk<
  ShoppingList,
  {
    listId: string | number;
    name: string;
    quantity: number;
    category?: string;
    notes?: string;
    images?: string[];
  },
  { state: RootState }
>("shopping/addItem", async (args, thunkApi) => {
  const { listId, name, quantity, category, notes, images } = args;
  const state = thunkApi.getState();
  const list = state.shopping.byId[keyOf(listId)];
  if (!list) throw new Error("List not found");

  const newItem: ShoppingItem = {
    id: nanoid(),
    name: name.trim(),
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    purchased: false,
    category: category?.trim() || undefined,
    notes: notes?.trim() || undefined,
    images: images && images.length ? images : undefined,
  };

  const res = await fetch(`${API_BASE}/ShoppingList/${listId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ShoppingItems: [...list.ShoppingItems, newItem],
    }),
  });
  if (!res.ok) throw new Error(`Failed to add item (${res.status})`);
  return parseShoppingList(await res.json());
});

// Update item (name/qty/category/notes/images/purchased)
export const updateListItem = createAsyncThunk<
  ShoppingList,
  {
    listId: string | number;
    itemId: string;
    changes: Partial<Omit<ShoppingItem, "id">>;
  },
  { state: RootState }
>("shopping/updateItem", async ({ listId, itemId, changes }, thunkApi) => {
  const state = thunkApi.getState();
  const list = state.shopping.byId[keyOf(listId)];
  if (!list) throw new Error("List not found");

  const nextItems = list.ShoppingItems.map((it) =>
    it.id === itemId ? { ...it, ...changes } : it
  );

  const res = await fetch(`${API_BASE}/ShoppingList/${listId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ShoppingItems: nextItems }),
  });
  if (!res.ok) throw new Error(`Failed to update item (${res.status})`);
  return parseShoppingList(await res.json());
});

// Toggle purchased
export const togglePurchased = createAsyncThunk<
  ShoppingList,
  { listId: string | number; itemId: string },
  { state: RootState }
>("shopping/togglePurchased", async ({ listId, itemId }, thunkApi) => {
  const state = thunkApi.getState();
  const list = state.shopping.byId[keyOf(listId)];
  if (!list) throw new Error("List not found");

  const nextItems = list.ShoppingItems.map((it) =>
    it.id === itemId ? { ...it, purchased: !it.purchased } : it
  );

  const res = await fetch(`${API_BASE}/ShoppingList/${listId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ShoppingItems: nextItems }),
  });
  if (!res.ok) throw new Error(`Failed to toggle purchased (${res.status})`);
  return parseShoppingList(await res.json());
});

// Delete item
export const deleteListItem = createAsyncThunk<
  ShoppingList,
  { listId: string | number; itemId: string },
  { state: RootState }
>("shopping/deleteItem", async ({ listId, itemId }, thunkApi) => {
  const state = thunkApi.getState();
  const list = state.shopping.byId[keyOf(listId)];
  if (!list) throw new Error("List not found");

  const nextItems = list.ShoppingItems.filter((it) => it.id !== itemId);

  const res = await fetch(`${API_BASE}/ShoppingList/${listId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ShoppingItems: nextItems }),
  });
  if (!res.ok) throw new Error(`Failed to delete item (${res.status})`);
  return parseShoppingList(await res.json());
});

/** ===== Slice ===== */
const slice = createSlice({
  name: "shopping",
  initialState,
  reducers: {
    resetShoppingState(state) {
      state.byId = {};
      state.allIds = [];
      state.status = "idle";
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    const upsertMany = (state: ShoppingState, lists: ShoppingList[]) => {
      for (const l of lists) {
        const k = keyOf(l.id);
        state.byId[k] = l;
        if (!state.allIds.includes(k)) state.allIds.push(k);
      }
    };
    const upsertOne = (state: ShoppingState, l: ShoppingList) => {
      const k = keyOf(l.id);
      state.byId[k] = l;
      if (!state.allIds.includes(k)) state.allIds.push(k);
    };

    builder
      .addCase(fetchShoppingListsByUser.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchShoppingListsByUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.byId = {};
        state.allIds = [];
        upsertMany(state, action.payload);
      })
      .addCase(fetchShoppingListsByUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(createShoppingList.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(createShoppingList.fulfilled, (state, action) => {
        state.status = "succeeded";
        upsertOne(state, action.payload);
      })
      .addCase(createShoppingList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(renameShoppingList.fulfilled, (state, action) => {
        upsertOne(state, action.payload);
      })
      .addCase(renameShoppingList.rejected, (state, action) => {
        state.error = action.error.message;
      })

      .addCase(deleteShoppingList.fulfilled, (state, action) => {
        const k = keyOf(action.payload);
        delete state.byId[k];
        state.allIds = state.allIds.filter((id) => id !== k);
      })
      .addCase(deleteShoppingList.rejected, (state, action) => {
        state.error = action.error.message;
      })

      .addCase(addItemToList.fulfilled, (state, action) => {
        upsertOne(state, action.payload);
      })
      .addCase(updateListItem.fulfilled, (state, action) => {
        upsertOne(state, action.payload);
      })
      .addCase(togglePurchased.fulfilled, (state, action) => {
        upsertOne(state, action.payload);
      })
      .addCase(deleteListItem.fulfilled, (state, action) => {
        upsertOne(state, action.payload);
      });
  },
});

export const { resetShoppingState } = slice.actions;
export default slice.reducer;

/** ===== Selectors ===== */
export const selectShoppingStatus = (s: RootState) => s.shopping.status;
export const selectShoppingError = (s: RootState) => s.shopping.error;

export const selectAllShoppingLists = (s: RootState): ShoppingList[] =>
  s.shopping.allIds.map((id) => s.shopping.byId[id]);

export const selectShoppingListsByUser =
  (userId: string) =>
  (s: RootState): ShoppingList[] =>
    selectAllShoppingLists(s).filter((l) => l.userId === userId);

export const selectShoppingListById =
  (listId: string | number) =>
  (s: RootState): ShoppingList | undefined =>
    s.shopping.byId[keyOf(listId)];

export const selectItemsByListId =
  (listId: string | number) =>
  (s: RootState): ShoppingItem[] =>
    s.shopping.byId[keyOf(listId)]?.ShoppingItems ?? [];
