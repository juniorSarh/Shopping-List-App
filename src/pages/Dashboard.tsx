import React from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/NavBar'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div>
    <Navbar />
    <Link to="/profile">View Profile</Link>
      <h1>Dashboard Page</h1>
      <p>This is the Dashboard page.</p>
      <Footer />
    </div>
  )
}
