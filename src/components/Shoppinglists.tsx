import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store";
import {
  createShoppingList,
  deleteShoppingList as deleteListThunk,
  fetchShoppingListsByUser,
  renameShoppingList,
  selectShoppingError,
  selectShoppingListsByUser,
  selectShoppingStatus,
  addItemToList, // <= from your slice
} from "../features/shoppingSlice";
import ShoppingListDetail from "./ShoppinglistDetails";
import styles from "../modules.css/shoppinglist.module.css";

type Props = { userId: string };

const CATEGORIES = [
  "Groceries",
  "Household",
  "Electronics",
  "Clothing",
  "Pharmacy",
  "Other",
];

export default function ShoppingLists({ userId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const lists = useSelector(selectShoppingListsByUser(userId));
  const status = useSelector(selectShoppingStatus);
  const error = useSelector(selectShoppingError);

  useEffect(() => {
    dispatch(fetchShoppingListsByUser(userId));
  }, [dispatch, userId]);

  const [showAddList, setShowAddList] = useState(false);
  const [itemModalListId, setItemModalListId] = useState<
    string | number | null
  >(null);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Your Shopping Lists</h2>

      <div className={styles.createRow}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => setShowAddList(true)}
        >
          + New List
        </button>
      </div>

      {status === "loading" && lists.length === 0 && (
        <p className={styles.loading}>Loading your lists…</p>
      )}
      {error && <p className={styles.error}>{error}</p>}

      {lists.length === 0 ? (
        <p className={styles.empty}>No lists yet — create one above.</p>
      ) : (
        <ul className={styles.list}>
          {lists.map((list) => (
            <li key={String(list.id)} className={styles.card}>
              <div className={styles.cardHeader}>
                <InlineTitleEditor
                  title={list.title}
                  onSave={(t) =>
                    dispatch(renameShoppingList({ listId: list.id, title: t }))
                  }
                />
                <div className={styles.cardHeaderActions}>
                  <button
                    className={styles.btn}
                    onClick={() => setItemModalListId(list.id)}
                  >
                    + Add Item
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={() => {
                      const ok = confirm(`Delete the list “${list.title}”?`);
                      if (ok) dispatch(deleteListThunk(list.id));
                    }}
                  >
                    Delete List
                  </button>
                </div>
              </div>

              <ShoppingListDetail listId={list.id} />
            </li>
          ))}
        </ul>
      )}

      {/* Add Shopping List modal */}
      {showAddList && (
        <AddListModal
          categories={CATEGORIES}
          busy={status === "loading"}
          onCancel={() => setShowAddList(false)}
          onCreate={async ({ title }) => {
            // Slice currently supports title only
            await dispatch(createShoppingList({ userId, title }));
            setShowAddList(false);
          }}
        />
      )}

      {/* Add Item modal */}
      {itemModalListId != null && (
        <AddItemModal
          categories={CATEGORIES}
          busy={status === "loading"}
          onCancel={() => setItemModalListId(null)}
          onCreate={async (payload) => {
            await dispatch(
              addItemToList({ listId: itemModalListId!, ...payload })
            ).unwrap();

            setItemModalListId(null);
          }}
        />
      )}
    </div>
  );
}

/* ── Inline title editor ─────────────────────────────────────────────── */
function InlineTitleEditor({
  title,
  onSave,
}: {
  title: string;
  onSave: (t: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);

  React.useEffect(() => setValue(title), [title]);

  if (!editing) {
    return (
      <div className={styles.titleRow}>
        <h3 className={styles.title}>{title}</h3>
        <button className={styles.btn} onClick={() => setEditing(true)}>
          Rename
        </button>
      </div>
    );
  }

  const save = () => {
    const t = value.trim();
    if (t.length > 0) onSave(t);
    setEditing(false);
  };

  return (
    <div className={styles.renameRow}>
      <input
        className={styles.renameInput}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        aria-label="New title"
      />
      <button className={styles.btn} onClick={save}>
        Save
      </button>
      <button className={styles.btn} onClick={() => setEditing(false)}>
        Cancel
      </button>
    </div>
  );
}

/* ── Add Shopping List Modal (UI shows extra fields; slice persists title) ─ */
function AddListModal({
  categories,
  busy,
  onCreate,
  onCancel,
}: {
  categories: string[];
  busy: boolean;
  onCreate: (payload: { title: string }) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(""); // kept for UI parity
  const [imageUrl, setImageUrl] = useState(""); // kept for UI parity
  const [notes, setNotes] = useState(""); // kept for UI parity

  const valid = title.trim().length > 0;

  const submit = () => valid && onCreate({ title: title.trim() });

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <h3 className={styles.modalTitle}>Add Shopping list</h3>

        <div className={styles.formRow}>
          <label className={styles.label}>Name</label>
          <input
            className={styles.input}
            placeholder="Enter a list name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Image</label>
          <input
            className={styles.input}
            placeholder="url image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Notes</label>
          <input
            className={styles.input}
            placeholder="(opt.) Description of list"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className={styles.modalActions}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={!valid || busy}
            onClick={submit}
          >
            {busy ? "Saving…" : "Create"}
          </button>
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Add Item Modal (maps image url -> images: string[]) ─────────────── */
function AddItemModal({
  categories,
  busy,
  onCreate,
  onCancel,
}: {
  categories: string[];
  busy: boolean;
  onCreate: (payload: {
    name: string;
    quantity: number;
    category?: string;
    notes?: string;
    images?: string[];
  }) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState<string>("");

  const qty = Number.parseInt(quantity || "0", 10);
  const valid = name.trim().length > 0 && qty > 0;

  const submit = () => {
    if (!valid) return;
    const images = imageUrl.trim() ? [imageUrl.trim()] : undefined;
    onCreate({
      name: name.trim(),
      quantity: qty,
      category: category || undefined,
      notes: notes || undefined,
      images,
    });
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <h3 className={styles.modalTitle}>Add Item on Shopping list</h3>

        <div className={styles.formRow}>
          <label className={styles.label}>Name</label>
          <input
            className={styles.input}
            placeholder="Enter a list name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Image</label>
          <input
            className={styles.input}
            placeholder="url image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Notes</label>
          <input
            className={styles.input}
            placeholder="(opt.) Description of list"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Quantity</label>
          <input
            className={styles.input}
            placeholder="enter number"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/[^\d]/g, ""))}
          />
        </div>

        <div className={styles.modalActions}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={!valid || busy}
            onClick={submit}
          >
            {busy ? "Saving…" : "Create"}
          </button>
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
