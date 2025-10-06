import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import {
  addItemToShoppingList,
  updateShoppingListItem,
  deleteShoppingListItem,
} from "../features/shoppingSlice";

type Props = { listId: string };

export default function ShoppingListDetail({ listId }: Props) {
  // ✅ All hooks at the top
  const dispatch = useDispatch<AppDispatch>();
  const list = useSelector((state: RootState) =>
    state.shopping.shoppingLists.find((l) => l.id === listId)
  );

  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState("");

  // ✅ No useMemo needed for this; just derive inline
  const trimmedName = newItemName.trim();
  const canAdd = trimmedName.length > 0 && newItemQuantity > 0;

  // You can early-return AFTER all hooks are declared
  if (!list) {
    return <div>List not found.</div>;
  }

  const handleAddItem = () => {
    if (!canAdd) return;

    dispatch(
      addItemToShoppingList({
        listId,
        name: trimmedName,
        quantity: newItemQuantity,
        category: category || undefined,
        notes: notes || undefined,
        image: image || undefined,
      })
    );

    setNewItemName("");
    setNewItemQuantity(1);
    setCategory("");
    setNotes("");
    setImage("");
  };

  const handleUpdateItem = (itemId: string, nextQty: number) => {
    if (nextQty < 1) return;
    dispatch(
      updateShoppingListItem({
        listId,
        itemId,
        updatedItem: { quantity: nextQty },
      })
    );
  };

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto" }}>
      <h3 style={{ marginBottom: 12 }}>{list.name}</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: 8,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="New item name"
          aria-label="New item name"
        />
        <input
          type="number"
          value={newItemQuantity}
          onChange={(e) =>
            setNewItemQuantity(Math.max(1, Number(e.target.value) || 1))
          }
          min={1}
          aria-label="Quantity"
        />
        <button onClick={handleAddItem} disabled={!canAdd}>
          Add Item
        </button>

        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          aria-label="Category"
          style={{ gridColumn: "1 / span 3" }}
        />
        <input
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL (optional)"
          aria-label="Image URL"
          style={{ gridColumn: "1 / span 3" }}
        />
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          aria-label="Notes"
          style={{ gridColumn: "1 / span 3" }}
        />
      </div>

      {list.items.length === 0 ? (
        <p style={{ color: "#64748b" }}>
          No items yet — add your first one above.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {list.items.map((item) => (
            <li
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: 8,
                alignItems: "center",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                marginBottom: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {item.category ? `${item.category} • ` : ""}
                  {item.notes || ""}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() =>
                    handleUpdateItem(
                      item.id,
                      Math.max(1, (item.quantity || 1) - 1)
                    )
                  }
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity ?? 1}
                  onChange={(e) =>
                    handleUpdateItem(
                      item.id,
                      Math.max(1, Number(e.target.value) || 1)
                    )
                  }
                  min={1}
                  style={{ width: 64, textAlign: "center" }}
                  aria-label={`Quantity for ${item.name}`}
                />
                <button
                  onClick={() =>
                    handleUpdateItem(item.id, (item.quantity || 1) + 1)
                  }
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  const ok = confirm(`Delete “${item.name}”?`);
                  if (ok)
                    dispatch(
                      deleteShoppingListItem({ listId, itemId: item.id })
                    );
                }}
                aria-label={`Delete ${item.name}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
