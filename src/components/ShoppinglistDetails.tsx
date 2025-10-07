import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store";
import styles from "../modules.css/shoppinglistdetails.module.css";
import {
  addItemToList,
  deleteListItem,
  selectItemsByListId,
  selectShoppingListById,
  selectShoppingStatus,
  togglePurchased,
  updateListItem,
} from "../features/shoppingSlice";

type Props = { listId: string | number };

const CATEGORIES = [
  "Groceries",
  "Household",
  "Electronics",
  "Clothing",
  "Pharmacy",
  "Party",
  "Other",
];

type ListMeta = {
  category?: string;
  notes?: string;
  imageUrl?: string;
};

const metaKey = (listId: string | number) => `shopping:listmeta:${listId}`;
const loadMeta = (listId: string | number): ListMeta => {
  try {
    const raw = localStorage.getItem(metaKey(listId));
    return raw ? (JSON.parse(raw) as ListMeta) : {};
  } catch {
    return {};
  }
};
const saveMeta = (listId: string | number, m: ListMeta) =>
  localStorage.setItem(metaKey(listId), JSON.stringify(m));
const clearMeta = (listId: string | number) =>
  localStorage.removeItem(metaKey(listId));

export default function ShoppingListDetail({ listId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const list = useSelector(selectShoppingListById(listId));
  const items = useSelector(selectItemsByListId(listId));
  const status = useSelector(selectShoppingStatus);

  const [meta, setMeta] = useState<ListMeta>(() => loadMeta(listId));
  const [showMeta, setShowMeta] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const totalQty = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0),
    [items]
  );

  if (!list) return <div className={styles.empty}>List not found.</div>;

  const onSaveMeta = (m: ListMeta) => {
    setMeta(m);
    saveMeta(listId, m);
    setShowMeta(false);
  };

  const onClearMeta = () => {
    setMeta({});
    clearMeta(listId);
  };

  return (
    <div className={styles.detail}>
      {/* Hero / summary card */}
      <div
        className={styles.heroCard ?? ""}
        style={{
          background: "#e3ecee",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 6px 20px rgba(0,0,0,.12)",
        }}
      >
        {/* Header row */}
        <div
          className={styles.heroHeader ?? ""}
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <div style={{ fontWeight: 700 }}>
            <div style={{ fontSize: 16 }}>{list.title}</div>
            <div style={{ fontSize: 14, marginTop: 6 }}>
              Category:&nbsp;
              <select
                value={meta.category ?? ""}
                onChange={(e) => {
                  const next = {
                    ...meta,
                    category: e.target.value || undefined,
                  };
                  setMeta(next);
                  saveMeta(listId, next);
                }}
                className={styles.select ?? styles.input}
              >
                <option value="">select</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => setShowMeta(true)}
              disabled={status === "loading"}
            >
              Update
            </button>
            <button
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={onClearMeta}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Illustration */}
        <div
          style={{ display: "grid", placeItems: "center", padding: "10px 0" }}
        >
          <img
            src={
              meta.imageUrl?.trim() ||
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

        {/* Notes + Add Item */}
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
            className={styles.noteBox ?? ""}
            style={{
              background: "white",
              borderRadius: 12,
              padding: "10px 12px",
              boxShadow: "0 2px 8px rgba(0,0,0,.08)",
              flex: 1,
            }}
          >
            <div>
              <strong>Quantity :</strong> {totalQty}
            </div>
            <div style={{ marginTop: 4 }}>
              <strong>Notes:</strong> {meta.notes?.trim() || "—"}
            </div>
          </div>

          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => setShowAdd(true)}
            style={{ paddingInline: 18 }}
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <p className={styles.empty} style={{ marginTop: 14 }}>
          No items yet.
        </p>
      ) : (
        <ul className={styles.items} style={{ marginTop: 14 }}>
          {items.map((it) => (
            <ItemRow key={it.id} listId={listId} {...it} />
          ))}
        </ul>
      )}

      {/* Update meta modal */}
      {showMeta && (
        <MetaModal
          categories={CATEGORIES}
          initial={meta}
          onCancel={() => setShowMeta(false)}
          onSave={onSaveMeta}
        />
      )}

      {/* Add item modal */}
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

