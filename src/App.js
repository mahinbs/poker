import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/dashboards/ManagerDashboardPage';
import GreSignIn from './pages/auth/GreSignIn';
import GreDashboard from './pages/dashboards/GreDashboard';
import HrSignIn from './pages/auth/HrSignIn';
import HrDashboard from './pages/dashboards/HrDashboard';
import CashierSignIn from './pages/auth/CashierSignIn';
import CashierDashboard from './pages/dashboards/CashierDashboard';
import FnbSignIn from './pages/auth/FnbSignIn';
import FnbDashboard from './pages/dashboards/FnbDashboard';
import AdminSignIn from './pages/auth/AdminSignIn';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import MasterAdminSignIn from './pages/auth/MasterAdminSignIn';
import MasterAdminDashboard from './pages/dashboards/MasterAdminDashboard';
import SuperAdminSignIn from './pages/auth/SuperAdminSignIn';
import SuperAdminPortal from './pages/dashboards/SuperAdminPortal';
import AffiliateDashboard from './pages/dashboards/AffiliateDashboard';
import StaffDashboard from './pages/dashboards/StaffDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/manager" replace />} />
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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/master-admin/signin" element={<MasterAdminSignIn />} />
          <Route path="/master-admin" element={<MasterAdminDashboard />} />
          <Route path="/super-admin/signin" element={<SuperAdminSignIn />} />
          <Route path="/super-admin" element={<SuperAdminPortal />} />
          {/* <Route path="/affiliate-dashboard" element={<AffiliateDashboard />} /> */}
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="*" element={<Navigate to="/manager" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
