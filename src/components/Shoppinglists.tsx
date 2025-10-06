// src/pages/ShoppingLists.tsx
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import type { AppDispatch } from "../store";
import {
  addShoppingList,
  deleteShoppingList,
} from "../features/shoppingSlice";
import ShoppingListDetail from "./ShoppinglistDetails";

export default function ShoppingLists() {
  const dispatch = useDispatch<AppDispatch>();

  // If your reducer is mounted as: reducer: { shopping: shoppingListsReducer }
  const shoppingLists = useSelector(
    (state: RootState) => state.shopping.shoppingLists
  );

  const [newListName, setNewListName] = useState("");

  const trimmed = useMemo(() => newListName.trim(), [newListName]);
  const canAdd = trimmed.length > 0;

  const handleAddList = useCallback(() => {
    if (!canAdd) return;
    dispatch(addShoppingList(trimmed));
    setNewListName("");
  }, [canAdd, dispatch, trimmed]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddList();
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto" }}>
      <h2>Your Shopping Lists</h2>

      <div style={{ display: "flex", gap: 8, margin: "12px 0 20px" }}>
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="New list name"
          aria-label="New list name"
          style={{ flex: 1, padding: "10px 12px" }}
        />
        <button onClick={handleAddList} disabled={!canAdd}>
          Add List
        </button>
      </div>

      {shoppingLists.length === 0 ? (
        <p style={{ color: "#64748b" }}>
          You don’t have any lists yet. Create your first one above.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {shoppingLists.map((list) => (
            <li
              key={list.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: 600 }}>{list.name}</div>

              <div style={{ display: "flex", gap: 8 }}>
                {/* TODO: swap for a Link to a List Details page if you have routing */}
                {/* <Link to={`/lists/${list.id}`}>Open</Link> */}

                <button
                  onClick={() => {
                    const ok = confirm(
                      `Delete the list “${list.name}”? This cannot be undone.`
                    );
                    if (ok) dispatch(deleteShoppingList(list.id));
                  }}
                  aria-label={`Delete list ${list.name}`}
                >
                  Delete
                </button>
              </div>
              <ShoppingListDetail listId={list.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
