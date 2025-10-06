import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store";
import { logout, selectCurrentUser } from "../features/loginSlice";
import styles from "../modules.css/header.module.css";

type HeaderProps = { appName?: string };

export default function Header({ appName = "ShopEase" }: HeaderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <header className={styles.navbar}>
      <NavLink to="/" className={styles.brand} aria-label={`${appName} home`}>
        <span className={styles.appName}>{appName}</span>
      </NavLink>

      <nav className={styles.links}>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? styles.linkActive : styles.link
          }
        >
          Home
        </NavLink>

        {user ? (
          <>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? styles.linkActive : styles.link
              }
            >
              Profile
            </NavLink>

            {/* Real logout button (styled like a link) */}
            <button
              type="button"
              onClick={handleLogout}
              className={`${styles.link} ${styles.buttonLike}`}
              aria-label="Log out"
            >
              Logout
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </nav>
    </header>
  );
}
