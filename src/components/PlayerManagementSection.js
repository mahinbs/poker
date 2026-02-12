import { useState, useEffect } from "react";
import CustomSelect from "./common/CustomSelect";

export default function PlayerManagementSection({
  userRole = "hr", // "superadmin", "admin", "manager", "hr", "cashier", "gre",
  clubId = null, // Club ID for API calls
  // Data props
  kycRequests = [],
  setKycRequests = null,
  profileUpdates = [],
  setProfileUpdates = null,
  pendingApprovals = [],
  setPendingApprovals = null,
  suspendedPlayers = [],
  setSuspendedPlayers = null,
  // Option to force a specific tab
  forceTab = null, // "creating", "approval", "suspension", "kyc-review", "field-update", "all-players"
  // All players list prop
  allPlayers = [],
  setAllPlayers = null,
}) {
  const [activeTab, setActiveTab] = useState(forceTab || "all-players");
  
  // Player details modal state
  const [selectedPlayerForView, setSelectedPlayerForView] = useState(null);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);
  const [loadingPlayerDetails, setLoadingPlayerDetails] = useState(false);

  // Player Creation state
  const [playerForm, setPlayerForm] = useState({
    name: "",
    email: "",
    phone: "",
    referredBy: "",
    referralCode: "",
    documentType: "",
    documentUrl: "",
    initialBalance: 0,
  });

  // Player Suspension state
  const [suspensionForm, setSuspensionForm] = useState({
    playerId: "",
    reason: "",
    duration: "", // "temporary" | "permanent"
    suspensionDays: "",
  });

  // Role-based permissions
  const canCreatePlayer = ["superadmin", "admin", "manager", "gre"].includes(
    userRole.toLowerCase()
  );
  const canApprovePlayer = ["superadmin", "admin", "manager", "gre"].includes(
    userRole.toLowerCase()
  );
  const canSuspendPlayer = ["superadmin", "admin", "manager", "gre"].includes(
    userRole.toLowerCase()
  );
  const canReviewKyc = ["superadmin", "admin", "hr", "manager", "gre"].includes(
    userRole.toLowerCase()
  );
  const canReviewFieldUpdates = [
    "superadmin",
    "admin",
    "hr",
    "manager",
    "gre",
  ].includes(userRole.toLowerCase());
  const canViewAllPlayers = true; // All roles can view players list

  // Get select value helper
  const getSelectValue = (e, option) => option?.value ?? e?.target?.value ?? "";

  // Default data if not provided
  const defaultKycRequests = [
    {
      id: 1,
      name: "Rahul Sharma",
      documentType: "PAN Card",
      docUrl: "#",
      status: "Pending",
      submittedDate: "2024-02-20",
      playerId: "P001",
      documentNumber: "ABCDE1234F",
      email: "rahul@example.com",
      phone: "+91 9876543210",
    },
    {
      id: 2,
      name: "Priya Patel",
      documentType: "Aadhaar",
      docUrl: "#",
      status: "Pending",
      submittedDate: "2024-02-21",
      playerId: "P002",
      documentNumber: "1234 5678 9012",
      email: "priya@example.com",
      phone: "+91 9876543211",
    },
  ];

  const defaultProfileUpdates = [
    {
      id: 1,
      name: "Amit Kumar",
      playerId: "P003",
      fields: [
        {
          field: "Phone Number",
          oldValue: "+91 9876543210",
          newValue: "+91 9123456780",
        },
        { field: "Address", oldValue: "Old Address", newValue: "New Address" },
      ],
      status: "Pending",
      requestedDate: "2024-02-22",
    },
    {
      id: 2,
      name: "Sneha Gupta",
      playerId: "P004",
      fields: [
        {
          field: "Email",
          oldValue: "sneha.old@test.com",
          newValue: "sneha.new@test.com",
        },
      ],
      status: "Pending",
      requestedDate: "2024-02-23",
    },
  ];

  const defaultPendingApprovals = [
    {
      id: 1,
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+91 9876543212",
      registrationDate: "2024-02-18",
      status: "Pending",
      referredBy: "Agent X",
    },
    {
      id: 2,
      name: "Meera Singh",
      email: "meera@example.com",
      phone: "+91 9876543213",
      registrationDate: "2024-02-19",
      status: "Pending",
      referredBy: "Agent Y",
    },
  ];

  const defaultSuspendedPlayers = [
    {
      id: 1,
      name: "Vikram Patel",
      email: "vikram@example.com",
      reason: "Suspicious Activity",
      suspensionDate: "2024-02-15",
      status: "Suspended",
      duration: "temporary",
      suspensionDays: 7,
    },
  ];

  const defaultAllPlayers = [
    {
      id: "P001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      status: "Active",
      kycStatus: "Verified",
      registrationDate: "2024-01-15",
      referredBy: "Agent X",
      balance: 5000,
    },
    {
      id: "P002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+91 9876543211",
      status: "Active",
      kycStatus: "Pending",
      registrationDate: "2024-01-10",
      referredBy: "Agent Y",
      balance: 2500,
    },
    {
      id: "P003",
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+91 9876543212",
      status: "Suspended",
      kycStatus: "Verified",
      registrationDate: "2024-01-08",
      referredBy: "Agent Z",
      balance: 0,
    },
    {
      id: "P004",
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "+91 9876543213",
      status: "Pending Approval",
      kycStatus: "Pending",
      registrationDate: "2024-01-20",
      referredBy: "Agent A",
      balance: 0,
    },
  ];

  // Use provided data or defaults
  const activeKycRequests =
    kycRequests.length > 0 ? kycRequests : defaultKycRequests;
  const activeProfileUpdates =
    profileUpdates.length > 0 ? profileUpdates : defaultProfileUpdates;
  const activePendingApprovals =
    pendingApprovals.length > 0 ? pendingApprovals : defaultPendingApprovals;
  const activeSuspendedPlayers =
    suspendedPlayers.length > 0 ? suspendedPlayers : defaultSuspendedPlayers;
  const activeAllPlayers =
    allPlayers.length > 0 ? allPlayers : defaultAllPlayers;

  // State for modals
  const [selectedKycDetails, setSelectedKycDetails] = useState(null);
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerStatusFilter, setPlayerStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(12); // Show 12 cards per page

  // Reset to page 1 when filters change
  useEffect(() => {
    if (activeTab === "all-players") {
      setCurrentPage(1);
    }
  }, [playerSearch, playerStatusFilter, activeTab]);

  // Handlers
  const handleKycAction = (id, action) => {
    if (!setKycRequests) {
      alert(`KYC Request ${action === "approve" ? "Approved" : "Rejected"}`);
      return;
    }
    setKycRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, status: action === "approve" ? "Approved" : "Rejected" }
          : req
      )
    );
    alert(`KYC Request ${action === "approve" ? "Approved" : "Rejected"}`);
  };

  const handleProfileUpdateAction = (id, action) => {
    if (!setProfileUpdates) {
      alert(`Profile Update ${action === "approve" ? "Approved" : "Rejected"}`);
      return;
    }
    setProfileUpdates((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, status: action === "approve" ? "Approved" : "Rejected" }
          : req
      )
    );
    alert(`Profile Update ${action === "approve" ? "Approved" : "Rejected"}`);
  };

  const handleCreatePlayer = () => {
    if (!playerForm.name || !playerForm.email || !playerForm.phone) {
      alert("Please fill in all required fields (Name, Email, Phone)");
      return;
    }
    alert(`Player "${playerForm.name}" created successfully!`);
    // Reset form
    setPlayerForm({
      name: "",
      email: "",
      phone: "",
      referredBy: "",
      referralCode: "",
      documentType: "",
      documentUrl: "",
      initialBalance: 0,
    });
  };

  // View player details with KYC documents
  const handleViewPlayerDetails = async (player, clubId) => {
    try {
      setLoadingPlayerDetails(true);
      setShowPlayerDetailsModal(true);
      // For now, just show the player data we have
      // In real implementation, fetch from API: clubsAPI.getPlayer(clubId, player.id)
      setSelectedPlayerForView(player);
    } catch (error) {
      console.error('Error fetching player details:', error);
      alert('Failed to load player details');
      setShowPlayerDetailsModal(false);
    } finally {
      setLoadingPlayerDetails(false);
    }
  };

  const handleApprovePlayer = (id) => {
    alert(`Player ${id} approved successfully!`);
  };

  const handleRejectPlayer = (id) => {
    alert(`Player ${id} rejected!`);
  };

  const handleSuspendPlayer = () => {
    if (!suspensionForm.playerId || !suspensionForm.reason) {
      alert("Please select a player and provide a reason for suspension");
      return;
    }
    alert(`Player suspended successfully!`);
    // Reset form
    setSuspensionForm({
      playerId: "",
      reason: "",
      duration: "",
      suspensionDays: "",
    });
  };

  const handleUnsuspendPlayer = (id) => {
    if (!setSuspendedPlayers) {
      alert(`Player ${id} unsuspended!`);
      return;
    }
    setSuspendedPlayers((prev) => prev.filter((p) => p.id !== id));
    alert(`Player ${id} unsuspended!`);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      {!forceTab && (
        <div className="flex gap-2 border-b border-white/20 pb-4 flex-wrap">
          {canViewAllPlayers && (
            <button
              onClick={() => setActiveTab("all-players")}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === "all-players"
                  ? "bg-gradient-to-r from-purple-600 to-pink-700 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              All Players
            </button>
          )}
          {canCreatePlayer && (
            <button
              onClick={() => setActiveTab("creating")}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === "creating"
                  ? "bg-gradient-to-r from-purple-600 to-pink-700 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              Player Creating
            </button>
          )}
          {canApprovePlayer && (
            <button
              onClick={() => setActiveTab("approval")}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === "approval"
                  ? "bg-gradient-to-r from-purple-600 to-pink-700 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              Player Approval
            </button>
          )}
          {canSuspendPlayer && (
            <button
              onClick={() => setActiveTab("suspension")}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === "suspension"
                  ? "bg-gradient-to-r from-purple-600 to-pink-700 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              Player Suspension
            </button>
          )}
          {canReviewKyc && (
            <button
              onClick={() => setActiveTab("kyc-review")}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === "kyc-review"
                  ? "bg-gradient-to-r from-purple-600 to-pink-700 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              Player KYC Docs Review
            </button>
          )}
          {canReviewFieldUpdates && (
            <button
              onClick={() => setActiveTab("field-update")}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === "field-update"
                  ? "bg-gradient-to-r from-purple-600 to-pink-700 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              Player Fields Update Approval
            </button>
          )}
          
        </div>
      )}

      {/* Player Creating Tab */}
      {activeTab === "creating" && canCreatePlayer && (
        <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
          <h2 className="text-xl font-bold text-white mb-6">
            Create New Player
          </h2>
          <div className="bg-white/10 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm mb-2 block">
                  Player Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  placeholder="Enter player name"
                  value={playerForm.name}
                  onChange={(e) =>
                    setPlayerForm({ ...playerForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Email *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  placeholder="player@example.com"
                  value={playerForm.email}
                  onChange={(e) =>
                    setPlayerForm({ ...playerForm, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  placeholder="+91 9876543210"
                  value={playerForm.phone}
                  onChange={(e) =>
                    setPlayerForm({ ...playerForm, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">
                  Referred By
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  placeholder="Agent/Referrer name"
                  value={playerForm.referredBy}
                  onChange={(e) =>
                    setPlayerForm({ ...playerForm, referredBy: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">
                  Referral Code
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  placeholder="REF-CODE-123"
                  value={playerForm.referralCode}
                  onChange={(e) =>
                    setPlayerForm({
                      ...playerForm,
                      referralCode: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">
                  Document Type
                </label>
                <CustomSelect
                  options={[
                    { value: "", label: "-- Select Document Type --" },
                    { value: "PAN Card", label: "PAN Card" },
                    { value: "Aadhaar", label: "Aadhaar" },
                    { value: "Passport", label: "Passport" },
                    { value: "Driving License", label: "Driving License" },
                  ]}
                  value={playerForm.documentType}
                  onChange={(e, option) =>
                    setPlayerForm({
                      ...playerForm,
                      documentType: getSelectValue(e, option),
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">
                  Document URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  placeholder="https://example.com/document.pdf"
                  value={playerForm.documentUrl}
                  onChange={(e) =>
                    setPlayerForm({
                      ...playerForm,
                      documentUrl: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">
                  Initial Balance (₹)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  placeholder="0"
                  value={playerForm.initialBalance}
                  onChange={(e) =>
                    setPlayerForm({
                      ...playerForm,
                      initialBalance: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
              </div>
            </div>
            <button
              onClick={handleCreatePlayer}
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-3 rounded-lg font-semibold shadow-lg"
            >
              Create Player
            </button>
          </div>
        </section>
      )}

      {/* Player Approval Tab */}
      {activeTab === "approval" && canApprovePlayer && (
        <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
          <h2 className="text-xl font-bold text-white mb-6">
            Player Approval Requests
          </h2>
          <div className="bg-white/10 p-4 rounded-lg">
            <table className="w-full text-left bg-gray-900/50 rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-gray-400 uppercase text-sm">
                <tr>
                  <th className="py-3 px-4">Player Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4">Referred By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-gray-300">
                {activePendingApprovals.map((player) => (
                  <tr key={player.id}>
                    <td className="py-3 px-4 font-medium text-white">
                      {player.name}
                    </td>
                    <td className="py-3 px-4">{player.email}</td>
                    <td className="py-3 px-4">{player.phone}</td>
                    <td className="py-3 px-4">{player.registrationDate}</td>
                    <td className="py-3 px-4">{player.referredBy || "N/A"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          player.status === "Approved"
                            ? "bg-green-900 text-green-400"
                            : player.status === "Rejected"
                            ? "bg-red-900 text-red-400"
                            : "bg-yellow-900 text-yellow-400"
                        }`}
                      >
                        {player.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewPlayerDetails(player, clubId)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold text-white"
                      >
                        📄 View KYC
                      </button>
                      {player.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleApprovePlayer(player.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-bold text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectPlayer(player.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs font-bold text-white"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {activePendingApprovals.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400">
                      No pending approval requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Player Suspension Tab */}
      {activeTab === "suspension" && canSuspendPlayer && (
        <div className="space-y-6">
          <section className="p-6 bg-gradient-to-r from-red-600/30 via-orange-500/20 to-yellow-700/30 rounded-xl shadow-md border border-red-800/40">
            <h2 className="text-xl font-bold text-white mb-6">
              Suspend Player
            </h2>
            <div className="bg-white/10 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-2 block">
                    Select Player
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    placeholder="Enter player ID or name"
                    value={suspensionForm.playerId}
                    onChange={(e) =>
                      setSuspensionForm({
                        ...suspensionForm,
                        playerId: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">
                    Suspension Type
                  </label>
                  <CustomSelect
                    options={[
                      { value: "", label: "-- Select Type --" },
                      { value: "temporary", label: "Temporary" },
                      { value: "permanent", label: "Permanent" },
                    ]}
                    value={suspensionForm.duration}
                    onChange={(e, option) => {
                      const value = getSelectValue(e, option);
                      setSuspensionForm({
                        ...suspensionForm,
                        duration: value,
                        suspensionDays:
                          value === "permanent"
                            ? ""
                            : suspensionForm.suspensionDays,
                      });
                    }}
                    className="w-full"
                  />
                </div>
                {suspensionForm.duration === "temporary" && (
                  <div>
                    <label className="text-white text-sm mb-2 block">
                      Suspension Duration (days)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      placeholder="Enter number of days"
                      value={suspensionForm.suspensionDays}
                      onChange={(e) =>
                        setSuspensionForm({
                          ...suspensionForm,
                          suspensionDays: e.target.value,
                        })
                      }
                      min="1"
                    />
                  </div>
                )}
                <div
                  className={
                    suspensionForm.duration === "temporary"
                      ? ""
                      : "md:col-span-2"
                  }
                >
                  <label className="text-white text-sm mb-2 block">
                    Reason for Suspension *
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    rows="3"
                    placeholder="Enter reason for suspension"
                    value={suspensionForm.reason}
                    onChange={(e) =>
                      setSuspensionForm({
                        ...suspensionForm,
                        reason: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <button
                onClick={handleSuspendPlayer}
                className="mt-6 w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-4 py-3 rounded-lg font-semibold shadow-lg"
              >
                Suspend Player
              </button>
            </div>
          </section>

          <section className="p-6 bg-gradient-to-r from-red-600/30 via-orange-500/20 to-yellow-700/30 rounded-xl shadow-md border border-red-800/40">
            <h2 className="text-xl font-bold text-white mb-6">
              Currently Suspended Players
            </h2>
            <div className="bg-white/10 p-4 rounded-lg">
              <table className="w-full text-left bg-gray-900/50 rounded-lg overflow-hidden">
                <thead className="bg-gray-800 text-gray-400 uppercase text-sm">
                  <tr>
                    <th className="py-3 px-4">Player Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Suspension Date</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 text-gray-300">
                  {activeSuspendedPlayers.map((player) => (
                    <tr key={player.id}>
                      <td className="py-3 px-4 font-medium text-white">
                        {player.name}
                      </td>
                      <td className="py-3 px-4">{player.email}</td>
                      <td className="py-3 px-4">{player.reason}</td>
                      <td className="py-3 px-4">{player.suspensionDate}</td>
                      <td className="py-3 px-4">
                        {player.duration === "permanent"
                          ? "Permanent"
                          : `${player.suspensionDays} days`}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleUnsuspendPlayer(player.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-bold text-white"
                        >
                          Unsuspend
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeSuspendedPlayers.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-8 text-center text-gray-400"
                      >
                        No suspended players
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Player KYC Docs Review Tab */}
      {activeTab === "kyc-review" && canReviewKyc && (
        <section className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            Player KYC Requests
          </h2>
          <div className="bg-white/10 p-4 rounded-lg">
            <table className="w-full text-left bg-gray-900/50 rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-gray-400 uppercase text-sm">
                <tr>
                  <th className="py-3 px-4">Player Name</th>
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-gray-300">
                {activeKycRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="py-3 px-4 font-medium text-white">
                      {req.name}
                    </td>
                    <td className="py-3 px-4">{req.documentType}</td>
                    <td className="py-3 px-4">{req.submittedDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          req.status === "Approved"
                            ? "bg-green-900 text-green-400"
                            : req.status === "Rejected"
                            ? "bg-red-900 text-red-400"
                            : "bg-yellow-900 text-yellow-400"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedKycDetails(req)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold text-white"
                      >
                        View Details
                      </button>
                      {req.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleKycAction(req.id, "approve")}
                            className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-bold text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleKycAction(req.id, "reject")}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs font-bold text-white"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {req.docUrl && req.docUrl !== "#" && (
                        <a
                          href={req.docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs font-bold text-white"
                        >
                          View Doc
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
                {activeKycRequests.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">
                      No KYC requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* KYC Details Modal */}
          {selectedKycDetails && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl border border-purple-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        KYC Document Details
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Complete information for {selectedKycDetails.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedKycDetails(null)}
                      className="text-white/70 hover:text-white text-2xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm">
                        Player Name
                      </label>
                      <div className="text-white font-medium">
                        {selectedKycDetails.name}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Player ID</label>
                      <div className="text-white font-medium">
                        {selectedKycDetails.playerId || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Email</label>
                      <div className="text-white font-medium">
                        {selectedKycDetails.email || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Phone</label>
                      <div className="text-white font-medium">
                        {selectedKycDetails.phone || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">
                        Document Type
                      </label>
                      <div className="text-white font-medium">
                        {selectedKycDetails.documentType}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">
                        Document Number
                      </label>
                      <div className="text-white font-medium">
                        {selectedKycDetails.documentNumber || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">
                        Submitted Date
                      </label>
                      <div className="text-white font-medium">
                        {selectedKycDetails.submittedDate}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Status</label>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs border font-medium ${
                            selectedKycDetails.status === "Approved"
                              ? "bg-green-500/30 text-green-300 border-green-400/50"
                              : selectedKycDetails.status === "Rejected"
                              ? "bg-red-500/30 text-red-300 border-red-400/50"
                              : "bg-yellow-500/30 text-yellow-300 border-yellow-400/50"
                          }`}
                        >
                          {selectedKycDetails.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedKycDetails.docUrl &&
                    selectedKycDetails.docUrl !== "#" && (
                      <div className="pt-4 border-t border-white/10">
                        <label className="text-gray-400 text-sm mb-2 block">
                          Document
                        </label>
                        <a
                          href={selectedKycDetails.docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                        >
                          View Document
                        </a>
                      </div>
                    )}
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    {selectedKycDetails.status === "Pending" && (
                      <>
                        <button
                          onClick={() => {
                            handleKycAction(selectedKycDetails.id, "approve");
                            setSelectedKycDetails(null);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            handleKycAction(selectedKycDetails.id, "reject");
                            setSelectedKycDetails(null);
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-lg font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedKycDetails(null)}
                      className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Player Fields Update Approval Tab */}
      {activeTab === "field-update" && canReviewFieldUpdates && (
        <section className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            Player Profile Update Requests
          </h2>
          <div className="bg-white/10 p-4 rounded-lg">
            <table className="w-full text-left bg-gray-900/50 rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-gray-400 uppercase text-sm">
                <tr>
                  <th className="py-3 px-4">Player Name</th>
                  <th className="py-3 px-4">Fields Updated</th>
                  <th className="py-3 px-4">Requested Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-gray-300">
                {activeProfileUpdates.map((req) => {
                  const fields =
                    req.fields ||
                    (req.field
                      ? [
                          {
                            field: req.field,
                            oldValue: req.oldValue,
                            newValue: req.newValue,
                          },
                        ]
                      : []);
                  return (
                    <tr key={req.id}>
                      <td className="py-3 px-4 font-medium text-white">
                        {req.name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-2">
                          {fields.map((field, idx) => (
                            <div
                              key={idx}
                              className="bg-white/5 p-2 rounded text-xs"
                            >
                              <div className="font-semibold text-white">
                                {field.field}
                              </div>
                              <div className="text-red-300 line-through">
                                {field.oldValue}
                              </div>
                              <div className="text-green-300">
                                → {field.newValue}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {req.requestedDate || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            req.status === "Approved"
                              ? "bg-green-900 text-green-400"
                              : req.status === "Rejected"
                              ? "bg-red-900 text-red-400"
                              : "bg-yellow-900 text-yellow-400"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {req.status === "Pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleProfileUpdateAction(req.id, "approve")
                              }
                              className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-bold text-white"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleProfileUpdateAction(req.id, "reject")
                              }
                              className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs font-bold text-white"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {activeProfileUpdates.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">
                      No profile update requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* All Players Tab */}
      {activeTab === "all-players" && canViewAllPlayers && (() => {
        // Filter players
        const filteredPlayers = activeAllPlayers.filter((player) => {
          const matchesSearch =
            !playerSearch ||
            player.name
              ?.toLowerCase()
              .includes(playerSearch.toLowerCase()) ||
            player.id
              ?.toLowerCase()
              .includes(playerSearch.toLowerCase()) ||
            player.email
              ?.toLowerCase()
              .includes(playerSearch.toLowerCase());
          const matchesStatus =
            playerStatusFilter === "all" ||
            player.status === playerStatusFilter;
          return matchesSearch && matchesStatus;
        });

        // Calculate pagination
        const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);
        const indexOfLastPlayer = currentPage * playersPerPage;
        const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
        const currentPlayers = filteredPlayers.slice(
          indexOfFirstPlayer,
          indexOfLastPlayer
        );

        return (
          <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-blue-500/20 to-purple-700/30 rounded-xl shadow-md border border-indigo-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">All Players</h2>
                <p className="text-gray-300 text-sm mt-1">
                  Showing {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <input
                  type="text"
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                  placeholder="Search by name, ID, email..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                />
                <CustomSelect
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "Active", label: "Active" },
                    { value: "Suspended", label: "Suspended" },
                    { value: "Pending Approval", label: "Pending Approval" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                  value={playerStatusFilter}
                  onChange={(e, option) =>
                    setPlayerStatusFilter(getSelectValue(e, option))
                  }
                  className="w-full sm:w-48"
                />
              </div>
            </div>

            {/* Players Cards Grid */}
            {currentPlayers.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                  {currentPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="bg-white/10 p-4 rounded-lg border border-white/20 hover:border-indigo-400/50 transition-all shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-white text-lg mb-1">
                            {player.name}
                          </div>
                          <div className="text-xs text-gray-400">ID: {player.id}</div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded font-semibold ${
                            player.status === "Active"
                              ? "bg-green-900 text-green-400"
                              : player.status === "Suspended"
                              ? "bg-red-900 text-red-400"
                              : player.status === "Pending Approval"
                              ? "bg-yellow-900 text-yellow-400"
                              : "bg-gray-900 text-gray-400"
                          }`}
                        >
                          {player.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white truncate ml-2" title={player.email}>
                            {player.email}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Phone:</span>
                          <span className="text-white">{player.phone}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Balance:</span>
                          <span className="text-green-300 font-semibold">
                            ₹{(player.balance || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">KYC Status:</span>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              player.kycStatus === "Verified"
                                ? "bg-green-900 text-green-400"
                                : player.kycStatus === "Pending"
                                ? "bg-yellow-900 text-yellow-400"
                                : player.kycStatus === "Rejected"
                                ? "bg-red-900 text-red-400"
                                : "bg-gray-900 text-gray-400"
                            }`}
                          >
                            {player.kycStatus || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Registered:</span>
                          <span className="text-white text-xs">
                            {player.registrationDate || "N/A"}
                          </span>
                        </div>
                        {player.referredBy && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Referred By:</span>
                            <span className="text-white text-xs">
                              {player.referredBy}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => handleViewPlayerDetails(player, clubId)}
                        className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
                      >
                        📄 View Full Details & KYC
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
                    <div className="text-sm text-gray-300">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Previous
                      </button>
                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
                                  currentPage === page
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <span
                                key={page}
                                className="px-2 text-gray-400"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/10 p-8 rounded-lg text-center text-gray-400">
                <div className="text-4xl mb-2">🔍</div>
                <div className="text-lg">No players found</div>
                <div className="text-sm mt-1">
                  Try adjusting your search or filter criteria
                </div>
              </div>
            )}
          </section>
        );
      })()}

      {/* Player Details Modal with KYC Documents */}
      {showPlayerDetailsModal && selectedPlayerForView && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Player Details & KYC Documents</h3>
              <button
                onClick={() => {
                  setShowPlayerDetailsModal(false);
                  setSelectedPlayerForView(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {loadingPlayerDetails ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-400">Loading player details...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Player Information */}
                <div className="bg-slate-700 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-white mb-4">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">Full Name:</span>
                      <p className="text-white font-semibold text-lg">{selectedPlayerForView.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Player ID:</span>
                      <p className="text-white font-semibold">{selectedPlayerForView.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Email:</span>
                      <p className="text-white font-semibold">{selectedPlayerForView.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Phone:</span>
                      <p className="text-white font-semibold">{selectedPlayerForView.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Registration Date:</span>
                      <p className="text-white font-semibold">{selectedPlayerForView.registrationDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Account Status:</span>
                      <p className={`font-semibold ${
                        selectedPlayerForView.status === 'Active' ? 'text-green-400' :
                        selectedPlayerForView.status === 'Pending' ? 'text-yellow-400' :
                        selectedPlayerForView.status === 'Suspended' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {selectedPlayerForView.status || 'Pending'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">KYC Status:</span>
                      <p className={`font-semibold ${
                        selectedPlayerForView.kycStatus === 'Verified' || selectedPlayerForView.kycStatus === 'approved' ? 'text-green-400' :
                        selectedPlayerForView.kycStatus === 'Pending' || selectedPlayerForView.kycStatus === 'pending' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {selectedPlayerForView.kycStatus || 'Pending'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Referred By:</span>
                      <p className="text-white font-semibold">{selectedPlayerForView.referredBy || 'Direct Registration'}</p>
                    </div>
                    {selectedPlayerForView.balance !== undefined && (
                      <div>
                        <span className="text-gray-400 text-sm">Current Balance:</span>
                        <p className="text-green-400 font-semibold text-lg">₹{(selectedPlayerForView.balance || 0).toLocaleString('en-IN')}</p>
                      </div>
                    )}
                    {selectedPlayerForView.kycDocument && (
                      <div>
                        <span className="text-gray-400 text-sm">Document Submitted:</span>
                        <p className="text-white font-semibold">{selectedPlayerForView.kycDocument}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* KYC Documents */}
                <div className="bg-slate-700 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-white mb-4">KYC Documents</h4>
                  
                  {selectedPlayerForView.kycDocuments && selectedPlayerForView.kycDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedPlayerForView.kycDocuments.map((doc, index) => (
                        <div key={index} className="bg-slate-600 rounded-lg p-4">
                          <div className="mb-3">
                            <span className="text-gray-300 text-sm font-semibold">
                              {doc.type || `Document ${index + 1}`}
                            </span>
                            {doc.status && (
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                doc.status === 'approved' ? 'bg-green-900 text-green-300' :
                                doc.status === 'rejected' ? 'bg-red-900 text-red-300' :
                                'bg-yellow-900 text-yellow-300'
                              }`}>
                                {doc.status}
                              </span>
                            )}
                          </div>
                          {doc.url ? (
                            <div className="space-y-2">
                              <img 
                                src={doc.url} 
                                alt={doc.type || 'KYC Document'} 
                                className="w-full h-48 object-cover rounded"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23334155" width="200" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block text-center text-blue-400 hover:text-blue-300 text-sm"
                              >
                                View Full Size
                              </a>
                            </div>
                          ) : (
                            <div className="bg-slate-500 rounded h-48 flex items-center justify-center text-gray-400">
                              No document available
                            </div>
                          )}
                          {doc.uploadedAt && (
                            <p className="text-gray-400 text-xs mt-2">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-2">📄</div>
                      <div className="text-lg">No KYC documents submitted</div>
                      <div className="text-sm mt-1">Player has not uploaded any documents yet</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-600">
                  <button
                    onClick={() => {
                      setShowPlayerDetailsModal(false);
                      handleApprovePlayer(selectedPlayerForView.id);
                    }}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Approve Player
                  </button>
                  <button
                    onClick={() => {
                      setShowPlayerDetailsModal(false);
                      handleRejectPlayer(selectedPlayerForView.id);
                    }}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Reject Player
                  </button>
                  <button
                    onClick={() => {
                      setShowPlayerDetailsModal(false);
                      setSelectedPlayerForView(null);
                    }}
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
