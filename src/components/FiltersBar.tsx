import { useSearchParams } from "react-router-dom";
import styles from "../modules.css/shoppinglist.module.css";

const SORTS = [
  { v: "date.desc", label: "Date added (newest)" },
  { v: "date.asc", label: "Date added (oldest)" },
  { v: "name.asc", label: "Name (A→Z)" },
  { v: "name.desc", label: "Name (Z→A)" },
  { v: "category.asc", label: "Category (A→Z)" },
  { v: "category.desc", label: "Category (Z→A)" },
];

export default function FiltersBar() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const sort = params.get("sort") || "date.desc";

  return (
    <div className={styles.createRow}>
      <input
        className={styles.input}
        placeholder="Search items by name…"
        value={q}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value) next.set("q", e.target.value);
          else next.delete("q");
          setParams(next, { replace: true });
        }}
      />
      <select
        className={styles.select}
        value={sort}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          next.set("sort", e.target.value);
          setParams(next, { replace: true });
        }}
      >
        {SORTS.map((s) => (
          <option key={s.v} value={s.v}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
