// src/features/registerSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import bcrypt from "bcryptjs";

export interface RegisterForm {
  email: string;
  password: string;
  name: string;
  surname: string;
  cellNumber: string;
}

export interface User {
  id: number | string;
  email: string;
  name: string;
  surname: string;
  cellNumber: string;
  passwordHash?: string; // stored in json-server
}

export interface RegisterState {
  form: RegisterForm;
  loading: boolean;
  error: string | null;
  success: boolean;
  createdUser: User | null;
  token: string | null; // fake token for demo
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const submitRegistration = createAsyncThunk<
  { user: User; accessToken: string },
  RegisterForm,
  { rejectValue: string }
>("register/submit", async (payload, { rejectWithValue }) => {
  try {
    // 1) duplicate email?
    const dup = await fetch(
      `${API_BASE}/users?email=${encodeURIComponent(payload.email)}`
    );
    if (!dup.ok) return rejectWithValue("Failed to check duplicates");
    const arr = (await dup.json()) as User[];
    if (arr.length > 0) return rejectWithValue("Email already registered");

    // 2) hash on the client (prototype only)
    const passwordHash = await bcrypt.hash(payload.password, 12);

    // 3) create user in json-server (store hash, not password)
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        name: payload.name,
        surname: payload.surname,
        cellNumber: payload.cellNumber,
        passwordHash,
      }),
    });
    if (!res.ok) return rejectWithValue("Failed to register user");
    const user = (await res.json()) as User;

    // 4) make a fake token (for demo)
    const accessToken = btoa(
      `uid:${user.id};email:${user.email};ts:${Date.now()}`
    );

    return { user, accessToken };
  } catch (e) {
    console.log("Registration error", e);
    return rejectWithValue("Registration failed");
  }
});

const initialState: RegisterState = {
  form: { email: "", password: "", name: "", surname: "", cellNumber: "" },
  loading: false,
  error: null,
  success: false,
  createdUser: null,
  token: null,
};

const slice = createSlice({
  name: "register",
  initialState,
  reducers: {
    updateField: (
      state,
      action: PayloadAction<{ field: keyof RegisterForm; value: string }>
    ) => {
      state.form[action.payload.field] = action.payload.value;
    },
    resetForm: (state) => {
      state.form = initialState.form;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.createdUser = null;
      state.token = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(submitRegistration.pending, (s) => {
      s.loading = true;
      s.error = null;
      s.success = false;
    })
      .addCase(submitRegistration.fulfilled, (s, a) => {
        s.loading = false;
        s.success = true;
        s.createdUser = a.payload.user;
        s.token = a.payload.accessToken;
        s.form.password = ""; // clear sensitive value
      })
      .addCase(submitRegistration.rejected, (s, a) => {
        s.loading = false;
        s.success = false;
        s.error = a.payload || "Registration failed";
      });
  },
});

export const { updateField, resetForm } = slice.actions;
export const selectRegister = (s: RootState) => s.register;
export const selectRegisterForm = (s: RootState) => s.register.form;
export const selectRegisterLoading = (s: RootState) => s.register.loading;
export const selectRegisterError = (s: RootState) => s.register.error;
export const selectRegisterSuccess = (s: RootState) => s.register.success;

export default slice.reducer;
