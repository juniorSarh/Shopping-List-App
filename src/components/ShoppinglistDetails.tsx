import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store";
import { Link } from "react-router-dom";
import styles from "../modules.css/shoppinglistdetails.module.css";

import {
  selectShoppingListById,
  updateShoppingList,
  deleteShoppingList,
} from "../features/shoppinglistSlice";

import {
  addItemToList,
  selectItemsByListId,
  selectItemsStatus,
} from "../features/itemsSlice";

type Props = { listId: string | number; showItems?: boolean };
const CATEGORIES = [
  "Groceries",
  "Household",
  "Electronics",
  "Clothing",
  "Pharmacy",
  "Party",
  "Other",
];

export default function ShoppingListDetail({ listId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const list = useSelector(selectShoppingListById(listId));
  const items = useSelector(selectItemsByListId(listId));
  const status = useSelector(selectItemsStatus);

  const [showMeta, setShowMeta] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const totalItems = items.length;
  const totalQty = useMemo(
    () => items.reduce((s, it) => s + (Number(it.quantity) || 0), 0),
    [items]
  );

  if (!list) return <div className={styles.empty}>List not found.</div>;

  return (
    <div className={styles.detail}>
      <div
        className={styles.heroCard}
        style={{
          background: "#d7e3e6",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 6px 20px rgba(0,0,0,.12)",
        }}
      >
        <div
          className={styles.heroHeader}
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <div style={{ fontWeight: 700 }}>
            <div style={{ fontSize: 16 }}>{list.title}</div>
            <div style={{ fontSize: 14, marginTop: 6 }}>
              <strong>Category:</strong>&nbsp;{list.category ?? "—"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={styles.btn}
              style={{
                background: "#166534",
                color: "#fff",
                borderColor: "#166534",
              }}
              onClick={() => setShowMeta(true)}
              disabled={status === "loading"}
            >
              Update
            </button>
            <button
              className={styles.btn}
              style={{
                background: "#b91c1c",
                color: "#fff",
                borderColor: "#b91c1c",
              }}
              onClick={() => {
                if (confirm(`Delete “${list.title}”?`))
                  dispatch(deleteShoppingList(list.id));
              }}
            >
              Delete
            </button>
          </div>
        </div>

        <div
          style={{ display: "grid", placeItems: "center", padding: "10px 0" }}
        >
          <img
            src={
              list.imageUrl?.trim() ||
              "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Shopping_cart_icon.svg/240px-Shopping_cart_icon.svg.png"
            }
            alt=""
            style={{
              width: 220,
              height: 220,
              objectFit: "contain",
              opacity: 0.95,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <div
            className={styles.noteBox}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "10px 12px",
              boxShadow: "0 2px 8px rgba(0,0,0,.08)",
              flex: 1,
            }}
          >
            <div>
              <strong>items :</strong> {totalItems} &nbsp;&nbsp;{" "}
              <strong>Quantity :</strong> {totalQty}
            </div>
            <div style={{ marginTop: 4 }}>
              <strong>Notes:</strong> {list.notes?.trim() || "—"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link
              className={styles.btn}
              style={{
                background: "#1f275e",
                color: "#fff",
                borderColor: "#1f275e",
                borderRadius: 16,
                paddingInline: 22,
              }}
              to={`lists/${list.id}/items`}
            >
              view&nbsp; Items
            </Link>
            <button
              className={styles.btn}
              style={{
                background: "#1f275e",
                color: "#fff",
                borderColor: "#1f275e",
                borderRadius: 16,
                paddingInline: 22,
              }}
              onClick={() => setShowAdd(true)}
            >
              Add Item
            </button>
          </div>
        </div>
      </div>

      {showMeta && (
        <MetaModal
          categories={CATEGORIES}
          initial={{
            title: list.title,
            category: list.category ?? "",
            imageUrl: list.imageUrl ?? "",
            notes: list.notes ?? "",
          }}
          onCancel={() => setShowMeta(false)}
          onSave={async (data) => {
            const { title, category, imageUrl, notes } = data;
            await dispatch(
              updateShoppingList({
                listId,
                changes: {
                  title: title.trim() || list.title,
                  category: category || undefined,
                  imageUrl: imageUrl || undefined,
                  notes: notes || undefined,
                },
              })
            ).unwrap();
            setShowMeta(false);
          }}
        />
      )}

      {showAdd && (
        <AddItemModal
          categories={CATEGORIES}
          busy={status === "loading"}
          onCancel={() => setShowAdd(false)}
          onCreate={async (payload) => {
            await dispatch(addItemToList({ listId, ...payload })).unwrap();
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

/* ── Modals ────────────────────────────────────────────────────────── */

function MetaModal({
  categories,
  initial,
  onSave,
  onCancel,
}: {
  categories: string[];
  initial: { title: string; category: string; imageUrl: string; notes: string };
  onSave: (m: {
    title: string;
    category: string;
    imageUrl: string;
    notes: string;
  }) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState(initial.category);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);
  const [notes, setNotes] = useState(initial.notes);

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <h3 className={styles.modalTitle}>Update list details</h3>
        <div className={styles.formRow}>
          <label className={styles.label}>Title</label>
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className={styles.formRow}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.select ?? styles.input}
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
          <label className={styles.label}>Image URL</label>
          <input
            className={styles.input}
            placeholder="https://…"
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
            className={styles.btn}
            style={{
              background: "#166534",
              color: "#fff",
              borderColor: "#166534",
            }}
            onClick={() => onSave({ title, category, imageUrl, notes })}
          >
            Save
          </button>
          <button
            className={styles.btn}
            style={{
              background: "#b91c1c",
              color: "#fff",
              borderColor: "#b91c1c",
            }}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

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
            placeholder="Enter item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className={styles.formRow}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.select ?? styles.input}
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
            placeholder="(opt.) Notes"
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
            className={styles.btn}
            style={{
              background: "#1f275e",
              color: "#fff",
              borderColor: "#1f275e",
            }}
            disabled={!valid || busy}
            onClick={submit}
          >
            {busy ? "Saving…" : "Create"}
          </button>
          <button className={styles.btn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
