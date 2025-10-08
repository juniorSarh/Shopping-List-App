import Footer from '../components/Footer'

import Header from '../components/Header'
// import ShoppingListCard from '../components/shoppinglistCard';
import ShoppingLists from '../components/Shoppinglists';
export default function Dashboard() {
  return (
    <div>
      <Header />
      <ShoppingLists userId="users{id}" /> 
      {/* <ShoppingListCard listId={'123'} /> */}
      <Footer />
    </div>
  );
}