/* ───────────── Item row (unchanged core behavior) ───────────── */
function ItemRow({
  listId,
  id,
  name,
  quantity,
  purchased,
  category,
  notes,
  images,
}: {
  listId: string | number;
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
  category?: string;
  notes?: string;
  images?: string[];
}) {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selectShoppingStatus);

  const [editing, setEditing] = useState(false);
  const [eName, setEName] = useState(name);
  const [eQty, setEQty] = useState<string>(String(quantity));
  const [eCat, setECat] = useState(category ?? "");
  const [eNotes, setENotes] = useState(notes ?? "");
  const [eImages, setEImages] = useState((images ?? []).join(", "));

  React.useEffect(() => {
    setEName(name);
    setEQty(String(quantity));
    setECat(category ?? "");
    setENotes(notes ?? "");
    setEImages((images ?? []).join(", "));
  }, [name, quantity, category, notes, images]);

  const save = () => {
    const imgs = eImages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const next = {
      name: eName.trim(),
      quantity: Math.max(1, Number(eQty) || 1),
      category: eCat.trim() || undefined,
      notes: eNotes.trim() || undefined,
      images: imgs.length ? imgs : undefined,
    };
    dispatch(updateListItem({ listId, itemId: id, changes: next }));
    setEditing(false);
  };

  const updateQty = (next: number) => {
    if (next < 1) return;
    dispatch(
      updateListItem({ listId, itemId: id, changes: { quantity: next } })
    );
  };

  return (
    <li className={styles.itemRow}>
      {!editing ? (
        <>
          <div>
            <label className={styles.itemHeader}>
              <input
                type="checkbox"
                checked={purchased}
                onChange={() =>
                  dispatch(togglePurchased({ listId, itemId: id }))
                }
                aria-label={`Toggle purchased for ${name}`}
              />
              <span
                className={`${styles.itemName} ${
                  purchased ? styles.purchased : ""
                }`}
              >
                {name}
              </span>
            </label>

            <div className={styles.itemSub}>
              {category ? `${category} • ` : ""}
              {notes || ""}
            </div>

            {images && images.length > 0 && (
              <div className={styles.thumbs}>
                {images.map((src, i) => (
                  <img key={i} src={src} alt="" className={styles.thumb} />
                ))}
              </div>
            )}
          </div>

          <div className={styles.qtyGroup}>
            <button
              className={styles.btn}
              onClick={() => updateQty(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <input
              className={`${styles.input} ${styles.qtyInput}`}
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                updateQty(Math.max(1, Number(e.target.value) || 1))
              }
              aria-label={`Qty for ${name}`}
            />
            <button
              className={styles.btn}
              onClick={() => updateQty(quantity + 1)}
            >
              +
            </button>
          </div>

          <div className={styles.badge}>
            {purchased ? "Purchased" : "Pending"}
          </div>

          <div className={styles.actions}>
            <button className={styles.btn} onClick={() => setEditing(true)}>
              Edit
            </button>
            <button
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={() => {
                const ok = confirm(`Delete "${name}"?`);
                if (ok) dispatch(deleteListItem({ listId, itemId: id }));
              }}
              disabled={status === "loading"}
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.editGrid}>
            <input
              value={eName}
              onChange={(e) => setEName(e.target.value)}
              aria-label="Edit name"
              placeholder="Name"
              className={styles.input}
            />
            <input
              value={eCat}
              onChange={(e) => setECat(e.target.value)}
              aria-label="Edit category"
              placeholder="Category"
              className={styles.input}
            />
            <input
              value={eNotes}
              onChange={(e) => setENotes(e.target.value)}
              aria-label="Edit notes"
              placeholder="Notes"
              className={styles.input}
            />
            <input
              value={eImages}
              onChange={(e) => setEImages(e.target.value)}
              aria-label="Edit images"
              placeholder="Image URLs (comma-separated)"
              className={styles.input}
            />
          </div>

          <div className={styles.qtyGroup}>
            <button
              className={styles.btn}
              onClick={() =>
                setEQty(String(Math.max(1, (Number(eQty) || 1) - 1)))
              }
            >
              -
            </button>
            <input
              type="number"
              min={1}
              value={eQty}
              onChange={(e) => setEQty(e.target.value)}
              className={`${styles.input} ${styles.qtyInput}`}
              aria-label="Edit quantity"
            />
            <button
              className={styles.btn}
              onClick={() => setEQty(String((Number(eQty) || 1) + 1))}
            >
              +
            </button>
          </div>

          <div className={styles.badge}>
            {purchased ? "Purchased" : "Pending"}
          </div>

          <div className={styles.actions}>
            <button
              className={styles.btn}
              onClick={save}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Saving…" : "Save"}
            </button>
            <button className={styles.btn} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </>
      )}
    </li>
  );
}

/* ───────────── Modals ───────────── */

function MetaModal({
  categories,
  initial,
  onSave,
  onCancel,
}: {
  categories: string[];
  initial: ListMeta;
  onSave: (m: ListMeta) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState(initial.category ?? "");
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [imageUrl, setImageUrl] = useState(initial.imageUrl ?? "");

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <h3 className={styles.modalTitle}>Update list details</h3>

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
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() =>
              onSave({
                category: category || undefined,
                notes: notes || undefined,
                imageUrl: imageUrl || undefined,
              })
            }
          >
            Save
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
