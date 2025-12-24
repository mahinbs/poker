/**
 * API Service Layer for Staff Portal
 * Connects to poker-crm-backend NestJS API
 * 
 * SECURITY: All data flows through backend API only.
 * No direct Supabase access from frontend.
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3333/api';

// Storage keys
const STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_EMAIL: 'userEmail',
  USER_ROLE: 'userRole',
  CLUB_ID: 'clubId',
  TENANT_ID: 'tenantId',
  AUTH_TOKEN: 'authToken',
};

/**
 * Get authentication headers
 */
export const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  const clubId = localStorage.getItem(STORAGE_KEYS.CLUB_ID);
  const tenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID);
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  if (userId) headers['x-user-id'] = userId;
  if (clubId) headers['x-club-id'] = clubId;
  if (tenantId) headers['x-tenant-id'] = tenantId;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return headers;
};

/**
 * Make API request
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// =============================================================================
// AUTHENTICATION API
// =============================================================================

export const authAPI = {
  /**
   * Staff login
   */
  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store auth data
    if (data.user) {
      localStorage.setItem(STORAGE_KEYS.USER_ID, data.user.id);
      localStorage.setItem(STORAGE_KEYS.USER_EMAIL, data.user.email);
      
      // Store full user object for profile display
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        name: data.user.displayName || data.user.email,
        displayName: data.user.displayName,
        isMasterAdmin: data.user.isMasterAdmin || false
      }));
      
      // Store club role if exists
      if (data.clubRoles && data.clubRoles.length > 0) {
        const primaryRole = data.clubRoles[0];
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, primaryRole.role);
        localStorage.setItem(STORAGE_KEYS.CLUB_ID, primaryRole.club.id);
        localStorage.setItem(STORAGE_KEYS.TENANT_ID, primaryRole.club.tenantId);
      }
      // Store tenant role if exists
      else if (data.tenantRoles && data.tenantRoles.length > 0) {
        const primaryRole = data.tenantRoles[0];
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, primaryRole.role);
        localStorage.setItem(STORAGE_KEYS.TENANT_ID, primaryRole.tenant.id);
      }
      // Master admin
      else if (data.user.isMasterAdmin) {
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, 'MASTER_ADMIN');
      }
    }

    return data;
  },

  /**
   * Logout
   */
  logout: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  /**
   * Get current user data
   */
  getCurrentUser: () => {
    return {
      userId: localStorage.getItem(STORAGE_KEYS.USER_ID),
      email: localStorage.getItem(STORAGE_KEYS.USER_EMAIL),
      role: localStorage.getItem(STORAGE_KEYS.USER_ROLE),
      clubId: localStorage.getItem(STORAGE_KEYS.CLUB_ID),
      tenantId: localStorage.getItem(STORAGE_KEYS.TENANT_ID),
    };
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEYS.USER_ID);
  },
};

// =============================================================================
// CLUBS API
// =============================================================================

export const clubsAPI = {
  /**
   * Get all clubs
   */
  getClubs: async () => {
    return await apiRequest('/clubs');
  },

  /**
   * Get club by ID
   */
  getClub: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}`);
  },

  /**
   * Create club
   */
  createClub: async (clubData) => {
    return await apiRequest('/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    });
  },

  /**
   * Update club
   */
  updateClub: async (clubId, clubData) => {
    return await apiRequest(`/clubs/${clubId}`, {
      method: 'PUT',
      body: JSON.stringify(clubData),
    });
  },
};

// =============================================================================
// PLAYERS API
// =============================================================================

export const playersAPI = {
  /**
   * Get all players in a club
   */
  getPlayers: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/players`);
  },

  /**
   * Get player by ID
   */
  getPlayer: async (clubId, playerId) => {
    return await apiRequest(`/clubs/${clubId}/players/${playerId}`);
  },

  /**
   * Create player
   */
  createPlayer: async (clubId, playerData) => {
    return await apiRequest(`/clubs/${clubId}/players`, {
      method: 'POST',
      body: JSON.stringify(playerData),
    });
  },

  /**
   * Update player
   */
  updatePlayer: async (clubId, playerId, playerData) => {
    return await apiRequest(`/clubs/${clubId}/players/${playerId}`, {
      method: 'PUT',
      body: JSON.stringify(playerData),
    });
  },

  /**
   * Update player KYC status
   */
  updateKycStatus: async (clubId, playerId, status, approvedBy) => {
    return await apiRequest(`/clubs/${clubId}/players/${playerId}/kyc-status`, {
      method: 'PUT',
      body: JSON.stringify({ kycStatus: status, approvedBy }),
    });
  },

  /**
   * Get KYC pending players
   */
  getKycPending: async (clubId) => {
    const players = await apiRequest(`/clubs/${clubId}/players`);
    return players.filter(p => p.kycStatus === 'pending');
  },
};

