import Footer from '../components/Footer'

import Header from '../components/Header'
import ShoppingLists from '../components/Shoppinglists';

export default function Dashboard() {
  return (
    <div>
      <Header />
      <ShoppingLists userId="users{id}" />
      <Footer />
    </div>
  );
}
