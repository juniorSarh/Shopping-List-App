import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { AppDispatch } from "../store";
import { selectShoppingListById } from "../features/shoppingListSlice";
import {
  fetchItemsByList,
  selectItemsByListId,
  deleteListItem,
  updateListItem,
  addItemToList,
} from "../features/itemsSlice";
import sheet from "../modules.css/itemsOverlay.module.css";
import table from "../modules.css/itemsTable.module.css";
import { refreshAfterDelete } from "../utils/refreshUtils";

export default function ItemsOverlay() {
  const { listId = "" } = useParams();
  const id = String(listId);
  const nav = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const list = useSelector(selectShoppingListById(id));
  const items = useSelector(selectItemsByListId(id));

  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";

  const [showAdd, setShowAdd] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCat, setEditCat] = useState("");
  const [editQty, setEditQty] = useState<string>("");
  const [editNotes, setEditNotes] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);

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
    setEditNotes(it.notes ?? "");
    setEditImages(it.images ?? []);
  };

  const fmtDate = (ms: number) => {
    const d = new Date(ms);
    return d.toISOString().split("T")[0];
  };

  return (
    <div className={sheet.overlay}>
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
              placeholder="Search items..."
              value={q}
              onChange={(e) => {
                const next = new URLSearchParams(params);
                const v = e.target.value;
                if (v) next.set("q", v);
                else next.delete("q");
                setParams(next, { replace: true });
              }}
            />

            {/* <button
              className={sheet.primaryBtn}
              onClick={() => setShowAdd(true)}
            >
              Add Item
            </button> */}

            <button className={sheet.closeBtn} onClick={() => nav(-1)}>
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
                <th className={table.th}>Notes</th>
                <th className={table.th}>Images</th>
                <th className={table.th}>Date Added</th>
                <th className={table.thSmall}>Quantity</th>
                <th className={table.thSmall}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((it) => (
                <tr key={it.id} className={table.row}>
                  <td className={table.td}>{it.name}</td>
                  <td className={table.td}>{it.category ?? ""}</td>
                  <td className={table.td}>{it.notes ?? ""}</td>

                  <td className={table.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {(it.images ?? []).map((img, i) => (
                        <img key={i} src={img} width={40} height={40} />
                      ))}
                    </div>
                  </td>

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
                        refreshAfterDelete(async () => {
                          await dispatch(
                            deleteListItem({ listId: id, itemId: it.id })
                          );
                          alert("You are about to delete this item.");
                        })
                        
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD */}
      {showAdd && (
        <ItemModal
          mode="add"
          title="Add Item"
          onClose={() => setShowAdd(false)}
          onSubmit={async (data) => {
            await dispatch(
              addItemToList({
                listId: id,
                ...data,
                images: data.images ?? [],
              })
            ).unwrap();

            setShowAdd(false);
          }}
        />
      )}

      {/* EDIT */}
      {editId && (
        <ItemModal
          mode="edit"
          title="Edit Item"
          initial={{
            name: editName,
            category: editCat,
            quantity: editQty,
            notes: editNotes,
            images: editImages,
          }}
          onClose={() => setEditId(null)}
          onSubmit={async ({ name, category, notes, quantity }) => {
            await dispatch(
              updateListItem({
                listId: id,
                itemId: editId,
                changes: {
                  name,
                  category,
                  notes,
                  quantity,
                  images: editImages,
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

/* MODAL */

type ItemModalProps = {
  mode: "add" | "edit";
  title: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initial?: {
    name?: string;
    category?: string;
    quantity?: string;
    notes?: string;
    images?: string[];
  };
};

function ItemModal({ mode, title, onClose, onSubmit, initial }: ItemModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [quantity, setQuantity] = useState(initial?.quantity ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    ).then((imgs) => setImages((prev) => [...prev, ...imgs]));
  };

  const qtyNum = Math.max(1, Number(quantity));
  const valid = name.trim().length > 0 && qtyNum > 0;

  return (
    <div className={sheet.modalOverlay}>
      <div className={sheet.modalCard}>
        <h3 className={sheet.modalTitle}>{title}</h3>

        <label className={sheet.modalLabel}>Name</label>
        <input
          className={sheet.modalInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className={sheet.modalLabel}>Category</label>
        <input
          className={sheet.modalInput}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <label className={sheet.modalLabel}>Notes</label>
        <input
          className={sheet.modalInput}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {mode === "add" && (
          <>
            <label className={sheet.modalLabel}>Images</label>
            <input
              className={sheet.modalInput}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {images.map((img, i) => (
                <img key={i} src={img} width={50} height={50} />
              ))}
            </div>
          </>
        )}

        <label className={sheet.modalLabel}>Quantity</label>
        <input
          className={sheet.modalInput}
          value={quantity}
          inputMode="numeric"
          onChange={(e) =>
            setQuantity(e.target.value.replace(/[^\d]/g, ""))
          }
        />

        <div className={sheet.modalActions}>
          <button
            className={sheet.primaryBtn}
            disabled={!valid}
            onClick={() =>
              onSubmit({
                name: name.trim(),
                category,
                notes,
                quantity: qtyNum,
                images,
              })
            }
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