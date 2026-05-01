import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from '../../services/api';
import axios from 'axios';
import styles from './PaymentSimulation.module.css';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
];

const PaymentSimulation = () => {
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Card form fields
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  // UPI field
  const [upiId, setUpiId] = useState('');
  // Net banking
  const [bank, setBank] = useState('SBI');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/public/invoices/${id}`);
        setInvoice(res.data);
      } catch {
        setError('Could not load invoice details.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const formatCard = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val) =>
    val.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');

  const handlePay = async () => {
    // Basic validations
    if (method === 'card') {
      if (card.number.replace(/\s/g, '').length < 16) return setError('Enter a valid 16-digit card number.');
      if (!card.name.trim()) return setError('Enter the cardholder name.');
      if (card.expiry.length < 5) return setError('Enter a valid expiry date (MM/YY).');
      if (card.cvv.length < 3) return setError('Enter a valid CVV.');
    }
    if (method === 'upi' && !upiId.includes('@')) return setError('Enter a valid UPI ID (e.g. name@upi).');

    setError('');
    setProcessing(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 2200));

    try {
      // Call real backend endpoint (simulated — marks invoice Paid)
      await axios.post(`${BASE_URL}/api/public/invoices/${id}/pay`);
      setSuccess(true);
    } catch {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className={styles.center}>Loading invoice...</div>;
  if (!invoice) return <div className={styles.center}>{error || 'Invoice not found.'}</div>;
  if (invoice.status === 'Paid') {
    return (
      <div className={styles.center}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✅</div>
          <h2>Already Paid</h2>
          <p>This invoice has already been marked as paid.</p>
          <button className={styles.doneBtn} onClick={() => window.close()}>Close Window</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div className={styles.center} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className={styles.successCard}>
          <motion.div
            className={styles.successIcon}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            🎉
          </motion.div>
          <h2>Payment Successful!</h2>
          <p>Invoice <strong>{invoice.invoiceNumber}</strong> has been marked as paid.</p>
          <p className={styles.amount}>₹{invoice.total.toFixed(2)}</p>
          <button className={styles.doneBtn} onClick={() => window.close()}>Close Window</button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Invoice Summary */}
        <div className={styles.summary}>
          <h2>Invoice Summary</h2>
          <div className={styles.summaryRow}><span>Invoice #</span><strong>{invoice.invoiceNumber}</strong></div>
          <div className={styles.summaryRow}><span>Customer</span><strong>{invoice.customer?.name}</strong></div>
          <div className={styles.summaryRow}><span>Subtotal</span><span>₹{invoice.subtotal?.toFixed(2)}</span></div>
          <div className={styles.summaryRow}><span>Tax</span><span>₹{(invoice.tax || 0).toFixed(2)}</span></div>
          <div className={`${styles.summaryRow} ${styles.total}`}><span>Total Due</span><strong>₹{invoice.total.toFixed(2)}</strong></div>
        </div>

        {/* Payment Form */}
        <div className={styles.form}>
          <h2>Complete Payment</h2>

          {/* Method Selector */}
          <div className={styles.methodGrid}>
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                className={`${styles.methodBtn} ${method === m.id ? styles.methodActive : ''}`}
                onClick={() => { setMethod(m.id); setError(''); }}
              >
                <span className={styles.methodIcon}>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Inputs per method */}
          <AnimatePresence mode="wait">
            <motion.div
              key={method}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {method === 'card' && (
                <div className={styles.inputs}>
                  <input className={styles.input} placeholder="Card Number" value={card.number}
                    onChange={e => setCard({ ...card, number: formatCard(e.target.value) })} />
                  <input className={styles.input} placeholder="Cardholder Name" value={card.name}
                    onChange={e => setCard({ ...card, name: e.target.value })} />
                  <div className={styles.row}>
                    <input className={styles.input} placeholder="MM/YY" value={card.expiry}
                      onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })} />
                    <input className={styles.input} placeholder="CVV" type="password" maxLength={4} value={card.cvv}
                      onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })} />
                  </div>
                </div>
              )}

              {method === 'upi' && (
                <div className={styles.inputs}>
                  <input className={styles.input} placeholder="Enter UPI ID (e.g. name@ybl)" value={upiId}
                    onChange={e => setUpiId(e.target.value)} />
                  <p className={styles.hint}>You'll be redirected to your UPI app to confirm payment (simulated).</p>
                </div>
              )}

              {method === 'netbanking' && (
                <div className={styles.inputs}>
                  <select className={styles.input} value={bank} onChange={e => setBank(e.target.value)}>
                    {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Punjab National Bank'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <p className={styles.hint}>You'll be redirected to {bank}'s net banking portal (simulated).</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p className={styles.error}>{error}</p>}

          <motion.button
            className={styles.payBtn}
            onClick={handlePay}
            disabled={processing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {processing ? (
              <span className={styles.spinner}>Processing...</span>
            ) : (
              `Pay ₹${invoice.total.toFixed(2)}`
            )}
          </motion.button>

          <p className={styles.secure}>🔒 This is a simulated payment for academic demo purposes only.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSimulation;
