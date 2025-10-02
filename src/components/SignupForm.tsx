import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../modules.css/SignUp.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  updateField,
  submitRegistration,
  selectRegisterForm,
  selectRegisterLoading,
  selectRegisterError,
  selectRegisterSuccess,
  resetForm,
} from "../features/registerSlice";
import type { AppDispatch } from "../store";

export default function RegisterForm() {
  const dispatch = useDispatch<AppDispatch>();
  const form = useSelector(selectRegisterForm);
  const loading = useSelector(selectRegisterLoading);
  const error = useSelector(selectRegisterError);
  const success = useSelector(selectRegisterSuccess);

  

  const navigate = useNavigate();
  const onSubmit = async (e: FormEvent) => {
      e.preventDefault();
      try {
        
        await dispatch(submitRegistration(form)).unwrap();
        navigate("/dashboard");
      } catch {
        console.log("Could not find landing page")
      }
    };

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <h2 className={styles.heading}>Register</h2>

      <label className={styles.field}>
        <span className={styles.label}>Name</span>
        <input
          className={styles.input}
          value={form.name}
          onChange={(e) =>
            dispatch(updateField({ field: "name", value: e.target.value }))
          }
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Surname</span>
        <input
          className={styles.input}
          value={form.surname}
          onChange={(e) =>
            dispatch(updateField({ field: "surname", value: e.target.value }))
          }
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Cell number</span>
        <input
          className={styles.input}
          value={form.cellNumber}
          onChange={(e) =>
            dispatch(
              updateField({ field: "cellNumber", value: e.target.value })
            )
          }
          placeholder="+27 82 123 4567"
          required
        />
      </label>

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

        <p> Already have account? <Link to="/login">LogIn</Link> here</p>
      </label>

      <div className={styles.actions}>
        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Registering…" : "Register"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {success && (
        <p className={styles.success}>
          Registered!{" "}
          <button
            type="button"
            className={styles.inlineButton}
            onClick={() => dispatch(resetForm())}
          >
            Add another
          </button>
        </p>
      )}
    </form>
  );
}
