import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

/** Types */
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserState {
  current: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  current: null,
  token: null,
  isAuthenticated: false,
};

type AuthPayload = { user: User; token: string };
type UpdateUserPayload = Partial<Pick<User, "name" | "email">>;

/** Slice */
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Sign up success — set new user + token
    signup: (state, action: PayloadAction<AuthPayload>) => {
      state.current = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },

    // Login success — set user + token
    login: (state, action: PayloadAction<AuthPayload>) => {
      state.current = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },

    // Update user profile fields (name/email)
    updateUser: (state, action: PayloadAction<UpdateUserPayload>) => {
      if (!state.current) return;
      state.current = { ...state.current, ...action.payload };
    },
  },
});

/** Actions */
export const { signup, login, updateUser } = userSlice.actions;

export const selectUserState = (s: RootState) => s.user;
export const selectUser = (s: RootState) => s.user.current;
export const selectUserToken = (s: RootState) => s.user.token;
export const selectIsAuthenticated = (s: RootState) => s.user.isAuthenticated;
/** Reducer */
export default userSlice.reducer;
