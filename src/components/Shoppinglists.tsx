// src/pages/ShoppingLists.tsx
import React, { useEffect, useMemo, useState } from "react";
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
} from "../features/shoppingSlice";
import ShoppingListDetail from "./ShoppinglistDetails"; // ensure filename matches
import styles from "../modules.css/shoppinglist.module.css";

type Props = { userId: string };

export default function ShoppingLists({ userId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const lists = useSelector(selectShoppingListsByUser(userId));
  const status = useSelector(selectShoppingStatus);
  const error = useSelector(selectShoppingError);

  const [title, setTitle] = useState("");
  const trimmed = useMemo(() => title.trim(), [title]);
  const canAdd = trimmed.length > 0;

  useEffect(() => {
    dispatch(fetchShoppingListsByUser(userId));
  }, [dispatch, userId]);

  const addList = () => {
    if (!canAdd) return;
    dispatch(createShoppingList({ userId, title: trimmed }));
    setTitle("");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addList();
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Your Shopping Lists</h2>

      {/* Create list */}
      <div className={styles.createRow}>
        <input
          className={styles.input}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="New list title"
          aria-label="New list title"
        />
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={addList}
          disabled={!canAdd || status === "loading"}
        >
          {status === "loading" ? "Saving…" : "Add List"}
        </button>
      </div>

      {status === "loading" && lists.length === 0 && (
        <p className={styles.loading}>Loading your lists…</p>
      )}
      {error && <p className={styles.error}>{error}</p>}

      {/* Read lists */}
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

              {/* Items CRUD for this list */}
              <ShoppingListDetail listId={list.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
