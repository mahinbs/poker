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
    if (requiredRole === 'GRE') {
      return <Navigate to="/gre/signin" state={{ from: location }} replace />;
    }
    if (requiredRole === 'CASHIER') {
      return <Navigate to="/cashier/signin" state={{ from: location }} replace />;
    }
    if (requiredRole === 'ADMIN') {
      return <Navigate to="/admin/signin" state={{ from: location }} replace />;
    }
    if (requiredRole === 'HR') {
      return <Navigate to="/hr/signin" state={{ from: location }} replace />;
    }
    if (requiredRole === 'FNB_STAFF') {
      return <Navigate to="/fnb/signin" state={{ from: location }} replace />;
    }
    if (requiredRole === 'SUPER_ADMIN') {
      return <Navigate to="/super-admin/signin" state={{ from: location }} replace />;
    }
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role if specified
  if (requiredRole && currentUser.role !== requiredRole) {
    console.warn(`Access denied. Required: ${requiredRole}, Current: ${currentUser.role}`);
    
    // Show 404 page for unauthorized access
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-9xl font-bold text-red-500 mb-4">404</div>
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-400 mb-6">
            The page you're looking for doesn't exist or you don't have permission to access it.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthenticatedRoute;

