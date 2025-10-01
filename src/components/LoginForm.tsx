
import type { FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
    <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
      <h2>Login</h2>

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

      <button type="submit" disabled={loading}>
        {loading ? "Logging in…" : "Login"}
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </form>
  );
}

const label: React.CSSProperties = {
  display: "grid",
  gap: 6,
  marginBottom: 10,
};
