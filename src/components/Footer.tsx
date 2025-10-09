
import styles from "../modules.css/footer.module.css";

type FooterProps = {
  appName?: string;
  year?: number;
};

export default function Footer({
  appName = "ShopEase",
  year = new Date().getFullYear(),
}: FooterProps) {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        {/* Brand + blurb */}
        <div className={styles.brandCol}>
          <div className={styles.brandRow}>
            <svg className={styles.logo} viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.77 5.82 22 7 14.15l-5-4.88 6.91-1.01L12 2z"
                fill="currentColor"
              />
            </svg>
            <span className={styles.appName}>{appName}</span>
          </div>
          <p className={styles.blurb}>
            Your ultimate shopping companion! Effortlessly organize your groceries,
          </p>

          <div className={styles.socials} aria-label="Social links">
            <a className={styles.socialLink} href="#" aria-label="Twitter">
              <svg
                viewBox="0 0 24 24"
                className={styles.socialIcon}
                aria-hidden="true"
              >
                <path
                  d="M22 5.8c-.7.3-1.5.6-2.3.7.8-.5 1.4-1.3 1.7-2.2-.8.5-1.7.9-2.6 1.1A3.9 3.9 0 0 0 12 8.6c0 .3 0 .6.1.9-3.2-.2-6.1-1.7-8-4.1-.3.6-.5 1.3-.5 2 0 1.4.7 2.6 1.7 3.4-.6 0-1.2-.2-1.7-.5v.1c0 2 1.4 3.6 3.2 4-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1.5 1.6 2 2.8 3.8 2.8A7.9 7.9 0 0 1 2 19.6 11.2 11.2 0 0 0 8 21.3c7.4 0 11.4-6.2 11.4-11.5v-.5c.8-.6 1.5-1.3 2-2.1z"
                  fill="currentColor"
                />
              </svg>
            </a>
            <a className={styles.socialLink} href="#" aria-label="LinkedIn">
              <svg
                viewBox="0 0 24 24"
                className={styles.socialIcon}
                aria-hidden="true"
              >
                <path
                  d="M4.98 3.5C4.98 4.9 3.9 6 2.5 6S0 4.9 0 3.5 1.12 1 2.5 1 4.98 2.1 4.98 3.5zM0 8h5v16H0zM9 8h4.8v2.2h.1c.7-1.3 2.4-2.6 4.9-2.6 5.2 0 6.2 3.4 6.2 7.8V24h-5v-7.6c0-1.8 0-4.2-2.6-4.2-2.6 0-3 2-3 4v7.8H9z"
                  fill="currentColor"
                />
              </svg>
            </a>
            <a className={styles.socialLink} href="#" aria-label="GitHub">
              <svg
                viewBox="0 0 24 24"
                className={styles.socialIcon}
                aria-hidden="true"
              >
                <path
                  d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.6-4.1-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.2-.8.1-.8.1-.8 1.3.1 2 .1 2.6 1.6 1.2 2.6 3.2 1.8 4 .1.1-.9.5-1.6 1-2-2.7-.3-5.6-1.4-5.6-6.2 0-1.4.5-2.6 1.3-3.5-.1-.3-.6-1.8.1-3.8 0 0 1-.3 3.6 1.3 1-.3 2-.4 3-.4s2 .1 3 .4c2.6-1.6 3.6-1.3 3.6-1.3.7 2 .2 3.5.1 3.8.8.9 1.3 2.1 1.3 3.5 0 4.8-2.9 5.9-5.6 6.2.5.4 1 1.3 1 2.6v3.8c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"
                  fill="currentColor"
                />
              </svg>
            </a>
          </div>
        </div>

     

        {/* Contact */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Contact</h3>
          <ul className={styles.list}>
            <li>
              <a className={styles.link} href="mailto:info@example.com">
                info@RoyaltyTechnologies.com
              </a>
            </li>
            <li>
              <a className={styles.link} href="tel:+27123456789">
                +27 12 345 6789
              </a>
            </li>
            <li>
              <span className={styles.muted}>Sandton, South Africa</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.base}>
        <span className={styles.copy}>
          © {year} {appName}. All rights reserved.
        </span>
        <nav className={styles.legal}>
          <a href="#" className={styles.link}>
            Privacy
          </a>
          <a href="#" className={styles.link}>
            Terms
          </a>
        </nav>
      </div>
    </footer>
  );
}
