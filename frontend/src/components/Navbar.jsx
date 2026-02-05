import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import styles from './Navbar.module.css';

/**
 * Navigation component with responsive layout.
 * Includes links to Dashboard, Customers, Products, Invoices, and Notifications.
 * Handles logout with confirmation.
 */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>OBS</div>
      <div className={styles.navLinks}>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/customers" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          Customers
        </NavLink>
        <NavLink 
          to="/products" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          Products
        </NavLink>
        <NavLink 
          to="/invoices" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          Invoices
        </NavLink>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
