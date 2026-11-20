import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect to the appropriate login page based on target route
    if (allowedRoles.includes('admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    if (allowedRoles.includes('technician')) {
      return <Navigate to="/technician/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is authorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If a customer attempts to visit admin or technician, send them to their dashboard
    if (user.role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    }
    if (user.role === 'technician') {
      return <Navigate to="/technician/dashboard" replace />;
    }
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
