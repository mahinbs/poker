import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyClubCode, playerLogin } from '../utils/api';

export default function PlayerLogin() {
  const [step, setStep] = useState('clubCode'); // 'clubCode' or 'login'
  const [clubCode, setClubCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [clubInfo, setClubInfo] = useState(null);
  
  const navigate = useNavigate();

  const handleClubCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!clubCode || clubCode.trim().length !== 6) {
        throw new Error('Club code must be exactly 6 digits');
      }

      const result = await verifyClubCode(clubCode.trim());
      
      if (result.valid) {
        setClubInfo({
          id: result.clubId,
          name: result.clubName,
          tenantId: result.tenantId,
          tenantName: result.tenantName
        });
        setStep('login');
      } else {
        setError(result.message || 'Invalid club code');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify club code');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }
      if (!password || !password.trim()) {
        throw new Error('Password is required');
      }

      const result = await playerLogin(clubCode.trim(), email.trim(), password);
      
      // Store player data
      localStorage.setItem('player', JSON.stringify({
        id: result.player.id,
        name: result.player.name,
        email: result.player.email,
        phoneNumber: result.player.phoneNumber,
        nickname: result.player.nickname,
        status: result.player.status,
        clubId: result.club.id,
        clubName: result.club.name,
        clubCode: result.club.code,
        tenantId: result.club.tenantId,
        tenantName: result.club.tenantName,
        affiliate: result.affiliate
      }));

      // Navigate to player portal
      navigate('/player');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('clubCode');
    setClubInfo(null);
    setEmail('');
    setPassword('');
    setError('');
  };

  if (step === 'clubCode') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-lg mb-4">
              Player Portal
            </div>
            <p className="text-gray-300">Enter your club code to continue</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Club Code</h2>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleClubCodeSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Club Code (6 digits)
                </label>
                <input
                  type="text"
                  value={clubCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setClubCode(value);
                    setError('');
                  }}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-gray-400">
                  Enter the 6-digit code provided by your club
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || clubCode.length !== 6}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Verifying...' : 'Continue'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                ← Back to Home
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
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-lg mb-4">
            Player Portal
          </div>
          {clubInfo && (
            <p className="text-gray-300">{clubInfo.name}</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Sign In</h2>
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Change Club
            </button>
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="player@example.com"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate(`/player/signup?clubCode=${clubCode}`)}
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Sign Up
              </button>
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}





