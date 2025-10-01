import type { FormEvent } from "react";
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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(submitRegistration(form));
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
      <h2>Register</h2>

      <label style={label}>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(e) =>
            dispatch(updateField({ field: "email", value: e.target.value }))
          }
          required
        />
      </label>

      <label style={label}>
        Password
        <input
          type="password"
          value={form.password}
          onChange={(e) =>
            dispatch(updateField({ field: "password", value: e.target.value }))
          }
          required
        />
      </label>

      <label style={label}>
        Name
        <input
          value={form.name}
          onChange={(e) =>
            dispatch(updateField({ field: "name", value: e.target.value }))
          }
          required
        />
      </label>

      <label style={label}>
        Surname
        <input
          value={form.surname}
          onChange={(e) =>
            dispatch(updateField({ field: "surname", value: e.target.value }))
          }
          required
        />
      </label>

      <label style={label}>
        Cell number
        <input
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

      <button type="submit" disabled={loading}>
        {loading ? "Registering…" : "Register"}
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && (
        <p style={{ color: "green" }}>
          Registered!{" "}
          <button type="button" onClick={() => dispatch(resetForm())}>
            Add another
          </button>
        </p>
      )}
    </form>
  );
}

const label: React.CSSProperties = {
  display: "grid",
  gap: 6,
  marginBottom: 10,
};
