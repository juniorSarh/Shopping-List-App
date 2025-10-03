import React from 'react'
import SignupForm from '../components/SignupForm'
import Footer from '../components/Footer'
import Navbar from '../components/NavBar'
export default function SignUp() {
  return (
    <div>
        <Navbar />
      <h1>SignUp Page</h1>
      <p>This is the SignUp page.</p>
      <SignupForm />
      <Footer />
    </div>
  )
}
