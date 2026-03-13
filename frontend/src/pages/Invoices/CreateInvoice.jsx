import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import EmailStatus from '../../components/EmailStatus/EmailStatus';
import styles from './CreateInvoice.module.css';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ status: 'idle', message: '' });
  const [profileComplete, setProfileComplete] = useState(true);

  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [items, setItems] = useState([
    { productId: '', quantity: 1, price: 0, name: '' }
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [currency, setCurrency] = useState('INR');
  const [taxType, setTaxType] = useState('Standard');

  // Auto-calculate Due Date when Date or Terms change
  useEffect(() => {
    if (date && paymentTerms) {
      const issueDate = new Date(date);
      let daysToAdd = 0;
      
      if (paymentTerms === 'Net 7') daysToAdd = 7;
      else if (paymentTerms === 'Net 15') daysToAdd = 15;
      else if (paymentTerms === 'Net 30') daysToAdd = 30;
      else if (paymentTerms === 'Net 60') daysToAdd = 60;
      else if (paymentTerms === 'Due on Receipt') daysToAdd = 0;
      
      const newDueDate = new Date(issueDate);
      newDueDate.setDate(newDueDate.getDate() + daysToAdd);
      setDueDate(newDueDate.toISOString().split('T')[0]);
    }
  }, [date, paymentTerms]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, productsRes, profileRes] = await Promise.all([
          api.get('/customers'),
          api.get('/products'),
          api.get('/users/profile')
        ]);
        setCustomers(customersRes.data);
        setProducts(productsRes.data);
        
        // Check if profile is complete
        const { companyName, businessAddress } = profileRes.data;
        if (!companyName || !businessAddress) {
          setProfileComplete(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load customers, products, or profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculations
  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = sub * (taxRate / 100);
    return {
      subtotal: sub,
      taxAmount: tax,
      total: sub + tax
    };
  }, [items, taxRate]);

  // Handlers
  const handleCustomerChange = (e) => {
    setSelectedCustomer(e.target.value);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      newItems[index] = {
        ...newItems[index],
        productId: value,
        name: product ? product.name : '',
        price: product ? product.price : 0
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0, name: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileComplete) {
      setError('Please complete your business profile in Settings before creating invoices.');
      return;
    }
    if (!selectedCustomer) {
      setError('Please select a customer.');
      return;
    }
    if (items.some(item => !item.productId || item.quantity < 1)) {
      setError('Please ensure all items have a product and valid quantity.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Show sending animation
      setEmailStatus({ status: 'sending', message: 'Generating invoice and sending email...' });
      
      const payload = {
        customer: selectedCustomer,
        date,
        dueDate,
        paymentTerms,
        isRecurring,
        frequency: isRecurring ? frequency : undefined,
        currency,
        taxType,
        items: items.map(item => ({
          product: item.productId,
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price)
        })),
        tax: taxAmount,
        status: 'Unpaid'
      };

      await api.post('/invoices', payload);
      
      // Show success and redirect
      setEmailStatus({ status: 'success', message: 'Invoice created and email sent!' });
      setTimeout(() => {
        navigate('/invoices');
      }, 2000); // Wait 2 seconds before redirecting
      
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.response?.data?.message || 'Failed to create invoice.');
      setEmailStatus({ status: 'error', message: 'Failed to create invoice.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading data...</div>;

  const selectedCustomerDetails = customers.find(c => c._id === selectedCustomer);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <EmailStatus status={emailStatus.status} message={emailStatus.message} />
        
        {!profileComplete && (
          <div style={{ padding: '1rem', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #ffeeba' }}>
            <strong>Attention:</strong> Your business profile is incomplete. 
            <button 
              onClick={() => navigate('/settings')}
              style={{ marginLeft: '1rem', background: 'none', border: 'none', color: '#856404', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
            >
              Go to Settings to complete setup
            </button>
          </div>
        )}

        <div className={styles.header}>
        <h2>Create New Invoice</h2>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Customer Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>Customer Details</div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Select Customer</label>
              <select 
                value={selectedCustomer} 
                onChange={handleCustomerChange}
                required
              >
                <option value="">-- Select Customer --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            {selectedCustomerDetails && (
              <div className={styles.formGroup}>
                <label>Contact Info</label>
                <input 
                  type="text" 
                  value={`${selectedCustomerDetails.email} | ${selectedCustomerDetails.phone}`} 
                  readOnly 
                />
              </div>
            )}
          </div>
        </div>

        {/* Invoice Meta */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>Invoice Details</div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Invoice Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Payment Terms</label>
              <select 
                value={paymentTerms} 
                onChange={(e) => setPaymentTerms(e.target.value)}
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 7">Net 7</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Due Date</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                required 
              />
            </div>
          </div>
        </div>

        {/* Billing Options: Currency, Recurring, Tax Type */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>Billing Options</div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD (US Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
                <option value="GBP">£ GBP (British Pound)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Tax Type</label>
              <select value={taxType} onChange={e => setTaxType(e.target.value)}>
                <option value="Standard">Standard</option>
                <option value="GST">GST (India)</option>
                <option value="VAT">VAT (EU/UK)</option>
                <option value="Sales Tax">Sales Tax (US)</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={e => setIsRecurring(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Recurring Invoice
              </label>
            </div>
            {isRecurring && (
              <div className={styles.formGroup}>
                <label>Billing Frequency</label>
                <select value={frequency} onChange={e => setFrequency(e.target.value)}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Items Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>Invoice Items</div>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Product</th>
                <th style={{ width: '15%' }}>Price</th>
                <th style={{ width: '15%' }}>Quantity</th>
                <th style={{ width: '20%' }}>Total</th>
                <th style={{ width: '10%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.stockQuantity ?? 0} in stock)
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={item.price} 
                      readOnly 
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      required 
                    />
                  </td>
                  <td>
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                  <td>
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className={styles.removeBtn}
                      disabled={items.length === 1}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addItem} className={styles.addItemBtn}>
            + Add Item
          </button>
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Tax Rate (%):</span>
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={taxRate} 
              onChange={(e) => setTaxRate(Number(e.target.value))}
              style={{ width: '60px', padding: '0.25rem' }}
            />
          </div>
          <div className={styles.summaryRow}>
            <span>Tax Amount:</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Grand Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')} 
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default CreateInvoice;
