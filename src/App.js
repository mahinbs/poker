import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardPage from "./components/DashboardPage";
import GreSignIn from "./components/GreSignIn";
import GreDashboard from "./components/GreDashboard";
import HrSignIn from "./components/HrSignIn";
import HrDashboard from "./components/HrDashboard";
import CashierSignIn from "./components/CashierSignIn";
import CashierDashboard from "./components/CashierDashboard";
import FnbSignIn from "./components/FnbSignIn";
import FnbDashboard from "./components/FnbDashboard";
import AdminSignIn from "./components/AdminSignIn";
import AdminDashboard from "./components/AdminDashboard";
import MasterAdminSignIn from "./components/MasterAdminSignIn";
import MasterAdminDashboard from "./components/MasterAdminDashboard";

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
          <Route path="*" element={<Navigate to="/manager" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
