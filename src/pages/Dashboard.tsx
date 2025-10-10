import styles from "../modules.css/dashboard.module.css";
import ShoppingLists from "../components/Shoppinglists";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/loginSlice";

export default function Dashboard() {
  const user = useSelector(selectCurrentUser)!;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          {/* If ShoppingLists exposes the card grid container, wrap or pass a class that uses styles.cardGrid */}
          <div className={styles.cardGrid}>
            <ShoppingLists userId={String(user.id)} />
          </div>
        </div>
      </main>

      {/* Optional wrapper if you want to force sticky behavior via class */}
      <div className={styles.footerSlot}>
        <Footer />
      </div>

      {/* If your items overlay renders via <Outlet />, keep it after main. 
          ItemsOverlay already uses fixed overlay styles, so no extra CSS needed. */}
      <Outlet />
    </div>
  );
}
