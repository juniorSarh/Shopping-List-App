import Footer from "../components/Footer";
import Header from "../components/Header";
import ShoppingLists from "../components/Shoppinglists";
import FiltersBar from "../components/FiltersBar";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/loginSlice";
import { useSearchParams } from "react-router-dom";

export default function Dashboard() {
  const user = useSelector(selectCurrentUser);
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const sort = params.get("sort") || "date.desc";

  if (!user) return null;

  return (
    <div>
      <Header />
      <div style={{ width: "80%", margin: "0 auto" }}>
        <FiltersBar />
      </div>
      {/* Cards always visible; items filtered/sorted inside each card */}
      <ShoppingLists userId={String(user.id)} filterTerm={q} sortSpec={sort} />
      <Footer /> 
    </div>
  );
}
