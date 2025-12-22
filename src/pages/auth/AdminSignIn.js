import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    if (email === 'admin@pokerroom.com' && password === 'admin123') {
      navigate('/admin');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-300 to-blue-400 drop-shadow-lg mb-4">
            Super Admin Portal
          </div>
          <p className="text-gray-300">System-wide administration & configuration</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
          
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="admin@pokerroom.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/manager')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Manager Portal
            </button>
          </div>
        </div>
        
        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-lg border border-red-400/30">
          <p className="text-sm text-gray-300 text-center">
            <strong>Demo Credentials:</strong><br />
            Email: admin@pokerroom.com<br />
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
}
