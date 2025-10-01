// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";

import registerReducer from "./features/registerSlice";
import loginReducer from "./features/loginSlice";


export const store = configureStore({
  reducer: { 
       register: registerReducer,
       login: loginReducer
   },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
