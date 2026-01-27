import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * ProtectedRoute component that checks for authentication token.
 * Redirects to /login if token is missing.
 * Renders child routes via Outlet if authenticated.
 */
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  // No props needed for this implementation using Outlet
};

export default ProtectedRoute;
