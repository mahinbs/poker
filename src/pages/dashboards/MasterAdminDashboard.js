import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { masterAdminAPI, tenantsAPI, authAPI } from "../../lib/api";
import BrandingHeader from "../../components/BrandingHeader";
import MasterAdminSidebar from "../../components/sidebars/MasterAdminSidebar";

export default function MasterAdminDashboard() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // User info from localStorage
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  
  // Real data from backend
  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [selectedClubId, setSelectedClubId] = useState(null);
  
  // Filters and sorting
  const [clubFilter, setClubFilter] = useState("all"); // all, active, suspended, killed
  const [clubSort, setClubSort] = useState("name"); // name, status, subscription
  const [tenantSort, setTenantSort] = useState("name"); // name, clubs
  const [subscriptionSort, setSubscriptionSort] = useState("price"); // price, name, tenant, date
  const [editingSubscriptionClubId, setEditingSubscriptionClubId] = useState(null);
  const [subscriptionEditForm, setSubscriptionEditForm] = useState({});
  
  // Modals
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  
  // Form states
  const [tenantForm, setTenantForm] = useState({
    tenantName: "",
    superAdminName: "",
    superAdminEmail: "",
  });

  const [clubForm, setClubForm] = useState({
    clubName: "",
    clubDescription: "",
      skinColor: "#10b981",
    gradient: "emerald-green-teal",
      logoUrl: "",
      videoUrl: "",
    tenantId: "",
    createNewTenant: false,
    newTenantName: "",
    newSuperAdminName: "",
    newSuperAdminEmail: "",
    pokerEnabled: true,
    rummyEnabled: false,
  });

  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState(""); // 'success' or 'error'

  const [termsForm, setTermsForm] = useState({
    termsText: "",
    publicUrl: "",
  });

  const navigate = useNavigate();

  // Check if user is actually a Master Admin - redirect if not
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const masterAdminUser = JSON.parse(localStorage.getItem('masteradminuser') || '{}');
    const currentUser = authAPI.getCurrentUser();
    
    // Check if user is Master Admin
    const isMasterAdmin = user.isMasterAdmin || masterAdminUser.userId || currentUser?.isMasterAdmin;
    
    if (!isMasterAdmin) {
      // User is not Master Admin - redirect to their correct portal
      const role = currentUser?.role || user.role || masterAdminUser.role;
      const roleDashboardMap = {
        'SUPER_ADMIN': '/super-admin',
        'ADMIN': '/admin',
        'MANAGER': '/manager',
        'GRE': '/gre',
        'CASHIER': '/cashier',
        'HR': '/hr',
        'FNB': '/fnb',
        'STAFF': '/staff',
        'DEALER': '/dealer',
        'AFFILIATE': '/affiliate',
      };
      
      const redirectPath = role && roleDashboardMap[role] ? roleDashboardMap[role] : '/login';
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  const menuItems = [
    "Dashboard",
    "Tenants Management",
    "Clubs Management",
    "Game Settings",
    "Terms & Conditions",
    "Subscriptions",
    "Reports",
  ];

  // All gradient options
  const gradientOptions = [
    { value: "emerald-green-teal", label: "Emerald → Green → Teal", class: "from-emerald-600 via-green-500 to-teal-500" },
    { value: "teal-cyan-blue", label: "Teal → Cyan → Blue", class: "from-teal-500 via-cyan-500 to-blue-500" },
    { value: "cyan-blue-indigo", label: "Cyan → Blue → Indigo", class: "from-cyan-500 via-blue-500 to-indigo-600" },
    { value: "blue-indigo-purple", label: "Blue → Indigo → Purple", class: "from-blue-600 via-indigo-500 to-purple-600" },
    { value: "purple-pink-rose", label: "Purple → Pink → Rose", class: "from-purple-600 via-pink-500 to-rose-500" },
    { value: "pink-red-orange", label: "Pink → Red → Orange", class: "from-pink-500 via-red-500 to-orange-500" },
    { value: "red-orange-yellow", label: "Red → Orange → Yellow", class: "from-red-600 via-orange-500 to-yellow-500" },
    { value: "orange-yellow-lime", label: "Orange → Yellow → Lime", class: "from-orange-500 via-yellow-500 to-lime-500" },
    { value: "yellow-lime-green", label: "Yellow → Lime → Green", class: "from-yellow-500 via-lime-500 to-green-500" },
    { value: "indigo-purple-pink", label: "Indigo → Purple → Pink", class: "from-indigo-600 via-purple-500 to-pink-500" },
    { value: "gray-slate-zinc", label: "Gray → Slate → Zinc", class: "from-gray-600 via-slate-500 to-zinc-500" },
    { value: "slate-gray-neutral", label: "Slate → Gray → Neutral", class: "from-slate-600 via-gray-500 to-neutral-500" },
  ];

  // Load user info from localStorage or fetch from API
  useEffect(() => {
    const loadUserInfo = async () => {
      // Try localStorage first
      const storedUser = localStorage.getItem('user');
      const storedEmail = localStorage.getItem('userEmail');
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUserEmail(user.email || storedEmail || '');
          setUserName(user.displayName || user.name || 'Master Admin');
          return;
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
      
      // Fallback to email from localStorage
      if (storedEmail) {
        setUserEmail(storedEmail);
        setUserName('Master Admin');
        return;
      }
      
      // Fallback: use email from localStorage directly
      if (storedEmail) {
        setUserEmail(storedEmail);
        setUserName('Master Admin');
      }
      
      // If we have userId but no user object, fetch from API
      const userId = localStorage.getItem('userId');
      if (userId && !storedUser) {
        try {
          const userData = await masterAdminAPI.getCurrentUser();
          if (userData && userData.email) {
            setUserEmail(userData.email);
            setUserName(userData.displayName || 'Master Admin');
            // Store for next time
            localStorage.setItem('user', JSON.stringify({
              id: userData.id,
              email: userData.email,
              name: userData.displayName || userData.email,
              displayName: userData.displayName
            }));
          }
        } catch (err) {
          console.error('Failed to fetch user info:', err);
          // Still use email from localStorage if available
          if (storedEmail) {
            setUserEmail(storedEmail);
            setUserName('Master Admin');
          }
        }
      }
    };
    
    loadUserInfo();
  }, []);

  // Load all data from backend
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const dashboardStats = await masterAdminAPI.getDashboardStats();
      setStats(dashboardStats);
      setClubs(dashboardStats.clubs || []);
      setTenants(dashboardStats.tenants || []);
      
      if (dashboardStats.clubs && dashboardStats.clubs.length > 0) {
        setSelectedClubId(dashboardStats.clubs[0].id);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    authAPI.logout();
    navigate("/master-admin/signin");
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
      setToastType("");
    }, 5000);
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      const result = await tenantsAPI.createTenant({
        name: tenantForm.tenantName,
        superAdminName: tenantForm.superAdminName,
        superAdminEmail: tenantForm.superAdminEmail,
      });
      
      // Show success modal with tenant details
      setSuccessData({
        type: 'tenant',
        tenantName: result.tenant.name,
        superAdminEmail: result.superAdmin.email,
        tempPassword: result.superAdmin.tempPassword,
      });
      setShowSuccessModal(true);
      
      setShowCreateTenantModal(false);
      setTenantForm({
        tenantName: "",
        superAdminName: "",
        superAdminEmail: "",
      });
      
      loadDashboardData();
    } catch (err) {
      const errorMsg = err.message || 'Unknown error';
      
      // Show error toast
      if (errorMsg.includes('already exists') || errorMsg.includes('already used')) {
        showToast(errorMsg, 'error');
      } else if (errorMsg.includes('Tenant name')) {
        showToast(errorMsg, 'error');
      } else {
        showToast('Failed to create tenant: ' + errorMsg, 'error');
      }
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    setUploadingLogo(true);
    
    try {
      let result;
      let finalLogoUrl = clubForm.logoUrl;
      
      const gradientClass = gradientOptions.find(g => g.value === clubForm.gradient)?.class || clubForm.gradient;
      
      if (clubForm.createNewTenant) {
        // Create tenant + club together
        result = await masterAdminAPI.createTenantWithClub({
          tenantName: clubForm.newTenantName,
          superAdminName: clubForm.newSuperAdminName,
          superAdminEmail: clubForm.newSuperAdminEmail,
          clubName: clubForm.clubName,
          clubDescription: clubForm.clubDescription,
          skinColor: clubForm.skinColor,
          gradient: gradientClass,
          logoUrl: clubForm.logoUrl || undefined,
          videoUrl: clubForm.videoUrl || undefined,
          pokerEnabled: clubForm.pokerEnabled,
          rummyEnabled: clubForm.rummyEnabled,
        });
        
        // Upload logo if file is selected
        if (logoFile && result.club && result.tenant) {
          try {
            const tenantId = result.tenant.id;
            const clubId = result.club.id;
            
            // Get signed URL
            const uploadData = await tenantsAPI.getLogoUploadUrl(tenantId, clubId);
            
            // Upload to Supabase
            await tenantsAPI.uploadLogo(uploadData.signedUrl, logoFile);
            
            // Get public URL
            finalLogoUrl = await tenantsAPI.getLogoPublicUrl(tenantId, clubId);
          } catch (uploadErr) {
            console.error('Logo upload failed:', uploadErr);
            showToast('Club created but logo upload failed', 'error');
          }
        }
        
        // Show success modal
        setSuccessData({
          type: 'tenant-club',
          tenant: result.tenant,
          superAdmin: result.superAdmin,
          club: result.club,
          logoUrl: finalLogoUrl
        });
        setShowSuccessModal(true);
      } else {
        // Create club for existing tenant
        result = await tenantsAPI.createClubWithBranding(clubForm.tenantId, {
          name: clubForm.clubName,
          description: clubForm.clubDescription || undefined,
          skinColor: clubForm.skinColor || undefined,
          gradient: gradientClass || undefined,
          logoUrl: clubForm.logoUrl || undefined,
          videoUrl: clubForm.videoUrl || undefined,
          pokerEnabled: clubForm.pokerEnabled,
          rummyEnabled: clubForm.rummyEnabled,
        });
        
        // Upload logo if file is selected
        if (logoFile && result.id) {
          try {
            const tenantId = clubForm.tenantId;
            const clubId = result.id;
            
            // Get signed URL
            const uploadData = await tenantsAPI.getLogoUploadUrl(tenantId, clubId);
            
            // Upload to Supabase
            await tenantsAPI.uploadLogo(uploadData.signedUrl, logoFile);
            
            // Get public URL
            finalLogoUrl = await tenantsAPI.getLogoPublicUrl(tenantId, clubId);
          } catch (uploadErr) {
            console.error('Logo upload failed:', uploadErr);
            showToast('Club created but logo upload failed', 'error');
          }
        }
        
        // Show success modal
        setSuccessData({
          type: 'club',
          club: result,
          logoUrl: finalLogoUrl
        });
        setShowSuccessModal(true);
      }

      
      setShowCreateClubModal(false);
      setClubForm({
        clubName: "",
        clubDescription: "",
        skinColor: "#10b981",
        gradient: "emerald-green-teal",
        logoUrl: "",
        videoUrl: "",
        tenantId: "",
        createNewTenant: false,
        newTenantName: "",
        newSuperAdminName: "",
        newSuperAdminEmail: "",
        pokerEnabled: true,
        rummyEnabled: false,
      });
      setLogoFile(null);
      
      loadDashboardData();
    } catch (err) {
      const errorMsg = err.message || 'Unknown error';
      
      // Show error toast
      if (errorMsg.includes('already exists') || errorMsg.includes('already used')) {
        showToast(errorMsg, 'error');
      } else {
        showToast('Failed to create club: ' + errorMsg, 'error');
      }
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUpdateClubStatus = async (clubId, status, reason) => {
    if (!confirm(`Are you sure you want to ${status} this club?\n\n${reason ? 'Reason: ' + reason : ''}`)) {
      return;
    }

    try {
      await masterAdminAPI.updateClubStatus(clubId, status, reason);
      alert(`✅ Club status updated to: ${status}`);
      loadDashboardData();
    } catch (err) {
      alert("Failed to update club status: " + err.message);
    }
  };

  const handleUpdateSubscription = async (clubId, subscriptionData) => {
    try {
      await masterAdminAPI.updateClubSubscription(clubId, subscriptionData);
      alert("✅ Subscription updated successfully!");
      setEditingSubscriptionClubId(null);
      setSubscriptionEditForm({});
      loadDashboardData();
    } catch (err) {
      alert("Failed to update subscription: " + err.message);
    }
  };

  const handleStartEditSubscription = (club) => {
    setEditingSubscriptionClubId(club.id);
    setSubscriptionEditForm({
      price: club.subscriptionPrice,
      status: club.subscriptionStatus,
      notes: club.subscriptionNotes || '',
    });
  };

  const handleCancelEditSubscription = () => {
    setEditingSubscriptionClubId(null);
    setSubscriptionEditForm({});
  };

  // Sort clubs for subscriptions
  const getSortedClubsForSubscriptions = () => {
    return [...clubs].sort((a, b) => {
      if (subscriptionSort === "price") {
        return parseFloat(b.subscriptionPrice) - parseFloat(a.subscriptionPrice);
      }
      if (subscriptionSort === "name") {
        return a.name.localeCompare(b.name);
      }
      if (subscriptionSort === "tenant") {
        return a.tenant.name.localeCompare(b.tenant.name);
      }
      if (subscriptionSort === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
  };

  // Export reports to CSV
  const exportReportsToCSV = () => {
    const headers = ['Club Name', 'Club Code', 'Tenant Name', 'Monthly Price (₹)', 'Status', 'Subscription Status', 'Created Date'];
    const rows = clubs.map(club => [
      club.name,
      club.code,
      club.tenant.name,
      club.subscriptionPrice,
      club.status,
      club.subscriptionStatus,
      new Date(club.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `revenue-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateTerms = async (e) => {
    if (e) e.preventDefault();
    
    if (!selectedClubId) {
      alert('Please select a club first');
      return;
    }

    if (!termsForm.termsText || termsForm.termsText.trim() === '') {
      alert('Terms & Conditions text cannot be empty');
      return;
    }

    try {
      await masterAdminAPI.updateClubTerms(selectedClubId, termsForm.termsText);
      alert('✅ Terms & Conditions updated successfully!');
      
      // Reload clubs to get updated data
      loadDashboardData();
      
      // Update the form with the saved data
      const updatedClub = clubs.find(c => c.id === selectedClubId);
      if (updatedClub) {
        setTermsForm({
          ...termsForm,
          termsText: updatedClub.termsAndConditions || termsForm.termsText,
        });
      }
    } catch (err) {
      alert('Failed to update Terms & Conditions: ' + err.message);
    }
  };

  const handleUpdateRummyEnabled = async (clubId, enabled) => {
    if (!confirm(`Are you sure you want to ${enabled ? 'enable' : 'disable'} Rummy mode for this club?`)) {
      return;
    }

    try {
      await masterAdminAPI.updateClubRummyEnabled(clubId, enabled);
      showToast(`✅ Rummy mode ${enabled ? 'enabled' : 'disabled'} successfully!`, 'success');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to update Rummy mode: ' + err.message, 'error');
    }
  };

  const handleUpdateGameAccess = async (clubId, updates) => {
    const changeDesc = Object.entries(updates).map(([key, val]) => {
      const label = key === 'pokerEnabled' ? 'Poker' : key === 'rummyEnabled' ? 'Rummy' : 'Tournaments';
      return `${val ? 'enable' : 'disable'} ${label}`;
    }).join(', ');

    try {
      await masterAdminAPI.updateClubGameAccess(clubId, updates);
      showToast(`✅ Game access updated: ${changeDesc}`, 'success');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to update game access: ' + err.message, 'error');
    }
  };

  // Get selected club data
  // Filter and sort clubs
  const filteredClubs = clubs
    .filter(club => {
      if (clubFilter === "all") return true;
      return club.status === clubFilter;
    })
    .sort((a, b) => {
      if (clubSort === "name") return a.name.localeCompare(b.name);
      if (clubSort === "status") return a.status.localeCompare(b.status);
      if (clubSort === "subscription") return parseFloat(b.subscriptionPrice) - parseFloat(a.subscriptionPrice);
      return 0;
    });

  // Sort tenants
  const sortedTenants = [...tenants].sort((a, b) => {
    if (tenantSort === "name") return a.name.localeCompare(b.name);
    if (tenantSort === "clubs") {
      const aClubs = clubs.filter(c => c.tenant.id === a.id).length;
      const bClubs = clubs.filter(c => c.tenant.id === b.id).length;
      return bClubs - aClubs;
    }
    return 0;
  });

  // Get selected club data for Terms & Conditions
  const selectedClubData = selectedClubId ? clubs.find(c => c.id === selectedClubId) : null;

  // Get gradient class for preview
  const getGradientClass = (gradientValue) => {
    const option = gradientOptions.find(g => g.value === gradientValue);
    return option ? option.class : gradientValue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium">Loading Master Admin Dashboard...</p>
          <p className="text-gray-400 mt-2">Fetching data from backend...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="flex">
        {/* Sidebar */}
        <MasterAdminSidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          menuItems={menuItems}
          onSignOut={handleSignOut}
          userEmail={userEmail}
          userName={userName}
        />

        {/* Main Section */}
        <main className="flex-1 lg:ml-0 min-w-0">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-10 space-y-8">
            <div className="mt-16 lg:mt-0">
              <div className="flex justify-between items-center mb-6">
              <BrandingHeader
                title={`Master Admin - ${activeItem}`}
                subtitle="White-label control center"
              />
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* DASHBOARD */}
            {activeItem === "Dashboard" && stats && (
            <>
                {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-gray-900 shadow-lg">
                    <div className="text-sm opacity-90 text-white/90">Total Tenants</div>
                    <div className="text-3xl font-bold mt-2 text-white">{stats.totalTenants}</div>
                    <div className="text-xs mt-1 text-white/70">Organization groups</div>
                    </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 text-gray-900 shadow-lg">
                    <div className="text-sm opacity-90 text-white/90">Total Clubs</div>
                    <div className="text-3xl font-bold mt-2 text-white">{stats.totalClubs}</div>
                    <div className="text-xs mt-1 text-white/70">All poker clubs</div>
                    </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 text-gray-900 shadow-lg">
                    <div className="text-sm opacity-90 text-white/90">Active Clubs</div>
                    <div className="text-3xl font-bold mt-2 text-white">{stats.activeClubs}</div>
                    <div className="text-xs mt-1 text-white/70">
                      {stats.suspendedClubs > 0 && `${stats.suspendedClubs} suspended, `}
                      {stats.killedClubs > 0 && `${stats.killedClubs} killed`}
                    </div>
              </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-gray-900 shadow-lg">
                    <div className="text-sm opacity-90 text-white/90">Monthly Revenue</div>
                    <div className="text-3xl font-bold mt-2 text-white">
                      ₹{stats.monthlyRevenue.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs mt-1 text-white/70">From subscriptions</div>
                    </div>
                    </div>

                {/* Quick Actions */}
                <section className="p-6 bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-black/50 rounded-xl border border-slate-700">
                  <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setShowCreateTenantModal(true)}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
                    >
                      + Create Tenant
                  </button>
                    <button
                      onClick={() => setShowCreateClubModal(true)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
                    >
                      + Create Club
                  </button>
                    <button
                      onClick={() => setActiveItem("Reports")}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
                    >
                      View Reports
                  </button>
                  </div>
              </section>

                {/* Recent Clubs */}
                <section className="p-6 bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-black/50 rounded-xl border border-slate-700">
                  <h2 className="text-xl font-bold text-white mb-6">Recent Clubs</h2>
                  <div className="space-y-4">
                    {clubs.slice(0, 5).map(club => (
                      <div key={club.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div>
                          <div className="font-bold text-white">{club.name}</div>
                          <div className="text-sm text-gray-400">
                            Code: {club.code} | Tenant: {club.tenant.name}
                    </div>
                    </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            club.status === 'active' ? 'bg-green-500/20 text-green-300' :
                            club.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {club.status}
                          </span>
                          <span className="text-emerald-400 font-medium">
                            ₹{club.subscriptionPrice}/mo
                          </span>
                    </div>
                  </div>
                    ))}
              </div>
            </section>
              </>
            )}

            {/* TENANTS MANAGEMENT */}
            {activeItem === "Tenants Management" && (
              <section className="p-6 bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-black/50 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Tenants ({tenants.length})</h2>
                  <div className="flex gap-3">
                    <select
                      value={tenantSort}
                      onChange={(e) => setTenantSort(e.target.value)}
                      className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="clubs">Sort by Club Count</option>
                    </select>
                    <button
                      onClick={() => setShowCreateTenantModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-medium"
                    >
                      + Create Tenant
                    </button>
                    </div>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedTenants.map(tenant => {
                    const tenantClubs = clubs.filter(c => c.tenant.id === tenant.id);
                    const isExpanded = selectedTenantId === tenant.id;
                    
                    return (
                      <div key={tenant.id} className={`p-6 bg-slate-800/50 rounded-lg border ${isExpanded ? 'border-emerald-500' : 'border-slate-700'} cursor-pointer transition-all hover:border-emerald-500/50`}>
                        <div onClick={() => setSelectedTenantId(isExpanded ? null : tenant.id)}>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white">{tenant.name}</h3>
                              <p className="text-gray-400 text-sm">Created: {new Date(tenant.createdAt).toLocaleDateString()}</p>
                    </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-emerald-400">{tenantClubs.length}</div>
                              <div className="text-sm text-gray-400">Clubs</div>
                    </div>
                    </div>
                  </div>

                        {isExpanded && tenantClubs.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-700 space-y-2">
                            <div className="text-sm font-medium text-gray-300 mb-3">Clubs:</div>
                            {tenantClubs.map(club => (
                              <div key={club.id} className="p-3 bg-slate-900/50 rounded border border-slate-700">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium text-white">{club.name}</div>
                                    <div className="text-xs text-gray-400 font-mono">Code: {club.code}</div>
                    </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    club.status === 'active' ? 'bg-green-500/20 text-green-300' :
                                    club.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-red-500/20 text-red-300'
                                  }`}>
                                    {club.status}
                                  </span>
                    </div>
                    </div>
                            ))}
                  </div>
                        )}

                        {isExpanded && tenantClubs.length === 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-700 text-center text-gray-400 text-sm">
                            No clubs yet
                    </div>
                        )}
                    </div>
                    );
                  })}

                  {tenants.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <p>No tenants found. Create your first tenant to get started!</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* CLUBS MANAGEMENT */}
            {activeItem === "Clubs Management" && (
              <section className="p-6 bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-black/50 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">All Clubs ({filteredClubs.length})</h2>
                  <div className="flex gap-3">
                    <select
                      value={clubFilter}
                      onChange={(e) => setClubFilter(e.target.value)}
                      className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="killed">Killed</option>
                    </select>
                    <select
                      value={clubSort}
                      onChange={(e) => setClubSort(e.target.value)}
                      className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="status">Sort by Status</option>
                      <option value="subscription">Sort by Subscription</option>
                    </select>
                    <button
                      onClick={() => setShowCreateClubModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-medium"
                    >
                      + Create Club
                  </button>
                </div>
                </div>

                <div className="grid gap-4">
                  {filteredClubs.map(club => (
                    <div key={club.id} className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{club.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              club.status === 'active' ? 'bg-green-500/20 text-green-300' :
                              club.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {club.status}
                            </span>
                </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                              <span className="text-gray-400">Club Code:</span>
                              <span className="text-white font-mono ml-2">{club.code}</span>
                    </div>
                    <div>
                              <span className="text-gray-400">Tenant:</span>
                              <span className="text-white ml-2">{club.tenant.name}</span>
                    </div>
                            <div>
                              <span className="text-gray-400">Subscription:</span>
                              <span className="text-emerald-400 ml-2 font-medium">₹{club.subscriptionPrice}/month</span>
                  </div>
                            <div>
                              <span className="text-gray-400">Sub Status:</span>
                              <span className="text-white ml-2">{club.subscriptionStatus}</span>
                </div>
                        </div>

                          {club.description && (
                            <p className="text-gray-400 mt-3 text-sm">{club.description}</p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {club.status === 'active' && (
                            <>
                          <button
                                onClick={() => handleUpdateClubStatus(club.id, 'suspended', 'Temporary suspension')}
                                className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-sm"
                              >
                                Suspend
                          </button>
                      <button
                                onClick={() => handleUpdateClubStatus(club.id, 'killed', 'Permanent closure')}
                                className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm"
                      >
                        Kill
                          </button>
                            </>
                          )}
                          {club.status === 'suspended' && (
                        <button
                              onClick={() => handleUpdateClubStatus(club.id, 'active', 'Reactivated')}
                              className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm"
                            >
                              Reactivate
                        </button>
                          )}
                          {club.status === 'killed' && (
                        <button
                              onClick={() => handleUpdateClubStatus(club.id, 'active', 'Restored from killed status')}
                              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm"
                            >
                              Restore
                        </button>
                      )}
                          <button
                            onClick={() => {
                              setSelectedClub(club);
                              setActiveItem("Subscriptions");
                            }}
                            className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded text-sm"
                          >
                            Edit Sub
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClub(club);
                              setSelectedClubId(club.id);
                              setActiveItem("Terms & Conditions");
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-sm"
                          >
                            Terms
                          </button>
                        </div>
                        </div>
                      </div>
                    ))}

                  {filteredClubs.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p>No clubs found with the selected filters.</p>
                  </div>
                  )}
              </div>
            </section>
          )}

            {/* GAME SETTINGS */}
          {activeItem === "Game Settings" && (() => {
            const selectedClubData = clubs.find(c => c.id === selectedClubId);
            return (
              <section className="p-6 bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-black/50 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">Game Settings</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Club Selection */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Club Selection</h3>
                      <select
                        value={selectedClubId || ''}
                    onChange={(e) => setSelectedClubId(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                      >
                        <option value="">Choose a club...</option>
                        {clubs.map(club => (
                          <option key={club.id} value={club.id}>
                            {club.name} ({club.code})
                      </option>
                    ))}
                      </select>
                      </div>

                    {selectedClubData && (
                      <div className="p-6 bg-slate-800/70 rounded-lg border border-slate-600">
                        <h4 className="font-bold text-lg mb-4 text-emerald-400">
                          Game Access Control for {selectedClubData.name}
                        </h4>
                        <p className="text-gray-300 text-sm mb-4">
                          Control which game types this club can access. Staff can only create tables and tournaments for enabled game types.
                        </p>

                        {/* Poker Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 mb-3">
                          <div>
                            <div className="font-semibold text-white">♠️ Poker</div>
                            <div className="text-xs text-gray-400">Poker tables and poker tournaments</div>
                          </div>
                          <button
                            onClick={() => handleUpdateGameAccess(selectedClubData.id, { pokerEnabled: !selectedClubData.pokerEnabled })}
                            className={`relative w-14 h-7 rounded-full transition-colors ${selectedClubData.pokerEnabled !== false ? 'bg-emerald-600' : 'bg-gray-600'}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${selectedClubData.pokerEnabled !== false ? 'translate-x-7' : ''}`} />
                          </button>
                        </div>

                        {/* Rummy Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 mb-3">
                          <div>
                            <div className="font-semibold text-white">🃏 Rummy</div>
                            <div className="text-xs text-gray-400">Rummy tables and rummy tournaments</div>
                          </div>
                          <button
                            onClick={() => handleUpdateGameAccess(selectedClubData.id, { rummyEnabled: !selectedClubData.rummyEnabled })}
                            className={`relative w-14 h-7 rounded-full transition-colors ${selectedClubData.rummyEnabled ? 'bg-emerald-600' : 'bg-gray-600'}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${selectedClubData.rummyEnabled ? 'translate-x-7' : ''}`} />
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-3">
                          Note: Each game type includes its own tables and tournaments. Disabling a game type prevents staff from creating new tables/tournaments of that type. Existing active sessions are not affected.
                        </p>
                  </div>
                    )}
                </div>

                  {/* Club Game Access Status */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Club Game Access Status</h3>
                  <div className="space-y-3">
                      {clubs.map(club => (
                        <div key={club.id} className="p-4 bg-slate-800/70 rounded-lg border border-slate-600">
                        <div className="flex justify-between items-center mb-2">
                            <div className="font-medium text-white">{club.name}</div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              club.pokerEnabled !== false
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              ♠️ Poker: {club.pokerEnabled !== false ? 'ON' : 'OFF'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              club.rummyEnabled
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              🃏 Rummy: {club.rummyEnabled ? 'ON' : 'OFF'}
                            </span>
                          </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            );
          })()}

            {/* TERMS & CONDITIONS */}
          {activeItem === "Terms & Conditions" && (
              <section className="p-6 bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-black/50 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">Terms & Conditions (Per Club)</h2>

                <div className="max-w-4xl mx-auto">
                  <div className="flex gap-4 mb-6">
                    <select
                      value={selectedClubId || ''}
                      onChange={(e) => {
                        const clubId = e.target.value;
                        setSelectedClubId(clubId);
                        const club = clubs.find(c => c.id === clubId);
                        if (club) {
                          setTermsForm({
                            termsText: club.termsAndConditions || '',
                            publicUrl: '',
                          });
                        } else {
                          setTermsForm({
                            termsText: '',
                            publicUrl: '',
                          });
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Choose a club...</option>
                      {clubs.map(club => (
                        <option key={club.id} value={club.id}>
                          {club.name} ({club.code}) - {club.tenant?.name || 'No Tenant'}
                      </option>
                    ))}
                    </select>
                  <input
                      type="text"
                    placeholder="Optional public URL"
                      value={termsForm.publicUrl}
                      onChange={(e) => setTermsForm({...termsForm, publicUrl: e.target.value})}
                      className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500"
                    />
                    <button
                      onClick={handleUpdateTerms}
                      disabled={!selectedClubId}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-medium text-white whitespace-nowrap"
                    >
                    Upload / Save
                  </button>
                </div>

                  {selectedClubData ? (
                    <form onSubmit={handleUpdateTerms} className="space-y-4">
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            Editing T&C for: <span className="text-emerald-400">{selectedClubData.name}</span>
                          </h3>
                          <span className="text-xs text-gray-400">
                            Club Code: <span className="font-mono text-emerald-400">{selectedClubData.code}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          Tenant: {selectedClubData.tenant?.name || 'N/A'}
                        </p>
                      </div>
                      
                      <textarea
                        name="terms"
                        value={termsForm.termsText}
                        onChange={(e) => setTermsForm({...termsForm, termsText: e.target.value})}
                        rows={15}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Paste Terms & Conditions here... Each club can have different T&C stored separately in the database."
                      />
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          ⚠️ Only Master Admin can manage club T&C. Each club's T&C is stored separately in the database.
                        </p>
                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-medium text-white transition-colors"
                        >
                          Save Terms & Conditions
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-4xl mb-4">📄</div>
                      <p className="text-lg mb-2">Select a club from the dropdown above</p>
                      <p className="text-sm">to edit terms & conditions for that specific club.</p>
                      <p className="text-xs mt-4 text-gray-500">
                        Each club can have different Terms & Conditions stored separately in the database.
                      </p>
                    </div>
                  )}
              </div>
            </section>
          )}

            {/* SUBSCRIPTIONS */}
          {activeItem === "Subscriptions" && (
              <section className="p-6 bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-black/50 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Subscription Management ({clubs.length})</h2>
                      <select
                    value={subscriptionSort}
                    onChange={(e) => setSubscriptionSort(e.target.value)}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                  >
                    <option value="price">Sort by Price</option>
                    <option value="name">Sort by Club Name</option>
                    <option value="tenant">Sort by Tenant Name</option>
                    <option value="date">Sort by Date Created</option>
                      </select>
                    </div>

                <div className="space-y-4">
                  {getSortedClubsForSubscriptions().map(club => (
                    <div key={club.id} className="p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                      {editingSubscriptionClubId === club.id ? (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateSubscription(club.id, {
                            subscriptionPrice: parseFloat(subscriptionEditForm.price),
                            subscriptionStatus: subscriptionEditForm.status,
                            subscriptionNotes: subscriptionEditForm.notes,
                          });
                        }} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                              <label className="block text-sm font-medium mb-2 text-gray-300">Club Name</label>
                              <div className="px-4 py-2 bg-slate-900 rounded-lg text-white">
                                {club.name} ({club.code})
                              </div>
                    </div>
                    <div>
                              <label className="block text-sm font-medium mb-2 text-gray-300">Tenant</label>
                              <div className="px-4 py-2 bg-slate-900 rounded-lg text-white">
                                {club.tenant.name}
                              </div>
                    </div>
                    <div>
                              <label className="block text-sm font-medium mb-2 text-gray-300">Monthly Price (₹)</label>
                        <input
                                type="number"
                                step="0.01"
                                value={subscriptionEditForm.price}
                                onChange={(e) => setSubscriptionEditForm({...subscriptionEditForm, price: e.target.value})}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                                required
                              />
                    </div>
                    <div>
                              <label className="block text-sm font-medium mb-2 text-gray-300">Status</label>
                      <select
                                value={subscriptionEditForm.status}
                                onChange={(e) => setSubscriptionEditForm({...subscriptionEditForm, status: e.target.value})}
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                              >
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Notes</label>
                            <textarea
                              value={subscriptionEditForm.notes}
                              onChange={(e) => setSubscriptionEditForm({...subscriptionEditForm, notes: e.target.value})}
                              rows={3}
                              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                              placeholder="Payment notes, reminders, etc."
                            />
                          </div>
                          <div className="flex gap-3">
                      <button
                              type="submit"
                              className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-medium"
                            >
                              Save Changes
                      </button>
                        <button
                              type="button"
                              onClick={handleCancelEditSubscription}
                              className="bg-slate-600 hover:bg-slate-500 px-6 py-2 rounded-lg font-medium"
                            >
                              Cancel
                        </button>
                    </div>
                        </form>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">{club.name}</h3>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-gray-300">
                                {club.code}
                              </span>
                    </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                              <div>
                                <span className="text-gray-400">Tenant:</span>
                                <span className="text-white ml-2">{club.tenant.name}</span>
                  </div>
                              <div>
                                <span className="text-gray-400">Created:</span>
                                <span className="text-white ml-2">{new Date(club.createdAt).toLocaleDateString()}</span>
                </div>
                              <div>
                                <span className="text-gray-400">Monthly Price:</span>
                                <span className="text-emerald-400 ml-2 font-bold text-lg">₹{club.subscriptionPrice}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Status:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  club.subscriptionStatus === 'active' ? 'bg-green-500/20 text-green-300' :
                                  club.subscriptionStatus === 'paused' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-red-500/20 text-red-300'
                                }`}>
                                  {club.subscriptionStatus}
                                </span>
                              </div>
                            </div>
                            {club.subscriptionNotes && (
                              <div className="mt-3 text-sm text-gray-400">
                                <span className="font-medium">Notes:</span> {club.subscriptionNotes}
                              </div>
                            )}
                          </div>
                        <button
                            onClick={() => handleStartEditSubscription(club)}
                            className="ml-4 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap"
                          >
                            Edit Subscription
                        </button>
                      </div>
                      )}
                  </div>
                ))}

                  {clubs.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p>No clubs found.</p>
                    </div>
                  )}
              </div>
            </section>
          )}

            {/* REPORTS */}
            {activeItem === "Reports" && (
              <section className="p-6 bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-black/50 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Revenue Reports</h2>
                  <button
                    onClick={exportReportsToCSV}
                    className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-medium text-white"
                  >
                    Export CSV
                  </button>
                      </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-500/30">
                    <div className="text-sm text-gray-300">Total Monthly Revenue</div>
                    <div className="text-3xl font-bold text-emerald-400 mt-2">
                      ₹{stats?.monthlyRevenue.toLocaleString('en-IN')}
                        </div>
                      </div>

                  <div className="p-6 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-500/30">
                    <div className="text-sm text-gray-300">Active Subscriptions</div>
                    <div className="text-3xl font-bold text-blue-400 mt-2">
                      {clubs.filter(c => c.subscriptionStatus === 'active').length}
                      </div>
                    </div>

                  <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                    <div className="text-sm text-gray-300">Avg. Subscription</div>
                    <div className="text-3xl font-bold text-purple-400 mt-2">
                      ₹{clubs.length > 0 ? Math.round(stats?.monthlyRevenue / clubs.length).toLocaleString('en-IN') : 0}
                    </div>
                  </div>
                </div>

                  <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Club Revenue Breakdown</h3>
                  {clubs.map(club => (
                    <div key={club.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div>
                        <div className="font-medium text-white">{club.name}</div>
                        <div className="text-sm text-gray-400">{club.tenant.name}</div>
                    </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-emerald-400">
                          ₹{club.subscriptionPrice}/mo
                    </div>
                        <div className="text-xs text-gray-400">{club.subscriptionStatus}</div>
                    </div>
                    </div>
                ))}
                    </div>
            </section>
          )}
          </div>
        </main>
      </div>

      {/* CREATE TENANT MODAL (Only Tenant, No Club) */}
      {showCreateTenantModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Create Tenant + Super Admin</h2>
            
            <form onSubmit={handleCreateTenant} className="space-y-6">
                  <div className="space-y-4">
                <h3 className="text-lg font-medium text-emerald-400">Tenant Information</h3>
                <input
                  type="text"
                  placeholder="Tenant Name (e.g., Poker Group India)"
                  value={tenantForm.tenantName}
                  onChange={(e) => setTenantForm({...tenantForm, tenantName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  required
              />
            </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-400">Super Admin</h3>
                <input
                  type="text"
                  placeholder="Super Admin Name"
                  value={tenantForm.superAdminName}
                  onChange={(e) => setTenantForm({...tenantForm, superAdminName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  required
                />
                      <input
                        type="email"
                  placeholder="Super Admin Email"
                  value={tenantForm.superAdminEmail}
                  onChange={(e) => setTenantForm({...tenantForm, superAdminEmail: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  required
                />
                <p className="text-sm text-gray-400">A temporary password will be generated automatically</p>
                    </div>

            <div className="flex gap-3">
              <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-medium text-white"
              >
                  Create Tenant
              </button>
              <button
                  type="button"
                  onClick={() => setShowCreateTenantModal(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-white"
              >
                  Cancel
                    </button>
                  </div>
            </form>
                </div>
                          </div>
      )}

      {/* CREATE CLUB MODAL (With Full Branding & Live Preview) */}
      {showCreateClubModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-8 max-w-6xl w-full my-8 border border-slate-700 max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Create Club with Branding</h2>
            
            <form onSubmit={handleCreateClub}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Form */}
                <div className="space-y-6">
                  {/* Club Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-purple-400">Club Information</h3>
                    <input
                      type="text"
                      placeholder="Club Name (e.g., Emerald Poker Mumbai)"
                      value={clubForm.clubName}
                      onChange={(e) => setClubForm({...clubForm, clubName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                      required
                    />
                    <textarea
                      placeholder="Club Description"
                      value={clubForm.clubDescription}
                      onChange={(e) => setClubForm({...clubForm, clubDescription: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                      rows={3}
                    />
                        </div>

                  {/* Game Access Control */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-amber-400">Game Access</h3>
                    <p className="text-xs text-gray-400">Select which game types this club can access. You can change this later.</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {/* Poker Toggle */}
                      <label className="flex items-center justify-between bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 cursor-pointer hover:border-slate-500 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">♠️</span>
                          <div>
                            <span className="text-white font-medium">Poker</span>
                            <p className="text-xs text-gray-400">Poker tables and poker tournaments</p>
                          </div>
                        </div>
                        <div
                          onClick={() => setClubForm({...clubForm, pokerEnabled: !clubForm.pokerEnabled})}
                          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${clubForm.pokerEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${clubForm.pokerEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </div>
                      </label>

                      {/* Rummy Toggle */}
                      <label className="flex items-center justify-between bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 cursor-pointer hover:border-slate-500 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🃏</span>
                          <div>
                            <span className="text-white font-medium">Rummy</span>
                            <p className="text-xs text-gray-400">Rummy tables and rummy tournaments</p>
                          </div>
                        </div>
                        <div
                          onClick={() => setClubForm({...clubForm, rummyEnabled: !clubForm.rummyEnabled})}
                          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${clubForm.rummyEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${clubForm.rummyEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </div>
                      </label>

                    </div>

                    {!clubForm.pokerEnabled && !clubForm.rummyEnabled && (
                      <p className="text-xs text-red-400">⚠ At least one game type should be enabled</p>
                    )}
                  </div>

                  {/* Branding */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-pink-400">Club Branding</h3>
                    
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm mb-2 text-gray-300">Club Logo (PNG)</label>
                      <input
                        type="file"
                        accept="image/png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Validate file
                            if (file.size > 5 * 1024 * 1024) {
                              showToast('Logo file size must be less than 5MB', 'error');
                              e.target.value = '';
                              return;
                            }
                            if (!file.type.includes('png')) {
                              showToast('Logo must be a PNG image', 'error');
                              e.target.value = '';
                              return;
                            }
                            setLogoFile(file);
                          }
                        }}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 file:cursor-pointer"
                      />
                      {logoFile && (
                        <p className="text-xs text-emerald-400 mt-2">✓ {logoFile.name} selected (will upload when club is created)</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Logo will be uploaded to Supabase when you create the club (max 5MB)</p>
                    </div>

                    {/* Promo Video URL */}
                    <div>
                      <label className="block text-sm mb-2 text-gray-300">Promo Video URL (mp4) - Optional</label>
                      <input
                        type="text"
                        placeholder="Promo Video URL (mp4)"
                        value={clubForm.videoUrl}
                        onChange={(e) => setClubForm({...clubForm, videoUrl: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500"
                      />
                    </div>

                    {/* Skin Color */}
                    <div>
                      <label className="block text-sm mb-2 text-gray-300">Skin Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={clubForm.skinColor}
                          onChange={(e) => setClubForm({...clubForm, skinColor: e.target.value})}
                          className="w-16 h-12 bg-slate-800 border border-slate-600 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={clubForm.skinColor}
                          onChange={(e) => setClubForm({...clubForm, skinColor: e.target.value})}
                          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Primary theme color for the club</p>
                    </div>

                    {/* Gradient */}
                    <div>
                      <label className="block text-sm mb-2 text-gray-300">Gradient Selection</label>
                      <select
                        value={clubForm.gradient}
                        onChange={(e) => setClubForm({...clubForm, gradient: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                      >
                        {gradientOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Gradient theme for club branding</p>
                    </div>
                </div>

                  {/* Tenant Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-cyan-400">Tenant Assignment</h3>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                      <input
                          type="radio"
                          checked={!clubForm.createNewTenant}
                          onChange={() => setClubForm({...clubForm, createNewTenant: false})}
                          className="w-4 h-4"
                        />
                        <span>Assign to Existing Tenant</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={clubForm.createNewTenant}
                          onChange={() => setClubForm({...clubForm, createNewTenant: true})}
                          className="w-4 h-4"
                        />
                        <span>Create New Tenant</span>
                      </label>
              </div>

                    {!clubForm.createNewTenant ? (
                    <div>
                        <label className="block text-sm mb-2">Select Tenant</label>
                        <select
                          value={clubForm.tenantId}
                          onChange={async (e) => {
                            const tenantId = e.target.value;
                            setClubForm({...clubForm, tenantId});
                            
                            // Auto-fetch super admin email for this tenant (not shown, but used by backend)
                            if (tenantId) {
                              try {
                                const tenantData = await tenantsAPI.getTenant(tenantId);
                                if (tenantData && tenantData.superAdmin) {
                                  console.log('✅ Tenant has super admin:', tenantData.superAdmin.email);
                                }
                              } catch (err) {
                                console.error('Failed to fetch tenant info:', err);
                              }
                            }
                          }}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                          required={!clubForm.createNewTenant}
                        >
                          <option value="">Choose a tenant...</option>
                          {tenants.map(tenant => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </option>
                          ))}
                        </select>
                    </div>
                    ) : (
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-emerald-400">New Tenant Details</h4>
                        <input
                          type="text"
                          placeholder="Tenant Name"
                          value={clubForm.newTenantName}
                          onChange={(e) => setClubForm({...clubForm, newTenantName: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                          required={clubForm.createNewTenant}
                        />
                        <input
                          type="text"
                          placeholder="Super Admin Name"
                          value={clubForm.newSuperAdminName}
                          onChange={(e) => setClubForm({...clubForm, newSuperAdminName: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                          required={clubForm.createNewTenant}
                        />
                        <input
                          type="email"
                          placeholder="Super Admin Email"
                          value={clubForm.newSuperAdminEmail}
                          onChange={(e) => setClubForm({...clubForm, newSuperAdminEmail: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                          required={clubForm.createNewTenant}
              />
                    </div>
          )}
                  </div>

                  <p className="text-sm text-gray-400 text-center">A unique 6-digit club code will be generated automatically</p>
                </div>

                {/* Right: Live Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Live Preview</h3>
                  <div className={`p-8 rounded-xl bg-gradient-to-br ${getGradientClass(clubForm.gradient)} min-h-[500px]`}>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xs overflow-hidden" style={{ backgroundColor: clubForm.skinColor }}>
                          {logoFile ? (
                            <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="w-full h-full object-cover rounded-lg" />
                          ) : clubForm.logoUrl ? (
                            <img src={clubForm.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" onError={(e) => e.target.style.display = 'none'} />
                          ) : (
                            'LOGO'
                          )}
                      </div>
                        <div className="flex-1">
                          <h4 className="text-2xl font-bold text-white">
                            {clubForm.clubName || 'Club Name'}
                          </h4>
                          <p className="text-white/80 text-sm">
                            {clubForm.clubDescription || 'Club description will appear here'}
                          </p>
                      </div>
                    </div>

                      <div className="space-y-3 text-white">
                      <div className="flex items-center gap-2">
                          <span className="font-medium">Logo:</span>
                          <span className="text-white/80">
                            {logoFile ? `${logoFile.name} (${(logoFile.size / 1024).toFixed(1)}KB)` : clubForm.logoUrl ? 'Set via URL' : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="font-medium">Video:</span>
                          <span className="text-white/80">
                            {clubForm.videoUrl ? 'Set' : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="font-medium">Skin Color:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded border-2 border-white" style={{ backgroundColor: clubForm.skinColor }}></div>
                            <span className="text-white/80 font-mono text-sm">{clubForm.skinColor}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="font-medium">Gradient:</span>
                          <span className="text-white/80 text-sm">
                            {gradientOptions.find(g => g.value === clubForm.gradient)?.label || clubForm.gradient}
                        </span>
                      </div>
                    </div>

                      <div className="mt-6 pt-6 border-t border-white/20">
                        <p className="text-white/70 text-sm">
                          This preview shows how the branding will appear in the player portal and club dashboards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
                    </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
              <button
                  type="submit"
                  disabled={uploadingLogo}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium text-white"
              >
                  {uploadingLogo ? 'Uploading Logo...' : 'Create Club'}
                    </button>
              <button
                  type="button"
                  onClick={() => {
                    setShowCreateClubModal(false);
                    setLogoFile(null);
                  }}
                  disabled={uploadingLogo}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed rounded-lg font-medium text-white"
                >
                  Cancel
                          </button>
                        </div>
            </form>
                      </div>
                  </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-lg shadow-2xl border-2 ${
          toastType === 'error' 
            ? 'bg-red-900 border-red-500 text-red-100' 
            : 'bg-emerald-900 border-emerald-500 text-emerald-100'
        }`}>
          <div className="flex items-center gap-3">
            {toastType === 'error' ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <p className="font-medium">{toastMessage}</p>
                </div>
              </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full border-2 border-emerald-500 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {successData.type === 'tenant' ? '🎉 Tenant Created!' : successData.type === 'tenant-club' ? '🎉 Tenant & Club Created!' : '🎉 Club Created!'}
              </h2>
              <p className="text-emerald-400 text-sm">Save these credentials securely!</p>
            </div>

            <div className="space-y-6">
              {successData.type === 'tenant' && (
                <>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
                    <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      Tenant Details
                    </h3>
                    <p className="text-white"><span className="text-gray-400">Name:</span> {successData.tenantName}</p>
            </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/30">
                    <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Super Admin Login
                  </h3>
                  <div className="space-y-2">
                      <p className="text-white"><span className="text-gray-400">Email:</span> {successData.superAdminEmail}</p>
                      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3 mt-2">
                        <p className="text-yellow-400 text-sm font-medium mb-1">⚠️ Temporary Password</p>
                        <p className="text-yellow-100 font-mono text-lg font-bold">{successData.tempPassword}</p>
                      </div>
                      </div>
                    </div>
                </>
              )}
              
              {successData.type === 'tenant-club' && (
                <>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
                    <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      Tenant Details
                  </h3>
                    <p className="text-white"><span className="text-gray-400">Name:</span> {successData.tenant.name}</p>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/30">
                    <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Super Admin Login
                  </h3>
                  <div className="space-y-2">
                      <p className="text-white"><span className="text-gray-400">Name:</span> {successData.superAdmin.displayName || successData.superAdmin.email}</p>
                      <p className="text-white"><span className="text-gray-400">Email:</span> {successData.superAdmin.email}</p>
                      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3 mt-2">
                        <p className="text-yellow-400 text-sm font-medium mb-1">⚠️ Temporary Password</p>
                        <p className="text-yellow-100 font-mono text-lg font-bold">{successData.superAdmin.tempPassword}</p>
                      </div>
                      </div>
                      </div>
                </>
              )}

              {(successData.type === 'tenant-club' || successData.type === 'club') && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-500/30">
                  <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    Club Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-white"><span className="text-gray-400">Club Name:</span> {successData.club.name}</p>
                    <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-3 mt-2">
                      <p className="text-emerald-400 text-sm font-medium mb-1">🎮 Unique Club Code</p>
                      <p className="text-emerald-100 font-mono text-2xl font-bold tracking-wider">{successData.club.code}</p>
                      <p className="text-emerald-300 text-xs mt-1">Players use this code to sign up</p>
                  </div>
                    {successData.logoUrl && (
                      <p className="text-emerald-400 text-sm mt-2">✅ Logo uploaded successfully</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-gray-400 text-sm font-medium mb-2">Game Access:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${successData.club.pokerEnabled !== false ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-gray-500'}`}>
                          ♠️ Poker {successData.club.pokerEnabled !== false ? 'ON' : 'OFF'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${successData.club.rummyEnabled ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-gray-500'}`}>
                          🃏 Rummy {successData.club.rummyEnabled ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>
                </div>
              </div>
          )}
            </div>

              <button
              onClick={() => {
                setShowSuccessModal(false);
                setSuccessData(null);
              }}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-bold text-white text-lg transition-colors"
            >
              Got it! Close
              </button>
            </div>
          </div>
      )}
    </div>
  );
}
