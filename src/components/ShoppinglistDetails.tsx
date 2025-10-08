import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store";
import styles from "../modules.css/shoppinglistdetails.module.css";

/* ── lists selectors (split slice) ─────────────────────────────────── */
import { selectShoppingListById } from "../features/shoppinglistSlice";

/* ── items slice (CRUD + selectors) ────────────────────────────────── */
import {
  addItemToList,
  selectItemsByListId,
  selectItemsStatus,
  togglePurchased,
  updateListItem,
} from "../features/itemsSlice";

/* ── Props ─────────────────────────────────────────────────────────── */
type Props = {
  listId: string | number;
  showItems?: boolean;
  /** text from URL query (?q=...) */
  filterTerm?: string;
  /** sort spec from URL (?sort=name.asc | name.desc | category.asc | category.desc | date.asc | date.desc) */
  sortSpec?: string;
};

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

type SortKey = "name" | "category" | "date";
type SortDir = "asc" | "desc";

const parseSortSpec = (spec?: string): { key: SortKey; dir: SortDir } => {
  const [rawKey, rawDir] = (spec || "date.desc").split(".");
  const key: SortKey =
    rawKey === "name" || rawKey === "category" || rawKey === "date"
      ? rawKey
      : "date";
  const dir: SortDir = rawDir === "asc" ? "asc" : "desc";
  return { key, dir };
};

const metaKey = (listId: string | number) => `shopping:listmeta:${listId}`;
const loadMeta = (listId: string | number): ListMeta => {
  try {
    const raw = localStorage.getItem(metaKey(listId));
    if (!raw) return {};
    return JSON.parse(raw) as ListMeta;
  } catch {
    return {};
  }
};
const saveMeta = (listId: string | number, m: ListMeta): void => {
  try {
    localStorage.setItem(metaKey(listId), JSON.stringify(m));
  } catch {
    // ignore
  }
};

