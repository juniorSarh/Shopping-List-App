// src/pages/ShoppingListDetail.tsx
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
} from "../features/shoppingSlice"; // change path if your slice file is named differently

type Props = { listId: string | number };

export default function ShoppingListDetail({ listId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const list = useSelector(selectShoppingListById(listId));
  const items = useSelector(selectItemsByListId(listId));
  const status = useSelector(selectShoppingStatus);

  // Create item form (Name, Quantity, Category, Notes, Images)
  const [name, setName] = useState("");
  const [qty, setQty] = useState<string>("1");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [imagesStr, setImagesStr] = useState(""); // comma-separated URLs

  const images = useMemo(
    () =>
      imagesStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [imagesStr]
  );

  const canAdd = useMemo(
    () => name.trim().length > 0 && Number(qty) > 0,
    [name, qty]
  );

  if (!list) {
    return <div className={styles.empty}>List not found.</div>;
  }

  const addItem = () => {
    if (!canAdd) return;
    dispatch(
      addItemToList({
        listId,
        name: name.trim(),
        quantity: Math.max(1, Number(qty) || 1),
        category: category || undefined,
        notes: notes || undefined,
        images: images.length ? images : undefined,
      })
    );
    setName("");
    setQty("1");
    setCategory("");
    setNotes("");
    setImagesStr("");
  };

  const onEnter: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className={styles.detail}>
      {/* Add item */}
      <div className={styles.addGrid}>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onEnter}
          placeholder="Item name"
          aria-label="Item name"
        />
        <input
          className={styles.input}
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          onKeyDown={onEnter}
          placeholder="Qty"
          aria-label="Quantity"
        />
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={addItem}
          disabled={!canAdd || status === "loading"}
        >
          {status === "loading" ? "Saving…" : "Add Item"}
        </button>

        <input
          className={`${styles.metaInput} ${styles.metaRow}`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (optional)"
          aria-label="Category"
        />
        <input
          className={`${styles.metaInput} ${styles.metaRow}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          aria-label="Notes"
        />
        <input
          className={`${styles.metaInput} ${styles.metaRow}`}
          value={imagesStr}
          onChange={(e) => setImagesStr(e.target.value)}
          placeholder="Image URLs (comma-separated, optional)"
          aria-label="Images"
        />
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <p className={styles.empty}>No items yet.</p>
      ) : (
        <ul className={styles.items}>
          {items.map((it) => (
            <ItemRow key={it.id} listId={listId} {...it} />
          ))}
        </ul>
      )}
    </div>
  );
}

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
