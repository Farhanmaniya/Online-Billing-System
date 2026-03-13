import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import Skeleton from '../../components/Skeleton/Skeleton';
import styles from './Dashboard.module.css';

/**
 * Main Dashboard component displaying summary statistics.
 * Protected route accessible only to authenticated users.
 */
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/users/dashboard-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    { title: 'Total Customers', value: stats?.totalCustomers, icon: '👥' },
    { title: 'Total Products', value: stats?.totalProducts, icon: '📦' },
    { title: 'Total Invoices', value: stats?.totalInvoices, icon: '📄' },
    { title: 'Total Revenue', value: stats?.totalRevenue ? `₹${stats.totalRevenue}` : '₹0', icon: '💰' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <Navbar />
      <motion.div 
        className={styles.dashboardContainer}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className={styles.welcomeSection} variants={itemVariants}>
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to Online Billing System
          </motion.h1>
          <motion.p
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Hello, {user.name || 'User'}! Here's what's happening today.
          </motion.p>
        </motion.div>

        <motion.div className={styles.statsGrid} variants={containerVariants}>
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className={styles.statCard}>
                <Skeleton height="1.5rem" width="60%" className={styles.cardTitle} />
                <Skeleton height="3rem" width="80%" className={styles.cardValue} />
              </div>
            ))
          ) : (
            statItems.map((item, index) => (
              <motion.div 
                key={index} 
                className={styles.statCard}
                variants={itemVariants}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
              >
                <div className={styles.cardIcon}>{item.icon}</div>
                <div className={styles.cardTitle}>{item.title}</div>
                <div className={styles.cardValue}>{item.value}</div>
              </motion.div>
            ))
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default Dashboard;
