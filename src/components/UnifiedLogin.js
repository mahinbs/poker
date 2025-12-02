import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/api';

export default function UnifiedLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      // Check user role and route accordingly
      if (result.user.isMasterAdmin) {
        // Master Admin
        localStorage.setItem('masterAdmin', JSON.stringify({
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
          isMasterAdmin: true
        }));

        if (result.mustResetPassword) {
          navigate('/master-admin/reset-password', {
            state: { email, mustReset: true }
          });
        } else {
          navigate('/master-admin');
        }
      } else if (result.tenants && result.tenants.length > 0) {
        // Super Admin
        localStorage.setItem('superAdmin', JSON.stringify({
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
          tenants: result.tenants
        }));

        if (result.mustResetPassword) {
          navigate('/super-admin/reset-password', {
            state: { email, mustReset: true }
          });
        } else {
          navigate('/super-admin');
        }
      } else if (result.clubs && result.clubs.length > 0) {
        // Admin or other club roles (Manager, HR, Staff, Affiliate, Cashier, GRE)
        const adminClub = result.clubs[0];
        const userRoles = adminClub.roles || [];
        
        // Store user info
        const userInfo = {
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
          clubId: adminClub.clubId,
          clubName: adminClub.clubName,
          tenantId: adminClub.tenantId,
          tenantName: adminClub.tenantName,
          roles: userRoles
        };
        
        localStorage.setItem('admin', JSON.stringify(userInfo));

        if (result.mustResetPassword) {
          navigate('/admin/reset-password', {
            state: { email, mustReset: true }
          });
        } else {
          // Route based on primary role
          const primaryRole = userRoles[0] || 'ADMIN';
          
          // Map roles to routes
          const roleRoutes = {
            'ADMIN': '/admin',
            'MANAGER': '/manager',
            'HR': '/hr',
            'CASHIER': '/cashier',
            'GRE': '/gre',
            'STAFF': '/staff',
            'AFFILIATE': '/affiliate'
          };
          
          const route = roleRoutes[primaryRole] || '/admin';
          navigate(route);
        }
      } else {
        setError('You do not have access to any dashboard. Please contact your administrator.');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-lg mb-4">
            Poker CRM Portal
          </div>
          <p className="text-gray-300">Sign in to your dashboard</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
          <form onSubmit={handleSignIn} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <span className="text-emerald-400">Contact your administrator</span>
            </p>
            <button 
              onClick={() => navigate('/manager')} 
              className="text-gray-400 hover:text-white text-sm transition-colors block w-full"
            >
              ← Back to Manager Portal
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg border border-emerald-400/30">
          <p className="text-sm text-gray-300 text-center">
            <strong>Role-Based Access:</strong><br />
            Master Admin • Super Admin • Admin
          </p>
        </div>
      </div>
    </div>
  );
}

