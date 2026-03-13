import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import ProductForm from './ProductForm';
import api from '../../services/api';
import styles from './Products.module.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list');
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileInputRef = useRef(null);

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

  const handleAddClick = () => { setEditingProduct(null); setView('form'); setError(null); };
  const handleEditClick = (product) => { setEditingProduct(product); setView('form'); setError(null); };
  const handleDeleteClick = (id) => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);

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

  const handleSave = async (data) => {
    try {
      setIsSubmitting(true);
      if (editingProduct) {
        const response = await api.put(`/products/${editingProduct._id}`, data);
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? response.data : p));
      } else {
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

  const handleCancelForm = () => { setView('list'); setEditingProduct(null); setError(null); };

  // CSV Import handler
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());

      let imported = 0;
      let failed = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        const row = {};
        headers.forEach((h, idx) => { row[h] = values[idx]; });

        if (!row.name || !row.price) { failed++; continue; }

        try {
          const response = await api.post('/products', {
            name: row.name,
            price: parseFloat(row.price) || 0,
            description: row.description || '',
            stockQuantity: parseInt(row.stock || row.stockquantity || 0),
            lowStockThreshold: parseInt(row.threshold || row.lowstockthreshold || 5),
          });
          setProducts(prev => [response.data, ...prev]);
          imported++;
        } catch {
          failed++;
        }
      }

      setImportMsg(`✅ Imported ${imported} products${failed ? `, ${failed} failed` : ''}.`);
      setTimeout(() => setImportMsg(''), 4000);
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  if (loading && products.length === 0 && view === 'list') {
    return (<><Navbar /><div className={styles.container}><div className={styles.loading}>Loading products...</div></div></>);
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {importMsg && (
          <div className={styles.errorMessage} style={{ background: '#d4edda', color: '#155724', borderColor: '#c3e6cb' }}>
            {importMsg}
          </div>
        )}

        {view === 'list' ? (
          <>
            <div className={styles.header}>
              <h1>Products &amp; Services</h1>
              <div className={styles.headerActions}>
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} style={{ display: 'none' }} />
                <button onClick={() => fileInputRef.current.click()} className={styles.importBtn}>⬆ Import CSV</button>
                <button onClick={handleAddClick} className={styles.addButton}>+ Add Product</button>
              </div>
            </div>

            {products.length === 0 ? (
              <div className={styles.emptyState}><p>No products available. Click "Add Product" to create one.</p></div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{formatCurrency(product.price)}</td>
                        <td>
                          {product.stockQuantity}
                          {product.stockQuantity <= product.lowStockThreshold && (
                            <span className={styles.lowStockBadge}>Low Stock</span>
                          )}
                        </td>
                        <td>{product.description || '-'}</td>
                        <td className={styles.actions}>
                          <button onClick={() => handleEditClick(product)} className={styles.editButton}>Edit</button>
                          <button onClick={() => handleDeleteClick(product._id)} className={styles.deleteButton}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <ProductForm initialData={editingProduct} onSubmit={handleSave} onCancel={handleCancelForm} isSubmitting={isSubmitting} />
        )}

        {deleteId && (
          <div className={styles.overlay}>
            <div className={styles.confirmDialog}>
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className={styles.confirmActions}>
                <button onClick={cancelDelete} className={styles.cancelButton}>Cancel</button>
                <button onClick={confirmDelete} className={styles.deleteButton}>Confirm Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Products;
