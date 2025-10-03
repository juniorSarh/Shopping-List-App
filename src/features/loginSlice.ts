// src/features/loginSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import bcrypt from "bcryptjs";

export interface LoginForm {
  email: string;
  password: string;
}
export interface User {
  id: number | string;
  email: string;
  name?: string;
  surname?: string;
  cellNumber?: string;
  passwordHash?: string;
}
type LoginResponse = { user: User; accessToken: string };

export interface LoginState {
  form: LoginForm;
  loading: boolean;
  error: string | null;
  success: boolean;
  currentUser: User | null;
  token: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const LS_KEY = "session";
function saveSession(u: User, token: string) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ user: u, token }));
  } catch {
    console.log("Could not save session");
  }
}
function loadSession(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw) as { user: User; token: string };
    return parsed;
  } catch {
    return { user: null, token: null };
  }
}
function clearSession() {
  localStorage.removeItem(LS_KEY);
}

export const submitLogin = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await fetch(
      `${API_BASE}/users?email=${encodeURIComponent(email)}`
    );
    if (!res.ok) return rejectWithValue("Failed to query user");
    const arr = (await res.json()) as User[];
    const user = arr[0];
    if (!user || !user.passwordHash)
      return rejectWithValue("Invalid credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return rejectWithValue("Invalid credentials");

    const accessToken = btoa(
      `uid:${user.id};email:${user.email};ts:${Date.now()}`
    );
    return { user, accessToken };
  } catch {
    return rejectWithValue("Login failed");
  }
});

const session = loadSession();
const initialState: LoginState = {
  form: { email: "", password: "" },
  loading: false,
  error: null,
  success: false,
  currentUser: session.user,
  token: session.token,
};

const slice = createSlice({
  name: "login",
  initialState,
  reducers: {
    updateField: (
      state,
      action: PayloadAction<{ field: keyof LoginForm; value: string }>
    ) => {
      state.form[action.payload.field] = action.payload.value;
    },
    resetForm: (state) => {
      state.form = { email: "", password: "" };
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.success = false;
      clearSession();
    },
  },
  extraReducers: (b) => {
    b.addCase(submitLogin.pending, (s) => {
      s.loading = true;
      s.error = null;
      s.success = false;
    })
      .addCase(submitLogin.fulfilled, (s, a) => {
        s.loading = false;
        s.success = true;
        s.currentUser = a.payload.user;
        s.token = a.payload.accessToken;
        saveSession(a.payload.user, a.payload.accessToken);
        s.form.password = ""; // clear sensitive value
      })
      .addCase(submitLogin.rejected, (s, a) => {
        s.loading = false;
        s.success = false;
        s.error = a.payload || "Login failed";
        s.currentUser = null;
        s.token = null;
        clearSession();
      });
  },
});

export const { updateField, resetForm, logout } = slice.actions;
export const selectLogin = (s: RootState) => s.login;
export const selectLoginForm = (s: RootState) => s.login.form;
export const selectLoginLoading = (s: RootState) => s.login.loading;
export const selectLoginError = (s: RootState) => s.login.error;
export const selectLoginSuccess = (s: RootState) => s.login.success;
export default slice.reducer;
