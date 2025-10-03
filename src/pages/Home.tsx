import { Link } from "react-router-dom";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import styles from "../modules.css/home.module.css";
import cart from "../images/shopping-cart.png";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.intro}>
          {/* Left column (text) */}
          <div>
            <h1 className={styles.title}>Welcome to ShopEase</h1>
            <p className={styles.lead}>
              Your ultimate shopping companion! Effortlessly organize your
              groceries,
            </p>
            <p className={styles.copy}>
              create quick lists, and never forget an item again. Shop smarter,
              faster, and stress-free with ShopEase by your side!
            </p>

            <div className={styles.actions}>
              <Link
                to="/signup"
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                Sign Up
              </Link>
              <Link to="/login" className={`${styles.btn} ${styles.btnGhost}`}>
                Log In
              </Link>
            </div>
          </div>

          {/* Right column (image) — becomes visible and nicely placed on larger screens */}
          <div className={styles.media}>
            <img
              className={styles.heroImg}
              src={cart}
              alt="Shopping cart illustration"
              width={560}
              height={420}
              loading="eager"
              decoding="async"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
