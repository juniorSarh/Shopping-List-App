import React from 'react'
import { Link } from "react-router-dom";
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import styles from "../modules.css/home.module.css";


export default function Home() {
  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <h1 className={styles.title}>Home Page</h1>
        <p className={styles.lead}>Welcome to the Home page.</p>
        <p className={styles.copy}>Please sign up or log in to continue.</p>

        <div className={styles.actions}>
          <Link to="/signup" className={`${styles.btn} ${styles.btnPrimary}`}>
            Sign Up
          </Link>
          <Link to="/login" className={`${styles.btn} ${styles.btnGhost}`}>
            Log In
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
