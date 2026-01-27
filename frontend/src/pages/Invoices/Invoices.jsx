import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';
import styles from './Invoices.module.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get('/invoices');
        setInvoices(response.data);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to load invoices.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Invoices</h1>
          <Link to="/invoices/create" className={styles.createBtn}>
            + Create New Invoice
          </Link>
        </div>

        {loading && <div className={styles.loading}>Loading invoices...</div>}
        {error && <div className={styles.error}>{error}</div>}
        
        {!loading && !error && invoices.length === 0 && (
          <div className={styles.empty}>
            <p>No invoices found. Create your first invoice!</p>
          </div>
        )}

        {!loading && !error && invoices.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id}>
                  <td>
                    <Link to={`/invoices/${invoice._id}`} style={{ color: '#3498db', fontWeight: 'bold', textDecoration: 'none' }}>
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td>{new Date(invoice.date).toLocaleDateString()}</td>
                  <td>{invoice.customer ? invoice.customer.name : 'Unknown'}</td>
                  <td>${invoice.total.toFixed(2)}</td>
                  <td>
                    <span className={`${styles.status} ${invoice.status === 'Paid' ? styles.statusPaid : styles.statusUnpaid}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default Invoices;
