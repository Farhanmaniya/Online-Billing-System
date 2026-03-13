import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import styles from './InvoiceDetail.module.css';

const InvoiceDetail = () => {
  const { id } = useParams();
  const isPublicPay = window.location.pathname.startsWith('/pay/');
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });
  const [onlineDetails, setOnlineDetails] = useState({
    reference: ''
  });
  const [netbankingDetails, setNetbankingDetails] = useState({
    bank: '',
    accountName: '',
    last4: ''
  });

  useEffect(() => {
    fetchInvoice();
  }, [id, isPublicPay, fetchInvoice]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      if (isPublicPay) {
        const res = await fetch(`http://localhost:5000/api/public/invoices/${id}`);
        if (!res.ok) {
          throw new Error('Failed to load public invoice');
        }
        const data = await res.json();
        setInvoice(data);
      } else {
        const response = await api.get(`/invoices/${id}`);
        setInvoice(response.data);
      }
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

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      const digitsOnly = cardDetails.number.replace(/\s+/g, '');
      if (!cardDetails.name.trim()) return 'Card holder name is required.';
      if (!/^\d{16}$/.test(digitsOnly)) return 'Card number must be 16 digits.';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry)) return 'Expiry must be in MM/YY format.';
      if (!/^\d{3,4}$/.test(cardDetails.cvv)) return 'CVV must be 3 or 4 digits.';
    }
    if (paymentMethod === 'online') {
      if (!onlineDetails.reference.trim()) return 'Payment reference is required for online payment.';
    }
    if (paymentMethod === 'netbanking') {
      if (!netbankingDetails.bank) return 'Please select a bank.';
      if (!netbankingDetails.accountName.trim()) return 'Account holder name is required.';
      if (!/^\d{4}$/.test(netbankingDetails.last4)) return 'Last 4 digits of account number are required.';
    }
    return '';
  };

  const handleMockPayment = async () => {
    if (!invoice || invoice.status === 'Paid') return;
    setPaymentError('');
    setPaymentSuccess(false);

    const validationError = validatePayment();
    if (validationError) {
      setPaymentError(validationError);
      return;
    }

    try {
      setPaymentProcessing(true);
      if (isPublicPay) {
        const res = await fetch(`http://localhost:5000/api/public/invoices/${id}/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          throw new Error('Failed to record public payment');
        }
        const data = await res.json();
        setInvoice(data);
      } else {
        const response = await api.put(`/invoices/${id}/status`, { status: 'Paid' });
        setInvoice(response.data);
      }
      setPaymentSuccess(true);
    } catch (err) {
      console.error('Error processing mock payment:', err);
      setPaymentError('Failed to record payment. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading Invoice...</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className={styles.error}>
        <h3>Unable to load invoice</h3>
        <p>{error}</p>
        <button onClick={fetchInvoice} className={styles.retryBtn}>Try Again</button>
        <div style={{ marginTop: '1rem' }}>
          <Link to="/invoices">Return to Invoices</Link>
        </div>
      </div>
    </>
  );

  if (!invoice) return null;

  const { customer, items, subtotal, tax, total, invoiceNumber, date, status, userId } = invoice;
  const sender = userId || {};
  const logoUrl = sender.companyLogo ? `http://localhost:5000${sender.companyLogo}` : null;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        
        {/* Actions Bar - Hidden in Print */}
        <div className={styles.actionsBar}>
          <button onClick={handlePrint} className={`${styles.actionBtn} ${styles.printBtn}`}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Invoice
          </button>
          <button 
            onClick={handleStatusToggle} 
            disabled={updating}
            className={`${styles.actionBtn} ${styles.statusBtn}`}
          >
            {updating ? 'Updating...' : `Mark as ${status === 'Paid' ? 'Unpaid' : 'Paid'}`}
          </button>
        </div>

        {/* Invoice Paper */}
        <div className={styles.invoicePaper}>
          
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.logoSection}>
              {logoUrl ? (
                <img src={logoUrl} alt={sender.companyName} style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain' }} />
              ) : (
                <h1>{sender.companyName || 'ONLINE BILLING'}</h1>
              )}
              {!logoUrl && <p>Professional Invoicing</p>}
            </div>
            <div className={styles.invoiceMeta}>
              <h2>INVOICE</h2>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Invoice No:</span>
                <span className={styles.metaValue}>{invoiceNumber || invoice._id}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Date Issued:</span>
                <span className={styles.metaValue}>{new Date(date).toLocaleDateString()}</span>
              </div>
              {invoice.dueDate && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Due Date:</span>
                  <span className={styles.metaValue}>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              {invoice.paymentTerms && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Terms:</span>
                  <span className={styles.metaValue}>{invoice.paymentTerms}</span>
                </div>
              )}
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Status:</span>
                <span className={`${styles.statusBadge} ${styles[`status${status}`]}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className={styles.addresses}>
            <div className={styles.addressCol}>
              <h3>Billed To:</h3>
              <h4>{customer ? customer.name : 'Valued Customer'}</h4>
              <p>{customer ? customer.email : ''}</p>
              {customer && customer.phone && <p>{customer.phone}</p>}
              {customer && customer.address && <p>{customer.address}</p>}
            </div>
            <div className={styles.addressCol} style={{ textAlign: 'right' }}>
              <h3>Pay To:</h3>
              <h4>{sender.companyName || 'Online Billing System'}</h4>
              <p style={{ whiteSpace: 'pre-line' }}>{sender.businessAddress || 'Please update your business settings'}</p>
              <p>{sender.email}</p>
              {sender.phoneNumber && <p>{sender.phoneNumber}</p>}
              {sender.taxId && <p>Tax ID: {sender.taxId}</p>}
            </div>
          </div>

          {/* Items Table */}
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className={styles.summarySection}>
            <div className={styles.summaryTable}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Subtotal</span>
                <span className={styles.summaryValue}>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Tax (10%)</span>
                <span className={styles.summaryValue}>${tax.toFixed(2)}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span className={styles.summaryLabel}>Total Due</span>
                <span className={styles.summaryValue}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Mock Payment Section */}
          {status !== 'Paid' && (
            <div className={styles.paymentSection}>
              <div className={styles.paymentHeader}>
                <h3>Pay this invoice (demo)</h3>
                <button
                  type="button"
                  className={styles.paymentToggle}
                  onClick={() => setShowPayment(!showPayment)}
                >
                  {showPayment ? 'Hide payment options' : 'Show payment options'}
                </button>
              </div>

              {showPayment && (
                <>
                  <p className={styles.paymentIntro}>
                    Choose a mock payment method. This does not use real card or bank data,
                    but it will update the invoice status to Paid for demonstration.
                  </p>

                  <div className={styles.paymentMethods}>
                    <button
                      type="button"
                      className={`${styles.paymentMethodBtn} ${paymentMethod === 'card' ? styles.paymentMethodBtnActive : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      Pay with Card
                    </button>
                    <button
                      type="button"
                      className={`${styles.paymentMethodBtn} ${paymentMethod === 'online' ? styles.paymentMethodBtnActive : ''}`}
                      onClick={() => setPaymentMethod('online')}
                    >
                      Online / QR Pay
                    </button>
                    <button
                      type="button"
                      className={`${styles.paymentMethodBtn} ${paymentMethod === 'netbanking' ? styles.paymentMethodBtnActive : ''}`}
                      onClick={() => setPaymentMethod('netbanking')}
                    >
                      Netbanking
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className={styles.paymentMethodPanel}>
                      <div className={styles.paymentFieldGroup}>
                        <label>Card Holder Name</label>
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        />
                      </div>
                      <div className={styles.paymentFieldGroup}>
                        <label>Card Number</label>
                        <input
                          type="text"
                          placeholder="16 digits"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        />
                      </div>
                      <div className={styles.paymentFieldRow}>
                        <div className={styles.paymentFieldGroup}>
                          <label>Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          />
                        </div>
                        <div className={styles.paymentFieldGroup}>
                          <label>CVV</label>
                          <input
                            type="password"
                            placeholder="3-4 digits"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'online' && (
                    <div className={styles.paymentMethodPanel}>
                      <div className={styles.qrPlaceholder}>
                        <span>QR CODE DEMO</span>
                        <small>Mock ID: {String(invoice._id).slice(-8)}</small>
                      </div>
                      <div className={styles.paymentFieldGroup}>
                        <label>Payment Reference</label>
                        <input
                          type="text"
                          placeholder="Enter mock transaction/reference ID"
                          value={onlineDetails.reference}
                          onChange={(e) => setOnlineDetails({ ...onlineDetails, reference: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className={styles.paymentMethodPanel}>
                      <div className={styles.paymentFieldGroup}>
                        <label>Select Bank</label>
                        <select
                          value={netbankingDetails.bank}
                          onChange={(e) => setNetbankingDetails({ ...netbankingDetails, bank: e.target.value })}
                        >
                          <option value="">-- Choose a bank --</option>
                          <option value="Bank of Demo">Bank of Demo</option>
                          <option value="Global Test Bank">Global Test Bank</option>
                          <option value="Academic National Bank">Academic National Bank</option>
                        </select>
                      </div>
                      <div className={styles.paymentFieldGroup}>
                        <label>Account Holder Name</label>
                        <input
                          type="text"
                          value={netbankingDetails.accountName}
                          onChange={(e) => setNetbankingDetails({ ...netbankingDetails, accountName: e.target.value })}
                        />
                      </div>
                      <div className={styles.paymentFieldGroup}>
                        <label>Last 4 digits of Account Number</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={netbankingDetails.last4}
                          onChange={(e) => setNetbankingDetails({ ...netbankingDetails, last4: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {paymentError && (
                    <div className={styles.paymentError}>
                      {paymentError}
                    </div>
                  )}
                  {paymentSuccess && (
                    <div className={styles.paymentSuccess}>
                      Payment recorded successfully. Invoice status is now Paid.
                    </div>
                  )}

                  <div className={styles.paymentActions}>
                    <button
                      type="button"
                      className={styles.paymentSubmitBtn}
                      onClick={handleMockPayment}
                      disabled={paymentProcessing}
                    >
                      {paymentProcessing ? 'Processing...' : 'Confirm Mock Payment'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Footer */}
          <div className={styles.footer}>
            <p>Thank you for your business!</p>
            <p>Please make checks payable to Online Billing System. Payment is due within 30 days.</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default InvoiceDetail;