// =============================================================================
// TABLES API
// =============================================================================

export const tablesAPI = {
  /**
   * Get all tables in a club
   */
  getTables: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/tables`);
  },

  /**
   * Get table by ID
   */
  getTable: async (clubId, tableId) => {
    return await apiRequest(`/clubs/${clubId}/tables/${tableId}`);
  },

  /**
   * Create table
   */
  createTable: async (clubId, tableData) => {
    return await apiRequest(`/clubs/${clubId}/tables`, {
      method: 'POST',
      body: JSON.stringify(tableData),
    });
  },

  /**
   * Update table
   */
  updateTable: async (clubId, tableId, tableData) => {
    return await apiRequest(`/clubs/${clubId}/tables/${tableId}`, {
      method: 'PUT',
      body: JSON.stringify(tableData),
    });
  },

  /**
   * Delete table
   */
  deleteTable: async (clubId, tableId) => {
    return await apiRequest(`/clubs/${clubId}/tables/${tableId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Assign seat at table
   */
  assignSeat: async (clubId, tableId, assignmentData) => {
    return await apiRequest(`/clubs/${clubId}/tables/${tableId}/assign-seat`, {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },
};

// =============================================================================
// WAITLIST API
// =============================================================================

export const waitlistAPI = {
  /**
   * Get all waitlist entries
   */
  getWaitlist: async (clubId, status = null) => {
    const query = status ? `?status=${status}` : '';
    return await apiRequest(`/clubs/${clubId}/waitlist${query}`);
  },

  /**
   * Add to waitlist
   */
  addToWaitlist: async (clubId, waitlistData) => {
    return await apiRequest(`/clubs/${clubId}/waitlist`, {
      method: 'POST',
      body: JSON.stringify(waitlistData),
    });
  },

  /**
   * Update waitlist entry
   */
  updateWaitlist: async (clubId, entryId, updateData) => {
    return await apiRequest(`/clubs/${clubId}/waitlist/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Seat player from waitlist
   */
  seatPlayer: async (clubId, entryId, tableNumber, seatedBy) => {
    return await apiRequest(`/clubs/${clubId}/waitlist/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'SEATED',
        tableNumber,
        seatedBy,
        seatedAt: new Date().toISOString(),
      }),
    });
  },

  /**
   * Cancel waitlist entry
   */
  cancelWaitlist: async (clubId, entryId) => {
    return await apiRequest(`/clubs/${clubId}/waitlist/${entryId}`, {
      method: 'DELETE',
    });
  },
};

// =============================================================================
// CREDIT API
// =============================================================================

