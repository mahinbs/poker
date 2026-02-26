import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { superAdminAPI } from "../../lib/api";
import toast from "react-hot-toast";

const KYC_BUCKET = "kyc-docs";
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const useClientUpload = Boolean(supabaseUrl && supabaseAnonKey);

// Unified Player Management Component with 4 Tabs
export default function UnifiedPlayerManagement({
  selectedClubId,
  playersData,
  playersLoading,
  pendingPlayers,
  pendingLoading,
  suspendedPlayers = [],
  suspendedLoading = false,
  onRefresh
}) {
  const [activeTab, setActiveTab] = useState("all"); // "all", "create", "approval", "field-updates"
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshingApprovals, setIsRefreshingApprovals] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [approvalPage, setApprovalPage] = useState(1);
  const [fieldUpdatesPage, setFieldUpdatesPage] = useState(1);
  const itemsPerPage = 10;
  const [playerForm, setPlayerForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    referralCode: "",
    panCard: "",
    aadhaarFile: null,
    panCardFile: null,
  });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);
  const [selectedPlayerForDetails, setSelectedPlayerForDetails] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [playerToSuspend, setPlayerToSuspend] = useState(null);
  const [suspendForm, setSuspendForm] = useState({
    type: 'temporary',
    reason: '',
    duration: '',
  });
  const queryClient = useQueryClient();

  // Fetch player details and documents
  const { data: playerDetailsData, isLoading: playerDetailsLoading } = useQuery({
    queryKey: ['playerDetails', selectedClubId, selectedPlayerForDetails?.id],
    queryFn: async () => {
      if (!selectedPlayerForDetails || !selectedClubId) return null;
      const player = await superAdminAPI.getPlayer(selectedClubId, selectedPlayerForDetails.id);
      // Fetch documents
      let documents = [];
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3333/api'}/player-documents/my`, {
          headers: {
            'x-player-id': selectedPlayerForDetails.id,
            'x-club-id': selectedClubId,
          },
        });
        if (response.ok) {
          const docs = await response.json();
          documents = docs.documents || [];
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
      }

      // Also check kycDocuments from player object and merge (avoid duplicates)
      const playerKycDocs = player.kycDocuments || selectedPlayerForDetails.kycDocuments || [];
      if (Array.isArray(playerKycDocs) && playerKycDocs.length > 0) {
        // Merge documents, avoiding duplicates by URL
        const existingUrls = new Set(documents.map(d => d.url));
        playerKycDocs.forEach(doc => {
          if (doc.url && !existingUrls.has(doc.url)) {
            documents.push(doc);
          }
        });
      }

      return {
        ...player,
        documents: documents
      };
    },
    enabled: !!selectedPlayerForDetails && !!selectedClubId && showPlayerDetailsModal,
  });

  // Upload Document Mutation (prefer client upload when REACT_APP_SUPABASE_* set – restart dev server after adding .env)
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ playerId, file, documentType, clubId: payloadClubId }) => {
      const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3333/api';
      const clubId = payloadClubId || selectedClubId;

      if (useClientUpload && clubId) {
        const ext = file.name?.split('.').pop() || 'pdf';
        const filePath = `${clubId}/${playerId}/${documentType}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { error: uploadError } = await supabase.storage.from(KYC_BUCKET).upload(filePath, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });
        if (uploadError) throw new Error(uploadError.message || 'Failed to upload to storage');
        const recordRes = await fetch(`${apiBase}/player-documents/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId,
            clubId,
            documentType,
            filePath,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          }),
        });
        if (!recordRes.ok) {
          const err = await recordRes.json();
          throw new Error(err.message || 'Failed to record document');
        }
        return recordRes.json();
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', documentType);
      formData.append('name', file.name);
      const response = await fetch(`${apiBase}/player-documents/upload`, {
        method: 'POST',
        headers: { 'x-player-id': playerId, 'x-club-id': clubId || selectedClubId },
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload document');
      }
      return response.json();
    },
  });

  // Create Player Mutation: create player, then upload KYC; only show temp password after BOTH succeed. If upload fails, delete player and fail.
  const createPlayerMutation = useMutation({
    mutationFn: async (payload) => {
      const { _aadhaarFile, _panCardFile, ...apiPayload } = payload;
      const playerData = await superAdminAPI.createPlayer(selectedClubId, apiPayload);

      try {
        if (_aadhaarFile) {
          await uploadDocumentMutation.mutateAsync({
            playerId: playerData.id,
            file: _aadhaarFile,
            documentType: 'government_id',
            clubId: selectedClubId,
          });
        }
        if (_panCardFile) {
          await uploadDocumentMutation.mutateAsync({
            playerId: playerData.id,
            file: _panCardFile,
            documentType: 'pan_card',
            clubId: selectedClubId,
          });
        }
      } catch (uploadErr) {
        try {
          await superAdminAPI.deletePlayer(selectedClubId, playerData.id);
        } catch (deleteErr) {
          console.error('Rollback: failed to delete player after KYC upload failure', deleteErr);
        }
        throw new Error(uploadErr?.message || 'KYC document upload failed. Player was not created.');
      }

      return playerData;
    },
    onSuccess: (data) => {
      setSuccessData({
        player: {
          name: data.name,
          email: data.email,
          tempPassword: data.tempPassword ?? 'Not provided',
        }
      });
      setShowSuccessModal(true);
      setPlayerForm({
        name: "",
        email: "",
        phoneNumber: "",
        referralCode: "",
        panCard: "",
        aadhaarFile: null,
        panCardFile: null,
      });
      queryClient.invalidateQueries(['clubPlayers', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create player');
    },
  });

  // Approve Player Mutation
  const approveMutation = useMutation({
    mutationFn: ({ playerId, notes }) => superAdminAPI.approvePlayer(selectedClubId, playerId, notes),
    onSuccess: () => {
      toast.success('Player approved successfully!');
      setSelectedPlayer(null);
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve player');
    },
  });

  // Reject Player Mutation
  const rejectMutation = useMutation({
    mutationFn: ({ playerId, reason }) => superAdminAPI.rejectPlayer(selectedClubId, playerId, reason),
    onSuccess: () => {
      toast.success('Player rejected');
      setSelectedPlayer(null);
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject player');
    },
  });

  // Suspend Player Mutation
  const suspendPlayerMutation = useMutation({
    mutationFn: async ({ playerId, suspensionType, reason, duration }) => {
      const payload = {
        type: suspensionType,
        reason: reason,
      };
      // Only include duration if it's temporary and provided, and send as string
      if (suspensionType === 'temporary' && duration) {
        payload.duration = `${duration} days`; // Convert to string format like "7 days"
      }
      // For permanent, don't send duration at all (undefined, not null)
      return await superAdminAPI.suspendPlayer(selectedClubId, playerId, payload);
    },
    onSuccess: () => {
      toast.success('Player suspended successfully');
      setShowSuspendModal(false);
      setPlayerToSuspend(null);
      setSuspendForm({ type: 'temporary', reason: '', duration: '' });
      onRefresh();
      queryClient.invalidateQueries(['clubPlayers', selectedClubId]);
      queryClient.invalidateQueries(['suspendedPlayers', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to suspend player');
    },
  });

  // Unsuspend Player Mutation
  const unsuspendPlayerMutation = useMutation({
    mutationFn: async (playerId) => {
      return await superAdminAPI.unsuspendPlayer(selectedClubId, playerId);
    },
    onSuccess: () => {
      toast.success('Player unsuspended successfully');
      onRefresh();
      queryClient.invalidateQueries(['clubPlayers', selectedClubId]);
      queryClient.invalidateQueries(['suspendedPlayers', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to unsuspend player');
    },
  });

  const { data: fieldUpdateRequests = [], isLoading: fieldUpdatesLoading, isFetching: fieldUpdatesFetching, refetch: refetchFieldUpdates } = useQuery({
    queryKey: ['fieldUpdateRequests', selectedClubId],
    queryFn: () => superAdminAPI.getFieldUpdateRequests(selectedClubId),
    enabled: !!selectedClubId && activeTab === "field-updates",
  });

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [docViewModal, setDocViewModal] = useState({ open: false, request: null, oldDocUrl: null, newDocUrl: null });

  const approveFieldMutation = useMutation({
    mutationFn: ({ requestId }) => superAdminAPI.approveFieldUpdate(selectedClubId, requestId),
    onSuccess: () => {
      toast.success('Field update approved');
      queryClient.invalidateQueries(['fieldUpdateRequests', selectedClubId]);
      queryClient.invalidateQueries(['clubPlayers', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve field update');
    },
  });

  const rejectFieldMutation = useMutation({
    mutationFn: ({ requestId, reason }) => superAdminAPI.rejectFieldUpdate(selectedClubId, requestId, reason),
    onSuccess: () => {
      toast.success('Field update rejected');
      setRejectingId(null);
      setRejectReason('');
      queryClient.invalidateQueries(['fieldUpdateRequests', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject field update');
    },
  });

  const handleCreatePlayer = async (e) => {
    e.preventDefault();

    // Validate club is selected
    if (!selectedClubId) {
      toast.error('Please select a club first');
      return;
    }

    // Validate PAN card format if provided
    if (playerForm.panCard && playerForm.panCard.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(playerForm.panCard.trim())) {
        toast.error('PAN card must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)');
        return;
      }
    }

    // Validate files
    if (!playerForm.aadhaarFile) {
      toast.error('Please upload Aadhaar document');
      return;
    }
    if (!playerForm.panCardFile) {
      toast.error('Please upload PAN card document');
      return;
    }

    // Validate file sizes (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (playerForm.aadhaarFile.size > maxSize) {
      toast.error('Aadhaar document must be less than 5MB');
      return;
    }
    if (playerForm.panCardFile.size > maxSize) {
      toast.error('PAN card document must be less than 5MB');
      return;
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(playerForm.aadhaarFile.type)) {
      toast.error('Aadhaar document must be JPG, PNG, or PDF');
      return;
    }
    if (!allowedTypes.includes(playerForm.panCardFile.type)) {
      toast.error('PAN card document must be JPG, PNG, or PDF');
      return;
    }

    // Backend will generate password automatically - no need to send it
    // Pass form data + files; mutation will create player then upload KYC; only show temp password after both succeed
    const formData = {
      name: playerForm.name,
      email: playerForm.email,
      phoneNumber: playerForm.phoneNumber,
      affiliateCode: playerForm.referralCode || undefined,
      panCard: playerForm.panCard || undefined,
      _aadhaarFile: playerForm.aadhaarFile,
      _panCardFile: playerForm.panCardFile,
    };

    createPlayerMutation.mutate(formData);
  };

  const filteredPlayers = (playersData?.players || []).filter((player) => {
    const matchesSearch =
      !searchTerm ||
      player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.playerId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || player.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlayers = filteredPlayers.slice(startIndex, endIndex);

  // Approval pagination
  const approvalTotalPages = Math.ceil(pendingPlayers.length / itemsPerPage);
  const approvalStartIndex = (approvalPage - 1) * itemsPerPage;
  const approvalEndIndex = approvalStartIndex + itemsPerPage;
  const paginatedPendingPlayers = pendingPlayers.slice(approvalStartIndex, approvalEndIndex);

  // Field updates pagination
  const fieldUpdatesTotalPages = Math.ceil(fieldUpdateRequests.length / itemsPerPage);
  const fieldUpdatesStartIndex = (fieldUpdatesPage - 1) * itemsPerPage;
  const fieldUpdatesEndIndex = fieldUpdatesStartIndex + itemsPerPage;
  const paginatedFieldUpdates = fieldUpdateRequests.slice(fieldUpdatesStartIndex, fieldUpdatesEndIndex);

  // Reset to page 1 when tab changes or search/filter changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    setApprovalPage(1);
    setFieldUpdatesPage(1);
  };

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const tabs = [
    { id: "all", label: "All Players" },
    { id: "create", label: "Create Players" },
    { id: "approval", label: "Player Approval" },
    // { id: "suspend", label: "Player Suspension" }, // Commented out - suspend from All Players tab
    { id: "field-updates", label: "Player Fields Update Approval" },
  ];

  return (
    <div className="text-white space-y-6">
      <h1 className="text-3xl font-bold">Player Management</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === tab.id
              ? "bg-gradient-to-r from-red-400 to-purple-600 text-white border-b-2 border-purple-400"
              : "text-gray-400 hover:text-white"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Tab 1: All Players */}
        {activeTab === "all" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex gap-4">
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Players Table */}
            {playersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p>Loading players...</p>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 text-sm text-gray-400 flex justify-between items-center">
                  <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredPlayers.length)} of {filteredPlayers.length} players</span>
                </div>
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">KYC</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Registered</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {paginatedPlayers.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-8 text-center text-gray-400">
                          No players found
                        </td>
                      </tr>
                    ) : (
                      paginatedPlayers.map((player) => (
                        <tr
                          key={player.id}
                          className="hover:bg-slate-750"
                        >
                          <td
                            className="px-6 py-4 font-medium cursor-pointer"
                            onClick={() => {
                              setSelectedPlayerForDetails(player);
                              setShowPlayerDetailsModal(true);
                            }}
                          >
                            {player.name}
                          </td>
                          <td className="px-6 py-4 text-gray-400">{player.playerId || '-'}</td>
                          <td className="px-6 py-4 text-gray-400">{player.email}</td>
                          <td className="px-6 py-4 text-gray-400">{player.phoneNumber || '-'}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${player.status === 'Active'
                                ? 'bg-emerald-600/20 text-emerald-400'
                                : player.status === 'Pending'
                                  ? 'bg-yellow-600/20 text-yellow-400'
                                  : 'bg-red-600/20 text-red-400'
                                }`}
                            >
                              {player.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${player.kycStatus === 'approved' || player.kycStatus === 'verified'
                                ? 'bg-green-600/20 text-green-400'
                                : 'bg-gray-600/20 text-gray-400'
                                }`}
                            >
                              {player.kycStatus || 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(player.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPlayerForDetails(player);
                                  setShowPlayerDetailsModal(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              >
                                📄 View
                              </button>
                              {player.status === 'Suspended' ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Are you sure you want to unsuspend ${player.name}?`)) {
                                      unsuspendPlayerMutation.mutate(player.id);
                                    }
                                  }}
                                  disabled={unsuspendPlayerMutation.isLoading}
                                  className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                                >
                                  Unsuspend
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPlayerToSuspend(player);
                                    setShowSuspendModal(true);
                                  }}
                                  className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Create Players */}
        {activeTab === "create" && (
          <div className="relative bg-slate-800 rounded-xl p-8 border border-slate-700">
            {/* Loading overlay - visible while create API is in progress */}
            {(createPlayerMutation.isPending || createPlayerMutation.isLoading) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-slate-900/90 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-purple-500 border-t-transparent mb-4" />
                <p className="text-white font-semibold text-lg">Creating player & uploading KYC documents...</p>
                <p className="text-gray-400 text-sm mt-1">Temp password shown only after KYC upload succeeds</p>
              </div>
            )}
            <h2 className="text-2xl font-bold mb-6">Create New Player</h2>
            {useClientUpload ? (
              <p className="text-sm text-emerald-400/90 mb-4">KYC uploads from browser (avoids backend timeout).</p>
            ) : (
              <p className="text-sm text-amber-400/90 mb-4">Tip: Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env and restart dev server to upload from browser.</p>
            )}
            {!selectedClubId && (
              <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
                <p className="text-yellow-400 font-semibold">⚠️ Please select a club from the sidebar dropdown to create a player</p>
              </div>
            )}
            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Player Name *</label>
                  <input
                    type="text"
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={playerForm.email}
                    onChange={(e) => setPlayerForm({ ...playerForm, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={playerForm.phoneNumber}
                    onChange={(e) => setPlayerForm({ ...playerForm, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Referral Code (Optional)</label>
                  <input
                    type="text"
                    value={playerForm.referralCode || ''}
                    onChange={(e) => setPlayerForm({ ...playerForm, referralCode: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Referral code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    value={playerForm.panCard}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // Only allow PAN format characters
                      if (value.length <= 10 && /^[A-Z0-9]*$/.test(value)) {
                        setPlayerForm({ ...playerForm, panCard: value });
                      }
                    }}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-400 mt-1">Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Aadhaar Document *</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPlayerForm({ ...playerForm, aadhaarFile: file });
                      }
                    }}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500"
                    required
                  />
                  {playerForm.aadhaarFile && (
                    <p className="text-xs text-emerald-400 mt-1">✓ {playerForm.aadhaarFile.name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Upload Aadhaar card (JPG, PNG, or PDF, max 5MB)</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">PAN Card Document *</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPlayerForm({ ...playerForm, panCardFile: file });
                      }
                    }}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500"
                    required
                  />
                  {playerForm.panCardFile && (
                    <p className="text-xs text-emerald-400 mt-1">✓ {playerForm.panCardFile.name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Upload PAN card document (JPG, PNG, or PDF, max 5MB)</p>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={(createPlayerMutation.isPending || createPlayerMutation.isLoading) || !selectedClubId}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {(createPlayerMutation.isPending || createPlayerMutation.isLoading) ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating player & uploading KYC...</span>
                    </>
                  ) : !selectedClubId ? (
                    'Select a Club First'
                  ) : (
                    'Create Player'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Player Approval */}
        {activeTab === "approval" && (
          <div className="space-y-6">
            {/* Refresh button — always visible */}
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  setIsRefreshingApprovals(true);
                  try { await onRefresh(); } finally { setIsRefreshingApprovals(false); }
                }}
                disabled={isRefreshingApprovals || pendingLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                title="Refresh approval requests"
              >
                <svg className={`w-4 h-4 ${isRefreshingApprovals || pendingLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshingApprovals || pendingLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {pendingLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p>Loading pending players...</p>
              </div>
            ) : pendingPlayers.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-xl text-gray-300">No pending approvals</p>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Player Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Registration Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">KYC Document</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {paginatedPendingPlayers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                          No pending players found
                        </td>
                      </tr>
                    ) : (
                      paginatedPendingPlayers.map((player) => (
                        <tr key={player.id} className="hover:bg-slate-750">
                          <td className="px-6 py-4 font-medium">{player.name}</td>
                          <td className="px-6 py-4 text-gray-400">{player.email}</td>
                          <td className="px-6 py-4 text-gray-400">{player.phoneNumber || '-'}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(player.registrationDate || player.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {player.kycDocumentUrl && (
                                <a
                                  href={player.kycDocumentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                  View Document
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedPlayerForDetails(player);
                                  setShowPlayerDetailsModal(true);
                                }}
                                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg text-xs font-medium text-white transition-colors"
                              >
                                📄 View KYC
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs font-semibold">
                              Pending
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedPlayer(player);
                                  // Show details modal or approve directly
                                  approveMutation.mutate({ playerId: player.id, notes: 'Approved by Super Admin' });
                                }}
                                disabled={approveMutation.isLoading}
                                className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason:');
                                  if (reason) {
                                    rejectMutation.mutate({ playerId: player.id, reason });
                                  }
                                }}
                                disabled={rejectMutation.isLoading}
                                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      )))}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                {approvalTotalPages > 1 && (
                  <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Page {approvalPage} of {approvalTotalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setApprovalPage(prev => Math.max(1, prev - 1))}
                        disabled={approvalPage === 1}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setApprovalPage(prev => Math.min(approvalTotalPages, prev + 1))}
                        disabled={approvalPage === approvalTotalPages}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Player Fields Update Approval */}
        {activeTab === "field-updates" && (
          <div className="space-y-6">
            {/* Refresh button — always visible */}
            <div className="flex justify-end">
              <button
                onClick={() => refetchFieldUpdates()}
                disabled={fieldUpdatesFetching}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                title="Refresh field update requests"
              >
                <svg className={`w-4 h-4 ${fieldUpdatesFetching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {fieldUpdatesFetching ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {fieldUpdatesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p>Loading field update requests...</p>
              </div>
            ) : fieldUpdateRequests.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl text-gray-300">No pending field update requests</p>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 text-sm text-gray-400 flex justify-between items-center">
                  <span>Showing {fieldUpdatesStartIndex + 1}-{Math.min(fieldUpdatesEndIndex, fieldUpdateRequests.length)} of {fieldUpdateRequests.length} field update requests</span>
                </div>
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Player Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Field</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Change</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Requested Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {paginatedFieldUpdates.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                          No field update requests found
                        </td>
                      </tr>
                    ) : (
                      paginatedFieldUpdates.map((request) => {
                        const playerName = request.player?.name || request.player?.first_name
                          ? `${request.player.first_name || ''} ${request.player.last_name || ''}`.trim()
                          : 'Unknown';
                        const fieldLabelMap = { phoneNumber: 'Phone', name: 'Name', email: 'Email', government_id: 'Govt ID', pan_card: 'PAN Card' };
                        const fieldLabel = fieldLabelMap[request.fieldName] || request.fieldName;
                        const isDocField = ['government_id', 'pan_card'].includes(request.fieldName);

                        const openDocView = async () => {
                          setDocViewModal({ open: true, request, oldDocUrl: null, newDocUrl: null, loading: true });
                          try {
                            const playerId = request.playerId || request.player?.id;
                            if (!playerId) throw new Error('No player ID');
                            const result = await superAdminAPI.getPlayerDocuments(selectedClubId, playerId);
                            const docs = result?.documents || [];
                            const docType = request.fieldName;
                            const matchingDocs = docs
                              .filter(d => (d.type === docType || d.documentType === docType) && (d.url || d.fileUrl))
                              .sort((a, b) => new Date(b.uploadedAt || b.createdAt || 0) - new Date(a.uploadedAt || a.createdAt || 0));
                            const newDoc = matchingDocs[0]?.url || matchingDocs[0]?.fileUrl || null;
                            const oldDoc = matchingDocs[1]?.url || matchingDocs[1]?.fileUrl || null;
                            const requestedUrl = (request.requestedValue || '').startsWith('http') ? request.requestedValue : null;
                            setDocViewModal({ open: true, request, oldDocUrl: oldDoc, newDocUrl: newDoc || requestedUrl, loading: false });
                          } catch (err) {
                            console.error('Failed to load documents:', err);
                            const requestedUrl = (request.requestedValue || '').startsWith('http') ? request.requestedValue : null;
                            setDocViewModal(prev => ({ ...prev, newDocUrl: requestedUrl, loading: false }));
                          }
                        };

                        return (
                          <tr key={request.id} className="hover:bg-slate-700/50">
                            <td className="px-6 py-4 font-medium">{playerName}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${isDocField ? 'bg-blue-600/20 text-blue-300' : 'bg-purple-600/20 text-purple-300'}`}>
                                {isDocField ? '📄 ' : ''}{fieldLabel}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {isDocField ? (
                                <button
                                  onClick={openDocView}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-xs font-medium border border-blue-500/30 transition-colors"
                                >
                                  🔍 View Old & New Document
                                </button>
                              ) : (
                                <>
                                  <span className="text-gray-500 line-through">{request.currentValue || 'N/A'}</span>
                                  {' → '}
                                  <span className="text-emerald-400 font-medium">{request.requestedValue}</span>
                                </>
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-400 text-sm">
                              {new Date(request.createdAt).toLocaleDateString('en-IN', {
                                timeZone: 'Asia/Kolkata',
                                day: '2-digit', month: 'short', year: 'numeric',
                              })}
                              <br />
                              <span className="text-xs text-gray-500">
                                {new Date(request.createdAt).toLocaleTimeString('en-IN', {
                                  timeZone: 'Asia/Kolkata',
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs font-semibold">
                                Pending
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {rejectingId === request.id ? (
                                <div className="flex flex-col gap-2 min-w-[200px]">
                                  <input
                                    type="text"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Rejection reason..."
                                    className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        if (!rejectReason.trim()) {
                                          toast.error('Please enter a rejection reason');
                                          return;
                                        }
                                        rejectFieldMutation.mutate({ requestId: request.id, reason: rejectReason.trim() });
                                      }}
                                      disabled={rejectFieldMutation.isLoading}
                                      className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                      className="bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => approveFieldMutation.mutate({ requestId: request.id })}
                                    disabled={approveFieldMutation.isLoading}
                                    className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => setRejectingId(request.id)}
                                    disabled={rejectFieldMutation.isLoading}
                                    className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                {fieldUpdatesTotalPages > 1 && (
                  <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Page {fieldUpdatesPage} of {fieldUpdatesTotalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFieldUpdatesPage(prev => Math.max(1, prev - 1))}
                        disabled={fieldUpdatesPage === 1}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setFieldUpdatesPage(prev => Math.min(fieldUpdatesTotalPages, prev + 1))}
                        disabled={fieldUpdatesPage === fieldUpdatesTotalPages}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Player Suspension */}
            {activeTab === "suspend" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Player Suspension Management</h2>

                {/* Note: Suspension is now done from All Players tab */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-lg mb-2">💡 To suspend a player:</p>
                    <p className="text-gray-300">Go to the "All Players" tab and click the "Suspend" button next to any player.</p>
                  </div>
                </div>

                {/* Suspended Players List */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <div className="p-4 text-sm text-gray-400">
                    {suspendedLoading ? 'Loading...' : `Showing ${suspendedPlayers.length} suspended players`}
                  </div>
                  {suspendedLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                      <p>Loading suspended players...</p>
                    </div>
                  ) : suspendedPlayers.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-gray-400">No suspended players</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 text-sm text-gray-400">
                        Showing {Math.min((suspendPage - 1) * itemsPerPage + 1, suspendedPlayers.length)} - {Math.min(suspendPage * itemsPerPage, suspendedPlayers.length)} of {suspendedPlayers.length} suspended players
                      </div>
                      <table className="w-full">
                        <thead className="bg-slate-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Suspended Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {suspendedPlayers.slice((suspendPage - 1) * itemsPerPage, suspendPage * itemsPerPage).map((player) => (
                            <tr key={player.id} className="hover:bg-slate-750">
                              <td className="px-6 py-4 font-medium">{player.name}</td>
                              <td className="px-6 py-4 text-gray-400">{player.email}</td>
                              <td className="px-6 py-4 text-gray-400 text-sm">
                                {player.suspendedAt ? new Date(player.suspendedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : '-'}
                              </td>
                              <td className="px-6 py-4 text-gray-400 text-sm">
                                {player.suspensionReason || player.reason || '-'}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to unsuspend ${player.name}?`)) {
                                      superAdminAPI.unsuspendPlayer(selectedClubId, player.id)
                                        .then(() => {
                                          toast.success('Player unsuspended successfully');
                                          onRefresh();
                                        })
                                        .catch((err) => {
                                          toast.error(err.message || 'Failed to unsuspend player');
                                        });
                                    }
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Unsuspend
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {Math.ceil(suspendedPlayers.length / itemsPerPage) > 1 && (
                        <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                          <div className="text-sm text-gray-400">
                            Page {suspendPage} of {Math.ceil(suspendedPlayers.length / itemsPerPage)}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSuspendPage(prev => Math.max(1, prev - 1))}
                              disabled={suspendPage === 1}
                              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => setSuspendPage(prev => Math.min(Math.ceil(suspendedPlayers.length / itemsPerPage), prev + 1))}
                              disabled={suspendPage >= Math.ceil(suspendedPlayers.length / itemsPerPage)}
                              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Modal - Player Created */}
      {showSuccessModal && successData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full border-2 border-emerald-500 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">🎉 Player Created!</h2>
              <p className="text-emerald-400 text-sm">Save these credentials securely!</p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-500/30">
                <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Player Login Credentials
                </h3>
                <div className="space-y-2">
                  <p className="text-white"><span className="text-gray-400">Name:</span> {successData.player.name}</p>
                  <p className="text-white"><span className="text-gray-400">Email:</span> {successData.player.email}</p>
                  <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3 mt-2">
                    <p className="text-yellow-400 text-sm font-medium mb-1">⚠️ Temporary Password</p>
                    <p className="text-yellow-100 font-mono text-lg font-bold">{successData?.player?.tempPassword ?? 'Not provided'}</p>
                    <p className="text-yellow-300 text-xs mt-1">Player must reset password on first login</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                setSuccessData(null);
                setActiveTab("all"); // Switch to All Players tab after closing
              }}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-bold text-white text-lg transition-colors"
            >
              Got it! Close
            </button>
          </div>
        </div>
      )}

      {/* Player Details Modal */}
      {showPlayerDetailsModal && selectedPlayerForDetails && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 max-w-4xl w-full border-2 border-purple-500 shadow-2xl my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Player Details</h2>
              <button
                onClick={() => {
                  setShowPlayerDetailsModal(false);
                  setSelectedPlayerForDetails(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {playerDetailsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading player details...</p>
              </div>
            ) : playerDetailsData ? (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Basic Information */}
                <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-purple-400 font-semibold mb-4 text-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Name</p>
                      <p className="text-white font-medium">{playerDetailsData.name || selectedPlayerForDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Email</p>
                      <p className="text-white font-medium">{playerDetailsData.email || selectedPlayerForDetails.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Phone Number</p>
                      <p className="text-white font-medium">{playerDetailsData.phoneNumber || selectedPlayerForDetails.phoneNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Player ID</p>
                      <p className="text-white font-medium">{playerDetailsData.playerId || selectedPlayerForDetails.playerId || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">PAN Card</p>
                      <p className="text-white font-medium">{playerDetailsData.panCard || selectedPlayerForDetails.panCard || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${(playerDetailsData.status || selectedPlayerForDetails.status) === 'Active'
                          ? 'bg-emerald-600/20 text-emerald-400'
                          : (playerDetailsData.status || selectedPlayerForDetails.status) === 'Pending'
                            ? 'bg-yellow-600/20 text-yellow-400'
                            : 'bg-red-600/20 text-red-400'
                          }`}
                      >
                        {playerDetailsData.status || selectedPlayerForDetails.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">KYC Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${(playerDetailsData.kycStatus || selectedPlayerForDetails.kycStatus) === 'approved' ||
                          (playerDetailsData.kycStatus || selectedPlayerForDetails.kycStatus) === 'verified'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-gray-600/20 text-gray-400'
                          }`}
                      >
                        {playerDetailsData.kycStatus || selectedPlayerForDetails.kycStatus || 'pending'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Registration Date</p>
                      <p className="text-white font-medium">
                        {new Date(playerDetailsData.createdAt || selectedPlayerForDetails.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Balance</p>
                      <p className="text-white font-medium">₹{playerDetailsData.balance || selectedPlayerForDetails.balance || 0}</p>
                    </div>
                  </div>
                </div>

                {/* KYC Documents */}
                <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-purple-400 font-semibold mb-4 text-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    KYC Documents
                  </h3>
                  {playerDetailsData.documents && playerDetailsData.documents.length > 0 ? (
                    <div className="space-y-6">
                      {playerDetailsData.documents.map((doc, idx) => {
                        // Map document types to readable labels
                        const getDocumentTypeLabel = (type) => {
                          if (!type) return 'Unknown';
                          const typeLower = type.toLowerCase();
                          if (typeLower === 'government_id' || typeLower === 'aadhaar' || typeLower === 'aadhar') {
                            return 'Aadhaar Card';
                          }
                          if (typeLower === 'pan_card' || typeLower === 'pan') {
                            return 'PAN Card';
                          }
                          return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
                        };

                        const documentTypeLabel = getDocumentTypeLabel(doc.type || doc.documentType);
                        const isAadhaar = documentTypeLabel.includes('Aadhaar');

                        return (
                          <div
                            key={doc.id || idx}
                            className={`bg-slate-700/70 rounded-xl p-6 border-2 ${isAadhaar
                              ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
                              : 'border-purple-500/50 shadow-lg shadow-purple-500/10'
                              }`}
                          >
                            {/* Document Header */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className={`px-4 py-2 rounded-lg text-sm font-bold ${isAadhaar
                                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                                    : 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                                    }`}>
                                    {documentTypeLabel}
                                  </span>
                                </div>
                                <p className="text-white font-semibold text-lg mb-2">
                                  {doc.name || doc.fileName || `Document ${idx + 1}`}
                                </p>
                                {doc.uploadedAt && (
                                  <p className="text-gray-400 text-sm">
                                    📅 Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {doc.url && (
                                  <>
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-md"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      Preview
                                    </a>
                                    <a
                                      href={doc.url}
                                      download
                                      className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-md"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                      Download
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>

                            {doc.url && (
                              <div className="mt-3">
                                {doc.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                  <img
                                    src={doc.url}
                                    alt={doc.name || 'Document'}
                                    className="max-w-full h-auto rounded-lg border border-slate-600 max-h-64"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : doc.url.match(/\.pdf$/i) ? (
                                  <iframe
                                    src={doc.url}
                                    className="w-full h-64 rounded-lg border border-slate-600"
                                    title={doc.name || 'PDF Document'}
                                  />
                                ) : (
                                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                                    <p className="text-gray-400 text-sm">Preview not available for this file type</p>
                                    <p className="text-gray-500 text-xs mt-1">Click Preview or Download to view</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No KYC documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-red-400">Failed to load player details</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowPlayerDetailsModal(false);
                  setSelectedPlayerForDetails(null);
                }}
                className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-bold text-white text-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Player Modal */}
      {showSuspendModal && playerToSuspend && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full border-2 border-red-500 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Suspend Player</h2>
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setPlayerToSuspend(null);
                  setSuspendForm({ type: 'temporary', reason: '', duration: '' });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/30">
                <p className="text-white font-medium mb-1">Player: <span className="text-red-400">{playerToSuspend.name}</span></p>
                <p className="text-gray-400 text-sm">Email: {playerToSuspend.email}</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!suspendForm.reason || !suspendForm.reason.trim()) {
                    toast.error('Please provide a reason for suspension');
                    return;
                  }
                  suspendPlayerMutation.mutate({
                    playerId: playerToSuspend.id,
                    suspensionType: suspendForm.type,
                    reason: suspendForm.reason.trim(),
                    duration: suspendForm.type === 'temporary' && suspendForm.duration ? suspendForm.duration : undefined,
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Suspension Type *</label>
                  <select
                    value={suspendForm.type}
                    onChange={(e) => setSuspendForm({ ...suspendForm, type: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="temporary">Temporary</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>

                {suspendForm.type === 'temporary' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration (days) *</label>
                    <input
                      type="number"
                      min="1"
                      value={suspendForm.duration}
                      onChange={(e) => setSuspendForm({ ...suspendForm, duration: e.target.value })}
                      placeholder="Enter number of days"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                      required={suspendForm.type === 'temporary'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reason for Suspension *</label>
                  <textarea
                    value={suspendForm.reason}
                    onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
                    placeholder="Enter detailed reason for suspending this player..."
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuspendModal(false);
                      setPlayerToSuspend(null);
                      setSuspendForm({ type: 'temporary', reason: '', duration: '' });
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-bold text-white text-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={suspendPlayerMutation.isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-bold text-white text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suspendPlayerMutation.isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Suspending...
                      </span>
                    ) : (
                      'Suspend Player'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Document Comparison Modal */}
      {docViewModal.open && docViewModal.request && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full border border-blue-600 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Document Comparison — {docViewModal.request.fieldName === 'government_id' ? 'Govt ID (Aadhaar)' : 'PAN Card'}
              </h2>
              <button
                onClick={() => setDocViewModal({ open: false, request: null, oldDocUrl: null, newDocUrl: null, loading: false })}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
              <p className="text-sm text-gray-300">
                <span className="text-white font-medium">
                  {docViewModal.request.player?.name || `${docViewModal.request.player?.first_name || ''} ${docViewModal.request.player?.last_name || ''}`.trim() || 'Unknown Player'}
                </span>
                {' '}requested a document change on{' '}
                <span className="text-blue-300">
                  {new Date(docViewModal.request.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            </div>

            {docViewModal.loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
                <span className="ml-3 text-gray-400">Loading documents...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Old Document */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-red-300 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    Old Document
                  </h3>
                  <div className="bg-slate-700 rounded-lg border border-slate-600 p-4 min-h-[200px] flex items-center justify-center">
                    {docViewModal.oldDocUrl ? (
                      <div className="space-y-3 w-full">
                        <img
                          src={docViewModal.oldDocUrl}
                          alt="Old document"
                          className="max-w-full max-h-[400px] rounded-lg border border-slate-600 mx-auto object-contain"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                        />
                        <div style={{ display: 'none' }} className="text-center">
                          <p className="text-gray-400 text-sm mb-2">Cannot preview this file type</p>
                        </div>
                        <a
                          href={docViewModal.oldDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center text-blue-400 hover:text-blue-300 text-sm underline"
                        >
                          Open in new tab
                        </a>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-4xl mb-2">📄</p>
                        <p className="text-gray-500 text-sm">No previous document found (first upload)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* New Document */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-emerald-300 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    New Document (Uploaded)
                  </h3>
                  <div className="bg-slate-700 rounded-lg border border-emerald-600/30 p-4 min-h-[200px] flex items-center justify-center">
                    {docViewModal.newDocUrl ? (
                      <div className="space-y-3 w-full">
                        <img
                          src={docViewModal.newDocUrl}
                          alt="New document"
                          className="max-w-full max-h-[400px] rounded-lg border border-emerald-600/30 mx-auto object-contain"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                        />
                        <div style={{ display: 'none' }} className="text-center">
                          <p className="text-gray-400 text-sm mb-2">Cannot preview this file type</p>
                        </div>
                        <a
                          href={docViewModal.newDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center text-emerald-400 hover:text-emerald-300 text-sm underline"
                        >
                          Open in new tab
                        </a>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-4xl mb-2">📄</p>
                        <p className="text-gray-500 text-sm">New document not found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => {
                  setDocViewModal({ open: false, request: null, oldDocUrl: null, newDocUrl: null, loading: false });
                  approveFieldMutation.mutate({ requestId: docViewModal.request.id });
                }}
                disabled={approveFieldMutation.isLoading || docViewModal.loading}
                className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                ✓ Approve Change
              </button>
              <button
                onClick={() => {
                  setDocViewModal({ open: false, request: null, oldDocUrl: null, newDocUrl: null, loading: false });
                  setRejectingId(docViewModal.request.id);
                }}
                disabled={docViewModal.loading}
                className="bg-red-600 hover:bg-red-500 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                ✗ Reject Change
              </button>
              <button
                onClick={() => setDocViewModal({ open: false, request: null, oldDocUrl: null, newDocUrl: null, loading: false })}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

