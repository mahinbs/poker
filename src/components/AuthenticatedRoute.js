/**
 * Protected Route Component
 * Ensures user is authenticated before accessing routes
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '../lib/api';

// Map roles to their dashboard paths
const ROLE_DASHBOARD_MAP = {
  'MASTER_ADMIN': '/master-admin',
  'SUPER_ADMIN': '/super-admin',
  'ADMIN': '/admin',
  'MANAGER': '/manager',
  'GRE': '/gre',
  'CASHIER': '/cashier',
  'HR': '/hr',
  'FNB': '/fnb',
  'STAFF': '/staff',
  'DEALER': '/dealer',
  'AFFILIATE': '/affiliate',
};

// Get the correct dashboard path for a user's role
const getDashboardPathForRole = (user) => {
  // Check for Master Admin
  if (user?.isMasterAdmin) {
    return '/master-admin';
  }
  
  // Check role from localStorage (check multiple sources)
  const userStr = localStorage.getItem('user');
  const superAdminUser = JSON.parse(localStorage.getItem('superadminuser') || '{}');
  const adminUser = JSON.parse(localStorage.getItem('adminuser') || '{}');
  const masterAdminUser = JSON.parse(localStorage.getItem('masteradminuser') || '{}');
  
  let role = user?.role;
  
  // Try to get role from various localStorage keys
  if (!role) {
    if (superAdminUser.userId || superAdminUser.role === 'SUPER_ADMIN') {
      role = 'SUPER_ADMIN';
    } else if (adminUser.userId || adminUser.role === 'ADMIN') {
      role = 'ADMIN';
    } else if (masterAdminUser.userId || masterAdminUser.role === 'MASTER_ADMIN') {
      role = 'MASTER_ADMIN';
    } else if (userStr) {
      const parsedUser = JSON.parse(userStr);
      role = parsedUser.role;
    }
  }
  
  // Get role from authAPI
  if (!role) {
    const currentUser = authAPI.getCurrentUser();
    role = currentUser?.role;
  }
  
  return role && ROLE_DASHBOARD_MAP[role] ? ROLE_DASHBOARD_MAP[role] : '/login';
};

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

  // Check role if specified - redirect to user's correct portal instead of 404
  if (requiredRole) {
    const hasRequiredRole = currentUser?.isMasterAdmin && requiredRole === 'MASTER_ADMIN' ||
                            currentUser?.role === requiredRole;
    
    if (!hasRequiredRole) {
      // User is logged in but trying to access wrong portal - redirect to their portal
      const correctPath = getDashboardPathForRole(currentUser);
      console.warn(`Access denied. Required: ${requiredRole}, Current: ${currentUser?.role}. Redirecting to ${correctPath}`);
      return <Navigate to={correctPath} replace />;
    }
  }

  return children;
};

export default AuthenticatedRoute;

