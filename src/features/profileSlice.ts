import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import bcrypt from "bcryptjs";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://shoppinglist-json-server.onrender.com";

/** ===== Types ===== */
export interface User {
  id: number | string;
  email: string;
  name?: string;
  surname?: string;
  cellNumber?: string;
  passwordHash?: string; // stored in json-server
}

export interface ProfileState {
  loading: boolean;
  error: string | null;
  user: User | null; // the profile you're viewing/editing
}

const initialState: ProfileState = {
  loading: false,
  error: null,
  user: null,
};

/** ===== Thunks ===== */

// View profile: GET /users/:id
export const fetchProfile = createAsyncThunk<
  User,
  number | string,
  { rejectValue: string }
>("profile/fetch", async (userId, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`);
    if (!res.ok) {
      return rejectWithValue(`Failed to load profile (HTTP ${res.status})`);
    }
    return (await res.json()) as User;
  } catch {
    return rejectWithValue("Failed to load profile");
  }
});

// Update profile fields (NOT credentials): PATCH /users/:id
export const updateProfile = createAsyncThunk<
  User,
  {
    userId: number | string;
    data: Partial<Pick<User, "name" | "surname" | "cellNumber">>;
  },
  { rejectValue: string }
>("profile/update", async ({ userId, data }, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      return rejectWithValue(`Failed to update profile (HTTP ${res.status})`);
    }
    return (await res.json()) as User;
  } catch {
    return rejectWithValue("Failed to update profile");
  }
});

// Update credentials (email and/or password)
// Steps:
// 1) fetch current user
// 2) verify oldPassword with bcrypt.compare
// 3) if newEmail, ensure it's not used by another user
// 4) if newPassword, bcrypt.hash it
// 5) PATCH /users/:id with { email?, passwordHash? }
export const updateCredentials = createAsyncThunk<
  User,
  {
    userId: number | string;
    oldPassword: string;
    newEmail?: string;
    newPassword?: string;
  },
  { rejectValue: string }
>("profile/updateCredentials", async (payload, { rejectWithValue }) => {
  const { userId, oldPassword, newEmail, newPassword } = payload;

  try {
    // 1) load user
    const userRes = await fetch(`${API_BASE}/users/${userId}`);
    if (!userRes.ok) return rejectWithValue("Failed to load user");
    const user = (await userRes.json()) as User;

    if (!user.passwordHash) return rejectWithValue("User has no password set");

    // 2) verify old password
    const ok = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!ok) return rejectWithValue("Old password is incorrect");

    // 3) duplicate email check (if changing email)
    if (newEmail && newEmail !== user.email) {
      const dupRes = await fetch(
        `${API_BASE}/users?email=${encodeURIComponent(newEmail)}`
      );
      if (!dupRes.ok)
        return rejectWithValue("Failed to check email uniqueness");
      const dup = (await dupRes.json()) as User[];
      const taken = dup.find((u) => String(u.id) !== String(userId));
      if (taken) return rejectWithValue("Email already in use");
    }

    // 4) compute new password hash (if changing password)
    let passwordHash: string | undefined = undefined;
    if (newPassword && newPassword.trim().length > 0) {
      passwordHash = await bcrypt.hash(newPassword, 12);
    }

    // 5) patch changes
    const patch: Partial<User> = {};
    if (newEmail && newEmail !== user.email) patch.email = newEmail;
    if (passwordHash) patch.passwordHash = passwordHash;

    if (Object.keys(patch).length === 0) {
      // nothing to update
      return user;
    }

    const updRes = await fetch(`${API_BASE}/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!updRes.ok)
      return rejectWithValue(
        `Failed to update credentials (HTTP ${updRes.status})`
      );

    const updated = (await updRes.json()) as User;
    return updated;
  } catch {
    return rejectWithValue("Failed to update credentials");
  }
});

/** ===== Slice ===== */
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile(state) {
      state.user = null;
      state.error = null;
      state.loading = false;
    },
    // Optionally allow local field edits before saving
    localEdit(state, action: PayloadAction<Partial<User>>) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchProfile.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(fetchProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Failed to load profile";
      })

      .addCase(updateProfile.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(updateProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Failed to update profile";
      })

      .addCase(updateCredentials.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateCredentials.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(updateCredentials.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || "Failed to update credentials";
      });
  },
});

export const { clearProfile, localEdit } = profileSlice.actions;
export const selectProfile = (s: RootState) => s.profile;
export default profileSlice.reducer;
