import { NavLink } from "react-router-dom";
import styles from "../modules.css/navbar.module.css";


type NavbarProps = {
  appName?: string;
};

export default function Navbar({ appName = "ShopEase" }: NavbarProps) {
  return (
    <header className={styles.navbar}>
      <NavLink to="/" className={styles.brand} aria-label={`${appName} home`}>
        {/* Inline SVG icon (no asset pipeline needed) */}
       {/* <img src={appIcon} alt="logo" className={styles.logo}/> */}
        <span className={styles.appName}>{appName}</span>
      </NavLink>

      <nav className={styles.links}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? styles.linkActive : styles.link
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/login"
          className={({ isActive }) =>
            isActive ? styles.linkActive : styles.link
          }
        >
          Login
        </NavLink>
        <NavLink
          to="/signup"
          className={({ isActive }) =>
            isActive ? styles.linkActive : styles.link
          }
        >
          Sign Up
        </NavLink>
      </nav>
    </header>
  );
}
