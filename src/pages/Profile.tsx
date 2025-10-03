
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store";
import {
  fetchProfile,
  selectProfile,
  updateProfile,
  updateCredentials,
} from "../features/profileSlice";
import { selectCurrentUser } from "../features/loginSlice";
import styles from "../modules.css/profilecard.module.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector(selectProfile);
  const currentUser = useSelector(selectCurrentUser);

  // Local editable fields (profile)
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [cell, setCell] = useState("");

  // Credentials form
  const [oldPassword, setOldPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Local feedback
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Load profile once we have a logged-in user
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchProfile(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);

  // Seed local form when profile arrives
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setSurname(user.surname || "");
      setCell(user.cellNumber || "");
      setNewEmail(user.email || "");
    }
  }, [user]);

  const busy = loading; // simple alias

  function resetFeedback() {
    setOkMsg(null);
    setErrMsg(null);
  }

  async function handleSaveProfile() {
    if (!user) return;
    resetFeedback();
    const res = await dispatch(
      updateProfile({
        userId: user.id!,
        data: { name, surname, cellNumber: cell },
      })
    );
    if (updateProfile.fulfilled.match(res)) {
      setOkMsg("Profile updated successfully.");
    } else {
      setErrMsg((res.payload as string) || "Failed to update profile.");
    }
  }

  async function handleUpdateCredentials() {
    if (!user) return;
    resetFeedback();

    if (!oldPassword.trim()) {
      setErrMsg("Please enter your old password.");
      return;
    }
    // no need to require both newEmail and newPassword — either or both can be changed
    const res = await dispatch(
      updateCredentials({
        userId: user.id!,
        oldPassword,
        newEmail:
          newEmail?.trim() && newEmail !== user.email
            ? newEmail.trim()
            : undefined,
        newPassword: newPassword?.trim() ? newPassword.trim() : undefined,
      })
    );
    if (updateCredentials.fulfilled.match(res)) {
      setOkMsg("Credentials updated successfully.");
      setOldPassword("");
      setNewPassword("");
    } else {
      setErrMsg((res.payload as string) || "Failed to update credentials.");
    }
  }

  const avatarFallback = useMemo(() => {
    const initials =
      ((user?.name?.[0] ?? "") + (user?.surname?.[0] ?? "")).toUpperCase() ||
      "U";
    return initials;
  }, [user?.name, user?.surname]);

  if (!currentUser) return <p>Please log in.</p>;
  if (busy && !user) return <p>Loading…</p>;
  if (error && !user) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return null;

  return (
    <div style={{backgroundColor:'lightgrey'}} >
    <Header />
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          {/* Avatar block: show image if you have one; fallback to initials */}
          {/* Replace src with user.avatarUrl if you add that to your model */}
          <div
            className={styles.avatar}
            aria-label={`Avatar for ${user.name ?? ""} ${user.surname ?? ""}`}
            style={{
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: "1.1rem",
            }}
          >
            {avatarFallback}
          </div>

          <div className={styles.identity}>
            <div className={styles.name}>
              {(user.name || "").trim()} {(user.surname || "").trim()}
            </div>
            <div className={styles.email}>{user.email}</div>
          </div>

          <div className={styles.badge}>Member</div>
        </div>

        <div className={styles.divider} />

        {/* Feedback */}
        {errMsg && <div className={styles.error}>{errMsg}</div>}
        {okMsg && <div className={styles.success}>{okMsg}</div>}
        {(errMsg || okMsg) && <div className={styles.spacer} />}

        {/* Profile info (editable) */}
        <div className={styles.sectionTitle}>Profile</div>
        <div className={styles.infoGrid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={busy}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="surname">
              Surname
            </label>
            <input
              id="surname"
              className={styles.input}
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Your surname"
              disabled={busy}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="cell">
              Cell
            </label>
            <input
              id="cell"
              className={styles.input}
              value={cell}
              onChange={(e) => setCell(e.target.value)}
              placeholder="+27…"
              disabled={busy}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnGhost}`}
            type="button"
            onClick={() => {
              if (!user) return;
              // Reset local fields to current server values
              setName(user.name || "");
              setSurname(user.surname || "");
              setCell(user.cellNumber || "");
              resetFeedback();
            }}
            disabled={busy}
          >
            Reset
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            type="button"
            onClick={handleSaveProfile}
            disabled={busy}
          >
            Save Changes
          </button>
        </div>

        <div className={styles.divider} />

        {/* Credentials */}
        <div className={styles.sectionTitle}>Credentials</div>
        <div className={styles.infoGrid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={busy}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="oldPassword">
              Old password
            </label>
            <input
              id="oldPassword"
              className={styles.password}
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              disabled={busy}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="newPassword">
              New password (optional)
            </label>
            <input
              id="newPassword"
              className={styles.password}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              disabled={busy}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            type="button"
            onClick={handleUpdateCredentials}
            disabled={busy}
          >
            Update Email/Password
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