export default function ShoppingListDetail({
  listId,
  showItems = true,
  filterTerm,
  sortSpec,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const list = useSelector(selectShoppingListById(listId));
  const items = useSelector(selectItemsByListId(listId));
  const status = useSelector(selectItemsStatus);

  const [meta, setMeta] = useState<ListMeta>(() => loadMeta(listId));
  const [showMeta, setShowMeta] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  /* ── filter + sort derived list (no any) ─────────────────────────── */
  const sorted = useMemo(() => {
    const q = (filterTerm || "").trim().toLowerCase();
    const filtered = q
      ? items.filter((it) => it.name.toLowerCase().includes(q))
      : items;

    const { key, dir } = parseSortSpec(sortSpec);
    const mult = dir === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      if (key === "name") {
        return (
          mult *
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );
      }
      if (key === "category") {
        return (
          mult *
          (a.category ?? "").localeCompare(b.category ?? "", undefined, {
            sensitivity: "base",
          })
        );
      }
      // key === "date"
      return mult * (a.createdAt - b.createdAt);
    });
  }, [items, filterTerm, sortSpec]);

  const totalQty = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0),
    [items]
  );

  if (!list) {
    return <div className={styles.empty}>List not found.</div>;
  }

  const onSaveMeta = (m: ListMeta) => {
    setMeta(m);
    saveMeta(listId, m);
    setShowMeta(false);
  };

  return (
    <div className={styles.detail}>
      {/* Summary / Hero card — ALWAYS visible */}
      <div className={styles.heroCard}>
        <div className={styles.heroHeader}>
          <div style={{ fontWeight: 700 }}>
            <div style={{ fontSize: 16 }}>{list.title}</div>
            <div style={{ fontSize: 14, marginTop: 6 }}>
              Category:&nbsp;
              <select
                value={meta.category ?? ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const next: ListMeta = {
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
          </div>
        </div>

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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <div className={styles.noteBox}>
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

      {/* Items list — only toggled area (filtered + sorted) */}
      {showItems &&
        (sorted.length === 0 ? (
          <p className={styles.empty} style={{ marginTop: 14 }}>
            {filterTerm?.trim()
              ? "No items match your search."
              : "No items yet."}
          </p>
        ) : (
          <ul className={styles.items} style={{ marginTop: 14 }}>
            {sorted.map((it) => (
              <ItemRow key={it.id} listId={listId} {...it} />
            ))}
          </ul>
        ))}

      {/* Meta Modal */}
      {showMeta && (
        <MetaModal
          categories={CATEGORIES}
          initial={meta}
          onCancel={() => setShowMeta(false)}
          onSave={onSaveMeta}
        />
      )}

      {/* Add Item Modal */}
      {showAdd && (
        <AddItemModal
          categories={CATEGORIES}
          busy={status === "loading"}
          onCancel={() => setShowAdd(false)}
          onCreate={async (payload) => {
            const { name, quantity, category, notes, images } = payload;
            await dispatch(
              addItemToList({
                listId,
                name,
                quantity,
                category,
                notes,
                images,
              })
            ).unwrap();
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

/* ───────────── Item row ───────────── */
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
  const status = useSelector(selectItemsStatus);

  const [editing, setEditing] = useState(false);
  const [eName, setEName] = useState<string>(name);
  const [eQty, setEQty] = useState<string>(String(quantity));
  const [eCat, setECat] = useState<string>(category ?? "");
  const [eNotes, setENotes] = useState<string>(notes ?? "");
  const [eImages, setEImages] = useState<string>((images ?? []).join(", "));

  useEffect(() => {
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
      .filter((s) => s.length > 0);
    const next = {
      name: eName.trim(),
      quantity: Math.max(1, Number(eQty) || 1),
      category: eCat.trim() || undefined,
      notes: eNotes.trim() || undefined,
      images: imgs.length > 0 ? imgs : undefined,
    };
    dispatch(updateListItem({ listId, itemId: id, changes: next }));
    setEditing(false);
  };

  const updateQty = (nextQty: number) => {
    if (nextQty < 1) return;
    dispatch(
      updateListItem({ listId, itemId: id, changes: { quantity: nextQty } })
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
              {notes}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
          </div>
        </>
      ) : (
        <>
          <div className={styles.editGrid}>
            <input
              value={eName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEName(e.target.value)
              }
              aria-label="Edit name"
              placeholder="Name"
              className={styles.input}
            />
            <input
              value={eCat}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setECat(e.target.value)
              }
              aria-label="Edit category"
              placeholder="Category"
              className={styles.input}
            />
            <input
              value={eNotes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setENotes(e.target.value)
              }
              aria-label="Edit notes"
              placeholder="Notes"
              className={styles.input}
            />
            <input
              value={eImages}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEImages(e.target.value)
              }
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEQty(e.target.value)
              }
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
  const [category, setCategory] = useState<string>(initial.category ?? "");
  const [notes, setNotes] = useState<string>(initial.notes ?? "");
  const [imageUrl, setImageUrl] = useState<string>(initial.imageUrl ?? "");

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <h3 className={styles.modalTitle}>Update list details</h3>

        <div className={styles.formRow}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.select ?? styles.input}
            value={category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setCategory(e.target.value)
            }
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setImageUrl(e.target.value)
            }
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Notes</label>
          <input
            className={styles.input}
            placeholder="(opt.) Description of list"
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNotes(e.target.value)
            }
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
          <button className={styles.btn} onClick={onCancel}>
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
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  const qty = Number.parseInt(quantity || "0", 10);
  const valid = name.trim().length > 0 && qty > 0;

  const submit = () => {
    if (!valid) return;
    const imgs = imageUrl.trim() ? [imageUrl.trim()] : undefined;
    onCreate({
      name: name.trim(),
      quantity: qty,
      category: category || undefined,
      notes: notes || undefined,
      images: imgs,
    });
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <h3 className={styles.modalTitle}>Add Item to Shopping list</h3>

        <div className={styles.formRow}>
          <label className={styles.label}>Name</label>
          <input
            className={styles.input}
            placeholder="Enter item name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            autoFocus
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.select ?? styles.input}
            value={category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setCategory(e.target.value)
            }
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
            placeholder="URL"
            value={imageUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setImageUrl(e.target.value)
            }
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Notes</label>
          <input
            className={styles.input}
            placeholder="(opt.) Notes"
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNotes(e.target.value)
            }
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label}>Quantity</label>
          <input
            className={styles.input}
            placeholder="Enter number"
            inputMode="numeric"
            value={quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuantity(e.target.value.replace(/[^\d]/g, ""))
            }
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
          <button className={styles.btn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
