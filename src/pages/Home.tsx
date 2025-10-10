import styles from "../modules.css/home.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.hero}>
            <div>
              <h1 className={styles.title}>Your shopping, simplified.</h1>
              <p className={styles.subtitle}>
                Create lists, add items, share with family and keep everything
                in sync.
              </p>
              <div className={styles.ctaRow}>
                <a className={styles.primaryBtn} href="/signup">
                  Get started
                </a>
                <a className={styles.ghostBtn} href="/login">
                  I already have an account
                </a>
              </div>

              <div className={styles.featureGrid}>
                <div className={styles.featureCard}>
                  <h3 className={styles.featureTitle}>Secure</h3>
                  <p className={styles.featureText}>
                    Encrypted credentials, protected routes.
                  </p>
                </div>
                <div className={styles.featureCard}>
                  <h3 className={styles.featureTitle}>Organised</h3>
                  <p className={styles.featureText}>
                    Categories, notes, images & sorting.
                  </p>
                </div>
                <div className={styles.featureCard}>
                  <h3 className={styles.featureTitle}>Fast</h3>
                  <p className={styles.featureText}>
                    Redux Toolkit + JSON Server.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.heroMedia}>
              {/* optional illustration */}
              {/* <img className={styles.heroImage} src="/hero.png" alt="" /> */}
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
