import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { ShoppingItem, ShoppingList } from "../types/shopping";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function Share() {
  const { listId } = useParams();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listId) return;
    (async () => {
      try {
        const l = await (await fetch(`${API_BASE}/lists/${listId}`)).json();
        const allItems: ShoppingItem[] = await (
          await fetch(`${API_BASE}/items?listId=${listId}`)
        ).json();
        setList(l);
        setItems(allItems);
      } catch (e) {
        setError("Unable to load shared list");
        console.log(e);
      }
    })();
  }, [listId]);

  const totalQty = useMemo(
    () => items.reduce((s, it) => s + (Number(it.quantity) || 0), 0),
    [items]
  );

  if (error) return <div style={{ padding: 24 }}>{error}</div>;
  if (!list) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 760, margin: "24px auto", padding: 12 }}>
      <h2>{list.title}</h2>
      <div style={{ opacity: 0.8, marginBottom: 12 }}>
        Shared list • Items: {items.length} • Total quantity: {totalQty}
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((it) => (
          <li
            key={it.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 10,
              marginBottom: 8,
            }}
          >
            <div style={{ fontWeight: 700 }}>{it.name}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Qty: {it.quantity} {it.category ? `• ${it.category}` : ""}{" "}
              {it.notes ? `• ${it.notes}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
