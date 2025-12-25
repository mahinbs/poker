/**
 * Universal Sign In Component
 * Reusable authentication form for all staff roles
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../lib/api";

export default function UniversalSignIn({ 
  role, 
  roleDisplayName, 
  redirectPath, 
  gradientFrom, 
  gradientTo,
  description 
}) {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(credentials.email, credentials.password);
      
      // Check if user has the required role
      const hasRole = response.clubRoles?.some(r => r.role === role) ||
                      response.tenantRoles?.some(r => r.role === role) ||
                      (role === 'MASTER_ADMIN' && response.user.isMasterAdmin);
      
      if (!hasRole) {
        throw new Error(`You don't have ${roleDisplayName} access. Please use the correct portal.`);
      }

      // Store user info for persistence
      const userData = {
        id: response.user.id,
        email: credentials.email,
        displayName: response.user.displayName,
        role: role,
        mustResetPassword: response.user.mustResetPassword || false,
      };

      // Store in role-specific key
      localStorage.setItem(`${role.toLowerCase()}user`, JSON.stringify({ 
        email: credentials.email, 
        role: role,
        userId: response.user.id,
        displayName: response.user.displayName,
        mustResetPassword: response.user.mustResetPassword || false,
      }));

      // Also store in 'user' key for Super Admin and Admin (for consistency)
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        localStorage.setItem('user', JSON.stringify(userData));
      }

      navigate(redirectPath);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${gradientFrom} ${gradientTo} drop-shadow-lg mb-4`}>
            {roleDisplayName} Portal
          </div>
          <p className="text-gray-300">{description}</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${gradientFrom} ${gradientTo} hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Signing In..." : `Sign In to ${roleDisplayName} Portal`}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm text-center">
              <strong>Note:</strong> Please use your registered credentials<br />
              Contact admin if you need access
            </p>
          </div>

          {/* Navigation Links */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-emerald-400 hover:text-emerald-300 text-sm underline"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

