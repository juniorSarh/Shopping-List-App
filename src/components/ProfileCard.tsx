// In a component (e.g., Profile.tsx)
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../store";
import {
  fetchProfile,
  selectProfile,
//   updateProfile,
  updateCredentials,
} from "../features/profileSlice";
import { selectCurrentUser } from "../features/loginSlice";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector(selectProfile);
  const currentUser = useSelector(selectCurrentUser); // from your login slice

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchProfile(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);

  if (!currentUser) return <p>Please log in.</p>;
  if (loading && !user) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 520, margin: "2rem auto" }}>
      <h2>My Profile</h2>
      <div>Email: {user.email}</div>
      <div>Name: {user.name || ""}</div>
      <div>Surname: {user.surname || ""}</div>
      <div>Cell: {user.cellNumber || ""}</div>

      <hr />

      {/* <button
        onClick={() =>
          dispatch(
            updateProfile({
              userId: user.id!,
              data: { name: "Updated Name" },
            })
          )
        }
      >
        Update Name
      </button> */}

      <hr />
      <h3>Update Credentials</h3>
      <button
        onClick={() =>
          dispatch(
            updateCredentials({
              userId: user.id!,
              oldPassword: prompt("Old password") || "",
              newEmail: prompt("New email (or leave blank) || ''") || undefined,
              newPassword:
                prompt("New password (or leave blank) || ''") || undefined,
            })
          )
        }
      >
        Change Email/Password
      </button>
    </div>
  );
}
