import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store";
import {
  createShoppingList,
  fetchShoppingListsByUser,
  renameShoppingList,
  selectShoppingError,
  selectShoppingListsByUser,
  selectShoppingStatus,
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

  // Per-card "View Items" toggle
  const [openById, setOpenById] = useState<Record<string, boolean>>({});
  const isOpen = (id: string | number) => !!openById[String(id)];
  const toggleOpen = (id: string | number) =>
    setOpenById((m) => ({ ...m, [String(id)]: !m[String(id)] }));

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
                  {/* View/Hide Items with rotating chevron */}
                  <button
                    className={`${styles.btn} ${styles.btnToggle}`}
                    onClick={() => toggleOpen(list.id)}
                    aria-expanded={isOpen(list.id)}
                    aria-controls={`items-${list.id}`}
                    title={isOpen(list.id) ? "Hide Items" : "View Items"}
                  >
                    <svg
                      className={styles.chev}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{isOpen(list.id) ? "Hide Items" : "View Items"}</span>
                  </button>
                </div>
              </div>

              {/* Card stays visible; only the ITEMS list inside is toggled */}
              <div id={`items-${list.id}`} className={styles.cardBody}>
                <ShoppingListDetail
                  listId={list.id}
                  showItems={isOpen(list.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add Shopping List POPUP */}
      {showAddList && (
        <AddListModal
          categories={CATEGORIES}
          busy={status === "loading"}
          onCancel={() => setShowAddList(false)}
          onCreate={async ({ title }) => {
            await dispatch(createShoppingList({ userId, title }));
            setShowAddList(false);
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

/* ── Add Shopping List Modal (styled like your screenshot) ─────────── */
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
  const [category, setCategory] = useState(""); // UI-only preview
  const [imageUrl, setImageUrl] = useState(""); // UI-only preview
  const [notes, setNotes] = useState(""); // UI-only preview

  const valid = title.trim().length > 0;
  const submit = () => valid && onCreate({ title: title.trim() });

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={`${styles.modalCard} ${styles.modalCardTint}`}>
        <h3 className={`${styles.modalTitle} ${styles.modalTitleCenter}`}>
          Add Shopping list
        </h3>

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

        <div className={styles.modalActionsCenter}>
          <button
            className={`${styles.btn} ${styles.btnGreen}`}
            disabled={!valid || busy}
            onClick={submit}
          >
            {busy ? "Saving…" : "Create"}
          </button>
          <button
            className={`${styles.btn} ${styles.btnRed}`}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
