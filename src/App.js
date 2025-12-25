import React from 'react';
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
import StaffLogin from './pages/auth/StaffLogin';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import MasterAdminSignIn from './pages/auth/MasterAdminSignIn';
import MasterAdminDashboard from './pages/dashboards/MasterAdminDashboard';
import SuperAdminSignIn from './pages/auth/SuperAdminSignIn';
import SuperAdminPortal from './pages/dashboards/SuperAdminPortal';
import AffiliateDashboard from './pages/dashboards/AffiliateDashboard';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
            <Route path="/staff" element={<StaffDashboard />} />
            
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
