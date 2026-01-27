import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ProductForm from './ProductForm';
import api from '../../services/api';
import styles from './Products.module.css';

const Products = () => {
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list');
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAddClick = () => {
    setEditingProduct(null);
    setView('form');
    setError(null);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setView('form');
    setError(null);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/products/${deleteId}`);
      setProducts(prev => prev.filter(p => p._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const handleSave = async (data) => {
    try {
      setIsSubmitting(true);
      if (editingProduct) {
        // Update
        const response = await api.put(`/products/${editingProduct._id}`, data);
        setProducts(prev => prev.map(p => 
          p._id === editingProduct._id ? response.data : p
        ));
      } else {
        // Create
        const response = await api.post('/products', data);
        setProducts(prev => [response.data, ...prev]);
      }
      setView('list');
      setError(null);
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.response?.data?.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setView('list');
    setEditingProduct(null);
    setError(null);
  };

  // Loading View
  if (loading && products.length === 0 && view === 'list') {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>Loading products...</div>
        </div>
      </>
    );
  }

  // Formatting helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        {view === 'list' ? (
          <>
            <div className={styles.header}>
              <h1>Products & Services</h1>
              <button onClick={handleAddClick} className={styles.addButton}>
                + Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No products available. Click "Add Product" to create one.</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{formatCurrency(product.price)}</td>
                        <td>{product.description || '-'}</td>
                        <td className={styles.actions}>
                          <button 
                            onClick={() => handleEditClick(product)}
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(product._id)}
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
          <ProductForm 
            initialData={editingProduct}
            onSubmit={handleSave}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deleteId && (
          <div className={styles.overlay}>
            <div className={styles.confirmDialog}>
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
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

export default Products;
