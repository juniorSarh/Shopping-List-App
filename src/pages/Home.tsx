import React from 'react'
import { Link } from "react-router-dom";


export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the Home page.</p>
      <p>Please sign up or log in to continue.</p>
      <button>
        {" "}
        <Link to="/signup">sign Up</Link>
      </button>

      <button>
        {" "}
        <Link to="/login">Log In</Link>
      </button>
    </div>
  );
}
