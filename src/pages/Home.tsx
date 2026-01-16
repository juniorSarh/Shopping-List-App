import styles from "../modules.css/home.module.css";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import shoppingListImage from "../assets/shoppingList.jpg";
import Navbar from "../components/NavBar";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.hero}>
            <div>
              <h1 className={styles.title}>
                Your shopping, <span className={styles.highlight}>simplified</span>.
              </h1>
              <p className={styles.subtitle}>
                Create smart shopping lists, organize items by categories, share with family, 
                and keep everything in sync across all your devices. Never forget an item again!
              </p>
              <div className={styles.ctaRow}>
                <Link className={styles.primaryBtn} to="/signup">
                  Get started free
                </Link>
                <Link className={styles.ghostBtn} to="/login">
                  I already have an account
                </Link>
              </div>
            </div>

            <div className={styles.heroMedia}>
              <img 
                className={styles.heroImage} 
                src={shoppingListImage} 
                alt="Shopping list app with cart and checklist" 
              />
            </div>
          </section>
        </div>
      </main>

      <div className={styles.footerSlot}>
        <Footer />
      </div>
    </div>
  );
}
