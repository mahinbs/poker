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
      let error;
      try {
        error = await response.json();
      } catch (e) {
        error = { message: response.statusText || `API Error: ${response.status}` };
      }
      // For 401 errors, show the actual error message from backend
      if (response.status === 401) {
        throw new Error(error.message || 'Invalid email or password');
      }
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
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    
    return {
      userId: localStorage.getItem(STORAGE_KEYS.USER_ID),
      email: localStorage.getItem(STORAGE_KEYS.USER_EMAIL),
      role: localStorage.getItem(STORAGE_KEYS.USER_ROLE),
      clubId: localStorage.getItem(STORAGE_KEYS.CLUB_ID),
      tenantId: localStorage.getItem(STORAGE_KEYS.TENANT_ID),
      isMasterAdmin: user.isMasterAdmin || false,
      displayName: user.displayName || null,
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
   * Get player by ID
   */
  getPlayer: async (clubId, playerId) => {
    return await apiRequest(`/clubs/${clubId}/players/${playerId}`);
  },

  /**
   * Get club revenue data (revenue, rake, tips)
   */
  getClubRevenue: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/revenue`);
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

  /**
   * Get active tables for rake collection
   */
  getActiveTablesForRakeCollection: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/rake-collections/active-tables`);
  },

  /**
   * Create rake collection
   */
  createRakeCollection: async (clubId, collectionData) => {
    return await apiRequest(`/clubs/${clubId}/rake-collections`, {
      method: 'POST',
      body: JSON.stringify(collectionData),
    });
  },

  /**
   * Get rake collections with filters
   */
  getRakeCollections: async (clubId, query = {}) => {
    // Remove empty string values from query
    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    const queryString = new URLSearchParams(cleanQuery).toString();
    return await apiRequest(`/clubs/${clubId}/rake-collections${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get rake collection stats
   */
  getRakeCollectionStats: async (clubId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return await apiRequest(`/clubs/${clubId}/rake-collections/stats${params.toString() ? `?${params.toString()}` : ''}`);
  },

  /**
   * Get buy-out requests
   */
  getBuyOutRequests: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/buyout-requests`);
  },

  /**
   * Approve buy-out request
   */
  approveBuyOutRequest: async (clubId, requestId, data) => {
    return await apiRequest(`/clubs/${clubId}/buyout-requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Reject buy-out request
   */
  rejectBuyOutRequest: async (clubId, requestId, data) => {
    return await apiRequest(`/clubs/${clubId}/buyout-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get buy-in requests
   */
  getBuyInRequests: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/buyin-requests`);
  },

  /**
   * Approve buy-in request
   */
  approveBuyInRequest: async (clubId, requestId, data) => {
    return await apiRequest(`/clubs/${clubId}/buyin-requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Reject buy-in request
   */
  rejectBuyInRequest: async (clubId, requestId, data) => {
    return await apiRequest(`/clubs/${clubId}/buyin-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get attendance records
   */
  getAttendanceRecords: async (clubId, startDate, endDate, staffId) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (staffId) params.append('staffId', staffId);
    return await apiRequest(`/clubs/${clubId}/attendance${params.toString() ? `?${params.toString()}` : ''}`);
  },

  /**
   * Get attendance stats
   */
  getAttendanceStats: async (clubId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return await apiRequest(`/clubs/${clubId}/attendance/stats${params.toString() ? `?${params.toString()}` : ''}`);
  },

  /**
   * Get salary payments (for HR - read-only)
   */
  getSalaryPayments: async (clubId, query = {}) => {
    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    const queryString = new URLSearchParams(cleanQuery).toString();
    return await apiRequest(`/clubs/${clubId}/payroll/salary${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Create attendance record
   */
  createAttendanceRecord: async (clubId, data) => {
    return await apiRequest(`/clubs/${clubId}/attendance`, {
      method: 'POST',
      body: JSON.stringify(data),
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

  /**
   * Get pending approval players
   */
  getPendingApprovalPlayers: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/players-pending-approval`);
  },

  /**
   * Get suspended players
   */
  getSuspendedPlayers: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/players-suspended`);
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

  /**
   * Pause table session
   */
  pauseSession: async (clubId, tableId) => {
    return await apiRequest(`/clubs/${clubId}/tables/${tableId}/pause-session`, {
      method: 'POST',
    });
  },

  /**
   * Resume table session
   */
  resumeSession: async (clubId, tableId) => {
    return await apiRequest(`/clubs/${clubId}/tables/${tableId}/resume-session`, {
      method: 'POST',
    });
  },

  /**
   * End table session
   */
  endSession: async (clubId, tableId) => {
    return await apiRequest(`/clubs/${clubId}/tables/${tableId}/end-session`, {
      method: 'POST',
    });
  },

  /**
   * Update session parameters
   */
  updateSessionParams: async (clubId, tableId, params) => {
    return await apiRequest(`/clubs/${clubId}/tables/${tableId}/session-params`, {
      method: 'PATCH',
      body: JSON.stringify(params),
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
  getOrders: async (clubId, status = null, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return await apiRequest(`/clubs/${clubId}/fnb/orders?${params.toString()}`);
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

  // ==================== ENHANCED FNB ENDPOINTS ====================

  /**
   * Kitchen Stations
   */
  createKitchenStation: async (clubId, stationData) => {
    return await apiRequest(`/clubs/${clubId}/fnb/kitchen-stations`, {
      method: 'POST',
      body: JSON.stringify(stationData),
    });
  },

  getKitchenStations: async (clubId, activeOnly = false) => {
    const query = activeOnly ? '?activeOnly=true' : '';
    return await apiRequest(`/clubs/${clubId}/fnb/kitchen-stations${query}`);
  },

  getKitchenStation: async (clubId, stationId) => {
    return await apiRequest(`/clubs/${clubId}/fnb/kitchen-stations/${stationId}`);
  },

  updateKitchenStation: async (clubId, stationId, stationData) => {
    return await apiRequest(`/clubs/${clubId}/fnb/kitchen-stations/${stationId}`, {
      method: 'PATCH',
      body: JSON.stringify(stationData),
    });
  },

  deleteKitchenStation: async (clubId, stationId) => {
    return await apiRequest(`/clubs/${clubId}/fnb/kitchen-stations/${stationId}`, {
      method: 'DELETE',
    });
  },

  getStationStatistics: async (clubId, stationId) => {
    return await apiRequest(`/clubs/${clubId}/fnb/kitchen-stations/${stationId}/statistics`);
  },

  /**
   * Order Acceptance/Rejection
   */
  acceptOrder: async (clubId, orderId, stationId) => {
    return await apiRequest(`/clubs/${clubId}/fnb/orders/${orderId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ stationId, isAccepted: true }),
    });
  },

  rejectOrder: async (clubId, orderId, reason) => {
    return await apiRequest(`/clubs/${clubId}/fnb/orders/${orderId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectedReason: reason, isAccepted: false }),
    });
  },

  markOrderReady: async (clubId, orderId) => {
    return await apiRequest(`/clubs/${clubId}/fnb/orders/${orderId}/ready`, {
      method: 'POST',
    });
  },

  markOrderDelivered: async (clubId, orderId) => {
    return await apiRequest(`/clubs/${clubId}/fnb/orders/${orderId}/delivered`, {
      method: 'POST',
    });
  },

  /**
   * Menu Categories (Enhanced)
   */
  getAllMenuCategories: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/fnb/categories/all`);
  },

  createMenuCategory: async (clubId, categoryName) => {
    return await apiRequest(`/clubs/${clubId}/fnb/categories`, {
      method: 'POST',
      body: JSON.stringify({ categoryName }),
    });
  },

  deleteMenuCategory: async (clubId, categoryId) => {
    return await apiRequest(`/clubs/${clubId}/fnb/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Inventory Management
   */
  getInventory: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/fnb/inventory`);
  },

  createInventoryItem: async (clubId, inventoryData) => {
    return await apiRequest(`/clubs/${clubId}/fnb/inventory`, {
      method: 'POST',
      body: JSON.stringify(inventoryData),
    });
  },

  updateInventory: async (clubId, itemId, inventoryData) => {
    return await apiRequest(`/clubs/${clubId}/fnb/inventory/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(inventoryData),
    });
  },

  /**
   * Suppliers
   */
  getSuppliers: async (clubId, activeOnly = false) => {
    const query = activeOnly ? '?activeOnly=true' : '';
    return await apiRequest(`/clubs/${clubId}/fnb/suppliers${query}`);
  },

  createSupplier: async (clubId, supplierData) => {
    return await apiRequest(`/clubs/${clubId}/fnb/suppliers`, {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  },

  updateSupplier: async (clubId, supplierId, supplierData) => {
    return await apiRequest(`/clubs/${clubId}/fnb/suppliers/${supplierId}`, {
      method: 'PATCH',
      body: JSON.stringify(supplierData),
    });
  },

  deleteSupplier: async (clubId, supplierId) => {
    return await apiRequest(`/clubs/${clubId}/fnb/suppliers/${supplierId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Delete menu item
   */
  deleteMenuItem: async (clubId, itemId) => {
    return await apiRequest(`/clubs/${clubId}/fnb/menu/${itemId}`, {
      method: 'DELETE',
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
    const response = await apiRequest(`/clubs/${clubId}/tournaments`);
    // Handle response structure: { success: true, tournaments: [...] }
    return response?.tournaments || response || [];
  },

  /**
   * Get tournament by ID
   */
  getTournamentById: async (clubId, tournamentId) => {
    return await apiRequest(`/clubs/${clubId}/tournaments/${tournamentId}`);
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

  /**
   * Delete tournament
   */
  deleteTournament: async (clubId, tournamentId) => {
    return await apiRequest(`/clubs/${clubId}/tournaments/${tournamentId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Start tournament
   */
  startTournament: async (clubId, tournamentId) => {
    return await apiRequest(`/clubs/${clubId}/tournaments/${tournamentId}/start`, {
      method: 'POST',
    });
  },

  /**
   * End tournament with winners
   */
  endTournament: async (clubId, tournamentId, winnersData) => {
    return await apiRequest(`/clubs/${clubId}/tournaments/${tournamentId}/end`, {
      method: 'POST',
      body: JSON.stringify(winnersData),
    });
  },

  /**
   * Get tournament players
   */
  getTournamentPlayers: async (clubId, tournamentId) => {
    return await apiRequest(`/clubs/${clubId}/tournaments/${tournamentId}/players`);
  },

  /**
   * Get tournament winners
   */
  getTournamentWinners: async (clubId, tournamentId) => {
    return await apiRequest(`/clubs/${clubId}/tournaments/${tournamentId}/winners`);
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
   * Get all staff with filters (Enhanced)
   */
  getAllStaffMembers: async (clubId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const queryString = params.toString();
    return await apiRequest(`/clubs/${clubId}/staff-management${queryString ? '?' + queryString : ''}`);
  },

  /**
   * Create staff member with KYC (Enhanced)
   */
  createStaffMember: async (clubId, staffData) => {
    return await apiRequest(`/clubs/${clubId}/staff-management/create`, {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  },

  /**
   * Get staff member by ID
   */
  getStaffMember: async (clubId, staffId) => {
    return await apiRequest(`/clubs/${clubId}/staff-management/${staffId}`);
  },

  /**
   * Update staff member
   */
  updateStaffMember: async (clubId, staffId, staffData) => {
    return await apiRequest(`/clubs/${clubId}/staff-management/${staffId}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  },

  /**
   * Suspend staff member
   */
  suspendStaffMember: async (clubId, staffId, reason) => {
    return await apiRequest(`/clubs/${clubId}/staff-management/${staffId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Reactivate staff member
   */
  reactivateStaffMember: async (clubId, staffId) => {
    return await apiRequest(`/clubs/${clubId}/staff-management/${staffId}/reactivate`, {
      method: 'POST',
    });
  },

  /**
   * Delete staff member
   */
  deleteStaffMember: async (clubId, staffId) => {
    return await apiRequest(`/clubs/${clubId}/staff-management/${staffId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Reset staff password
   */
  resetStaffPassword: async (clubId, staffId) => {
    return await apiRequest(`/clubs/${clubId}/staff-management/${staffId}/reset-password`, {
      method: 'POST',
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

  /**
   * Get all chatable users for a club (staff + Super Admin + Admin users)
   */
  getAllChatableUsers: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/chat/chatable-users`);
  },
};

// =============================================================================
// SHIFT MANAGEMENT API
// =============================================================================

export const shiftsAPI = {
  /**
   * Get all shifts with optional filters
   */
  getShifts: async (clubId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/shifts${query ? '?' + query : ''}`);
  },

  /**
   * Get shift by ID
   */
  getShiftById: async (clubId, shiftId) => {
    return await apiRequest(`/clubs/${clubId}/shifts/${shiftId}`);
  },

  /**
   * Create a new shift
   */
  createShift: async (clubId, shiftData) => {
    return await apiRequest(`/clubs/${clubId}/shifts`, {
      method: 'POST',
      body: JSON.stringify(shiftData),
    });
  },

  /**
   * Update a shift
   */
  updateShift: async (clubId, shiftId, shiftData) => {
    return await apiRequest(`/clubs/${clubId}/shifts/${shiftId}`, {
      method: 'PATCH',
      body: JSON.stringify(shiftData),
    });
  },

  /**
   * Delete a shift
   */
  deleteShift: async (clubId, shiftId) => {
    return await apiRequest(`/clubs/${clubId}/shifts/${shiftId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Copy shifts to new dates
   */
  copyShifts: async (clubId, copyData) => {
    return await apiRequest(`/clubs/${clubId}/shifts/copy`, {
      method: 'POST',
      body: JSON.stringify(copyData),
    });
  },

  /**
   * Get all dealers for shift assignment
   */
  getDealers: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/shifts-dealers`);
  },

  /**
   * Delete multiple shifts
   */
  deleteMultipleShifts: async (clubId, shiftIds) => {
    return await apiRequest(`/clubs/${clubId}/shifts/delete-multiple`, {
      method: 'POST',
      body: JSON.stringify({ shiftIds }),
    });
  },
};

// =============================================================================
// PAYROLL API
// =============================================================================

export const payrollAPI = {
  // Salary Processing
  processSalary: async (clubId, salaryData) => {
    return await apiRequest(`/clubs/${clubId}/payroll/salary`, {
      method: 'POST',
      body: JSON.stringify(salaryData),
    });
  },

  getSalaryPayments: async (clubId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/payroll/salary${query ? '?' + query : ''}`);
  },

  getSalaryPaymentById: async (clubId, paymentId) => {
    return await apiRequest(`/clubs/${clubId}/payroll/salary/${paymentId}`);
  },

  getAllStaffForPayroll: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/payroll/staff`);
  },

  getDealersForPayroll: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/payroll/dealers`);
  },

  // Dealer Tips
  getTipSettings: async (clubId, dealerId) => {
    const query = dealerId ? `?dealerId=${dealerId}` : '';
    return await apiRequest(`/clubs/${clubId}/payroll/tips/settings${query}`);
  },

  updateTipSettings: async (clubId, settings, dealerId) => {
    const query = dealerId ? `?dealerId=${dealerId}` : '';
    return await apiRequest(`/clubs/${clubId}/payroll/tips/settings${query}`, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },

  processDealerTips: async (clubId, tipsData) => {
    return await apiRequest(`/clubs/${clubId}/payroll/tips`, {
      method: 'POST',
      body: JSON.stringify(tipsData),
    });
  },

  getDealerTips: async (clubId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/payroll/tips${query ? '?' + query : ''}`);
  },

  getDealerTipsSummary: async (clubId, dealerId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/payroll/tips/${dealerId}/summary${query ? '?' + query : ''}`);
  },

  // Dealer Cashouts
  processDealerCashout: async (clubId, cashoutData) => {
    return await apiRequest(`/clubs/${clubId}/payroll/cashout`, {
      method: 'POST',
      body: JSON.stringify(cashoutData),
    });
  },

  getDealerCashouts: async (clubId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/payroll/cashout${query ? '?' + query : ''}`);
  },
};

// =============================================================================
// BONUS MANAGEMENT API
// =============================================================================

export const bonusAPI = {
  // Player Bonuses
  processPlayerBonus: async (clubId, bonusData) => {
    return await apiRequest(`/clubs/${clubId}/bonuses/players`, {
      method: 'POST',
      body: JSON.stringify(bonusData),
    });
  },

  getPlayerBonuses: async (clubId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/bonuses/players${query ? '?' + query : ''}`);
  },

  getPlayersForBonus: async (clubId, search) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return await apiRequest(`/clubs/${clubId}/bonuses/players/list${query}`);
  },

  // Staff Bonuses
  processStaffBonus: async (clubId, bonusData) => {
    return await apiRequest(`/clubs/${clubId}/bonuses/staff`, {
      method: 'POST',
      body: JSON.stringify(bonusData),
    });
  },

  getStaffBonuses: async (clubId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/bonuses/staff${query ? '?' + query : ''}`);
  },

  getStaffForBonus: async (clubId, search) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return await apiRequest(`/clubs/${clubId}/bonuses/staff/list${query}`);
  },
};

// Affiliate Management
export const affiliateAPI = {
  getAffiliates: async (clubId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/affiliates${query ? '?' + query : ''}`);
  },

  getAffiliateReferrals: async (clubId, affiliateId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/affiliates/${affiliateId}/referrals${query ? '?' + query : ''}`);
  },

  processAffiliatePayment: async (clubId, paymentData) => {
    return await apiRequest(`/clubs/${clubId}/affiliates/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  getAffiliateTransactions: async (clubId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/affiliates/transactions${query ? '?' + query : ''}`);
  },
};

// Financial Overrides
export const financialOverridesAPI = {
  getAllTransactions: async (clubId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/financial-overrides/transactions${query ? '?' + query : ''}`);
  },

  editTransaction: async (clubId, transactionId, data) => {
    return await apiRequest(`/clubs/${clubId}/financial-overrides/transactions/${transactionId}/edit`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  cancelTransaction: async (clubId, transactionId, data = {}) => {
    return await apiRequest(`/clubs/${clubId}/financial-overrides/transactions/${transactionId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data),
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
   * Get tenant by ID with super admin info
   */
  getTenant: async (tenantId) => {
    return await apiRequest(`/tenants/${tenantId}`, {
      method: 'GET',
    });
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
   * Update club rummy enabled status
   */
  updateClubRummyEnabled: async (clubId, rummyEnabled) => {
    return await apiRequest(`/clubs/${clubId}/rummy-enabled`, {
      method: 'PUT',
      body: JSON.stringify({ rummyEnabled }),
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

/**
 * Super Admin APIs
 */
export const superAdminAPI = {
  // Get all clubs for super admin
  getClubs: async () => {
    // Check both 'user' and 'superadminuser' storage keys
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const superAdminUser = JSON.parse(localStorage.getItem('superadminuser') || '{}');
    const userId = user.id || superAdminUser.userId;
    
    if (!userId) {
      throw new Error('User not logged in');
    }
    return await apiRequest(`/users/${userId}/clubs`);
  },

  // Get club details
  getClub: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}`);
  },

  // Get club revenue data
  getClubRevenue: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/revenue`);
  },

  // Player Management
  getAllPlayers: async (clubId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/players?${queryString}`);
  },

  createPlayer: async (clubId, playerData) => {
    return await apiRequest(`/clubs/${clubId}/players`, {
      method: 'POST',
      body: JSON.stringify(playerData),
    });
  },

  getPendingApprovalPlayers: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/players-pending-approval`);
  },

  approvePlayer: async (clubId, playerId, notes) => {
    return await apiRequest(`/clubs/${clubId}/players/${playerId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  rejectPlayer: async (clubId, playerId, reason) => {
    return await apiRequest(`/clubs/${clubId}/players/${playerId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  suspendPlayer: async (clubId, playerId, data) => {
    return await apiRequest(`/clubs/${clubId}/players/${playerId}/suspend`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  unsuspendPlayer: async (clubId, playerId) => {
    return await apiRequest(`/clubs/${clubId}/players/${playerId}/unsuspend`, {
      method: 'POST',
    });
  },

  getSuspendedPlayers: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/players-suspended`);
  },

  getPlayer: async (clubId, playerId) => {
    return await apiRequest(`/clubs/${clubId}/players/${playerId}`);
  },

  // Get all players (alias for getAllPlayers)
  getPlayers: async (clubId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/clubs/${clubId}/players?${queryString}`);
  },

  // Get player balance
  getPlayerBalance: async (clubId, playerId) => {
    return await apiRequest(`/clubs/${clubId}/players/${playerId}/balance`);
  },

  // Transactions
  getTransactions: async (clubId, filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return await apiRequest(`/clubs/${clubId}/transactions${query ? '?' + query : ''}`);
  },

  createTransaction: async (clubId, transactionData) => {
    return await apiRequest(`/clubs/${clubId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },

  // Credit Management
  getCreditRequests: async (clubId, status = null) => {
    const query = status ? `?status=${status}` : '';
    return await apiRequest(`/clubs/${clubId}/credit-requests${query}`);
  },

  approveCreditRequest: async (clubId, requestId, data = {}) => {
    return await apiRequest(`/clubs/${clubId}/credit-requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  rejectCreditRequest: async (clubId, requestId, data) => {
    return await apiRequest(`/clubs/${clubId}/credit-requests/${requestId}/deny`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  unlockCredit: async (clubId, playerId, data) => {
    return await apiRequest(`/clubs/${clubId}/players/${playerId}/enable-credit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCreditLimit: async (clubId, playerId, data) => {
    return await apiRequest(`/clubs/${clubId}/players/${playerId}/credit-limit`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // VIP Store Management
  getVipProducts: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/vip-products`);
  },

  createVipProduct: async (clubId, productData) => {
    return await apiRequest(`/clubs/${clubId}/vip-products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateVipProduct: async (clubId, productId, productData) => {
    return await apiRequest(`/clubs/${clubId}/vip-products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  deleteVipProduct: async (clubId, productId) => {
    return await apiRequest(`/clubs/${clubId}/vip-products/${productId}`, {
      method: 'DELETE',
    });
  },

  // VIP Product Image Upload
  createVipProductImageUploadUrl: async (clubId, filename) => {
    return await apiRequest(`/clubs/${clubId}/vip-products/upload-url`, {
      method: 'POST',
      body: JSON.stringify({ filename }),
    });
  },

  uploadToSignedUrl: async (signedUrl, file) => {
    const response = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    return response;
  },

  // Push Notifications
  getPushNotifications: async (clubId, notificationType = null) => {
    const query = notificationType ? `?notificationType=${notificationType}` : '';
    return await apiRequest(`/clubs/${clubId}/push-notifications${query}`);
  },

  createPushNotification: async (clubId, notificationData) => {
    return await apiRequest(`/clubs/${clubId}/push-notifications`, {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  },

  updatePushNotification: async (clubId, notificationId, notificationData) => {
    return await apiRequest(`/clubs/${clubId}/push-notifications/${notificationId}`, {
      method: 'PUT',
      body: JSON.stringify(notificationData),
    });
  },

  deletePushNotification: async (clubId, notificationId) => {
    return await apiRequest(`/clubs/${clubId}/push-notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  createPushNotificationUploadUrl: async (clubId, filename, isVideo = false) => {
    return await apiRequest(`/clubs/${clubId}/push-notifications/upload-url`, {
      method: 'POST',
      body: JSON.stringify({ filename, isVideo }),
    });
  },
};

// =============================================================================
// CHAT API
// =============================================================================

export const chatAPI = {
  // Staff Chat
  createStaffChatSession: async (clubId, recipientStaffId, subject) => {
    return await apiRequest(`/clubs/${clubId}/chat/staff/sessions`, {
      method: 'POST',
      body: JSON.stringify({ recipientStaffId, subject }),
    });
  },

  getStaffChatSessions: async (clubId, { page = 1, limit = 10, search, role } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    return await apiRequest(`/clubs/${clubId}/chat/staff/sessions?${params.toString()}`);
  },

  // Player Chat
  createPlayerChatSession: async (clubId, playerId, subject) => {
    return await apiRequest(`/clubs/${clubId}/chat/player/sessions`, {
      method: 'POST',
      body: JSON.stringify({ playerId, subject }),
    });
  },

  getPlayerChatSessions: async (clubId, { page = 1, limit = 10, status, search } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    return await apiRequest(`/clubs/${clubId}/chat/player/sessions?${params.toString()}`);
  },

  // Messages
  sendMessage: async (clubId, sessionId, message) => {
    return await apiRequest(`/clubs/${clubId}/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  getSessionMessages: async (clubId, sessionId, { page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return await apiRequest(`/clubs/${clubId}/chat/sessions/${sessionId}/messages?${params.toString()}`);
  },

  // Session management
  updateChatSession: async (clubId, sessionId, updates) => {
    return await apiRequest(`/clubs/${clubId}/chat/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  getUnreadCounts: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/chat/unread-counts`);
  },

  // Get all chatable users (staff + Super Admin + Admin)
  getChatableUsers: async (clubId) => {
    return await apiRequest(`/clubs/${clubId}/chat/chatable-users`);
  },

  // Archive chat session (one-sided deletion)
  archiveChatSession: async (clubId, sessionId) => {
    return await apiRequest(`/clubs/${clubId}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },
};

// Export storage keys for use in components
export { STORAGE_KEYS };

