import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import styles from './InvoiceDetail.module.css';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/invoices/${id}`);
      setInvoice(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError('Failed to load invoice details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!invoice) return;

    const newStatus = invoice.status === 'Paid' ? 'Unpaid' : 'Paid';
    const confirmMsg = `Are you sure you want to mark this invoice as ${newStatus}?`;

    if (window.confirm(confirmMsg)) {
      try {
        setUpdating(true);
        const response = await api.put(`/invoices/${id}/status`, { status: newStatus });
        setInvoice(response.data);
      } catch (err) {
        console.error('Error updating status:', err);
        alert('Failed to update invoice status.');
      } finally {
        setUpdating(false);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <>
      <Navbar />
      <div className={styles.loading}>Loading Invoice...</div>
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className={styles.error}>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchInvoice} className={styles.retryBtn}>Retry</button>
        <div style={{ marginTop: '1rem' }}>
          <Link to="/invoices">Back to Invoices</Link>
        </div>
      </div>
    </>
  );

  if (!invoice) return null;

  const { customer, items, subtotal, tax, total, invoiceNumber, date, status } = invoice;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>{invoiceNumber}</h1>
            <div className={styles.date}>
              Issued: {new Date(date).toLocaleDateString()}
            </div>
          </div>
          <div className={styles.statusSection}>
            <span className={`${styles.statusBadge} ${styles[`status${status}`]}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className={styles.customerSection}>
          <div className={styles.customerInfo}>
            <h3>Bill To:</h3>
            <div className={styles.customerName}>{customer?.name || 'Unknown Customer'}</div>
            <div className={styles.contactDetails}>
              {customer?.email && (
                <a href={`mailto:${customer.email}`}>{customer.email}</a>
              )}
              {customer?.phone && (
                <a href={`tel:${customer.phone}`}>{customer.phone}</a>
              )}
              {customer?.address && (
                <div style={{ whiteSpace: 'pre-line', marginTop: '0.5rem' }}>
                  {customer.address}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className={styles.tableContainer}>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th style={{ width: '50%' }}>Item Description</th>
                <th className={styles.textRight} style={{ width: '15%' }}>Price</th>
                <th className={styles.textCenter} style={{ width: '15%' }}>Qty</th>
                <th className={styles.textRight} style={{ width: '20%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td className={styles.textRight}>${item.price.toFixed(2)}</td>
                  <td className={styles.textCenter}>{item.quantity}</td>
                  <td className={styles.textRight}>${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div className={styles.summaryRow}>
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            )}
            <div className={styles.grandTotal}>
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Link to="/invoices" className={styles.backBtn}>
            ← Back to List
          </Link>
          <div className={styles.primaryActions}>
            <button onClick={handlePrint} className={styles.printBtn}>
              Print / PDF
            </button>
            <button 
              onClick={handleStatusToggle} 
              disabled={updating}
              className={`${styles.statusBtn} ${status === 'Paid' ? styles.markUnpaid : styles.markPaid}`}
            >
              {updating ? 'Updating...' : (status === 'Paid' ? 'Mark as Unpaid' : 'Mark as Paid')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceDetail;
