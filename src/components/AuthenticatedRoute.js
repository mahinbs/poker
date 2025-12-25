/**
 * Protected Route Component
 * Ensures user is authenticated before accessing routes
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '../lib/api';

export const AuthenticatedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = authAPI.isAuthenticated();
  const currentUser = authAPI.getCurrentUser();
  const location = useLocation();

  // Not authenticated - redirect to appropriate login page
  if (!isAuthenticated) {
    if (requiredRole === 'MASTER_ADMIN') {
      return <Navigate to="/master-admin/signin" state={{ from: location }} replace />;
    }
    if (requiredRole === 'SUPER_ADMIN') {
      return <Navigate to="/super-admin/signin" state={{ from: location }} replace />;
    }
    // All other staff roles (ADMIN, GRE, CASHIER, HR, FNB, etc.) use /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if specified - show 404 for unauthorized access
  if (requiredRole) {
    const hasRequiredRole = currentUser?.isMasterAdmin && requiredRole === 'MASTER_ADMIN' ||
                            currentUser?.role === requiredRole;
    
    if (!hasRequiredRole) {
      console.warn(`Access denied. Required: ${requiredRole}, Current: ${currentUser?.role}`);
      return <Navigate to="/404" replace />;
    }
  }

  return children;
};

export default AuthenticatedRoute;

