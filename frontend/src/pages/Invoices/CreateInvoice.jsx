import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import styles from './CreateInvoice.module.css';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { productId: '', quantity: 1, price: 0, name: '' }
  ]);
  const [taxRate, setTaxRate] = useState(0);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, productsRes] = await Promise.all([
          api.get('/customers'),
          api.get('/products')
        ]);
        setCustomers(customersRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load customers or products.');
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
      
      const payload = {
        customer: selectedCustomer,
        date,
        items: items.map(item => ({
          product: item.productId,
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price)
        })),
        tax: taxAmount
      };

      await api.post('/invoices', payload);
      navigate('/invoices'); // Redirect to invoices list (even if it doesn't exist yet, or dashboard)
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.response?.data?.message || 'Failed to create invoice.');
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
              <label>Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Status</label>
              <input type="text" value="Unpaid" readOnly />
            </div>
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
                        <option key={p._id} value={p._id}>{p.name}</option>
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
