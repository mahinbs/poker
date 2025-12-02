import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';

export default function AdminSignUp() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [clubId, setClubId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!clubId || !tenantId) {
        setError('Club ID and Tenant ID are required. Please contact your Super Admin.');
        setLoading(false);
        return;
      }

      const response = await apiRequest(`/clubs/${clubId}/users`, {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId
        },
        body: JSON.stringify({
          email,
          displayName: displayName || null,
          role
        })
      });

      if (response.tempPassword) {
        setTempPassword(response.tempPassword);
        setSuccess(true);
      } else {
        alert('Account created! Password was sent to your email.');
        navigate('/admin/signin');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (success && tempPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Account Created!</h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-lg">
                <p className="text-sm text-green-300 mb-2">Your temporary password:</p>
                <p className="text-lg font-mono font-bold text-white break-all">{tempPassword}</p>
                <p className="text-xs text-gray-400 mt-2">⚠️ Save this password! You'll need to reset it on first login.</p>
              </div>
              <button
                onClick={() => navigate('/admin/signin')}
                className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-300 to-blue-400 drop-shadow-lg mb-4">
            Admin Sign Up
          </div>
          <p className="text-gray-300">Create a club admin account</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
          <form onSubmit={handleSignUp} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tenant ID *</label>
              <input
                type="text"
                value={tenantId}
                onChange={(e) => {
                  setTenantId(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter Tenant ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Club ID *</label>
              <input
                type="text"
                value={clubId}
                onChange={(e) => {
                  setClubId(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter Club ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="HR">HR</option>
                <option value="STAFF">Staff</option>
                <option value="AFFILIATE">Affiliate</option>
                <option value="CASHIER">Cashier</option>
                <option value="GRE">GRE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="admin@club.com"
                required
              />
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
              <p className="text-xs text-blue-300">
                <strong>Note:</strong> A strong password will be auto-generated and displayed after account creation. You'll need to reset it on first login.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button onClick={() => navigate('/admin/signin')} className="text-red-400 hover:text-red-300 font-semibold">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

