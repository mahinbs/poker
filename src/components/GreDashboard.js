import React, { useState } from "react";
import CustomSelect from "./common/CustomSelect";
import { useNavigate } from "react-router-dom";

export default function GreDashboard() {
  const [activeItem, setActiveItem] = useState("Monitoring");
  const navigate = useNavigate();

  const menuItems = [
    "Monitoring",
    "Players",
    "Registered Players",
    "Push Notifications",
    "Player Registration", 
    "Table View",
    "Player Support",
    "Offers",
  ];

  // State for Players (KYC Pending) management
  const [playersSearch, setPlayersSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playersFilter, setPlayersFilter] = useState({
    kycStatus: "pending",
    registrationDate: "all",
    documentType: "all"
  });
  
  // Mock players data with kycStatus: 'pending'
  const [allPlayers, setAllPlayers] = useState([
    {
      id: "P001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      kycStatus: "pending",
      registrationDate: "2024-01-15",
      documentType: "PAN Card",
      submittedDate: "2024-01-16",
      verificationNotes: ""
    },
    {
      id: "P002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+91 9876543211",
      kycStatus: "pending",
      registrationDate: "2024-01-10",
      documentType: "Aadhaar Card",
      submittedDate: "2024-01-12",
      verificationNotes: ""
    },
    {
      id: "P003",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      phone: "+91 9876543212",
      kycStatus: "pending",
      registrationDate: "2024-01-08",
      documentType: "Passport",
      submittedDate: "2024-01-09",
      verificationNotes: ""
    },
    {
      id: "P004",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 9876543213",
      kycStatus: "pending",
      registrationDate: "2024-01-20",
      documentType: "Driving License",
      submittedDate: "2024-01-21",
      verificationNotes: ""
    },
    {
      id: "P005",
      name: "Amit Patel",
      email: "amit.patel@example.com",
      phone: "+91 9876543214",
      kycStatus: "pending",
      registrationDate: "2024-01-18",
      documentType: "PAN Card",
      submittedDate: "2024-01-19",
      verificationNotes: ""
    }
  ]);

  // Filter players for dropdown search
  const filteredPlayersForSearch = playersSearch.length >= 2
    ? allPlayers.filter(player => {
        if (player.kycStatus !== "pending") return false;
        const searchLower = playersSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.phone.includes(playersSearch)
        );
      })
    : [];

  // Filter players based on search and filters (for display list)
  const filteredPlayers = allPlayers.filter(player => {
    if (player.kycStatus !== "pending") return false;
    // If a player is selected, show only that player
    if (selectedPlayer && player.id !== selectedPlayer.id) return false;
    // Otherwise, filter by search text
    if (!selectedPlayer && playersSearch) {
      const searchLower = playersSearch.toLowerCase();
      const matchesSearch = 
        player.name.toLowerCase().includes(searchLower) ||
        player.email.toLowerCase().includes(searchLower) ||
        player.id.toLowerCase().includes(searchLower) ||
        player.phone.includes(playersSearch);
      if (!matchesSearch) return false;
    }
    if (playersFilter.documentType !== "all" && player.documentType !== playersFilter.documentType) {
      return false;
    }
    if (playersFilter.registrationDate !== "all") {
      const registrationDate = new Date(player.registrationDate);
      const now = new Date();
      const daysDiff = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));
      if (playersFilter.registrationDate === "today" && daysDiff !== 0) return false;
      if (playersFilter.registrationDate === "week" && daysDiff > 7) return false;
      if (playersFilter.registrationDate === "month" && daysDiff > 30) return false;
    }
    return true;
  });

  // Handle KYC verification actions
  const handleKYCVerification = (playerId, action, notes = "") => {
    setAllPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        return {
          ...player,
          kycStatus: action === "approve" ? "approved" : action === "reject" ? "rejected" : player.kycStatus,
          verificationNotes: notes,
          verifiedDate: new Date().toISOString().split('T')[0]
        };
      }
      return player;
    }));
    alert(`KYC ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "updated"} for ${playerId}`);
  };

  // State for Registered Players (Verified/Approved users)
  const [registeredPlayersSearch, setRegisteredPlayersSearch] = useState("");
  const [selectedRegisteredPlayer, setSelectedRegisteredPlayer] = useState(null);
  const [registeredPlayersFilter, setRegisteredPlayersFilter] = useState({
    status: "all",
    registrationDate: "all",
    documentType: "all",
    verifiedDate: "all"
  });
  const [selectedPlayerDetails, setSelectedPlayerDetails] = useState(null);

  // Mock registered/verified players data
  const [registeredPlayers, setRegisteredPlayers] = useState([
    {
      id: "P101", name: "Alex Johnson", email: "alex.johnson@example.com", phone: "+91 9876543215",
      kycStatus: "approved", registrationDate: "2024-01-05", documentType: "PAN Card",
      verifiedDate: "2024-01-06", verificationNotes: "All documents verified",
      accountStatus: "Active", totalGames: 45, lastActive: "2 hours ago",
      kycDocUrl: "/documents/pan_alex_johnson.pdf"
    },
    {
      id: "P102", name: "Maria Garcia", email: "maria.garcia@example.com", phone: "+91 9876543216",
      kycStatus: "approved", registrationDate: "2024-01-08", documentType: "Aadhaar Card",
      verifiedDate: "2024-01-09", verificationNotes: "Documents verified successfully",
      accountStatus: "Active", totalGames: 123, lastActive: "5 minutes ago",
      kycDocUrl: "/documents/aadhaar_maria_garcia.pdf"
    },
    {
      id: "P103", name: "Rajesh Kumar", email: "rajesh.kumar@example.com", phone: "+91 9876543217",
      kycStatus: "approved", registrationDate: "2024-01-10", documentType: "Passport",
      verifiedDate: "2024-01-11", verificationNotes: "Passport verified",
      accountStatus: "Suspended", totalGames: 67, lastActive: "3 days ago",
      kycDocUrl: "/documents/passport_rajesh_kumar.pdf"
    }
  ]);

  // Filter registered players for dropdown search
  const filteredRegisteredPlayersForSearch = registeredPlayersSearch.length >= 2
    ? registeredPlayers.filter(player => {
        if (player.kycStatus !== "approved") return false;
        const searchLower = registeredPlayersSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.phone.includes(registeredPlayersSearch)
        );
      })
    : [];

  const filteredRegisteredPlayers = registeredPlayers.filter(player => {
    if (player.kycStatus !== "approved") return false;
    // If a player is selected, show only that player
    if (selectedRegisteredPlayer && player.id !== selectedRegisteredPlayer.id) return false;
    // Otherwise, filter by search text
    if (!selectedRegisteredPlayer && registeredPlayersSearch) {
      const searchLower = registeredPlayersSearch.toLowerCase();
      const matchesSearch = 
        player.name.toLowerCase().includes(searchLower) ||
        player.email.toLowerCase().includes(searchLower) ||
        player.id.toLowerCase().includes(searchLower) ||
        player.phone.includes(registeredPlayersSearch);
      if (!matchesSearch) return false;
    }
    if (registeredPlayersFilter.status !== "all" && player.accountStatus !== registeredPlayersFilter.status) return false;
    if (registeredPlayersFilter.documentType !== "all" && player.documentType !== registeredPlayersFilter.documentType) return false;
    if (registeredPlayersFilter.registrationDate !== "all") {
      const registrationDate = new Date(player.registrationDate);
      const now = new Date();
      const daysDiff = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));
      if (registeredPlayersFilter.registrationDate === "today" && daysDiff !== 0) return false;
      if (registeredPlayersFilter.registrationDate === "week" && daysDiff > 7) return false;
      if (registeredPlayersFilter.registrationDate === "month" && daysDiff > 30) return false;
    }
    return true;
  });

  const handleDownloadKYCDoc = (player) => {
    alert(`Downloading KYC document for ${player.name}\nDocument: ${player.kycDocUrl}\nDocument Type: ${player.documentType}`);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Player ID", "Name", "Email", "Phone", "Status", "Registration Date", "Verified Date", "Document Type"],
      ...filteredRegisteredPlayers.map(p => [p.id, p.name, p.email, p.phone, p.accountStatus, p.registrationDate, p.verifiedDate, p.documentType])
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registered_players_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSignOut = () => {
    navigate("/gre/signin");
  };

  // Get all players for search
  const allPlayersForGreSearch = registeredPlayers ? [...registeredPlayers, ...allPlayers.filter(p => !registeredPlayers.find(rp => rp.id === p.id))] : allPlayers;

  // Player search for KYC Upload
  const [kycUploadPlayerSearch, setKycUploadPlayerSearch] = useState("");
  const [selectedKycUploadPlayer, setSelectedKycUploadPlayer] = useState(null);
  const filteredKycUploadPlayers = kycUploadPlayerSearch.length >= 3
    ? allPlayersForGreSearch.filter(player => {
        const searchLower = kycUploadPlayerSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          (player.email && player.email.toLowerCase().includes(searchLower))
        );
      })
    : [];

  // Player search for Player Support
  const [playerSupportSearch, setPlayerSupportSearch] = useState("");
  const [selectedPlayerSupport, setSelectedPlayerSupport] = useState(null);
  const filteredPlayerSupportPlayers = playerSupportSearch.length >= 3
    ? allPlayersForGreSearch.filter(player => {
        const searchLower = playerSupportSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          (player.email && player.email.toLowerCase().includes(searchLower))
        );
      })
    : [];

  // Offers state & helpers
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    audience: "All Players",
    rewardType: "Bonus Chips",
    rewardValue: "",
    startDate: "",
    endDate: "",
    notification: true,
  });

  const [offers, setOffers] = useState([
    {
      id: "OF101",
      title: "Welcome Bonus",
      description: "New players receive ₹1,000 bonus chips on first deposit.",
      audience: "New Players",
      reward: "Bonus Chips · ₹1,000",
      status: "Active",
      startDate: "2024-02-01",
      endDate: "2024-02-29",
      sentNotifications: 128,
    },
    {
      id: "OF102",
      title: "Weekend High Roller",
      description: "Play ₹50,000+ over the weekend and earn ₹5,000 bonus chips.",
      audience: "High Rollers",
      reward: "Bonus Chips · ₹5,000",
      status: "Upcoming",
      startDate: "2024-03-02",
      endDate: "2024-03-03",
      sentNotifications: 42,
    },
    {
      id: "OF099",
      title: "Festive Spin",
      description: "All players get double loyalty points on festive week.",
      audience: "All Players",
      reward: "Loyalty Points · 2x",
      status: "Expired",
      startDate: "2023-12-20",
      endDate: "2023-12-27",
      sentNotifications: 310,
    },
  ]);

  const resetOfferForm = () => {
    setOfferForm({
      title: "",
      description: "",
      audience: "All Players",
      rewardType: "Bonus Chips",
      rewardValue: "",
      startDate: "",
      endDate: "",
      notification: true,
    });
  };

  const handleCreateOffer = () => {
    if (!offerForm.title.trim() || !offerForm.description.trim() || !offerForm.rewardValue) {
      alert("Please fill in the offer title, description, and reward value.");
      return;
    }

    const newOffer = {
      id: `OF${Date.now().toString().slice(-4)}`,
      title: offerForm.title.trim(),
      description: offerForm.description.trim(),
      audience: offerForm.audience,
      reward: `${offerForm.rewardType} · ${offerForm.rewardType.includes("Points") ? offerForm.rewardValue : `₹${Number(offerForm.rewardValue).toLocaleString('en-IN')}`}`,
      status: offerForm.startDate
        ? new Date(offerForm.startDate) > new Date()
          ? "Upcoming"
          : "Active"
        : "Active",
      startDate: offerForm.startDate || new Date().toISOString().split("T")[0],
      endDate: offerForm.endDate || "-",
      sentNotifications: offerForm.notification ? Math.floor(Math.random() * 50) + 25 : 0,
    };

    setOffers(prev => [newOffer, ...prev]);
    alert(`Offer "${newOffer.title}" created${offerForm.notification ? " and notifications queued." : "."}`);
    resetOfferForm();
  };

  // Push Notifications state and helpers
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    audience: "All Players",
    imageFile: null,
    imageUrl: "",
    videoUrl: "",
    imagePreview: null
  });
  const [notificationErrors, setNotificationErrors] = useState({});

  const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    if (!validTypes.includes(file.type)) return "Image must be JPG, PNG, GIF, or WebP format";
    if (file.size > maxSize) return "Image size must be less than 5MB";
    return null;
  };

  const validateVideoUrl = (url) => {
    if (!url) return null;
    const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|facebook\.com|instagram\.com)\/.+$/i;
    return videoUrlPattern.test(url) ? null : "Please enter a valid video URL (YouTube, Vimeo, DailyMotion, Facebook, Instagram)";
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) { setNotificationErrors(prev => ({...prev, image: error})); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNotificationForm(prev => ({...prev, imageFile: file, imagePreview: reader.result, imageUrl: ""}));
      setNotificationErrors(prev => ({...prev, image: null}));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (url) => {
    if (!url) {
      setNotificationForm(prev => ({...prev, imageUrl: "", imageFile: null, imagePreview: null}));
      setNotificationErrors(prev => ({...prev, image: null}));
      return;
    }
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      setNotificationErrors(prev => ({...prev, image: "Please enter a valid URL starting with http:// or https://"}));
      return;
    }
    setNotificationForm(prev => ({...prev, imageUrl: url, imageFile: null, imagePreview: null}));
    setNotificationErrors(prev => ({...prev, image: null}));
  };

  const handleVideoUrlChange = (url) => {
    setNotificationForm(prev => ({...prev, videoUrl: url}));
    setNotificationErrors(prev => ({...prev, video: validateVideoUrl(url)}));
  };

  const handleSendNotification = () => {
    const errors = {};
    if (!notificationForm.title.trim()) errors.title = "Title is required";
    if (!notificationForm.message.trim()) errors.message = "Message is required";
    if (notificationForm.imageFile && notificationForm.imageUrl) errors.image = "Use either image upload OR image URL, not both";
    if (notificationForm.videoUrl) {
      const v = validateVideoUrl(notificationForm.videoUrl);
      if (v) errors.video = v;
    }
    if (Object.keys(errors).length) { setNotificationErrors(errors); return; }

    const payload = {
      title: notificationForm.title,
      message: notificationForm.message,
      audience: notificationForm.audience,
      media: {}
    };
    if (notificationForm.imageFile) {
      payload.media.imageUrl = "https://api.example.com/uploads/" + notificationForm.imageFile.name;
    } else if (notificationForm.imageUrl) {
      payload.media.imageUrl = notificationForm.imageUrl;
    }
    if (notificationForm.videoUrl) payload.media.videoUrl = notificationForm.videoUrl;

    console.log("Sending notification payload:", payload);
    alert(`Notification sent!\nPayload: ${JSON.stringify(payload, null, 2)}`);
    setNotificationForm({ title: "", message: "", audience: "All Players", imageFile: null, imageUrl: "", videoUrl: "", imagePreview: null });
    setNotificationErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-blue-500/20 via-cyan-600/30 to-teal-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 drop-shadow-lg mb-6">
            GRE Portal
          </div>
          <div className="flex items-center mb-6 text-white min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-gray-900 font-bold text-sm">GRE</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold truncate">Guest Relation Executive</div>
              <div className="text-sm opacity-80 truncate">gre@pokerroom.com</div>
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="space-y-3">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md ${
                  activeItem === item
                    ? "bg-gradient-to-r from-blue-400 to-cyan-600 text-gray-900 font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-blue-400/20 hover:to-cyan-500/20 text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Section */}
        <main className="col-span-12 lg:col-span-9 xl:col-span-9 space-y-8">
          {/* Header */}
          <header className="bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">GRE Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Monitor players, handle Player Registrations, and view tables</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
              Sign Out
            </button>
          </header>

          {/* Dynamic Content Based on Active Item */}
          {activeItem === "Monitoring" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Active Players", value: "12", color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "Waiting Players", value: "5", color: "from-yellow-400 via-orange-500 to-red-500" },
                  { title: "New Players", value: "3", color: "from-blue-400 via-indigo-500 to-violet-500" },
                  { title: "Active Sessions", value: "8", color: "from-purple-400 via-pink-500 to-rose-500" },
                ].map((card, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}
                  >
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Real-time monitoring</div>
                  </div>
                ))}
              </div>

              {/* Player Monitoring */}
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Status Monitoring</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Players</h3>
                    <div className="space-y-2">
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                        <div className="font-semibold text-white">John Smith</div>
                        <div className="text-sm text-gray-300">Table 1 - Seat 3 | ₹2,500</div>
                        <div className="text-xs text-green-300">Playing</div>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                        <div className="font-semibold text-white">Maria Garcia</div>
                        <div className="text-sm text-gray-300">Table 2 - Seat 7 | ₹1,800</div>
                        <div className="text-xs text-green-300">Playing</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Waiting Players</h3>
                    <div className="space-y-2">
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">Alex Johnson</div>
                        <div className="text-sm text-gray-300">Position: 1 | Texas Hold'em</div>
                        <div className="text-xs text-yellow-300">Waiting</div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">David Wilson</div>
                        <div className="text-sm text-gray-300">Position: 2 | Omaha</div>
                        <div className="text-xs text-yellow-300">Waiting</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">New Players</h3>
                    <div className="space-y-2">
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Sarah Connor</div>
                        <div className="text-sm text-gray-300">Registered: 2 hours ago</div>
                        <div className="text-xs text-blue-300">New</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Mike Tyson</div>
                        <div className="text-sm text-gray-300">Registered: 1 hour ago</div>
                        <div className="text-xs text-blue-300">New</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Account & Session Monitoring */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-indigo-500/20 to-blue-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Account & Session Monitoring</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white">Total Accounts</span>
                        <span className="text-green-300 font-bold">1,247</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Active Accounts</span>
                        <span className="text-blue-300 font-bold">892</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Suspended Accounts</span>
                        <span className="text-red-300 font-bold">23</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Pending Verification</span>
                        <span className="text-yellow-300 font-bold">45</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Session Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white">Active Sessions</span>
                        <span className="text-green-300 font-bold">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Average Session Time</span>
                        <span className="text-blue-300 font-bold">2h 34m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Peak Concurrent</span>
                        <span className="text-purple-300 font-bold">15</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white">Session Errors</span>
                        <span className="text-red-300 font-bold">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Players */}
          {activeItem === "Players" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Players - KYC Pending Review</h2>
                
                {/* Search and Filters */}
                <div className="bg-white/10 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="text-white text-sm mb-1 block">Search Player</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Type at least 2 characters to search..." 
                          value={playersSearch}
                          onChange={(e) => {
                            setPlayersSearch(e.target.value);
                            setSelectedPlayer(null);
                          }}
                        />
                        {playersSearch.length >= 2 && filteredPlayersForSearch.length > 0 && !selectedPlayer && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredPlayersForSearch.map(player => (
                              <div
                                key={player.id}
                                onClick={() => {
                                  setSelectedPlayer(player);
                                  setPlayersSearch(`${player.name} (${player.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{player.name}</div>
                                <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email} | Phone: {player.phone}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedPlayer && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm flex items-center justify-between">
                            <span className="text-green-300">Selected: {selectedPlayer.name} ({selectedPlayer.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedPlayer(null);
                                setPlayersSearch("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Registration Date</label>
                      <CustomSelect
                        className="w-full"
                        value={playersFilter.registrationDate}
                        onChange={(e) => setPlayersFilter({...playersFilter, registrationDate: e.target.value})}
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Document Type</label>
                      <CustomSelect
                        className="w-full"
                        value={playersFilter.documentType}
                        onChange={(e) => setPlayersFilter({...playersFilter, documentType: e.target.value})}
                      >
                        <option value="all">All Documents</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                      </CustomSelect>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-white text-sm">
                      Showing <span className="font-semibold">{filteredPlayers.length}</span> of <span className="font-semibold">{allPlayers.filter(p => p.kycStatus === 'pending').length}</span> pending KYC verifications
                    </div>
                    <button 
                      onClick={() => {
                        setPlayersSearch("");
                        setSelectedPlayer(null);
                        setPlayersFilter({kycStatus: "pending", registrationDate: "all", documentType: "all"});
                      }}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Players List */}
                <div className="bg-white/10 p-4 rounded-lg">
                  {filteredPlayers.length > 0 ? (
                    <div className="space-y-3">
                      {filteredPlayers.map(player => (
                        <div key={player.id} className="bg-white/5 p-4 rounded-lg border border-yellow-400/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            {/* Player Info */}
                            <div className="md:col-span-8 space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="font-semibold text-white text-lg">{player.name}</div>
                                <span className="bg-yellow-500/30 text-yellow-300 font-medium px-3 py-1 rounded-full text-xs border border-yellow-400/50">
                                  KYC Pending
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">ID:</span> <span className="text-white">{player.id}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Email:</span> <span className="text-white">{player.email}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Phone:</span> <span className="text-white">{player.phone}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Doc Type:</span> <span className="text-white">{player.documentType}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-300">
                                <div>Registered: {new Date(player.registrationDate).toLocaleDateString()}</div>
                                <div>Submitted: {new Date(player.submittedDate).toLocaleDateString()}</div>
                                <div className="md:col-span-2">Days Pending: {Math.floor((new Date() - new Date(player.submittedDate)) / (1000 * 60 * 60 * 24))} days</div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-4 flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleKYCVerification(player.id, "approve")}
                                  className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                >
                                  ✓ Approve
                                </button>
                                <button 
                                  onClick={() => {
                                    const notes = prompt("Enter rejection reason (optional):");
                                    if (notes !== null) {
                                      handleKYCVerification(player.id, "reject", notes);
                                    }
                                  }}
                                  className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                >
                                  ✗ Reject
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() => alert(`View documents for ${player.name} (${player.id})\nDocument Type: ${player.documentType}`)}
                                >
                                  View Docs
                                </button>
                                <button 
                                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() => alert(`Player Details:\n\nName: ${player.name}\nEmail: ${player.email}\nPhone: ${player.phone}\nDocument: ${player.documentType}\nRegistration: ${player.registrationDate}`)}
                                >
                                  Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">No players found</div>
                      <div className="text-gray-500 text-sm">
                        {playersSearch || playersFilter.registrationDate !== "all" || playersFilter.documentType !== "all"
                          ? "Try adjusting your search or filters"
                          : "No pending KYC verifications"}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Registered Players */}
          {activeItem === "Registered Players" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Registered Players - Verified Users</h2>
                <div className="bg-white/10 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="text-white text-sm mb-1 block">Search Player</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Type at least 2 characters to search..." 
                          value={registeredPlayersSearch} 
                          onChange={(e) => {
                            setRegisteredPlayersSearch(e.target.value);
                            setSelectedRegisteredPlayer(null);
                          }} 
                        />
                        {registeredPlayersSearch.length >= 2 && filteredRegisteredPlayersForSearch.length > 0 && !selectedRegisteredPlayer && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredRegisteredPlayersForSearch.map(player => (
                              <div
                                key={player.id}
                                onClick={() => {
                                  setSelectedRegisteredPlayer(player);
                                  setRegisteredPlayersSearch(`${player.name} (${player.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{player.name}</div>
                                <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email} | Phone: {player.phone}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedRegisteredPlayer && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm flex items-center justify-between">
                            <span className="text-green-300">Selected: {selectedRegisteredPlayer.name} ({selectedRegisteredPlayer.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedRegisteredPlayer(null);
                                setRegisteredPlayersSearch("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Account Status</label>
                      <CustomSelect
                        className="w-full"
                        value={registeredPlayersFilter.status}
                        onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, status: e.target.value})}
                      >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Inactive">Inactive</option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Registration Date</label>
                      <CustomSelect
                        className="w-full"
                        value={registeredPlayersFilter.registrationDate}
                        onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, registrationDate: e.target.value})}
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Document Type</label>
                      <CustomSelect
                        className="w-full"
                        value={registeredPlayersFilter.documentType}
                        onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, documentType: e.target.value})}
                      >
                        <option value="all">All Documents</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                      </CustomSelect>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-white text-sm">Showing <span className="font-semibold">{filteredRegisteredPlayers.length}</span> of <span className="font-semibold">{registeredPlayers.length}</span> verified players</div>
                    <div className="flex gap-2">
                      <button onClick={() => { setRegisteredPlayersSearch(""); setSelectedRegisteredPlayer(null); setRegisteredPlayersFilter({status: "all", registrationDate: "all", documentType: "all", verifiedDate: "all"}); }} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">Clear Filters</button>
                      <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">Export CSV</button>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  {filteredRegisteredPlayers.length > 0 ? (
                    <div className="space-y-3">
                      {filteredRegisteredPlayers.map(player => (
                        <div key={player.id} className="bg-white/5 p-4 rounded-lg border border-green-400/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            {/* Player Info */}
                            <div className="md:col-span-8 space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="font-semibold text-white text-lg">{player.name}</div>
                                <span className={`px-3 py-1 rounded-full text-xs border font-medium ${player.accountStatus === "Active" ? "bg-green-500/30 text-green-300 border-green-400/50" : player.accountStatus === "Suspended" ? "bg-red-500/30 text-red-300 border-red-400/50" : "bg-gray-500/30 text-gray-300 border-gray-400/50"}`}>
                                  {player.accountStatus}
                                </span>
                                <span className="bg-blue-500/30 text-blue-300 font-medium px-3 py-1 rounded-full text-xs border border-blue-400/50">
                                  ✓ Verified
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">ID:</span> <span className="text-white">{player.id}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Email:</span> <span className="text-white">{player.email}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Phone:</span> <span className="text-white">{player.phone}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Doc Type:</span> <span className="text-white">{player.documentType}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-300">
                                <div>Registered: {new Date(player.registrationDate).toLocaleDateString()}</div>
                                <div>Verified: {new Date(player.verifiedDate).toLocaleDateString()}</div>
                                <div>Games: {player.totalGames}</div>
                                <div>Last Active: {player.lastActive}</div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-4 flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setSelectedPlayerDetails(player)}
                                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                >
                                  View Details
                                </button>
                                <button 
                                  onClick={() => handleDownloadKYCDoc(player)}
                                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                >
                                  📥 Download KYC
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() => {
                                    const newStatus = player.accountStatus === "Active" ? "Suspended" : "Active";
                                    setRegisteredPlayers(prev => prev.map(p => 
                                      p.id === player.id ? {...p, accountStatus: newStatus} : p
                                    ));
                                    alert(`${player.name} account status changed to ${newStatus}`);
                                  }}
                                >
                                  {player.accountStatus === "Active" ? "Suspend" : "Activate"}
                                </button>
                                <button 
                                  className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete ${player.name}?`)) {
                                      setRegisteredPlayers(prev => prev.filter(p => p.id !== player.id));
                                      alert(`${player.name} removed from system`);
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">No players found</div>
                      <div className="text-gray-500 text-sm">{registeredPlayersSearch || registeredPlayersFilter.status !== "all" || registeredPlayersFilter.registrationDate !== "all" || registeredPlayersFilter.documentType !== "all" ? "Try adjusting your search or filters" : "No registered players found"}</div>
                    </div>
                  )}
                </div>
              </section>
              {selectedPlayerDetails && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl border border-purple-500/30 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-white/10">
                      <div className="flex justify-between items-start">
                        <div><h2 className="text-2xl font-bold text-white mb-2">Player Details</h2><p className="text-gray-400 text-sm">Complete information for {selectedPlayerDetails.name}</p></div>
                        <button onClick={() => setSelectedPlayerDetails(null)} className="text-white/70 hover:text-white text-2xl font-bold">×</button>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div><h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Basic Information</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="text-gray-400 text-sm">Player ID</label><div className="text-white font-medium">{selectedPlayerDetails.id}</div></div>
                          <div><label className="text-gray-400 text-sm">Full Name</label><div className="text-white font-medium">{selectedPlayerDetails.name}</div></div>
                          <div><label className="text-gray-400 text-sm">Email</label><div className="text-white font-medium">{selectedPlayerDetails.email}</div></div>
                          <div><label className="text-gray-400 text-sm">Phone</label><div className="text-white font-medium">{selectedPlayerDetails.phone}</div></div>
                          <div><label className="text-gray-400 text-sm">Account Status</label><div><span className={`px-3 py-1 rounded-full text-xs border font-medium ${selectedPlayerDetails.accountStatus === "Active" ? "bg-green-500/30 text-green-300 border-green-400/50" : "bg-red-500/30 text-red-300 border-red-400/50"}`}>{selectedPlayerDetails.accountStatus}</span></div></div>
                        </div></div>
                      <div><h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">KYC Information</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="text-gray-400 text-sm">KYC Status</label><div><span className="bg-green-500/30 text-green-300 font-medium px-3 py-1 rounded-full text-xs border border-green-400/50">✓ Approved</span></div></div>
                          <div><label className="text-gray-400 text-sm">Document Type</label><div className="text-white font-medium">{selectedPlayerDetails.documentType}</div></div>
                          <div><label className="text-gray-400 text-sm">Registration Date</label><div className="text-white font-medium">{new Date(selectedPlayerDetails.registrationDate).toLocaleDateString()}</div></div>
                          <div><label className="text-gray-400 text-sm">Verified Date</label><div className="text-white font-medium">{new Date(selectedPlayerDetails.verifiedDate).toLocaleDateString()}</div></div>
                          <div className="md:col-span-2"><label className="text-gray-400 text-sm">Verification Notes</label><div className="text-white font-medium bg-white/5 p-3 rounded">{selectedPlayerDetails.verificationNotes}</div></div>
                        </div></div>
                      <div><h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Activity Information</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="text-gray-400 text-sm">Total Games</label><div className="text-white font-medium text-xl">{selectedPlayerDetails.totalGames}</div></div>
                          <div><label className="text-gray-400 text-sm">Last Active</label><div className="text-white font-medium">{selectedPlayerDetails.lastActive}</div></div>
                        </div></div>
                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button onClick={() => handleDownloadKYCDoc(selectedPlayerDetails)} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold">📥 Download KYC Document</button>
                        <button onClick={() => { setSelectedPlayerDetails(null); handleExportCSV(); }} className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg font-semibold">Export Player Data</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Push Notifications */}
          {activeItem === "Push Notifications" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Push Notifications</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Compose Notification</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Title</label>
                        <input 
                          type="text" 
                          className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded text-white ${
                            notificationErrors.title ? 'border-red-500' : 'border-white/20'
                          }`}
                          placeholder="Enter title" 
                          value={notificationForm.title}
                          onChange={(e) => {
                            setNotificationForm({...notificationForm, title: e.target.value});
                            setNotificationErrors({...notificationErrors, title: null});
                          }}
                        />
                        {notificationErrors.title && (
                          <p className="text-red-400 text-xs mt-1">{notificationErrors.title}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-white text-sm">Message</label>
                        <textarea 
                          className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded text-white ${
                            notificationErrors.message ? 'border-red-500' : 'border-white/20'
                          }`}
                          rows="3" 
                          placeholder="Enter message..."
                          value={notificationForm.message}
                          onChange={(e) => {
                            setNotificationForm({...notificationForm, message: e.target.value});
                            setNotificationErrors({...notificationErrors, message: null});
                          }}
                        ></textarea>
                        {notificationErrors.message && (
                          <p className="text-red-400 text-xs mt-1">{notificationErrors.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-white text-sm">Audience</label>
                        <CustomSelect
                          className="w-full"
                          value={notificationForm.audience}
                          onChange={(e) => setNotificationForm({...notificationForm, audience: e.target.value})}
                        >
                          <option>All Players</option>
                          <option>Tables in Play</option>
                          <option>Waitlist</option>
                          <option>VIP</option>
                        </CustomSelect>
                      </div>
                      
                      {/* Image Section */}
                      <div className="border-t border-white/20 pt-4">
                        <label className="text-white text-sm font-semibold mb-2 block">Image (Optional)</label>
                        <div className="space-y-3">
                          <div>
                            <label className="text-white text-xs">Upload Image</label>
                            <div className="mt-1 border-2 border-dashed border-white/30 rounded-lg p-4 text-center">
                              <input 
                                type="file" 
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                className="hidden"
                                id="image-upload-gre"
                                onChange={handleImageUpload}
                              />
                              <label htmlFor="image-upload-gre" className="cursor-pointer">
                                <div className="text-white text-sm mb-1">Click to upload or drag and drop</div>
                                <div className="text-gray-400 text-xs">JPG, PNG, GIF, WebP (max 5MB)</div>
                              </label>
                              {notificationForm.imagePreview && (
                                <div className="mt-3">
                                  <img src={notificationForm.imagePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                                  <button
                                    type="button"
                                    onClick={() => setNotificationForm({...notificationForm, imageFile: null, imagePreview: null})}
                                    className="mt-2 text-red-400 text-xs hover:text-red-300"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-center text-white/60 text-xs">OR</div>
                          <div>
                            <label className="text-white text-xs">Image URL</label>
                            <input 
                              type="url" 
                              className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded text-white text-sm ${
                                notificationErrors.image ? 'border-red-500' : 'border-white/20'
                              }`}
                              placeholder="https://example.com/image.jpg"
                              value={notificationForm.imageUrl}
                              onChange={(e) => handleImageUrlChange(e.target.value)}
                            />
                          </div>
                          {notificationErrors.image && (
                            <p className="text-red-400 text-xs">{notificationErrors.image}</p>
                          )}
                        </div>
                      </div>

                      {/* Video Section */}
                      <div className="border-t border-white/20 pt-4">
                        <label className="text-white text-sm font-semibold mb-2 block">Video Link (Optional)</label>
                        <input 
                          type="url" 
                          className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded text-white text-sm ${
                            notificationErrors.video ? 'border-red-500' : 'border-white/20'
                          }`}
                          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                          value={notificationForm.videoUrl}
                          onChange={(e) => handleVideoUrlChange(e.target.value)}
                        />
                        {notificationErrors.video && (
                          <p className="text-red-400 text-xs mt-1">{notificationErrors.video}</p>
                        )}
                        <p className="text-gray-400 text-xs mt-1">
                          Supported: YouTube, Vimeo, DailyMotion, Facebook, Instagram
                        </p>
                      </div>

                      <button 
                        onClick={handleSendNotification}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold mt-4"
                      >
                        Send Notification
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Notifications</h3>
                    <div className="space-y-2">
                      {[{title:'Welcome Offer', time:'2h ago'}, {title:'Table 2 starting soon', time:'10m ago'}].map(n => (
                        <div key={n.title} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="text-white">{n.title}</div>
                          <div className="text-white/60 text-sm">{n.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Player Registration */}
          {activeItem === "Player Registration" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Create New Players</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Player Registration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Full Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter full name" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Email Address</label>
                        <input type="email" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter email" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Phone Number</label>
                        <input type="tel" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter phone number" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Preferred Game</label>
                      <CustomSelect className="w-full">
                        <option>Texas Hold'em</option>
                        <option>Omaha</option>
                        <option>Stud</option>
                        <option>Mixed Games</option>
                      </CustomSelect>
                      </div>
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Create Player Account
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Registrations</h3>
                    <div className="space-y-2">
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Sarah Connor</div>
                        <div className="text-sm text-gray-300">sarah.connor@email.com</div>
                        <div className="text-xs text-blue-300">Registered 2 hours ago</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Mike Tyson</div>
                        <div className="text-sm text-gray-300">mike.tyson@email.com</div>
                        <div className="text-xs text-blue-300">Registered 1 hour ago</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Emma Watson</div>
                        <div className="text-sm text-gray-300">emma.watson@email.com</div>
                        <div className="text-xs text-blue-300">Registered 30 minutes ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">KYC Upload (Portal Glitch Recovery)</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="text-white text-sm">Search Player (Type at least 3 characters)</label>
                      <input 
                        type="text" 
                        className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                        placeholder="Search by name, ID, or email..." 
                        value={kycUploadPlayerSearch}
                        onChange={(e) => {
                          setKycUploadPlayerSearch(e.target.value);
                          setSelectedKycUploadPlayer(null);
                        }}
                      />
                      {kycUploadPlayerSearch.length >= 3 && filteredKycUploadPlayers.length > 0 && !selectedKycUploadPlayer && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {filteredKycUploadPlayers.map(player => (
                            <div
                              key={player.id}
                              onClick={() => {
                                setSelectedKycUploadPlayer(player);
                                setKycUploadPlayerSearch(`${player.name} (${player.id})`);
                              }}
                              className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                            >
                              <div className="text-white font-medium">{player.name}</div>
                              <div className="text-gray-400 text-xs">ID: {player.id} {player.email ? `| Email: ${player.email}` : ''}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedKycUploadPlayer && (
                        <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                          <span className="text-green-300">Selected: {selectedKycUploadPlayer.name} ({selectedKycUploadPlayer.id})</span>
                          <button 
                            onClick={() => {
                              setSelectedKycUploadPlayer(null);
                              setKycUploadPlayerSearch("");
                            }}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-white text-sm">Document Type</label>
                      <CustomSelect className="w-full">
                        <option>PAN Card</option>
                        <option>Aadhaar Card</option>
                        <option>Passport</option>
                        <option>Driving License</option>
                      </CustomSelect>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-white text-sm">Upload Document</label>
                      <div className="mt-1 border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                        <div className="text-white mb-2">Click to upload or drag and drop</div>
                        <div className="text-gray-400 text-sm">PNG, JPG, PDF up to 10MB</div>
                        <input type="file" className="hidden" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold">
                      Upload KYC Document
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold">
                      View Uploaded Documents
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Table View */}
          {activeItem === "Table View" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-indigo-500/20 to-blue-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Poker Tables Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg border border-green-400/30">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Table 1</h3>
                      <span className="bg-green-500/30 text-green-300 px-2 py-1 rounded text-sm">Active</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">Game: Texas Hold'em</div>
                      <div className="text-sm text-gray-300">Players: 6/8</div>
                      <div className="text-sm text-gray-300">Blinds: ₹25/₹50</div>
                      <div className="text-sm text-gray-300">Dealer: John</div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg border border-yellow-400/30">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Table 2</h3>
                      <span className="bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded text-sm">Waiting</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">Game: Omaha</div>
                      <div className="text-sm text-gray-300">Players: 4/8</div>
                      <div className="text-sm text-gray-300">Blinds: ₹50/₹100</div>
                      <div className="text-sm text-gray-300">Dealer: Sarah</div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg border border-red-400/30">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Table 3</h3>
                      <span className="bg-red-500/30 text-red-300 px-2 py-1 rounded text-sm">Inactive</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">Game: Stud</div>
                      <div className="text-sm text-gray-300">Players: 0/8</div>
                      <div className="text-sm text-gray-300">Blinds: ₹100/₹200</div>
                      <div className="text-sm text-gray-300">Dealer: Mike</div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Table Details (Read-Only)</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Table 1 - Texas Hold'em</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Status:</span>
                          <span className="text-green-300">Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Current Players:</span>
                          <span className="text-white">6</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Max Players:</span>
                          <span className="text-white">8</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Small Blind:</span>
                          <span className="text-white">₹25</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Big Blind:</span>
                          <span className="text-white">₹50</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Dealer:</span>
                          <span className="text-white">John</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Seat Occupancy</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {[1,2,3,4,5,6,7,8].map(seat => (
                          <div key={seat} className={`p-2 rounded text-center text-sm ${
                            seat <= 6 ? 'bg-green-500/20 text-green-300 border border-green-400/30' : 'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                          }`}>
                            Seat {seat}
                            {seat <= 6 && <div className="text-xs">Occupied</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Player Support */}
          {activeItem === "Player Support" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Support Dashboard</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Support Tickets</h3>
                    <div className="space-y-2">
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">Ticket #001</div>
                        <div className="text-sm text-gray-300">Player: John Smith</div>
                        <div className="text-sm text-gray-300">Issue: Login problems</div>
                        <div className="text-xs text-yellow-300">Status: Open</div>
                      </div>
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                        <div className="font-semibold text-white">Ticket #002</div>
                        <div className="text-sm text-gray-300">Player: Maria Garcia</div>
                        <div className="text-sm text-gray-300">Issue: Account verification</div>
                        <div className="text-xs text-green-300">Status: Resolved</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Create Support Ticket
                      </button>
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Reset Player Password
                      </button>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Send Notification
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Offers */}
          {activeItem === "Offers" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Offers & Promotions</h2>
                    <p className="text-gray-300 text-sm mt-1">
                      Create player-facing offers and coordinate instant notifications from the GRE desk.
                    </p>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-xs text-gray-300 space-y-1">
                    <div>Active Offers: {offers.filter(o => o.status === "Active").length}</div>
                    <div>Upcoming Offers: {offers.filter(o => o.status === "Upcoming").length}</div>
                    <div>Notifications ready: {offers.reduce((sum, o) => sum + (o.sentNotifications || 0), 0)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[37%,1fr] gap-6">
                  <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Offer</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Offer Title</label>
                        <input
                          type="text"
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          placeholder="Eg. Weekend Bonus Blast"
                          value={offerForm.title}
                          onChange={(e) => setOfferForm({...offerForm, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm">Description</label>
                        <textarea
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          rows="3"
                          placeholder="Highlight reward, eligibility, and redemption steps..."
                          value={offerForm.description}
                          onChange={(e) => setOfferForm({...offerForm, description: e.target.value})}
                        ></textarea>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-white text-sm">Audience</label>
                          <CustomSelect
                            className="w-full"
                            value={offerForm.audience}
                            onChange={(e) => setOfferForm({...offerForm, audience: e.target.value})}
                          >
                            <option>All Players</option>
                            <option>New Players</option>
                            <option>High Rollers</option>
                            <option>VIP Players</option>
                            <option>Waitlist</option>
                          </CustomSelect>
                        </div>
                        <div>
                          <label className="text-white text-sm">Reward Type</label>
                          <CustomSelect
                            className="w-full"
                            value={offerForm.rewardType}
                            onChange={(e) => setOfferForm({...offerForm, rewardType: e.target.value})}
                          >
                            <option>Bonus Chips</option>
                            <option>Loyalty Points</option>
                            <option>Free Entry</option>
                            <option>Food & Beverage Voucher</option>
                          </CustomSelect>
                        </div>
                        <div>
                          <label className="text-white text-sm">
                            {offerForm.rewardType.includes("Points") ? "Point Multiplier / Value" : "Reward Value (₹)"}
                          </label>
                          <input
                            type="text"
                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                            placeholder={offerForm.rewardType.includes("Points") ? "Eg. 2x" : "Eg. 2500"}
                            value={offerForm.rewardValue}
                            onChange={(e) => setOfferForm({...offerForm, rewardValue: e.target.value})}
                          />
                        </div>
                      </div>
                        <div>
                          <label className="text-white text-sm">Notification</label>
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              id="offer-notification"
                              type="checkbox"
                              checked={offerForm.notification}
                              onChange={(e) => setOfferForm({...offerForm, notification: e.target.checked})}
                              className="w-4 h-4 text-orange-500 bg-white/10 border border-white/20 rounded"
                            />
                            <label htmlFor="offer-notification" className="text-sm text-gray-300">
                              Queue push notification for this offer
                            </label>
                          </div>
                        </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-white text-sm">Start Date</label>
                          <input
                            type="date"
                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                            value={offerForm.startDate}
                            onChange={(e) => setOfferForm({...offerForm, startDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-white text-sm">End Date</label>
                          <input
                            type="date"
                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                            value={offerForm.endDate}
                            onChange={(e) => setOfferForm({...offerForm, endDate: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCreateOffer}
                          className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Create Offer
                        </button>
                        <button
                          onClick={resetOfferForm}
                          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-white">Offer Pipeline</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => alert("Offer notification blast sent to the selected audience.")}
                          className="bg-orange-500 hover:bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                        >
                          Send Offer Notification
                        </button>
                        <button
                          onClick={() => alert("Offer performance report exported (mock).")}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                        >
                          Export Offer Report
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
                      {offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 shadow-inner"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-white text-lg font-semibold">{offer.title}</h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    offer.status === "Active"
                                      ? "bg-green-500/30 text-green-200 border border-green-400/40"
                                      : offer.status === "Upcoming"
                                      ? "bg-yellow-500/30 text-yellow-200 border border-yellow-400/40"
                                      : "bg-gray-500/30 text-gray-300 border border-gray-400/40"
                                  }`}
                                >
                                  {offer.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 leading-relaxed">{offer.description}</p>
                              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                <div className="bg-white/5 px-2 py-1 rounded border border-white/10">
                                  Audience: <span className="text-gray-200 font-medium">{offer.audience}</span>
                                </div>
                                <div className="bg-white/5 px-2 py-1 rounded border border-white/10">
                                  Reward: <span className="text-gray-200 font-medium">{offer.reward}</span>
                                </div>
                                <div className="bg-white/5 px-2 py-1 rounded border border-white/10">
                                  Duration: <span className="text-gray-200 font-medium">{offer.startDate} - {offer.endDate}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 space-y-1 min-w-[140px]">
                              <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center">
                                <div className="uppercase tracking-wide text-[10px]">Notifications</div>
                                <div className="text-white font-semibold text-sm">{offer.sentNotifications}</div>
                              </div>
                              <button
                                onClick={() => alert(`Offer "${offer.title}" marked for follow-up (mock).`)}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg font-semibold"
                              >
                                Follow Up
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {offers.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                          No offers configured yet. Create your first offer using the form on the left.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
