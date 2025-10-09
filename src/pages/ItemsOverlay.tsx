import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { AppDispatch } from "../store";
import { selectShoppingListById } from "../features/shoppinglistSlice";
import {
  fetchItemsByList,
  selectItemsByListId,
  selectItemsStatus,
  deleteListItem,
  updateListItem,
  addItemToList,
} from "../features/itemsSlice";
import sheet from "../modules.css/itemsOverlay.module.css";
import table from "../modules.css/itemsTable.module.css";

export default function ItemsOverlay() {
  const { listId = "" } = useParams();
  const id = String(listId); // normalize once
  const nav = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const list = useSelector(selectShoppingListById(id));
  const items = useSelector(selectItemsByListId(id));
  const status = useSelector(selectItemsStatus);

  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";

  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCat, setEditCat] = useState("");
  const [editQty, setEditQty] = useState<string>("");

  // lock scroll while overlay open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (id) dispatch(fetchItemsByList({ listId: id }));
  }, [dispatch, id]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const src = term
      ? items.filter((i) => i.name.toLowerCase().includes(term))
      : items;
    return [...src].sort((a, b) => b.createdAt - a.createdAt);
  }, [items, q]);

  const startEdit = (rowId: string) => {
    const it = items.find((i) => i.id === rowId);
    if (!it) return;
    setEditId(rowId);
    setEditName(it.name);
    setEditCat(it.category ?? "");
    setEditQty(String(it.quantity));
  };

  const fmtDate = (ms: number) => {
    const d = new Date(ms);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className={sheet.overlay} role="dialog" aria-modal="true">
      <div className={sheet.backdrop} onClick={() => nav(-1)} />
      <div className={sheet.panel}>
        <div className={sheet.topbar}>
          <div>
            <div className={sheet.title}>{list?.title ?? "Items"}</div>
            <div className={sheet.subtitle}>List ID: {id}</div>
          </div>
          <div className={sheet.actions}>
            <input
              className={sheet.search}
              placeholder="Search items by name…"
              value={q}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                const v = e.target.value;
                if (v) next.set("q", v);
                else next.delete("q");
                setParams(next, { replace: true });
              }}
            />
            <button
              className={sheet.primaryBtn}
              onClick={() => setShowAdd(true)}
            >
              Add Item
            </button>
            <button
              className={sheet.closeBtn}
              onClick={() => nav(-1)}
              aria-label="Close"
            >
              Close
            </button>
          </div>
        </div>

        <div className={table.tableWrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Name</th>
                <th className={table.th}>Category</th>
                <th className={table.th}>Date Added</th>
                <th className={table.thSmall}>Quantity</th>
                <th className={table.thSmall}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {status === "loading" && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className={table.loadingCell}>
                    Loading…
                  </td>
                </tr>
              )}

              {filtered.map((it) => (
                <tr key={it.id} className={table.row}>
                  <td className={table.td}>{it.name}</td>
                  <td className={table.td}>{it.category ?? ""}</td>
                  <td className={table.td}>{fmtDate(it.createdAt)}</td>
                  <td className={`${table.td} ${table.qtyTd}`}>
                    {it.quantity}
                  </td>
                  <td className={`${table.td} ${table.actionsTd}`}>
                    <button
                      className={table.smallBtn}
                      onClick={() => startEdit(it.id)}
                    >
                      Edit
                    </button>
                    <button
                      className={`${table.smallBtn} ${table.danger}`}
                      onClick={() =>
                        dispatch(deleteListItem({ listId: id, itemId: it.id }))
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && status !== "loading" && (
                <tr>
                  <td colSpan={5} className={table.emptyCell}>
                    No items{q ? " match your search." : "."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item modal */}
      {showAdd && (
        <ItemModal
          title="Add Item"
          onClose={() => setShowAdd(false)}
          onSubmit={async ({ name, category, quantity }) => {
            await dispatch(
              addItemToList({
                listId: id,
                name,
                category: category || undefined,
                quantity, // number ✅
              })
            ).unwrap();
            setShowAdd(false);
          }}
        />
      )}

      {/* Edit Item modal */}
      {editId && (
        <ItemModal
          title="Edit Item"
          initial={{ name: editName, category: editCat, quantity: editQty }} // initial may be string
          onClose={() => setEditId(null)}
          onSubmit={async ({ name, category, quantity }) => {
            const qty = Math.max(1, quantity); // quantity is number ✅
            await dispatch(
              updateListItem({
                listId: id,
                itemId: editId,
                changes: {
                  name,
                  category: category || undefined,
                  quantity: qty,
                },
              })
            ).unwrap();
            setEditId(null);
          }}
        />
      )}
    </div>
  );
}

/* Reusable popup modal for Add/Edit */
type ItemModalProps = {
  title: string;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: string;
    quantity: number;
  }) => void | Promise<void>;
  initial?: { name?: string; category?: string; quantity?: string };
};

function ItemModal({ title, onClose, onSubmit, initial }: ItemModalProps) {
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [category, setCategory] = useState<string>(initial?.category ?? "");
  const [quantity, setQuantity] = useState<string>(initial?.quantity ?? "");

  const qtyNum = Math.max(1, Number.parseInt(quantity || "0", 10));
  const valid = name.trim().length > 0 && qtyNum > 0;

  return (
    <div className={sheet.modalOverlay} role="dialog" aria-modal="true">
      <div className={sheet.modalCard}>
        <h3 className={sheet.modalTitle}>{title}</h3>

        <label className={sheet.modalLabel}>Name</label>
        <input
          className={sheet.modalInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <label className={sheet.modalLabel}>Category</label>
        <input
          className={sheet.modalInput}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <label className={sheet.modalLabel}>Quantity</label>
        <input
          className={sheet.modalInput}
          value={quantity}
          inputMode="numeric"
          onChange={(e) => setQuantity(e.target.value.replace(/[^\d]/g, ""))}
        />

        <div className={sheet.modalActions}>
          <button
            className={sheet.primaryBtn}
            disabled={!valid}
            onClick={() =>
              onSubmit({ name: name.trim(), category, quantity: qtyNum })
            } // pass number ✅
          >
            Save
          </button>
          <button className={sheet.closeBtn} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
