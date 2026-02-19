import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playersAPI, clubsAPI } from "../lib/api";
import toast from "react-hot-toast";

// HR-restricted Player Management - Only "All Players" (with KYC docs) and "Field Updates" tabs
export default function PlayerManagementHR({ selectedClubId }) {
  const [activeTab, setActiveTab] = useState("all"); // "all" or "field-updates"
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fieldUpdatesPage, setFieldUpdatesPage] = useState(1);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);
  const [selectedPlayerForDetails, setSelectedPlayerForDetails] = useState(null);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  // Fetch all players
  const { data: playersResponse, isLoading: playersLoading } = useQuery({
    queryKey: ['clubPlayers', selectedClubId],
    queryFn: () => playersAPI.getPlayers(selectedClubId),
    enabled: !!selectedClubId,
  });

  // Extract players array from response (backend returns { players: [...], total: ..., etc. })
  const playersData = Array.isArray(playersResponse) 
    ? playersResponse 
    : (playersResponse?.players || []);

  // Fetch player details and documents
  const { data: playerDetailsData, isLoading: playerDetailsLoading } = useQuery({
    queryKey: ['playerDetails', selectedClubId, selectedPlayerForDetails?.id],
    queryFn: async () => {
      if (!selectedPlayerForDetails || !selectedClubId) return null;
      const player = await clubsAPI.getPlayer(selectedClubId, selectedPlayerForDetails.id);
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
      
      // Also check kycDocuments from player object
      const playerKycDocs = player.kycDocuments || selectedPlayerForDetails.kycDocuments || [];
      if (Array.isArray(playerKycDocs) && playerKycDocs.length > 0) {
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

  // Field Update Requests Query (TODO: Add backend endpoint)
  const { data: fieldUpdateRequests = [], isLoading: fieldUpdatesLoading } = useQuery({
    queryKey: ['fieldUpdateRequests', selectedClubId],
    queryFn: async () => {
      // TODO: Replace with actual API call when backend endpoint is ready
      // return await clubsAPI.getFieldUpdateRequests(selectedClubId);
      return [];
    },
    enabled: !!selectedClubId && activeTab === "field-updates",
  });

  // Approve/Reject Field Update Mutation
  const fieldUpdateMutation = useMutation({
    mutationFn: async ({ requestId, approved, notes }) => {
      // TODO: Replace with actual API call when backend endpoint is ready
      // return await clubsAPI.approveFieldUpdate(selectedClubId, requestId, approved, notes);
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Field update request processed');
      queryClient.invalidateQueries(['fieldUpdateRequests', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process field update request');
    },
  });

  // Filter players
  const filteredPlayers = playersData.filter(player => {
    const matchesSearch = !searchTerm || 
      player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.playerId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlayers = filteredPlayers.slice(startIndex, endIndex);

  // Field updates pagination
  const fieldUpdatesTotalPages = Math.ceil(fieldUpdateRequests.length / itemsPerPage);
  const fieldUpdatesStartIndex = (fieldUpdatesPage - 1) * itemsPerPage;
  const fieldUpdatesEndIndex = fieldUpdatesStartIndex + itemsPerPage;
  const paginatedFieldUpdates = fieldUpdateRequests.slice(fieldUpdatesStartIndex, fieldUpdatesEndIndex);

  const tabs = [
    { id: "all", label: "All Players" },
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
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
              setFieldUpdatesPage(1);
            }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === tab.id
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
            {/* Search */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
              />
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">KYC Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">KYC Documents</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {paginatedPlayers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                          No players found
                        </td>
                      </tr>
                    ) : (
                      paginatedPlayers.map((player) => (
                        <tr key={player.id} className="hover:bg-slate-750">
                          <td className="px-6 py-4 font-medium">{player.name}</td>
                          <td className="px-6 py-4 text-gray-400">{player.playerId || '-'}</td>
                          <td className="px-6 py-4 text-gray-400">{player.email}</td>
                          <td className="px-6 py-4 text-gray-400">{player.phoneNumber || '-'}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                player.kycStatus === 'approved' || player.kycStatus === 'verified'
                                  ? 'bg-green-600/20 text-green-400'
                                  : 'bg-yellow-600/20 text-yellow-400'
                              }`}
                            >
                              {player.kycStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {player.kycDocuments && player.kycDocuments.length > 0 ? (
                              <span className="text-blue-400 text-sm">{player.kycDocuments.length} document(s)</span>
                            ) : (
                              <span className="text-gray-500 text-sm">No documents</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedPlayerForDetails(player);
                                setShowPlayerDetailsModal(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              View Details & KYC
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {/* Pagination */}
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
                        disabled={currentPage >= totalPages}
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

        {/* Tab 2: Field Updates */}
        {activeTab === "field-updates" && (
          <div className="space-y-6">
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Fields Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Requested Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {paginatedFieldUpdates.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                          No field update requests found
                        </td>
                      </tr>
                    ) : (
                      paginatedFieldUpdates.map((request) => (
                        <tr key={request.id} className="hover:bg-slate-750">
                          <td className="px-6 py-4 font-medium">{request.playerName}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {request.fields?.map((field, idx) => (
                                <div key={idx} className="text-sm">
                                  <span className="text-gray-400">{field.fieldName}:</span>{' '}
                                  <span className="text-gray-500 line-through">{field.currentValue || 'N/A'}</span>
                                  {' → '}
                                  <span className="text-emerald-400">{field.requestedValue}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(request.requestedDate || request.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs font-semibold">
                              {request.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  fieldUpdateMutation.mutate({
                                    requestId: request.id,
                                    approved: true,
                                    notes: 'Approved by HR',
                                  });
                                }}
                                disabled={fieldUpdateMutation.isLoading}
                                className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason:');
                                  if (reason) {
                                    fieldUpdateMutation.mutate({
                                      requestId: request.id,
                                      approved: false,
                                      notes: reason,
                                    });
                                  }
                                }}
                                disabled={fieldUpdateMutation.isLoading}
                                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {/* Pagination */}
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
                        disabled={fieldUpdatesPage >= fieldUpdatesTotalPages}
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
      </div>

      {/* Player Details Modal with KYC Documents */}
      {showPlayerDetailsModal && selectedPlayerForDetails && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 max-w-4xl w-full border-2 border-purple-500 shadow-2xl my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Player Details & KYC Documents</h2>
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
                  <h3 className="text-purple-400 font-semibold mb-4 text-lg">Basic Information</h3>
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
                      <p className="text-gray-400 text-sm mb-1">KYC Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          (playerDetailsData.kycStatus || selectedPlayerForDetails.kycStatus) === 'approved' || 
                          (playerDetailsData.kycStatus || selectedPlayerForDetails.kycStatus) === 'verified'
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-gray-600/20 text-gray-400'
                        }`}
                      >
                        {playerDetailsData.kycStatus || selectedPlayerForDetails.kycStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* KYC Documents */}
                <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-purple-400 font-semibold mb-4 text-lg">KYC Documents</h3>
                  {playerDetailsData.documents && playerDetailsData.documents.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {playerDetailsData.documents.map((doc, idx) => (
                        <div key={idx} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                          <p className="text-gray-300 font-medium mb-2">{doc.type || doc.documentType || 'Document'}</p>
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm underline"
                            >
                              View Document
                            </a>
                          )}
                          {doc.uploadedAt && (
                            <p className="text-gray-500 text-xs mt-1">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No KYC documents available</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

