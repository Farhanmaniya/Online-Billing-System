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
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count whenever location changes (user navigates)
  // In a real app, you might use WebSockets or Polling
  useEffect(() => {
    fetchUnreadCount();
  }, [location.pathname]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications?unreadOnly=true&limit=1');
      // Assuming the backend returns pagination info with total count
      // We need to adjust backend or just fetch all unread to count them if total not provided
      // Based on my backend implementation: 
      // return { notifications, pagination: { total, ... } }
      if (response.data.pagination) {
        setUnreadCount(response.data.pagination.total);
      } else if (Array.isArray(response.data)) {
         // Fallback if structure is different
         setUnreadCount(response.data.length);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

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
        <NavLink 
          to="/notifications" 
          className={({ isActive }) => `${styles.navItem} ${styles.notificationLink} ${isActive ? styles.active : ''}`}
        >
          Notifications
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </NavLink>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
