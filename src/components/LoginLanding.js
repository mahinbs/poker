import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-lg mb-4">
            Poker CRM Portal
          </div>
          <p className="text-gray-300 text-xl">Choose your login portal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Master Admin Login */}
          <div 
            onClick={() => navigate('/login/master-admin')}
            className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-700 cursor-pointer hover:border-emerald-500 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">👑</div>
              <h3 className="text-2xl font-bold text-white mb-2">Master Admin</h3>
              <p className="text-gray-400 text-sm mb-6">White-label management for clubs and clients</p>
              <button className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300">
                Sign In
              </button>
            </div>
          </div>

          {/* Super Admin Login */}
          <div 
            onClick={() => navigate('/login/super-admin')}
            className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-700 cursor-pointer hover:border-red-500 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-2">Super Admin</h3>
              <p className="text-gray-400 text-sm mb-6">Full control over system operations</p>
              <button className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300">
                Sign In
              </button>
            </div>
          </div>

          {/* Club Staff/Admin Login */}
          <div 
            onClick={() => navigate('/login/club')}
            className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-700 cursor-pointer hover:border-blue-500 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold text-white mb-2">Club Portal</h3>
              <p className="text-gray-400 text-sm mb-6">Admin, Staff, and Club Management</p>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300">
                Sign In
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Need help? Contact your administrator
          </p>
        </div>
      </div>
    </div>
  );
}






