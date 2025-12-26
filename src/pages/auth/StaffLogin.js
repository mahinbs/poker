/**
 * Universal Staff Login Page
 * All staff members (except Super Admin and Master Admin) login here
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../lib/api";

// Role to dashboard path mapping
const ROLE_DASHBOARD_MAP = {
  'ADMIN': '/admin',
  'GRE': '/gre',
  'CASHIER': '/cashier',
  'HR': '/hr',
  'FNB': '/fnb',
  'MANAGER': '/manager',
  'STAFF': '/staff',
  'DEALER': '/dealer',
  'AFFILIATE': '/affiliate',
};

export default function StaffLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default
  const from = location.state?.from?.pathname || '/';

  // Redirect if already logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const adminUser = JSON.parse(localStorage.getItem('adminuser') || '{}');
    const superAdminUser = JSON.parse(localStorage.getItem('superadminuser') || '{}');
    const masterAdminUser = JSON.parse(localStorage.getItem('masteradminuser') || '{}');
    
    // Check if user is logged in
    if (user.id || adminUser.userId || superAdminUser.userId || masterAdminUser.userId) {
      const role = user.role || adminUser.role || superAdminUser.role || masterAdminUser.role;
      
      // Redirect based on role
      if (role === 'SUPER_ADMIN' || superAdminUser.userId) {
        navigate('/super-admin', { replace: true });
      } else if (user.isMasterAdmin || masterAdminUser.userId) {
        navigate('/master-admin', { replace: true });
      } else if (role && ROLE_DASHBOARD_MAP[role]) {
        navigate(ROLE_DASHBOARD_MAP[role], { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(credentials.email, credentials.password);
      
      console.log('Login response:', response); // Debug log
      
      // Check if user is Master Admin or Super Admin (they have separate login pages)
      if (response.user?.isMasterAdmin) {
        throw new Error("Master Admin should use /master-admin/signin");
      }

      // Check if user has Super Admin role
      const hasSuperAdminRole = response.tenantRoles?.some(r => r.role === 'SUPER_ADMIN');
      if (hasSuperAdminRole) {
        throw new Error("Super Admin should use /super-admin/signin");
      }

      // Get user's role from clubRoles or tenantRoles
      const clubRole = response.clubRoles?.[0]?.role;
      const tenantRole = response.tenantRoles?.[0]?.role;
      const userRole = clubRole || tenantRole;

      console.log('Detected role:', userRole, 'clubRoles:', response.clubRoles, 'tenantRoles:', response.tenantRoles); // Debug log

      if (!userRole) {
        throw new Error("No role assigned. Please contact administrator.");
      }

      // For STAFF role, fetch custom role name from staff data
      let customRoleName = null;
      if (userRole === 'STAFF' && response.clubRoles?.[0]?.club?.id) {
        try {
          const { staffAPI } = await import('../../lib/api');
          const clubId = response.clubRoles[0].club.id;
          const allStaff = await staffAPI.getAllStaffMembers(clubId);
          const staffList = allStaff?.staff || allStaff || [];
          const currentStaff = staffList.find(s => s.email === credentials.email);
          if (currentStaff?.customRoleName) {
            customRoleName = currentStaff.customRoleName;
          }
        } catch (error) {
          console.error('Error fetching custom role name:', error);
          // Continue without custom role name
        }
      }

      // Store user info for persistence
      const userData = {
        id: response.user.id,
        email: credentials.email,
        displayName: response.user.displayName,
        role: userRole,
        mustResetPassword: response.user.mustResetPassword || false,
        customRoleName: customRoleName,
      };

      // Store in role-specific key for ALL roles
      const roleUserKey = `${userRole.toLowerCase()}user`;
      localStorage.setItem(roleUserKey, JSON.stringify({ 
        email: credentials.email, 
        role: userRole,
        userId: response.user.id,
        displayName: response.user.displayName,
        mustResetPassword: response.user.mustResetPassword || false,
        customRoleName: customRoleName,
      }));

      // Also store in 'user' key for ALL roles (for consistency and password reset check)
      localStorage.setItem('user', JSON.stringify(userData));

      // Store club ID if available
      if (response.clubRoles?.[0]?.club?.id) {
        localStorage.setItem('clubId', response.clubRoles[0].club.id);
      }

      // Redirect to appropriate dashboard
      const dashboardPath = ROLE_DASHBOARD_MAP[userRole] || '/';
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg mb-4">
            Staff Portal
          </div>
          <p className="text-gray-300">Sign in to access your dashboard</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={credentials.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

