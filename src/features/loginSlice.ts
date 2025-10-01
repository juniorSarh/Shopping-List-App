import { createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

/** ===== Types ===== */
export interface LoginForm {
  email: string;
  password: string;
}

export interface User {
  id: number | string;
  email: string;
  name: string;
  surname?: string;
  cellNumber?: string;
  // password?: string; // json-server demo only (don't store plaintext in prod)
}

export interface LoginState {
  form: LoginForm;
  loading: boolean;
  error: string | null;
  success: boolean;
  currentUser: User | null;
  token: string | null; // simulated
}

/** ===== Config ===== */
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/** ===== Helpers (optional persistence) ===== */
const LS_KEY = "session";
function saveSession(u: User, token: string) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ user: u, token }));
  } catch {
    // noop
    console.log("Failed to save session");
  }
}
function loadSession(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw) as { user: User; token: string };
    return { user: parsed.user, token: parsed.token };
  } catch {
    return { user: null, token: null };
  }
}
function clearSession() {
  localStorage.removeItem(LS_KEY);
}

/** ===== Async Thunks ===== */
export const submitLogin = createAsyncThunk<
  { user: User; token: string },
  LoginForm
>("login/submitLogin", async (payload, { rejectWithValue }) => {
  try {
    const url = `${API_BASE}/users?email=${encodeURIComponent(
      payload.email
    )}&password=${encodeURIComponent(payload.password)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to contact server");

    const list = (await res.json()) as User[];
    if (!Array.isArray(list) || list.length === 0) {
      return rejectWithValue("Invalid email or password") as unknown as {
        user: User;
        token: string;
      };
    }

    const user = list[0];
    // Simulate a token (json-server doesn't issue real tokens)
    const token = btoa(`${user.email}:${Date.now()}`);

    return { user, token };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Login failed";
    return rejectWithValue(msg) as unknown as { user: User; token: string };
  }
});

/** ===== Initial State ===== */
const session = loadSession();
const initialState: LoginState = {
  form: { email: "", password: "" },
  loading: false,
  error: null,
  success: false,
  currentUser: session.user,
  token: session.token,
};

/** ===== Slice ===== */
const loginSlice = createSlice({
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
    b.addCase(submitLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
      .addCase(submitLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        saveSession(action.payload.user, action.payload.token);
      })
      .addCase(submitLogin.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          (action.payload as string) || action.error.message || "Login failed";
        state.currentUser = null;
        state.token = null;
        clearSession();
      });
  },
});

/** Actions */
export const { updateField, resetForm, logout } = loginSlice.actions;

/** Selectors */
export const selectLogin = (s: RootState) => s.login;
export const selectLoginForm = (s: RootState) => s.login.form;
export const selectLoginLoading = (s: RootState) => s.login.loading;
export const selectLoginError = (s: RootState) => s.login.error;
export const selectLoginSuccess = (s: RootState) => s.login.success;
export const selectCurrentUser = (s: RootState) => s.login.currentUser;
export const selectLoginToken = (s: RootState) => s.login.token;

/** Reducer */
export default loginSlice.reducer;
