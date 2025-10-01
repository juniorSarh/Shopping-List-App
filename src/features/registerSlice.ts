import { createSlice, createAsyncThunk,  } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

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
  password?: string;
  name: string;
  surname: string;
  cellNumber: string;
}

export interface RegisterState {
  form: RegisterForm;
  loading: boolean;
  error: string | null;
  success: boolean;
  createdUser: User | null;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const submitRegistration = createAsyncThunk<User, RegisterForm>(
  "register/submitRegistration",
  async (payload, { rejectWithValue }) => {
    try {
      const dupRes = await fetch(
        `${API_BASE}/users?email=${encodeURIComponent(payload.email)}`
      );
      if (!dupRes.ok) throw new Error("Failed to validate email");
      const existing = (await dupRes.json()) as User[];
      if (existing.length > 0) {
        return rejectWithValue("Email already registered") as unknown as User;
      }

      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to register");
      return (await res.json()) as User;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      return rejectWithValue(msg) as unknown as User;
    }
  }
);

const initialState: RegisterState = {
  form: { email: "", password: "", name: "", surname: "", cellNumber: "" },
  loading: false,
  error: null,
  success: false,
  createdUser: null,
};

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    updateField: (
      state,
      action: PayloadAction<{ field: keyof RegisterForm; value: string }>
    ) => {
      state.form[action.payload.field] = action.payload.value;
    },
    setForm: (state, action: PayloadAction<RegisterForm>) => {
      state.form = action.payload;
    },
    resetForm: (state) => {
      state.form = initialState.form;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.createdUser = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(submitRegistration.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
      .addCase(submitRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdUser = action.payload;
      })
      .addCase(submitRegistration.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Registration failed";
      });
  },
});

export const { updateField, setForm, resetForm } = registerSlice.actions;

export const selectRegister = (s: RootState) => s.register;
export const selectRegisterForm = (s: RootState) => s.register.form;
export const selectRegisterLoading = (s: RootState) => s.register.loading;
export const selectRegisterError = (s: RootState) => s.register.error;
export const selectRegisterSuccess = (s: RootState) => s.register.success;
export const selectCreatedUser = (s: RootState) => s.register.createdUser;

export default registerSlice.reducer;
