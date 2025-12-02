import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './components/DashboardPage';
import GreSignIn from './components/GreSignIn';
import GreDashboard from './components/GreDashboard';
import HrSignIn from './components/HrSignIn';
import HrDashboard from './components/HrDashboard';
import CashierSignIn from './components/CashierSignIn';
import CashierDashboard from './components/CashierDashboard';
import FnbSignIn from './components/FnbSignIn';
import FnbDashboard from './components/FnbDashboard';
import AdminSignIn from './components/AdminSignIn';
import AdminSignUp from './components/AdminSignUp';
import AdminDashboard from './components/AdminDashboard';
import MasterAdminSignIn from './components/MasterAdminSignIn';
import MasterAdminSignUp from './components/MasterAdminSignUp';
import MasterAdminDashboard from './components/MasterAdminDashboard';
import SuperAdminSignIn from './components/SuperAdminSignIn';
import SuperAdminSignUp from './components/SuperAdminSignUp';
import SuperAdminPortal from './components/SuperAdminPortal';
import SuperAdminPasswordReset from './components/SuperAdminPasswordReset';
import AdminPasswordReset from './components/AdminPasswordReset';
import UnifiedLogin from './components/UnifiedLogin';
import ProtectedRoute from './components/ProtectedRoute';
import StaffDashboard from './components/StaffDashboard';
import AffiliateDashboard from './components/AffiliateDashboard';
import LoginLanding from './components/LoginLanding';
import ClubStaffLogin from './components/ClubStaffLogin';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginLanding />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/login/master-admin" element={<MasterAdminSignIn />} />
          <Route path="/login/super-admin" element={<SuperAdminSignIn />} />
          <Route path="/login/club" element={<ClubStaffLogin />} />
          <Route path="/manager" element={<DashboardPage />} />
          <Route path="/gre/signin" element={<GreSignIn />} />
          <Route path="/gre" element={<GreDashboard />} />
          <Route path="/hr/signin" element={<HrSignIn />} />
          <Route path="/hr" element={<HrDashboard />} />
          <Route path="/cashier/signin" element={<CashierSignIn />} />
          <Route path="/cashier" element={<CashierDashboard />} />
          <Route path="/fnb/signin" element={<FnbSignIn />} />
          <Route path="/fnb" element={<FnbDashboard />} />
          <Route path="/admin/signin" element={<AdminSignIn />} />
          <Route path="/admin/signup" element={<AdminSignUp />} />
          <Route path="/admin/reset-password" element={<AdminPasswordReset />} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/master-admin/signin" element={<MasterAdminSignIn />} />
          <Route path="/master-admin/signup" element={<MasterAdminSignUp />} />
          <Route path="/master-admin" element={<ProtectedRoute requiredRole="masterAdmin"><MasterAdminDashboard /></ProtectedRoute>} />
          <Route path="/super-admin/signin" element={<SuperAdminSignIn />} />
          <Route path="/super-admin/signup" element={<SuperAdminSignUp />} />
          <Route path="/super-admin/reset-password" element={<SuperAdminPasswordReset />} />
          <Route path="/super-admin" element={<ProtectedRoute requiredRole="superAdmin"><SuperAdminPortal /></ProtectedRoute>} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/affiliate" element={<ProtectedRoute requiredRole="admin"><AffiliateDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
  