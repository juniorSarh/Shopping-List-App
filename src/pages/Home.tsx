import styles from "../modules.css/home.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import shoppingListImage from "../assets/shoppingList.jpg";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <Header />

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
                <a className={styles.primaryBtn} href="/signup">
                  Get started free
                </a>
                <a className={styles.ghostBtn} href="/login">
                  I already have an account
                </a>
              </div>

              <div className={styles.featureGrid}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>🔒</div>
                  <h3 className={styles.featureTitle}>Secure & Private</h3>
                  <p className={styles.featureText}>
                    Your data is encrypted and protected. Only you control who sees your lists.
                  </p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>📋</div>
                  <h3 className={styles.featureTitle}>Smart Organization</h3>
                  <p className={styles.featureText}>
                    Categories, notes, images, and smart sorting make shopping effortless.
                  </p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>⚡</div>
                  <h3 className={styles.featureTitle}>Lightning Fast</h3>
                  <p className={styles.featureText}>
                    Built with modern tech for instant updates and smooth performance.
                  </p>
                </div>
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
