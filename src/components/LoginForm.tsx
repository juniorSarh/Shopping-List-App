
import type { FormEvent } from "react";
import styles from "../modules.css/Login.module.css";
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
    <form onSubmit={onSubmit} className={styles.form}>
      <h2 className={styles.heading}>Login</h2>

      <label className={styles.field}>
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

      <label className={styles.field}>
        <span className={styles.label}>Password</span>
        <input
          className={styles.input}
          type="password"
          value={form.password}
          onChange={(e) =>
            dispatch(updateField({ field: "password", value: e.target.value }))
          }
          required
        />
      </label>

      <p>
        {" "}
        Don`t have account? <Link to="/signup">SignUp</Link> here
      </p>

      <div className={styles.actions}>
        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </form>
  );


};