export const creditAPI = {
  /**
   * Get all credit requests
   */
  getCreditRequests: async (clubId, status = null) => {
    const query = status ? `?status=${status}` : '';
    return await apiRequest(`/clubs/${clubId}/credit-requests${query}`);
  },

  /**
   * Create credit request
   */
  createCreditRequest: async (clubId, requestData) => {
    return await apiRequest(`/clubs/${clubId}/credit-requests`, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  /**
   * Approve credit request
   */
  approveCreditRequest: async (clubId, requestId, approvedBy) => {
    return await apiRequest(`/clubs/${clubId}/credit-requests/${requestId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approvedBy }),
    });
  },

  /**
   * Reject credit request
   */
  rejectCreditRequest: async (clubId, requestId, reason) => {
    return await apiRequest(`/clubs/${clubId}/credit-requests/${requestId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Update credit visibility
   */
  updateCreditVisibility: async (clubId, requestId, visibleToPlayer) => {
    return await apiRequest(`/clubs/${clubId}/credit-requests/${requestId}/visibility`, {
      method: 'PUT',
      body: JSON.stringify({ visibleToPlayer }),
    });
  },
};

// =============================================================================
// FNB API
// =============================================================================

export const fnbAPI = {
  /**
   * Get menu items
   */
  getMenu: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/fnb/menu`);
  },

  /**
   * Create menu item
   */
  createMenuItem: async (clubId, itemData) => {
    return await apiRequest(`/clubs/${clubId}/fnb/menu`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  /**
   * Update menu item
   */
  updateMenuItem: async (clubId, itemId, itemData) => {
    return await apiRequest(`/clubs/${clubId}/fnb/menu/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  },

  /**
   * Get all orders
   */
  getOrders: async (clubId, status = null) => {
    const query = status ? `?status=${status}` : '';
    return await apiRequest(`/clubs/${clubId}/fnb/orders${query}`);
  },

  /**
   * Create order
   */
  createOrder: async (clubId, orderData) => {
    return await apiRequest(`/clubs/${clubId}/fnb/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (clubId, orderId, status, processedBy) => {
    return await apiRequest(`/clubs/${clubId}/fnb/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, processedBy }),
    });
  },
};

// =============================================================================
// TOURNAMENTS API
// =============================================================================

export const tournamentsAPI = {
  /**
   * Get all tournaments
   */
  getTournaments: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/tournaments`);
  },

  /**
   * Create tournament
   */
  createTournament: async (clubId, tournamentData) => {
    return await apiRequest(`/clubs/${clubId}/tournaments`, {
      method: 'POST',
      body: JSON.stringify(tournamentData),
    });
  },

  /**
   * Update tournament
   */
  updateTournament: async (clubId, tournamentId, tournamentData) => {
    return await apiRequest(`/clubs/${clubId}/tournaments/${tournamentId}`, {
      method: 'PUT',
      body: JSON.stringify(tournamentData),
    });
  },
};

// =============================================================================
// STAFF API
// =============================================================================

export const staffAPI = {
  /**
   * Get all staff
   */
  getStaff: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/staff`);
  },

  /**
   * Create staff member
   */
  createStaff: async (clubId, staffData) => {
    return await apiRequest(`/clubs/${clubId}/staff`, {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  },

  /**
   * Update staff member
   */
  updateStaff: async (clubId, staffId, staffData) => {
    return await apiRequest(`/clubs/${clubId}/staff/${staffId}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  },
};

// =============================================================================
// TRANSACTIONS API
// =============================================================================

export const transactionsAPI = {
  /**
   * Get all transactions
   */
  getTransactions: async (clubId, filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await apiRequest(`/clubs/${clubId}/transactions${query ? '?' + query : ''}`);
  },

  /**
   * Create transaction
   */
  createTransaction: async (clubId, transactionData) => {
    return await apiRequest(`/clubs/${clubId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },
};

// =============================================================================
// TENANTS API (Master Admin)
// =============================================================================

export const tenantsAPI = {
  /**
   * Get all tenants
   */
  getTenants: async () => {
    return await apiRequest('/tenants');
  },

  /**
   * Create tenant (only tenant + super admin, no club)
   */
  createTenant: async (data) => {
    // If data is a string, convert to object for backward compatibility
    const payload = typeof data === 'string' ? { name: data } : data;
    
    return await apiRequest('/tenants', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Create super admin for tenant
   */
  createSuperAdmin: async (tenantId, email, displayName) => {
    return await apiRequest(`/tenants/${tenantId}/super-admins`, {
      method: 'POST',
      body: JSON.stringify({ email, displayName }),
    });
  },

  /**
   * Setup tenant (create tenant + club + super admin in one go)
   */
  setupTenant: async (tenantId, data) => {
    return await apiRequest(`/tenants/${tenantId}/setup`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Create club under tenant
   */
  createClub: async (tenantId, clubData) => {
    return await apiRequest(`/tenants/${tenantId}/clubs`, {
      method: 'POST',
      body: JSON.stringify(clubData),
    });
  },

  /**
   * Create club with branding for existing tenant
   */
  createClubWithBranding: async (tenantId, clubData) => {
    // Filter out empty/undefined values
    const payload = {
      name: clubData.name,
    };
    
    if (clubData.description) payload.description = clubData.description;
    if (clubData.skinColor) payload.skinColor = clubData.skinColor;
    if (clubData.gradient) payload.gradient = clubData.gradient;
    if (clubData.logoUrl) payload.logoUrl = clubData.logoUrl;
    if (clubData.videoUrl) payload.videoUrl = clubData.videoUrl;
    
    return await apiRequest(`/tenants/${tenantId}/clubs`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get signed URL for logo upload
   */
  getLogoUploadUrl: async (tenantId, clubId) => {
    return await apiRequest(`/tenants/${tenantId}/clubs/${clubId}/logo-upload-url`, {
      method: 'POST',
    });
  },

  /**
   * Upload logo file to Supabase
   */
  uploadLogo: async (signedUrl, file) => {
    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/png',
      },
      body: file,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload logo');
    }
    
    return response;
  },

  /**
   * Get logo public URL from backend
   */
  getLogoPublicUrl: async (tenantId, clubId) => {
    const response = await apiRequest(`/tenants/${tenantId}/clubs/${clubId}/logo-url`);
    return response.logoUrl;
  },
};

// =============================================================================
// MASTER ADMIN API
// =============================================================================

export const masterAdminAPI = {
  /**
   * Get current logged-in user info
   */
  getCurrentUser: async () => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      throw new Error('User not logged in');
    }
    // Fetch user from backend
    return await apiRequest(`/users/${userId}`);
  },

  /**
   * Get all clubs with tenant info
   */
  getAllClubs: async () => {
    return await apiRequest('/clubs/master-admin/all');
  },

  /**
   * Update club status (active/suspended/killed)
   */
  updateClubStatus: async (clubId, status, reason) => {
    return await apiRequest(`/clubs/${clubId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  },

  /**
   * Update club subscription
   */
  updateClubSubscription: async (clubId, subscriptionData) => {
    return await apiRequest(`/clubs/${clubId}/subscription`, {
      method: 'PUT',
      body: JSON.stringify(subscriptionData),
    });
  },

  /**
   * Update club terms and conditions
   */
  updateClubTerms: async (clubId, termsAndConditions) => {
    return await apiRequest(`/clubs/${clubId}/terms`, {
      method: 'PUT',
      body: JSON.stringify({ termsAndConditions }),
    });
  },

  /**
   * Create complete tenant setup (tenant + club + super admin)
   */
  createTenantWithClub: async (data) => {
    return await apiRequest('/tenants/with-club', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async () => {
    try {
      const clubs = await masterAdminAPI.getAllClubs();
      const tenants = await tenantsAPI.getTenants();

      // Calculate statistics
      const totalClubs = clubs.length;
      const activeClubs = clubs.filter(c => c.status === 'active').length;
      const suspendedClubs = clubs.filter(c => c.status === 'suspended').length;
      const killedClubs = clubs.filter(c => c.status === 'killed').length;

      // Calculate revenue
      const monthlyRevenue = clubs.reduce((sum, club) => {
        return sum + (parseFloat(club.subscriptionPrice) || 0);
      }, 0);

      return {
        totalTenants: tenants.length,
        totalClubs,
        activeClubs,
        suspendedClubs,
        killedClubs,
        monthlyRevenue,
        clubs,
        tenants,
      };
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Return empty data structure on error
      return {
        totalTenants: 0,
        totalClubs: 0,
        activeClubs: 0,
        suspendedClubs: 0,
        killedClubs: 0,
        monthlyRevenue: 0,
        clubs: [],
        tenants: [],
      };
    }
  },
};

// Export storage keys for use in components
export { STORAGE_KEYS };

