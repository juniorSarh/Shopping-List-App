import React from 'react'
import LoginForm from '../components/LoginForm'
import Footer from '../components/Footer'
import Navbar from '../components/NavBar'

export default function Login() {
  return (
    <div>
      <Navbar />
      <h1>LogIn Page</h1>
      <p>This is the LogIn page.</p>
      <LoginForm />
      <Footer />
    </div>
  )
}
