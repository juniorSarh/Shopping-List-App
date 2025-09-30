import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../features/UserSlice";

export default function LoginForm() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // optional display name
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with real API call, get { user, token }
    const fakeUser = { id: "u_001", name: name || "Returning User", email };
    const fakeToken = "demo-login-token";
    dispatch(login({ user: fakeUser, token: fakeToken }));
    setPassword("");
  };

  return (
    <form onSubmit={onSubmit} style={card}>
      <h2 style={subtitle}>Log in</h2>
      <label style={label}>
        Name (optional)
        <input
          style={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name"
        />
      </label>
      <label style={label}>
        Email
        <input
          style={input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label style={label}>
        Password
        <input
          style={input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit" style={buttonSecondary}>
        Log in
      </button>
    </form>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
};
const subtitle: React.CSSProperties = { fontSize: 20, marginBottom: 12 };
const label: React.CSSProperties = {
  display: "grid",
  gap: 6,
  marginBottom: 10,
  fontSize: 14,
};
const input: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "10px 12px",
};
const buttonSecondary: React.CSSProperties = {
  background: "#111827",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  cursor: "pointer",
  marginTop: 8,
};
