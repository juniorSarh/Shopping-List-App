
import type { FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  updateField,
  submitLogin,
  selectLoginForm,
  selectLoginLoading,
  selectLoginError,
} from "../features/loginSlice";
import type { AppDispatch } from "../store";
import styles from "../modules.css/auth.module.css";
import Header from "./Header";
import Footer from "./Footer";

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const form = useSelector(selectLoginForm);
  const loading = useSelector(selectLoginLoading);
  const error = useSelector(selectLoginError);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      
      await dispatch(submitLogin(form)).unwrap();
      navigate("/dashboard");
    } catch {
      console.log("Could not find landing page")
    }
  };

  return (
    <div className={styles.page}>
    <Header/>
    <main className={styles.main}>
      <form onSubmit={onSubmit} className={styles.authCard}>
        <h2 className={styles.authTitle}>Login</h2>
        <p className={styles.authSubtitle}>Welcome back 👋</p>
        <div className={styles.form}>
          <label className={styles.row}>
            <span className={styles.label}>Email</span>
            <input
              className={styles.input}
              type="email"
              value={form.email}
              onChange={(e) =>
                dispatch(updateField({ field: "email", value: e.target.value }))
              }
              required
            />
          </label>

          <label className={styles.row}>
            <span className={styles.label}>Password</span>
            <input
              className={styles.input}
              type="password"
              value={form.password}
              onChange={(e) =>
                dispatch(
                  updateField({ field: "password", value: e.target.value })
                )
              }
              required
            />
          </label>

          <p className={styles.helper}>
            Don`t have account? <Link to="/signup">SignUp</Link> here
          </p>

          <div className={styles.actions}>
            <button
              className={styles.primaryBtn}
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>
      </form>
    </main>
      <Footer />
    </div>
  );


};
