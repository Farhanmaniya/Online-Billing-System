import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import CustomerForm from './CustomerForm';
import api from '../../services/api';
import styles from './Customers.module.css';

const Customers = () => {
  // State for storing customer data
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for controlling the view (list or form)
  const [view, setView] = useState('list');
  
  // State for the customer currently being edited
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  // State for the delete confirmation dialog
  const [deleteId, setDeleteId] = useState(null);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers');
      setCustomers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Switch to form view for adding a new customer
  const handleAddClick = () => {
    setEditingCustomer(null);
    setView('form');
    setError(null);
  };

  // Switch to form view for editing an existing customer
  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setView('form');
    setError(null);
  };

  // Trigger delete confirmation
  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  // Confirm and execute deletion
  const confirmDelete = async () => {
    try {
      await api.delete(`/customers/${deleteId}`);
      setCustomers(prev => prev.filter(c => c._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Failed to delete customer. Please try again.');
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setDeleteId(null);
  };

  // Handle form submission (Add or Edit)
  const handleSave = async (data) => {
    try {
      setLoading(true);
      if (editingCustomer) {
        // Update existing customer
        const response = await api.put(`/customers/${editingCustomer._id}`, data);
        setCustomers(prev => prev.map(c => 
          c._id === editingCustomer._id ? response.data : c
        ));
      } else {
        // Add new customer
        const response = await api.post('/customers', data);
        setCustomers(prev => [...prev, response.data]);
      }
      setView('list');
      setError(null);
    } catch (err) {
      console.error('Error saving customer:', err);
      setError(err.response?.data?.message || 'Failed to save customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel form operation
  const handleCancelForm = () => {
    setView('list');
    setEditingCustomer(null);
    setError(null);
  };

  if (loading && customers.length === 0 && view === 'list') {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>Loading customers...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        {view === 'list' ? (
          <>
            <div className={styles.header}>
              <h1>Customers Management</h1>
              <button onClick={handleAddClick} className={styles.addButton}>
                + Add Customer
              </button>
            </div>

            {customers.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No customers available. Click "Add Customer" to create one.</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id}>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phone || '-'}</td>
                        <td>{customer.address || '-'}</td>
                        <td className={styles.actions}>
                          <button 
                            onClick={() => handleEditClick(customer)}
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(customer._id)}
                            className={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <CustomerForm 
            initialData={editingCustomer}
            onSubmit={handleSave}
            onCancel={handleCancelForm}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deleteId && (
          <div className={styles.overlay}>
            <div className={styles.confirmDialog}>
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
              <div className={styles.confirmActions}>
                <button onClick={cancelDelete} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={confirmDelete} className={styles.deleteButton}>
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Customers;
