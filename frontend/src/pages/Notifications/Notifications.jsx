import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './Notifications.module.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      // Handle both array response or object with notifications property
      const data = Array.isArray(response.data) ? response.data : response.data.notifications || [];
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, entityType, entityId, e) => {
    e.stopPropagation(); // Prevent triggering parent click if needed
    try {
      await api.patch(`/notifications/${id}/read`);
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));

      // Redirect if entity info is present
      if (entityType === 'Invoice' && entityId) {
        navigate(`/invoices/${entityId}`);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) return <div className="loading">Loading notifications...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={handleMarkAllRead} className={styles.markAllBtn}>
            Mark all as read
          </button>
        )}
      </div>

      <div className={styles.list}>
        {notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No notifications yet</h3>
            <p>We'll let you know when something important happens.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`${styles.notificationItem} ${notification.isRead ? styles.read : styles.unread}`}
              onClick={(e) => handleMarkAsRead(notification._id, notification.entityType, notification.entityId, e)}
            >
              <div className={styles.content}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>{notification.title}</span>
                  <span className={`${styles.badge} ${styles[notification.type || 'info']}`}>
                    {notification.type || 'info'}
                  </span>
                </div>
                <p className={styles.message}>{notification.message}</p>
                <span className={styles.time}>{formatTime(notification.createdAt)}</span>
              </div>
              {!notification.isRead && <div className={styles.statusDot} title="Unread" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
