import { useSelector } from "react-redux";
import type { RootState } from "./store";
import { selectCurrentUser } from "../src/features/loginSlice";

export function useAuth() {
  const user = useSelector(selectCurrentUser);
  const token = useSelector((s: RootState) => s.login.token);
  return { isAuthed: Boolean(user && token), user, token };
}
