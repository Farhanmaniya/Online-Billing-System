import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Customers from './pages/Customers/Customers';
import Products from './pages/Products/Products';
import Invoices from './pages/Invoices/Invoices';
import CreateInvoice from './pages/Invoices/CreateInvoice';
import InvoiceDetail from './pages/Invoices/InvoiceDetail';
import Notifications from './pages/Notifications/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/invoices/create" element={<CreateInvoice />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
