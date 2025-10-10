import { configureStore } from "@reduxjs/toolkit";
import shoppingListsReducer from "./features/shoppingListSlice";
import itemsReducer from "./features/itemsSlice";
import loginReducer from "./features/loginSlice";
import registerReducer from "./features/registerSlice";
import profileReducer from "./features/profileSlice";

export const store = configureStore({
  reducer: {
    login: loginReducer,
    register: registerReducer,
    profile: profileReducer,
    shoppingLists: shoppingListsReducer,
    items: itemsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
