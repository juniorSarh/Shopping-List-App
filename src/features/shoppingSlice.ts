import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

/* ----------------------------- Types ----------------------------- */

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
  category?: string;
  notes?: string;
  images?: string[];
};

export type ShoppingList = {
  id: string;
  userId: string;
  title: string;
};

type ShoppingState = {
  lists: Record<string, ShoppingList>;
  itemsByList: Record<string, ShoppingItem[]>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

type CreateListPayload = { userId: string; title: string };
type AddItemPayload = {
  listId: string | number;
  name: string;
  quantity: number;
  category?: string;
  notes?: string;
  images?: string[];
};
type UpdateItemPayload = {
  listId: string | number;
  itemId: string;
  changes: Partial<Omit<ShoppingItem, "id">>;
};

/* ------------------------ Local storage I/O ----------------------- */

const LKEY_LISTS = "shopping/lists";
const LKEY_ITEMS = "shopping/items";

function load(): Pick<ShoppingState, "lists" | "itemsByList"> {
  try {
    const lists: Record<string, ShoppingList> = JSON.parse(
      localStorage.getItem(LKEY_LISTS) || "{}"
    );
    const itemsByList: Record<string, ShoppingItem[]> = JSON.parse(
      localStorage.getItem(LKEY_ITEMS) || "{}"
    );
    return { lists, itemsByList };
  } catch {
    return { lists: {}, itemsByList: {} };
  }
}
function save(state: Pick<ShoppingState, "lists" | "itemsByList">) {
  localStorage.setItem(LKEY_LISTS, JSON.stringify(state.lists));
  localStorage.setItem(LKEY_ITEMS, JSON.stringify(state.itemsByList));
}

const nid = () => Math.random().toString(36).slice(2, 10);

/* ----------------------------- Thunks ---------------------------- */

export const fetchShoppingListsByUser = createAsyncThunk<
  { lists: ShoppingList[]; itemsByList: Record<string, ShoppingItem[]> },
  string
>("shopping/fetchByUser", async (userId) => {
  const { lists, itemsByList } = load();
  const listsArr = Object.values(lists).filter((l) => l.userId === userId);
  return { lists: listsArr, itemsByList };
});

export const createShoppingList = createAsyncThunk<
  ShoppingList,
  CreateListPayload
>("shopping/createList", async ({ userId, title }) => {
  const { lists, itemsByList } = load();
  const list: ShoppingList = { id: nid(), userId, title };
  lists[list.id] = list;
  itemsByList[list.id] = itemsByList[list.id] || [];
  save({ lists, itemsByList });
  return list;
});

export const deleteShoppingList = createAsyncThunk<string, string | number>(
  "shopping/deleteList",
  async (listId) => {
    const id = String(listId);
    const { lists, itemsByList } = load();
    delete lists[id];
    delete itemsByList[id];
    save({ lists, itemsByList });
    return id;
  }
);

export const addItemToList = createAsyncThunk<ShoppingItem, AddItemPayload>(
  "shopping/addItem",
  async ({ listId, name, quantity, category, notes, images }) => {
    const { lists, itemsByList } = load();
    const id = String(listId);
    if (!lists[id]) throw new Error("List not found");
    const item: ShoppingItem = {
      id: nid(),
      name,
      quantity: Math.max(1, quantity),
      purchased: false,
      category,
      notes,
      images,
    };
    itemsByList[id] = itemsByList[id] || [];
    itemsByList[id].push(item);
    save({ lists, itemsByList });
    return item;
  }
);

/* ----------------------------- Slice ----------------------------- */

const initialState: ShoppingState = {
  lists: {},
  itemsByList: {},
  status: "idle",
  error: null,
};

const shoppingSlice = createSlice({
  name: "shopping",
  initialState,
  reducers: {
    renameShoppingList(
      state,
      action: PayloadAction<{ listId: string | number; title: string }>
    ) {
      const id = String(action.payload.listId);
      if (state.lists?.[id]) state.lists[id].title = action.payload.title;
      else if (state.lists[id]) state.lists[id].title = action.payload.title;
    },
    updateListItem(state, action: PayloadAction<UpdateItemPayload>) {
      const id = String(action.payload.listId);
      const items = state.itemsByList[id];
      if (!items) return;
      const idx = items.findIndex((i) => i.id === action.payload.itemId);
      if (idx === -1) return;
      items[idx] = { ...items[idx], ...action.payload.changes };
      save({ lists: state.lists, itemsByList: state.itemsByList });
    },
    togglePurchased(
      state,
      action: PayloadAction<{ listId: string | number; itemId: string }>
    ) {
      const id = String(action.payload.listId);
      const items = state.itemsByList[id];
      if (!items) return;
      const it = items.find((i) => i.id === action.payload.itemId);
      if (!it) return;
      it.purchased = !it.purchased;
      save({ lists: state.lists, itemsByList: state.itemsByList });
    },
    deleteListItem(
      state,
      action: PayloadAction<{ listId: string | number; itemId: string }>
    ) {
      const id = String(action.payload.listId);
      const arr = state.itemsByList[id];
      if (!arr) return;
      state.itemsByList[id] = arr.filter((i) => i.id !== action.payload.itemId);
      save({ lists: state.lists, itemsByList: state.itemsByList });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShoppingListsByUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchShoppingListsByUser.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.error = null;
        // merge lists
        const next: Record<string, ShoppingList> = {};
        payload.lists.forEach((l) => (next[String(l.id)] = l));
        state.lists = { ...state.lists, ...next };
        state.itemsByList = { ...state.itemsByList, ...payload.itemsByList };
      })
      .addCase(fetchShoppingListsByUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load lists";
      })
      .addCase(createShoppingList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createShoppingList.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.lists[String(payload.id)] = payload;
        state.itemsByList[String(payload.id)] =
          state.itemsByList[String(payload.id)] || [];
      })
      .addCase(createShoppingList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to create list";
      })
      .addCase(addItemToList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addItemToList.fulfilled, (state, { meta, payload }) => {
        state.status = "succeeded";
        const id = String((meta.arg as AddItemPayload).listId);
        state.itemsByList[id] = state.itemsByList[id] || [];
        state.itemsByList[id].push(payload);
      })
      .addCase(addItemToList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to add item";
      })
      .addCase(deleteShoppingList.fulfilled, (state, { payload: id }) => {
        delete state.lists[id];
        delete state.itemsByList[id];
      });
  },
});

export const {
  renameShoppingList,
  updateListItem,
  togglePurchased,
  deleteListItem,
} = shoppingSlice.actions;

export default shoppingSlice.reducer;

/* --------------------------- Selectors --------------------------- */

export const selectShoppingStatus = (s: RootState) => s.shopping.status;
export const selectShoppingError = (s: RootState) => s.shopping.error;

export const selectShoppingListById =
  (listId: string | number) => (s: RootState) =>
    s.shopping.lists[String(listId)] || null;

export const selectItemsByListId =
  (listId: string | number) => (s: RootState) =>
    s.shopping.itemsByList[String(listId)] || [];

export const selectShoppingListsByUser = (userId: string) => (s: RootState) =>
  Object.values(s.shopping.lists).filter((l) => l.userId === userId);
