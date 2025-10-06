// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";

import registerReducer from "./features/registerSlice";
import loginReducer from "./features/loginSlice";
import profileRecuder from "./features/profileSlice";
import shoppingReducer from "./features/shoppingSlice";


export const store = configureStore({
  reducer: { 
       register: registerReducer,
       login: loginReducer,
       profile: profileRecuder,
        shopping: shoppingReducer
   },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
