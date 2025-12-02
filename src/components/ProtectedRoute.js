import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  // Check for Master Admin
  const masterAdmin = localStorage.getItem('masterAdmin');
  if (requiredRole === 'masterAdmin' && masterAdmin) {
    return children;
  }

  // Check for Super Admin
  const superAdmin = localStorage.getItem('superAdmin');
  if (requiredRole === 'superAdmin' && superAdmin) {
    return children;
  }

  // Check for Admin
  const admin = localStorage.getItem('admin');
  if (requiredRole === 'admin' && admin) {
    return children;
  }

  // Redirect to login if not authenticated
  return <Navigate to="/login" replace />;
}

