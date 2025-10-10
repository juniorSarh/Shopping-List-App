import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/loginSlice";
import ShoppingLists from "../components/Shoppinglists";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function Dashboard() {
  const user = useSelector(selectCurrentUser)!;
  return (
    <div style={{ position: "relative", height:"100vh" }}>
      <Header />
      <div style={{display:'flex',flexDirection:'row'}}>
        <ShoppingLists userId={String(user.id)} />
      </div>
      <Outlet />
      <Footer />
    </div>
  );
}
