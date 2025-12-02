import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login, getTenant, getClub } from '../utils/api';

export default function ClubStaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState(null);
  const [loadingBranding, setLoadingBranding] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenant');
  const clubId = searchParams.get('club');

  // Fetch branding on mount
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        let brandingData = null;
        
        // Try to get branding from tenant or club
        if (tenantId) {
          // First check localStorage cache
          const cached = localStorage.getItem(`tenant_branding_${tenantId}`);
          if (cached) {
            try {
              brandingData = JSON.parse(cached);
            } catch (e) {
              // Invalid cache, fetch fresh
            }
          }
          
          // If not cached, fetch from API
          if (!brandingData) {
            const tenant = await getTenant(tenantId);
            if (tenant) {
              brandingData = {
                logoUrl: tenant.logoUrl,
                primaryColor: tenant.primaryColor || '#10b981', // Default emerald
                secondaryColor: tenant.secondaryColor || '#06b6d4', // Default cyan
                name: tenant.name,
                faviconUrl: tenant.faviconUrl
              };
              // Cache it
              localStorage.setItem(`tenant_branding_${tenantId}`, JSON.stringify(brandingData));
            }
          }
        } else if (clubId) {
          // If club ID is provided, try to get tenant branding
          // Note: getClub requires auth, so we'll try to get tenant from all tenants list
          // For now, we'll use default branding and apply tenant branding after login
          // In production, you might want a public endpoint for club/tenant branding
        }
        
        setBranding(brandingData);
      } catch (err) {
        console.error('Failed to load branding:', err);
        // Use default branding
        setBranding({
          logoUrl: null,
          primaryColor: '#10b981',
          secondaryColor: '#06b6d4',
          name: 'Club Portal',
          faviconUrl: null
        });
      } finally {
        setLoadingBranding(false);
      }
    };

    fetchBranding();
  }, [tenantId, clubId]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      // Check if user is club-scoped (Admin, Staff, Manager, HR, Cashier, GRE, Affiliate)
      if (result.user.isMasterAdmin) {
        setError('Please use Master Admin login portal');
        setLoading(false);
        return;
      }

      if (result.tenants && result.tenants.length > 0) {
        setError('Please use Super Admin login portal');
        setLoading(false);
        return;
      }

      if (!result.clubs || result.clubs.length === 0) {
        setError('You do not have access to any club. Please contact your administrator.');
        setLoading(false);
        return;
      }

      // Store user info
      const adminClub = result.clubs[0];
      const userRoles = adminClub.roles || [];
      
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
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Default branding if not loaded yet
  const defaultBranding = {
    logoUrl: null,
    primaryColor: '#10b981',
    secondaryColor: '#06b6d4',
    name: 'Club Portal',
    faviconUrl: null
  };

  const currentBranding = branding || defaultBranding;
  const primaryColor = currentBranding.primaryColor || '#10b981';
  const secondaryColor = currentBranding.secondaryColor || '#06b6d4';

  // Apply branding to document
  useEffect(() => {
    if (currentBranding.faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.rel = 'icon';
      link.href = currentBranding.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [currentBranding.faviconUrl]);

  if (loadingBranding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-white font-sans flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(to bottom right, ${primaryColor}15, ${secondaryColor}15, #000000)`
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {currentBranding.logoUrl ? (
            <div className="mb-6">
              <img 
                src={currentBranding.logoUrl} 
                alt={currentBranding.name}
                className="h-16 mx-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div 
              className="text-4xl font-extrabold text-transparent bg-clip-text drop-shadow-lg mb-4 mx-auto"
              style={{
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
              }}
            >
              {currentBranding.name}
            </div>
          )}
          <p className="text-gray-300">Sign in to your club dashboard</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 rounded-2xl p-8 shadow-2xl border border-gray-700/50 backdrop-blur-sm">
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{
                  '--tw-ring-color': primaryColor,
                  focusRingColor: primaryColor
                }}
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{
                  '--tw-ring-color': primaryColor,
                  focusRingColor: primaryColor
                }}
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
              }}
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
              onClick={() => navigate('/')} 
              className="text-gray-400 hover:text-white text-sm transition-colors block w-full"
            >
              ← Back to Login Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

