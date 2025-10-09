import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store";
import {
  createShoppingList,
  fetchShoppingListsByUser,
  selectShoppingListsByUser,
  selectListsStatus,
  selectListsError,
} from "../features/shoppinglistSlice";
import { fetchItems } from "../features/itemsSlice";
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
  const status = useSelector(selectListsStatus);
  const error = useSelector(selectListsError);

  useEffect(() => {
    dispatch(fetchShoppingListsByUser(userId));
    dispatch(fetchItems()); // preload items for quick counts
  }, [dispatch, userId]);

  const [showAddList, setShowAddList] = useState(false);

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
              {/* full card; items not rendered here */}
              <ShoppingListDetail listId={list.id} showItems={false} />
            </li>
          ))}
        </ul>
      )}

      {showAddList && (
        <AddListModal
          categories={CATEGORIES}
          busy={status === "loading"}
          onCancel={() => setShowAddList(false)}
          onCreate={async ({ title, category, imageUrl, notes }) => {
            await dispatch(
              createShoppingList({ userId, title, category, imageUrl, notes })
            );
            setShowAddList(false);
          }}
        />
      )}
    </div>
  );
}

/* Modal (popup) like your screenshot */
function AddListModal({
  categories,
  busy,
  onCreate,
  onCancel,
}: {
  categories: string[];
  busy: boolean;
  onCreate: (payload: {
    title: string;
    category?: string;
    imageUrl?: string;
    notes?: string;
  }) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");

  const valid = title.trim().length > 0;
  const submit = () =>
    valid &&
    onCreate({
      title: title.trim(),
      category: category || undefined,
      imageUrl: imageUrl || undefined,
      notes: notes || undefined,
    });

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
