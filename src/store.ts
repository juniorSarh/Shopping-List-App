import { configureStore } from "@reduxjs/toolkit";
import shoppingListsReducer from "./features/shoppinglistSlice";
import itemsReducer from "./features/itemsSlice";
import loginReducer from "./features/loginSlice";

export const store = configureStore({
  reducer: {
    login: loginReducer,
    shoppingLists: shoppingListsReducer,
    items: itemsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
