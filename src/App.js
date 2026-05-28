import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import NotFound from './pages/NotFound';
import ManagerDashboard from './pages/dashboards/ManagerDashboard';
import GreSignIn from './pages/auth/GreSignIn';
import GreDashboard from './pages/dashboards/GreDashboard';
import HrSignIn from './pages/auth/HrSignIn';
import HrDashboard from './pages/dashboards/HrDashboard';
import CashierSignIn from './pages/auth/CashierSignIn';
import CashierDashboard from './pages/dashboards/CashierDashboard';
import FnbSignIn from './pages/auth/FnbSignIn';
import FnbDashboard from './pages/dashboards/FnbDashboard';
import CustomStaffDashboard from './pages/dashboards/CustomStaffDashboard';
import StaffLogin from './pages/auth/StaffLogin';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import MasterAdminSignIn from './pages/auth/MasterAdminSignIn';
import MasterAdminDashboard from './pages/dashboards/MasterAdminDashboard';
import SuperAdminSignIn from './pages/auth/SuperAdminSignIn';
import SuperAdminPortal from './pages/dashboards/SuperAdminPortal';
import AffiliateDashboard from './pages/dashboards/AffiliateDashboard';
import DealerDashboard from './pages/dashboards/DealerDashboard';
import StaffDashboard from './pages/dashboards/StaffDashboard';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function SessionExpiredOverlay({ onDismiss }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">Session Expired</h2>
        <p className="text-gray-400 text-sm mb-6">Your session has timed out. Please log in again to continue.</p>
        <button
          onClick={onDismiss}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

function App() {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handler = () => setSessionExpired(true);
    window.addEventListener('session:expired', handler);
    return () => window.removeEventListener('session:expired', handler);
  }, []);

  const handleSessionDismiss = () => {
    setSessionExpired(false);
    // Wipe everything — role-specific keys use dynamic names like
    // super_adminuser / master_adminuser so a full clear is safest
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <QueryClientProvider client={queryClient}>
      {sessionExpired && <SessionExpiredOverlay onDismiss={handleSessionDismiss} />}
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            {/* Sign In Pages (Public) */}
            <Route path="/login" element={<StaffLogin />} />
            <Route path="/master-admin/signin" element={<MasterAdminSignIn />} />
            <Route path="/super-admin/signin" element={<SuperAdminSignIn />} />
            
            {/* Legacy signin routes - redirect to /login */}
            <Route path="/gre/signin" element={<Navigate to="/login" replace />} />
            <Route path="/hr/signin" element={<Navigate to="/login" replace />} />
            <Route path="/cashier/signin" element={<Navigate to="/login" replace />} />
            <Route path="/fnb/signin" element={<Navigate to="/login" replace />} />
            <Route path="/admin/signin" element={<Navigate to="/login" replace />} />

            {/* Protected Dashboard Routes */}
            <Route path="/gre" element={
              <AuthenticatedRoute requiredRole="GRE">
                <GreDashboard />
              </AuthenticatedRoute>
            } />
            
            <Route path="/hr" element={
              <AuthenticatedRoute requiredRole="HR">
                <HrDashboard />
              </AuthenticatedRoute>
            } />
            
            <Route path="/cashier" element={
              <AuthenticatedRoute requiredRole="CASHIER">
                <CashierDashboard />
              </AuthenticatedRoute>
            } />
            
            <Route path="/fnb" element={
              <AuthenticatedRoute requiredRole="FNB">
                <FnbDashboard />
              </AuthenticatedRoute>
            } />
            
            <Route path="/admin" element={
              <AuthenticatedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </AuthenticatedRoute>
            } />
            
            <Route path="/master-admin" element={
              <AuthenticatedRoute requiredRole="MASTER_ADMIN">
                <MasterAdminDashboard />
              </AuthenticatedRoute>
            } />
            
            <Route path="/super-admin" element={
              <AuthenticatedRoute requiredRole="SUPER_ADMIN">
                <SuperAdminPortal />
              </AuthenticatedRoute>
            } />

            <Route path="/manager" element={
              <AuthenticatedRoute requiredRole="MANAGER">
                <ManagerDashboard />
              </AuthenticatedRoute>
            } />
            <Route path="/staff" element={
              <AuthenticatedRoute requiredRole="STAFF">
                <CustomStaffDashboard />
              </AuthenticatedRoute>
            } />
            
            <Route path="/dealer" element={
              <AuthenticatedRoute requiredRole="DEALER">
                <DealerDashboard />
              </AuthenticatedRoute>
            } />
            
            <Route path="/affiliate" element={
              <AuthenticatedRoute requiredRole="AFFILIATE">
                <AffiliateDashboard />
              </AuthenticatedRoute>
            } />
            
            {/* 404 Page */}
            <Route path="/404" element={<NotFound />} />
            
            {/* Default and Catch-all */}
            <Route path="/" element={<Navigate to="/manager" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
