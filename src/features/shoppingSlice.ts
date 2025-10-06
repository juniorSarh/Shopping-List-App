// src/features/shoppingListsSlice.ts
import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

/** Domain types */
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  notes?: string;
  image?: string; // url or base64
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
}

export interface ShoppingState {
  shoppingLists: ShoppingList[];
}

/** Initial state (explicitly typed) */
const initialState: ShoppingState = {
  shoppingLists: [],
};

const shoppingListsSlice = createSlice({
  name: "shoppingLists",
  initialState,
  reducers: {
    /** Add a new shopping list */
    addShoppingList: {
      reducer(state, action: PayloadAction<ShoppingList>) {
        state.shoppingLists.push(action.payload);
      },
      // `prepare` lets you keep the dispatch signature simple while
      // ensuring a complete, valid payload is produced.
      prepare(name: string) {
        return {
          payload: {
            id: nanoid(),
            name,
            items: [],
          } as ShoppingList,
        };
      },
    },

    /** Delete a shopping list by id */
    deleteShoppingList(state, action: PayloadAction<string>) {
      const listId = action.payload;
      state.shoppingLists = state.shoppingLists.filter(
        (list) => list.id !== listId
      );
    },

    /** Update a shopping list's name */
    updateShoppingListName(
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) {
      const { id, name } = action.payload;
      const existingList = state.shoppingLists.find((l) => l.id === id);
      if (existingList) {
        existingList.name = name;
      }
    },

    /** Add an item to a specific shopping list */
    addItemToShoppingList: {
      reducer(
        state,
        action: PayloadAction<{ listId: string; item: ShoppingItem }>
      ) {
        const { listId, item } = action.payload;
        const list = state.shoppingLists.find((l) => l.id === listId);
        if (list) {
          list.items.push(item);
        }
      },
      // Use a single object arg so callers can pass named fields (clearer & safer)
      prepare(args: {
        listId: string;
        name: string;
        quantity: number;
        category?: string;
        notes?: string;
        image?: string;
      }) {
        const { listId, name, quantity, category, notes, image } = args;

        // (Optional) micro validation to avoid bad data:
        const safeName = name?.trim();
        const safeQty = Number.isFinite(quantity) ? quantity : 1;

        return {
          payload: {
            listId,
            item: {
              id: nanoid(),
              name: safeName,
              quantity: safeQty,
              category,
              notes,
              image,
            } as ShoppingItem,
          },
        };
      },
    },

    /** Update an item inside a specific shopping list */
    updateShoppingListItem(
      state,
      action: PayloadAction<{
        listId: string;
        itemId: string;
        updatedItem: Partial<Omit<ShoppingItem, "id">>;
      }>
    ) {
      const { listId, itemId, updatedItem } = action.payload;
      const list = state.shoppingLists.find((l) => l.id === listId);
      if (!list) return;

      const idx = list.items.findIndex((it) => it.id === itemId);
      if (idx === -1) return;

      // Only update provided fields (keep existing id)
      list.items[idx] = {
        ...list.items[idx],
        ...updatedItem,
      };
    },

    /** Delete an item from a specific shopping list */
    deleteShoppingListItem(
      state,
      action: PayloadAction<{ listId: string; itemId: string }>
    ) {
      const { listId, itemId } = action.payload;
      const list = state.shoppingLists.find((l) => l.id === listId);
      if (!list) return;

      list.items = list.items.filter((it) => it.id !== itemId);
    },
  },
});

/** Actions */
export const {
  addShoppingList,
  deleteShoppingList,
  updateShoppingListName,
  addItemToShoppingList,
  updateShoppingListItem,
  deleteShoppingListItem,
} = shoppingListsSlice.actions;

/** Reducer */
export default shoppingListsSlice.reducer;

export const selectShoppingLists = (state: RootState) =>
  state.shopping.shoppingLists;

export const selectShoppingListById = (state: RootState, listId: string) =>
  state.shopping.shoppingLists.find((list) => list.id === listId) ?? null;
