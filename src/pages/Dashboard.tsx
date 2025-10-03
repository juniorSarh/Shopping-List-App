import Footer from '../components/Footer'

import Header from '../components/Header'

export default function Dashboard() {
  return (
    <div>
      <Header />
      <div style={{ height: "650px" , textAlign: "center", paddingTop: "150px" }}>
        <h1>Dashboard Page</h1>
        <p>This is the Dashboard page.</p>
      </div>
      <Footer />
    </div>
  );
}
