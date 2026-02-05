import React, { useState, useEffect } from 'react';
import styles from './EmailStatus.module.css';

/**
 * EmailStatus Component
 * Displays the status of email sending with animations
 * 
 * @param {string} status - 'sending', 'success', 'error', 'idle'
 * @param {string} message - Optional message to display
 */
const EmailStatus = ({ status, message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status !== 'idle') {
      setIsVisible(true);
      
      // Auto-hide success message after 5 seconds
      if (status === 'success') {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [status]);

  if (!isVisible && status === 'idle') return null;

  return (
    <div className={`${styles.container} ${styles[status]} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.iconContainer}>
        {status === 'sending' && (
          <div className={styles.spinner}>
            <div className={styles.bounce1}></div>
            <div className={styles.bounce2}></div>
            <div className={styles.bounce3}></div>
          </div>
        )}
        {status === 'success' && (
          <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none"/>
            <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        )}
        {status === 'error' && (
          <svg className={styles.cross} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className={styles.crossCircle} cx="26" cy="26" r="25" fill="none"/>
            <path className={styles.crossPath} fill="none" d="M16 16 36 36 M36 16 16 36"/>
          </svg>
        )}
      </div>
      <div className={styles.content}>
        <span className={styles.title}>
          {status === 'sending' && 'Sending Email...'}
          {status === 'success' && 'Email Sent'}
          {status === 'error' && 'Sending Failed'}
        </span>
        {message && <span className={styles.message}>{message}</span>}
      </div>
    </div>
  );
};

export default EmailStatus;
