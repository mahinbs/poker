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
  });

  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [termsForm, setTermsForm] = useState({
    termsText: "",
    publicUrl: "",
  });

  const navigate = useNavigate();

  const menuItems = [
    "Dashboard",
    "Tenants Management",
    "Clubs Management",
    "Rummy Settings",
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

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      const result = await tenantsAPI.createTenant({
        name: tenantForm.tenantName,
        superAdminName: tenantForm.superAdminName,
        superAdminEmail: tenantForm.superAdminEmail,
      });
      
      alert(`✅ Tenant Created!\n\nTenant: ${result.tenant.name}\n\nSuper Admin Email: ${result.superAdmin.email}\nTemporary Password: ${result.superAdmin.tempPassword}\n\n⚠️ Save these credentials!`);
      
      setShowCreateTenantModal(false);
      setTenantForm({
        tenantName: "",
        superAdminName: "",
        superAdminEmail: "",
      });
      
      loadDashboardData();
    } catch (err) {
      const errorMsg = err.message || 'Unknown error';
      
      // Show user-friendly error messages
      if (errorMsg.includes('already exists') || errorMsg.includes('already used')) {
        alert('❌ ' + errorMsg);
      } else if (errorMsg.includes('Tenant name')) {
        alert('❌ ' + errorMsg);
      } else {
        alert('❌ Failed to create tenant: ' + errorMsg);
      }
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    setUploadingLogo(true);
    
    try {
      let result;
      const gradientClass = gradientOptions.find(g => g.value === clubForm.gradient)?.class || clubForm.gradient;
      
      if (clubForm.createNewTenant) {
        // Step 1: Create tenant + club together
        result = await masterAdminAPI.createTenantWithClub({
          tenantName: clubForm.newTenantName,
          superAdminName: clubForm.newSuperAdminName,
          superAdminEmail: clubForm.newSuperAdminEmail,
          clubName: clubForm.clubName,
          clubDescription: clubForm.clubDescription,
          skinColor: clubForm.skinColor,
          gradient: gradientClass,
          logoUrl: clubForm.logoUrl,
          videoUrl: clubForm.videoUrl,
        });
        
        // Step 2: Upload logo if file is selected
        let finalLogoUrl = clubForm.logoUrl;
        if (logoFile && result.club && result.tenant) {
          try {
            const tenantId = result.tenant.id;
            const clubId = result.club.id;
            
            // Get signed upload URL from backend
            const uploadData = await tenantsAPI.getLogoUploadUrl(tenantId, clubId);
            
            // Upload file to Supabase
            await tenantsAPI.uploadLogo(uploadData.signedUrl, logoFile);
            
            // Get public URL
            finalLogoUrl = tenantsAPI.getLogoPublicUrl(tenantId, clubId);
            
            // Update club with logo URL in database
            await masterAdminAPI.updateClub(clubId, { logoUrl: finalLogoUrl });
          } catch (uploadErr) {
            console.error('Logo upload failed:', uploadErr);
            // Don't fail the whole operation, just warn
          }
        }
        
        // Step 3: Show success message with all details
        const message = `✅ SUCCESS! Club Created with New Tenant\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `📋 TENANT DETAILS\n` +
          `Tenant Name: ${result.tenant.name}\n\n` +
          `👤 SUPER ADMIN LOGIN\n` +
          `Name: ${result.superAdmin.displayName || result.superAdmin.email}\n` +
          `Email: ${result.superAdmin.email}\n` +
          `Password: ${result.superAdmin.tempPassword}\n\n` +
          `🎮 CLUB DETAILS\n` +
          `Club Name: ${result.club.name}\n` +
          `Club Code: ${result.club.code}\n` +
          (finalLogoUrl ? `Logo: Uploaded ✓\n` : '') +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `⚠️ IMPORTANT: Save these credentials!\n` +
          `Players will use club code "${result.club.code}" to sign up.`;
        
        alert(message);
      } else {
        // Step 1: Create club for existing tenant
        result = await tenantsAPI.createClubWithBranding(clubForm.tenantId, {
          name: clubForm.clubName,
          description: clubForm.clubDescription || undefined,
          skinColor: clubForm.skinColor || undefined,
          gradient: gradientClass || undefined,
          logoUrl: clubForm.logoUrl || undefined,
          videoUrl: clubForm.videoUrl || undefined,
        });
        
        // Step 2: Upload logo if file is selected
        let finalLogoUrl = clubForm.logoUrl;
        if (logoFile && result.id) {
          try {
            const tenantId = clubForm.tenantId;
            const clubId = result.id;
            
            // Get signed upload URL
            const uploadData = await tenantsAPI.getLogoUploadUrl(tenantId, clubId);
            
            // Upload file to Supabase
            await tenantsAPI.uploadLogo(uploadData.signedUrl, logoFile);
            
            // Get public URL
            finalLogoUrl = tenantsAPI.getLogoPublicUrl(tenantId, clubId);
            
            // Update club with logo URL
            await masterAdminAPI.updateClub(clubId, { logoUrl: finalLogoUrl });
          } catch (uploadErr) {
            console.error('Logo upload failed:', uploadErr);
            // Don't fail the whole operation
          }
        }
        
        // Step 3: Show success message
        const message = `✅ SUCCESS! Club Created\n\n` +
          `🎮 CLUB DETAILS\n` +
          `Club Name: ${result.name}\n` +
          `Club Code: ${result.code}\n` +
          (finalLogoUrl ? `Logo: Uploaded ✓\n` : '') +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `Players will use club code "${result.code}" to sign up.`;
        
        alert(message);
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
      });
      setLogoFile(null);
      
      loadDashboardData();
    } catch (err) {
      const errorMsg = err.message || 'Unknown error';
      
      // Show user-friendly error messages
      if (errorMsg.includes('already exists') || errorMsg.includes('already used')) {
        alert('❌ ' + errorMsg);
      } else {
        alert('❌ Failed to create club: ' + errorMsg);
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
    e.preventDefault();
    if (!selectedClubId) {
      alert("Please select a club first");
      return;
    }
    
    try {
      await masterAdminAPI.updateClubTerms(selectedClubId, termsForm.termsText);
      alert("✅ Terms & Conditions updated successfully!");
      loadDashboardData();
    } catch (err) {
      alert("Failed to update terms: " + err.message);
    }
  };

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

  const selectedClubData = clubs.find(c => c.id === selectedClubId);

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

            {/* RUMMY SETTINGS */}
          {activeItem === "Rummy Settings" && (
              <section className="p-6 bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-black/50 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">Rummy Mode Settings</h2>

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
                          Enable Rummy Mode for {selectedClubData.name}
                        </h4>
                        <p className="text-gray-300 text-sm mb-4">
                          When enabled, the club's backend dashboard and player portal will show Rummy-specific features:
                        </p>
                        <ul className="space-y-2 text-sm text-gray-400 mb-6">
                          <li>• UI labels change from "Poker Table" to "Rummy Table"</li>
                          <li>• Table shape switches to round for Rummy tables</li>
                          <li>• Rummy variants become available in table creation</li>
                          <li>• Rummy-specific rules and gameplay features are enabled</li>
                        </ul>
                    <button
                          disabled
                          className="w-full bg-slate-700 text-gray-400 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
                        >
                          Disabled
                    </button>
                        <p className="text-xs text-gray-500 mt-3">
                          Note: Table creation and management is handled by club staff (Admin/Manager) in their respective portals, just like poker tables. This setting only enables/disables Rummy mode features for the club.
                        </p>
                  </div>
                    )}
                </div>

                  {/* Club Rummy Status */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Club Rummy Status</h3>
                  <div className="space-y-3">
                      {clubs.map(club => (
                        <div key={club.id} className="p-4 bg-slate-800/70 rounded-lg border border-slate-600 flex justify-between items-center">
                        <div>
                            <div className="font-medium text-white">{club.name}</div>
                            <div className="text-xs text-gray-400">Rummy Mode: Disabled</div>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300">
                            Disabled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

            {/* TERMS & CONDITIONS */}
          {activeItem === "Terms & Conditions" && (
              <section className="p-6 bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-black/50 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">Terms & Conditions (Per Club)</h2>

                <div className="max-w-4xl mx-auto">
                  <div className="flex gap-4 mb-6">
                    <select
                      value={selectedClubId || ''}
                      onChange={(e) => {
                        setSelectedClubId(e.target.value);
                        const club = clubs.find(c => c.id === e.target.value);
                        if (club) {
                          setTermsForm({
                            termsText: club.termsAndConditions || '',
                            publicUrl: '',
                          });
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Choose a club...</option>
                      {clubs.map(club => (
                        <option key={club.id} value={club.id}>
                          {club.name} ({club.code}) - {club.tenant.name}
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

                  {selectedClubData && (
                    <form onSubmit={handleUpdateTerms}>
                <textarea
                        name="terms"
                        value={termsForm.termsText}
                        onChange={(e) => setTermsForm({...termsForm, termsText: e.target.value})}
                        rows={15}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono text-sm"
                  placeholder="Paste Terms & Conditions here..."
                      />
                      <p className="text-xs text-gray-400 mt-2">
                  Only Master Admin can manage club T&C.
                      </p>
                    </form>
                  )}

                  {!selectedClubData && (
                    <div className="text-center py-12 text-gray-400">
                      <p>Select a club from the dropdown above to edit terms & conditions.</p>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-xl p-8 max-w-6xl w-full my-8 border border-slate-700">
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

                  {/* Branding */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-pink-400">Club Branding</h3>
                    
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm mb-2 text-gray-300">Club Logo (PNG)</label>
                      <input
                        type="file"
                        accept="image/png,image/jpg,image/jpeg"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Logo file size must be less than 5MB');
                              e.target.value = '';
                              return;
                            }
                            setLogoFile(file);
                          }
                        }}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 file:cursor-pointer"
                        disabled={uploadingLogo}
                      />
                      {logoFile && (
                        <p className="text-xs text-emerald-400 mt-2">✓ {logoFile.name} selected (will upload when club is created)</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Logo will be uploaded to Supabase after club creation (max 5MB)</p>
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
                          onChange={(e) => setClubForm({...clubForm, tenantId: e.target.value})}
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
    </div>
  );
}
