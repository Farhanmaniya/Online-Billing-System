import React from 'react';
import Navbar from '../../components/Navbar';
import styles from './Dashboard.module.css';

/**
 * Main Dashboard component displaying summary statistics.
 * Protected route accessible only to authenticated users.
 */
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Static data as per requirements
  const stats = [
    { title: 'Total Customers', value: 125, icon: '👥' },
    { title: 'Total Products', value: 42, icon: '📦' },
    { title: 'Total Invoices', value: 89, icon: '📄' },
  ];

  return (
    <>
      <Navbar />
      <div className={styles.dashboardContainer}>
        <div className={styles.welcomeSection}>
          <h1>Welcome to Online Billing System</h1>
          <p>Hello, {user.name || 'User'}! Here's what's happening today.</p>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.cardIcon}>{stat.icon}</div>
              <div className={styles.cardTitle}>{stat.title}</div>
              <div className={styles.cardValue}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
