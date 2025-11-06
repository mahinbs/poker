import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navigate = useNavigate();

  // State for session control
  const [selectedTable, setSelectedTable] = useState(null);
  const [sessionParams, setSessionParams] = useState({
    playWindow: 30,
    callWindow: 5,
    cashoutWindow: 10,
    sessionTimeout: 120
  });

  // Mock table data - in real app, this would come from API
  const tables = [
    { id: 1, name: "Table 1 - Texas Hold'em", status: "Active" },
    { id: 2, name: "Table 2 - Omaha", status: "Paused" },
    { id: 3, name: "Table 3 - Stud", status: "Ended" },
  ];

  const activeTables = tables.filter(table => table.status === "Active");

  // State for waitlist and seating management
  const [waitlist, setWaitlist] = useState([
    { 
      id: 1, 
      playerName: "Alex Johnson", 
      playerId: "P001",
      position: 1, 
      gameType: "Texas Hold'em",
      preferredSeat: 3,
      preferredTable: 1
    },
    { 
      id: 2, 
      playerName: "Maria Garcia", 
      playerId: "P002",
      position: 2, 
      gameType: "Omaha",
      preferredSeat: 5,
      preferredTable: 2
    },
    { 
      id: 3, 
      playerName: "David Wilson", 
      playerId: "P003",
      position: 3, 
      gameType: "Texas Hold'em",
      preferredSeat: null, // No preference
      preferredTable: 1
    }
  ]);

  // Track occupied seats by table (tableId -> array of occupied seat numbers)
  const [occupiedSeats, setOccupiedSeats] = useState({
    1: [1, 2, 4, 7], // Table 1 has seats 1, 2, 4, 7 occupied
    2: [2, 3, 6], // Table 2 has seats 2, 3, 6 occupied
    3: [] // Table 3 is empty
  });

  // State for seat assignment form
  const [seatAssignment, setSeatAssignment] = useState({
    playerId: "",
    playerName: "",
    tableId: "",
    seatNumber: ""
  });

  // State for push notifications
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
    // Filter by kycStatus (always 'pending' for this tab)
    if (player.kycStatus !== "pending") return false;
    
    // If a player is selected, show only that player
    if (selectedPlayer && player.id !== selectedPlayer.id) return false;
    
    // Otherwise, filter by search term
    if (!selectedPlayer && playersSearch) {
      const searchLower = playersSearch.toLowerCase();
      const matchesSearch = 
        player.name.toLowerCase().includes(searchLower) ||
        player.email.toLowerCase().includes(searchLower) ||
        player.id.toLowerCase().includes(searchLower) ||
        player.phone.includes(playersSearch);
      if (!matchesSearch) return false;
    }
    
    // Filter by document type
    if (playersFilter.documentType !== "all" && player.documentType !== playersFilter.documentType) {
      return false;
    }
    
    // Filter by registration date
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
      id: "P101",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone: "+91 9876543215",
      kycStatus: "approved",
      registrationDate: "2024-01-05",
      documentType: "PAN Card",
      verifiedDate: "2024-01-06",
      verificationNotes: "All documents verified",
      accountStatus: "Active",
      totalGames: 45,
      lastActive: "2 hours ago",
      kycDocUrl: "/documents/pan_alex_johnson.pdf"
    },
    {
      id: "P102",
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      phone: "+91 9876543216",
      kycStatus: "approved",
      registrationDate: "2024-01-08",
      documentType: "Aadhaar Card",
      verifiedDate: "2024-01-09",
      verificationNotes: "Documents verified successfully",
      accountStatus: "Active",
      totalGames: 123,
      lastActive: "5 minutes ago",
      kycDocUrl: "/documents/aadhaar_maria_garcia.pdf"
    },
    {
      id: "P103",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      phone: "+91 9876543217",
      kycStatus: "approved",
      registrationDate: "2024-01-10",
      documentType: "Passport",
      verifiedDate: "2024-01-11",
      verificationNotes: "Passport verified",
      accountStatus: "Suspended",
      totalGames: 67,
      lastActive: "3 days ago",
      kycDocUrl: "/documents/passport_rajesh_kumar.pdf"
    },
    {
      id: "P104",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 9876543218",
      kycStatus: "approved",
      registrationDate: "2024-01-12",
      documentType: "Driving License",
      verifiedDate: "2024-01-13",
      verificationNotes: "License verified",
      accountStatus: "Active",
      totalGames: 89,
      lastActive: "1 hour ago",
      kycDocUrl: "/documents/dl_priya_sharma.pdf"
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

  // Filter registered players (for display list)
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
    
    if (registeredPlayersFilter.status !== "all" && player.accountStatus !== registeredPlayersFilter.status) {
      return false;
    }
    
    if (registeredPlayersFilter.documentType !== "all" && player.documentType !== registeredPlayersFilter.documentType) {
      return false;
    }
    
    if (registeredPlayersFilter.registrationDate !== "all") {
      const registrationDate = new Date(player.registrationDate);
      const now = new Date();
      const daysDiff = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));
      if (registeredPlayersFilter.registrationDate === "today" && daysDiff !== 0) return false;
      if (registeredPlayersFilter.registrationDate === "week" && daysDiff > 7) return false;
      if (registeredPlayersFilter.registrationDate === "month" && daysDiff > 30) return false;
    }

    if (registeredPlayersFilter.verifiedDate !== "all") {
      const verifiedDate = new Date(player.verifiedDate);
      const now = new Date();
      const daysDiff = Math.floor((now - verifiedDate) / (1000 * 60 * 60 * 24));
      if (registeredPlayersFilter.verifiedDate === "today" && daysDiff !== 0) return false;
      if (registeredPlayersFilter.verifiedDate === "week" && daysDiff > 7) return false;
      if (registeredPlayersFilter.verifiedDate === "month" && daysDiff > 30) return false;
    }
    
    return true;
  });

  // Handle download KYC document
  const handleDownloadKYCDoc = (player) => {
    // In real app, this would fetch the actual file from server
    alert(`Downloading KYC document for ${player.name}\nDocument: ${player.kycDocUrl}\nDocument Type: ${player.documentType}`);
    // Simulate download
    console.log(`Downloading: ${player.kycDocUrl}`);
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    const csvContent = [
      ["Player ID", "Name", "Email", "Phone", "Status", "Registration Date", "Verified Date", "Document Type"],
      ...filteredRegisteredPlayers.map(p => [
        p.id,
        p.name,
        p.email,
        p.phone,
        p.accountStatus,
        p.registrationDate,
        p.verifiedDate,
        p.documentType
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registered_players_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get all players for search (combine registered and pending)
  const allPlayersForSearch = [...registeredPlayers, ...allPlayers.filter(p => !registeredPlayers.find(rp => rp.id === p.id))];

  // Player search for Cash-out Verification
  const [cashoutPlayerSearch, setCashoutPlayerSearch] = useState("");
  const [selectedCashoutPlayer, setSelectedCashoutPlayer] = useState(null);
  const [tableBalance, setTableBalance] = useState("");
  const filteredCashoutPlayers = cashoutPlayerSearch.length >= 3
    ? allPlayersForSearch.filter(player => {
        const searchLower = cashoutPlayerSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Validate image file
  const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      return "Image must be JPG, PNG, GIF, or WebP format";
    }
    if (file.size > maxSize) {
      return "Image size must be less than 5MB";
    }
    return null;
  };

  // Validate video URL
  const validateVideoUrl = (url) => {
    if (!url) return null; // Optional field
    
    const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|facebook\.com|instagram\.com)\/.+$/i;
    
    if (!videoUrlPattern.test(url)) {
      return "Please enter a valid video URL (YouTube, Vimeo, DailyMotion, Facebook, Instagram)";
    }
    return null;
  };

  // Handle image file selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateImageFile(file);
      if (error) {
        setNotificationErrors({...notificationErrors, image: error});
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setNotificationForm({
          ...notificationForm,
          imageFile: file,
          imagePreview: reader.result,
          imageUrl: "" // Clear URL if file is uploaded
        });
        setNotificationErrors({...notificationErrors, image: null});
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image URL input
  const handleImageUrlChange = (url) => {
    if (!url) {
      setNotificationForm({...notificationForm, imageUrl: "", imageFile: null, imagePreview: null});
      setNotificationErrors({...notificationErrors, image: null});
      return;
    }
    
    // Basic URL validation
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      setNotificationErrors({...notificationErrors, image: "Please enter a valid URL starting with http:// or https://"});
      return;
    }
    
    setNotificationForm({
      ...notificationForm,
      imageUrl: url,
      imageFile: null,
      imagePreview: null
    });
    setNotificationErrors({...notificationErrors, image: null});
  };

  // Handle video URL input
  const handleVideoUrlChange = (url) => {
    setNotificationForm({...notificationForm, videoUrl: url});
    const error = validateVideoUrl(url);
    setNotificationErrors({...notificationErrors, video: error});
  };

  // Handle send notification
  const handleSendNotification = () => {
    const errors = {};
    
    if (!notificationForm.title.trim()) {
      errors.title = "Title is required";
    }
    if (!notificationForm.message.trim()) {
      errors.message = "Message is required";
    }
    
    // Validate image (either file or URL, but not both)
    if (notificationForm.imageFile && notificationForm.imageUrl) {
      errors.image = "Please use either image upload OR image URL, not both";
    }
    
    // Validate video URL if provided
    if (notificationForm.videoUrl) {
      const videoError = validateVideoUrl(notificationForm.videoUrl);
      if (videoError) errors.video = videoError;
    }
    
    if (Object.keys(errors).length > 0) {
      setNotificationErrors(errors);
      return;
    }
    
    // Prepare payload
    const payload = {
      title: notificationForm.title,
      message: notificationForm.message,
      audience: notificationForm.audience,
      media: {}
    };
    
    // Add image to payload (URL from upload or direct URL)
    if (notificationForm.imageFile) {
      // In real app, upload file and get URL
      payload.media.imageUrl = "https://api.example.com/uploads/" + notificationForm.imageFile.name;
      payload.media.imageFile = notificationForm.imageFile; // For actual upload
    } else if (notificationForm.imageUrl) {
      payload.media.imageUrl = notificationForm.imageUrl;
    }
    
    // Add video URL to payload
    if (notificationForm.videoUrl) {
      payload.media.videoUrl = notificationForm.videoUrl;
    }
    
    console.log("Sending notification payload:", payload);
    alert(`Notification sent!\nPayload: ${JSON.stringify(payload, null, 2)}`);
    
    // Reset form
    setNotificationForm({
      title: "",
      message: "",
      audience: "All Players",
      imageFile: null,
      imageUrl: "",
      videoUrl: "",
      imagePreview: null
    });
    setNotificationErrors({});
  };

  // Check if a seat is available
  const isSeatAvailable = (tableId, seatNumber) => {
    const occupied = occupiedSeats[tableId] || [];
    return !occupied.includes(seatNumber);
  };

  // Handle preferred seat assignment
  const handleAssignPreferredSeat = (waitlistEntry) => {
    if (!waitlistEntry.preferredSeat || !waitlistEntry.preferredTable) {
      alert("Player has no preferred seat specified");
      return;
    }

    if (isSeatAvailable(waitlistEntry.preferredTable, waitlistEntry.preferredSeat)) {
      // Assign to preferred seat
      setOccupiedSeats(prev => ({
        ...prev,
        [waitlistEntry.preferredTable]: [...(prev[waitlistEntry.preferredTable] || []), waitlistEntry.preferredSeat]
      }));
      // Remove from waitlist
      setWaitlist(prev => prev.filter(item => item.id !== waitlistEntry.id));
      alert(`Assigned ${waitlistEntry.playerName} to Table ${waitlistEntry.preferredTable}, Seat ${waitlistEntry.preferredSeat}`);
    } else {
      alert(`Preferred seat ${waitlistEntry.preferredSeat} at Table ${waitlistEntry.preferredTable} is not available`);
    }
  };

  const menuItems = [
    "Dashboard",
    "Session Control",
    "Table Operations", 
    "Player Flow",
    "Seating Management",
    "Waitlist & Seating Overrides",
    "Real-Time Chat",
    "Players",
    "Registered Players",
    "KYC Review",
    "Push Notifications",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-yellow-500/20 via-green-600/30 to-emerald-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-300 to-teal-400 drop-shadow-lg mb-6">
            Manager Portal
          </div>
          <div className="flex items-center mb-6 text-white min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
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
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-yellow-400/20 hover:to-green-500/20 text-white"
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
          <header className="bg-gradient-to-r from-emerald-600 via-green-500 to-yellow-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Manager Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Monitor tables, players, and manage operations</p>
            </div>
            <div className="flex gap-3">
              {/* <button 
                onClick={() => navigate("/admin/signin")}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                Admin Portal
              </button>
              <button 
                onClick={() => navigate("/master-admin/signin")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                Master Admin
              </button>
              <button 
                onClick={() => navigate("/gre/signin")}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                GRE Portal
              </button>
              <button 
                onClick={() => navigate("/hr/signin")}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                HR Portal
              </button>
              <button 
                onClick={() => navigate("/cashier/signin")}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                Cashier Portal
              </button>
              <button 
                onClick={() => navigate("/fnb/signin")}
                className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                FNB Portal
              </button> */}
              <button className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow">
                Sign Out
              </button>
            </div>
          </header>

          {/* Dynamic Content Based on Active Item */}
          {activeItem === "Dashboard" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[
                  { title: "Active Tables", value: "3", color: "from-yellow-400 via-orange-500 to-red-500" },
                  { title: "Online Players", value: "8", color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "Pending KYC", value: "1", color: "from-pink-400 via-red-500 to-rose-600" },
                  // { title: "Daily Revenue", value: "₹0.00", color: "from-blue-400 via-indigo-500 to-violet-500" },
                ].map((card, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}
                  >
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Updated just now</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <section className="p-6 bg-gradient-to-r from-lime-400/30 via-green-500/20 to-emerald-700/20 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Create Player
                  </button>
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Refresh Data
                  </button>
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Review KYC
                  </button>
                </div>
              </section>

              {/* Recent KYC */}
              <section className="p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-lg border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Recent KYC Requests</h2>
                <div className="flex items-center justify-between bg-gradient-to-r from-yellow-500/20 to-green-500/20 p-4 rounded-xl shadow border border-yellow-400/30">
                  <div>
                    <div className="font-bold text-white">Test Player</div>
                    <div className="text-gray-300 text-sm">test@supabase.com</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-yellow-500/30 text-yellow-300 font-medium px-3 py-1 rounded-full text-sm border border-yellow-400/50">
                      Pending
                    </span>
                    <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                      Review
                    </button>
                  </div>
                </div>
              </section>

              {/* System Status */}
              <section className="p-6 bg-gradient-to-r from-green-700/30 via-lime-600/30 to-emerald-700/30 rounded-xl shadow-md border border-green-700/40">
                <h2 className="text-lg font-semibold text-white mb-4">System Status</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["Database Operational", "Player Portal Connected", "KYC System Active"].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white/5 p-4 rounded-lg text-center font-semibold text-white shadow-inner border border-white/10"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Session Control */}
          {activeItem === "Session Control" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-purple-500/20 to-indigo-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Table Session Control</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Table Sessions</h3>
                    <div className="space-y-2">
                      {tables.map((table) => (
                        <button
                          key={table.id}
                          onClick={() => setSelectedTable(table)}
                          className={`w-full flex justify-between items-center p-2 rounded transition-all ${
                            selectedTable?.id === table.id
                              ? "bg-blue-500/30 border-2 border-blue-400"
                              : table.status === "Active"
                              ? "bg-green-500/20 hover:bg-green-500/30"
                              : table.status === "Paused"
                              ? "bg-yellow-500/20 hover:bg-yellow-500/30"
                              : "bg-red-500/20 hover:bg-red-500/30"
                          }`}
                        >
                          <span className="text-white text-sm">{table.name}</span>
                          <span className={`text-sm ${
                            table.status === "Active" ? "text-green-300" :
                            table.status === "Paused" ? "text-yellow-300" :
                            "text-red-300"
                          }`}>
                            {table.status}
                          </span>
                        </button>
                      ))}
                      </div>
                    {selectedTable && (
                      <div className="mt-4 p-3 bg-blue-500/20 rounded border border-blue-400/30">
                        <div className="text-white text-sm font-semibold mb-1">Selected: {selectedTable.name}</div>
                        <div className={`text-xs ${
                          selectedTable.status === "Active" ? "text-green-300" : "text-gray-400"
                        }`}>
                          {selectedTable.status === "Active" 
                            ? "✓ Session parameters can be edited" 
                            : "⚠ Only active tables allow parameter editing"}
                      </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Session Controls</h3>
                    <div className="space-y-3">
                      <button 
                        className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold"
                        disabled={!selectedTable}
                      >
                        Start Session
                      </button>
                      <button 
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold"
                        disabled={!selectedTable}
                      >
                        Pause Session
                      </button>
                      <button 
                        className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
                        disabled={!selectedTable}
                      >
                        End Session
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3">Timing & Window Controls</h3>
                    {selectedTable && selectedTable.status === "Active" ? (
                    <div className="space-y-3">
                      <div>
                          <label className="text-white text-sm">Min Play Time (minutes)</label>
                          <input 
                            type="number" 
                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                            placeholder="30" 
                            value={sessionParams.playWindow}
                            onChange={(e) => setSessionParams({...sessionParams, playWindow: e.target.value})}
                          />
                        <div className="flex gap-2 mt-2">
                            <button 
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                              onClick={() => {/* Handle set */}}
                            >
                            Set
                          </button>
                            <button 
                              className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                              onClick={() => {/* Handle adjust */}}
                            >
                            Adjust
                          </button>
                        </div>
                      </div>
                      <div>
                          <label className="text-white text-sm">Call Time (minutes)</label>
                          <input 
                            type="number" 
                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                            placeholder="5" 
                            value={sessionParams.callWindow}
                            onChange={(e) => setSessionParams({...sessionParams, callWindow: e.target.value})}
                          />
                        <div className="flex gap-2 mt-2">
                            <button 
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                              onClick={() => {/* Handle set */}}
                            >
                            Set
                          </button>
                            <button 
                              className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                              onClick={() => {/* Handle adjust */}}
                            >
                            Adjust
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-white text-sm">Cash-out Window (minutes)</label>
                          <input 
                            type="number" 
                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                            placeholder="10" 
                            value={sessionParams.cashoutWindow}
                            onChange={(e) => setSessionParams({...sessionParams, cashoutWindow: e.target.value})}
                          />
                        <div className="flex gap-2 mt-2">
                            <button 
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                              onClick={() => {/* Handle set */}}
                            >
                            Set
                          </button>
                            <button 
                              className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                              onClick={() => {/* Handle adjust */}}
                            >
                            Adjust
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-white text-sm">Session Timeout (minutes)</label>
                          <input 
                            type="number" 
                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                            placeholder="120" 
                            value={sessionParams.sessionTimeout}
                            onChange={(e) => setSessionParams({...sessionParams, sessionTimeout: e.target.value})}
                          />
                        <div className="flex gap-2 mt-2">
                            <button 
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                              onClick={() => {/* Handle set */}}
                            >
                            Set
                          </button>
                            <button 
                              className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                              onClick={() => {/* Handle adjust */}}
                            >
                            Adjust
                          </button>
                        </div>
                      </div>
                    </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-sm mb-2">
                          {!selectedTable 
                            ? "Please select a table to edit session parameters"
                            : "Session parameters can only be edited for active tables"}
                        </div>
                        {!selectedTable && (
                          <div className="text-gray-500 text-xs mt-2">
                            Click on an active table from the list to enable editing
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Table Operations */}
          {activeItem === "Table Operations" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Table Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Table</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Table Name</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Table 1" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Game Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Texas Hold'em</option>
                          <option>Omaha</option>
                          <option>Seven Card Stud</option>
                          <option>Razz</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Max Players</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="8" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Blind Levels</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹25/₹50" />
                      </div>
                      <div className="border-t border-white/20 pt-3 mt-3">
                        <h4 className="text-white text-sm font-semibold mb-2">Session Parameters</h4>
                        <div className="space-y-2">
                          <div>
                            <label className="text-white text-xs">Min Play Time (minutes)</label>
                            <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="30" />
                          </div>
                          <div>
                            <label className="text-white text-xs">Call Time (minutes)</label>
                            <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="5" />
                          </div>
                          <div>
                            <label className="text-white text-xs">Cash-out Window (minutes)</label>
                            <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="10" />
                          </div>
                          <div>
                            <label className="text-white text-xs">Session Timeout (minutes)</label>
                            <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="120" />
                          </div>
                        </div>
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold mt-4">
                        Create Table
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Table Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Edit Table Settings
                      </button>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Activate/Deactivate Table
                      </button>
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Delete Table
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Dealer Assignment</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Select Table</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1 - Texas Hold'em</option>
                          <option>Table 2 - Omaha</option>
                          <option>Table 3 - Stud</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Assign Dealer</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Dealer 1 - John</option>
                          <option>Dealer 2 - Sarah</option>
                          <option>Dealer 3 - Mike</option>
                        </select>
                      </div>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Assign Dealer
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Rake Entry Form</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm">Table ID</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Table 1" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Session Date</label>
                      <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Chip Denomination</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹25, ₹50, ₹100, ₹500" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Total Rake Amount</label>
                      <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-white text-sm">Notes</label>
                      <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="3" placeholder="Additional notes about the session..."></textarea>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold">
                      Submit Rake Entry
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold">
                      Save Draft
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Player Flow */}
          {activeItem === "Player Flow" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Cash-out Approval</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Pending Cash-outs</h3>
                    <div className="space-y-3">
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">Player: John Doe</div>
                            <div className="text-sm text-gray-300">Table 1 - Seat 3</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                              Approve
                            </button>
                            <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">Player: Jane Smith</div>
                            <div className="text-sm text-gray-300">Table 2 - Seat 7</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                              Approve
                            </button>
                            <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Cash-out Verification</h3>
                    <div className="space-y-3">
                      <div className="relative">
                        <label className="text-white text-sm">Search Player (Type at least 3 characters)</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Search by name, ID, or email..." 
                          value={cashoutPlayerSearch}
                          onChange={(e) => {
                            setCashoutPlayerSearch(e.target.value);
                            setSelectedCashoutPlayer(null);
                          }}
                        />
                        {cashoutPlayerSearch.length >= 3 && filteredCashoutPlayers.length > 0 && !selectedCashoutPlayer && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredCashoutPlayers.map(player => (
                              <div
                                key={player.id}
                                onClick={() => {
                                  setSelectedCashoutPlayer(player);
                                  setCashoutPlayerSearch(`${player.name} (${player.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{player.name}</div>
                                <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedCashoutPlayer && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                            <span className="text-green-300">Selected: {selectedCashoutPlayer.name} ({selectedCashoutPlayer.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedCashoutPlayer(null);
                                setCashoutPlayerSearch("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-white text-sm">Table Balance</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Enter table balance" 
                          value={tableBalance}
                          onChange={(e) => setTableBalance(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => {
                          if (!selectedCashoutPlayer) {
                            alert("Please select a player first");
                            return;
                          }
                          if (!tableBalance || parseFloat(tableBalance) <= 0) {
                            alert("Please enter a valid table balance");
                            return;
                          }
                          const formattedBalance = `₹${parseFloat(tableBalance).toLocaleString('en-IN')}`;
                          alert(`Notification sent to Cashier:\n\n${selectedCashoutPlayer.name} has left the table with a table balance of ${formattedBalance}`);
                          
                          // Reset form
                          setSelectedCashoutPlayer(null);
                          setCashoutPlayerSearch("");
                          setTableBalance("");
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Verify & Update Balance
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Real-Time Chat */}
          {activeItem === "Real-Time Chat" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Real-Time Chat</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="h-64 overflow-y-auto space-y-2 mb-4">
                    {["Welcome to support chat.", "Player #P001: Need assistance at Table 2.", "Cashier: On the way!"]
                      .map((m, i) => (
                        <div key={i} className="bg-white/5 p-2 rounded text-white/90 text-sm">{m}</div>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Type a message..." />
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">Send</button>
                  </div>
                </div>
              </section>
            </div>
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
                      <select 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        value={playersFilter.registrationDate}
                        onChange={(e) => setPlayersFilter({...playersFilter, registrationDate: e.target.value})}
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Document Type</label>
                      <select 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        value={playersFilter.documentType}
                        onChange={(e) => setPlayersFilter({...playersFilter, documentType: e.target.value})}
                      >
                        <option value="all">All Documents</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                      </select>
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
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300">
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
                
                {/* Search and Filters */}
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
                      <select 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        value={registeredPlayersFilter.status}
                        onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, status: e.target.value})}
                      >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Registration Date</label>
                      <select 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        value={registeredPlayersFilter.registrationDate}
                        onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, registrationDate: e.target.value})}
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Document Type</label>
                      <select 
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        value={registeredPlayersFilter.documentType}
                        onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, documentType: e.target.value})}
                      >
                        <option value="all">All Documents</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-white text-sm">
                      Showing <span className="font-semibold">{filteredRegisteredPlayers.length}</span> of <span className="font-semibold">{registeredPlayers.length}</span> verified players
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setRegisteredPlayersSearch("");
                          setSelectedRegisteredPlayer(null);
                          setRegisteredPlayersFilter({status: "all", registrationDate: "all", documentType: "all", verifiedDate: "all"});
                        }}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                      >
                        Clear Filters
                      </button>
                      <button 
                        onClick={handleExportCSV}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Players List */}
                <div className="bg-white/10 p-4 rounded-lg">
                  {filteredRegisteredPlayers.length > 0 ? (
                    <div className="space-y-3">
                      {filteredRegisteredPlayers.map(player => (
                        <div key={player.id} className="bg-white/5 p-4 rounded-lg border border-green-400/30">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                            {/* Player Info */}
                            <div className="md:col-span-8 space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="font-semibold text-white text-lg">{player.name}</div>
                                <span className={`px-3 py-1 rounded-full text-xs border font-medium ${
                                  player.accountStatus === "Active" 
                                    ? "bg-green-500/30 text-green-300 border-green-400/50"
                                    : player.accountStatus === "Suspended"
                                    ? "bg-red-500/30 text-red-300 border-red-400/50"
                                    : "bg-gray-500/30 text-gray-300 border-gray-400/50"
                                }`}>
                                  {player.accountStatus}
                                </span>
                                <span className="bg-blue-500/30 text-blue-300 font-medium px-3 py-1 rounded-full text-xs border border-blue-400/50">
                                  ✓ Verified
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
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
                                  <span className="text-gray-400">Doc:</span> <span className="text-white">{player.documentType}</span>
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
                      <div className="text-gray-500 text-sm">
                        {registeredPlayersSearch || registeredPlayersFilter.status !== "all" || registeredPlayersFilter.registrationDate !== "all" || registeredPlayersFilter.documentType !== "all"
                          ? "Try adjusting your search or filters"
                          : "No registered players found"}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Player Details Modal */}
              {selectedPlayerDetails && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl border border-purple-500/30 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-white/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">Player Details</h2>
                          <p className="text-gray-400 text-sm">Complete information for {selectedPlayerDetails.name}</p>
                        </div>
                        <button
                          onClick={() => setSelectedPlayerDetails(null)}
                          className="text-white/70 hover:text-white text-2xl font-bold"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">Player ID</label>
                            <div className="text-white font-medium">{selectedPlayerDetails.id}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Full Name</label>
                            <div className="text-white font-medium">{selectedPlayerDetails.name}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Email</label>
                            <div className="text-white font-medium">{selectedPlayerDetails.email}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Phone</label>
                            <div className="text-white font-medium">{selectedPlayerDetails.phone}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Account Status</label>
                            <div>
                              <span className={`px-3 py-1 rounded-full text-xs border font-medium ${
                                selectedPlayerDetails.accountStatus === "Active" 
                                  ? "bg-green-500/30 text-green-300 border-green-400/50"
                                  : "bg-red-500/30 text-red-300 border-red-400/50"
                              }`}>
                                {selectedPlayerDetails.accountStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* KYC Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">KYC Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">KYC Status</label>
                            <div>
                              <span className="bg-green-500/30 text-green-300 font-medium px-3 py-1 rounded-full text-xs border border-green-400/50">
                                ✓ Approved
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Document Type</label>
                            <div className="text-white font-medium">{selectedPlayerDetails.documentType}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Registration Date</label>
                            <div className="text-white font-medium">{new Date(selectedPlayerDetails.registrationDate).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Verified Date</label>
                            <div className="text-white font-medium">{new Date(selectedPlayerDetails.verifiedDate).toLocaleDateString()}</div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-gray-400 text-sm">Verification Notes</label>
                            <div className="text-white font-medium bg-white/5 p-3 rounded">{selectedPlayerDetails.verificationNotes}</div>
                          </div>
                        </div>
                      </div>

                      {/* Activity Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Activity Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">Total Games</label>
                            <div className="text-white font-medium text-xl">{selectedPlayerDetails.totalGames}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Last Active</label>
                            <div className="text-white font-medium">{selectedPlayerDetails.lastActive}</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button
                          onClick={() => handleDownloadKYCDoc(selectedPlayerDetails)}
                          className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold"
                        >
                          📥 Download KYC Document
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPlayerDetails(null);
                            handleExportCSV();
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg font-semibold"
                        >
                          Export Player Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KYC Review */}
          {activeItem === "KYC Review" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-orange-700/30 rounded-xl shadow-md border border-amber-800/40">
                <h2 className="text-xl font-bold text-white mb-6">KYC Review</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="space-y-2">
                    {[{name:'Test Player', id:'P010', status:'Pending'}, {name:'Anil Kumar', id:'P011', status:'Pending'}].map(k => (
                      <div key={k.id} className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="text-white font-semibold">{k.name} <span className="text-white/60 text-sm">({k.id})</span></div>
                          <span className="bg-yellow-500/30 text-yellow-300 font-medium px-3 py-1 rounded-full text-sm border border-yellow-400/50">{k.status}</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">Approve</button>
                          <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">Reject</button>
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">View Docs</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Push Notifications */}
          {activeItem === "Push Notifications" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-teal-600/30 via-cyan-500/20 to-blue-700/30 rounded-xl shadow-md border border-teal-800/40">
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
                        <select 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          value={notificationForm.audience}
                          onChange={(e) => setNotificationForm({...notificationForm, audience: e.target.value})}
                        >
                          <option>All Players</option>
                          <option>Tables in Play</option>
                          <option>Waitlist</option>
                          <option>VIP</option>
                        </select>
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
                                id="image-upload"
                                onChange={handleImageUpload}
                              />
                              <label htmlFor="image-upload" className="cursor-pointer">
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
                        className="w-full bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold mt-4"
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

          {/* Seating Management */}
          {activeItem === "Seating Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Waitlist Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Waitlist</h3>
                    <div className="space-y-2">
                      {waitlist.map((entry) => {
                        const preferredSeatAvailable = entry.preferredSeat 
                          ? isSeatAvailable(entry.preferredTable, entry.preferredSeat)
                          : false;
                        
                        return (
                          <div key={entry.id} className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                            <div className="grid gap-5 sm:grid-cols-[60%,1fr] items-start">
                              <div className="flex-1">
                                <div className="font-semibold text-white">Player: {entry.playerName}</div>
                                <div className="text-sm text-gray-300">Position: {entry.position} | Game: {entry.gameType}</div>
                                {entry.preferredSeat ? (
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs text-yellow-300 font-medium">
                                      Preferred: Table {entry.preferredTable}, Seat {entry.preferredSeat}
                                    </span>
                                    {preferredSeatAvailable ? (
                                      <span className="text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full border border-green-400/50">
                                        ✓ Available
                                      </span>
                                    ) : (
                                      <span className="text-xs bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full border border-red-400/50">
                                        ✗ Occupied
                                      </span>
                                    )}
                          </div>
                                ) : (
                                  <div className="mt-1 text-xs text-gray-400">No preferred seat</div>
                                )}
                          </div>
                              <div className="flex flex-col gap-2 ml-3">
                                {entry.preferredSeat && preferredSeatAvailable && (
                                  <button 
                                    onClick={() => handleAssignPreferredSeat(entry)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
                                    title={`Assign to preferred seat ${entry.preferredSeat} at Table ${entry.preferredTable}`}
                                  >
                                    Assign Preferred
                                  </button>
                                )}
                                <button 
                                  className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-sm"
                                  onClick={() => {
                                    setSeatAssignment({
                                      ...seatAssignment,
                                      playerId: entry.id,
                                      playerName: entry.playerName
                                    });
                                  }}
                                >
                              Seat
                            </button>
                                <button 
                                  onClick={() => setWaitlist(prev => prev.filter(item => item.id !== entry.id))}
                                  className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-sm"
                                >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                        );
                      })}
                      {waitlist.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          No players in waitlist
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Seat Assignment</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Select Player</label>
                        <select 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          value={seatAssignment.playerId}
                          onChange={(e) => {
                            const selectedEntry = waitlist.find(w => w.id === parseInt(e.target.value));
                            setSeatAssignment({
                              ...seatAssignment,
                              playerId: e.target.value,
                              playerName: selectedEntry?.playerName || "",
                              tableId: selectedEntry?.preferredTable?.toString() || ""
                            });
                          }}
                        >
                          <option value="">-- Select Player --</option>
                          {waitlist.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              {entry.playerName} (Position {entry.position})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Select Table</label>
                        <select 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          value={seatAssignment.tableId}
                          onChange={(e) => setSeatAssignment({...seatAssignment, tableId: e.target.value, seatNumber: ""})}
                        >
                          <option value="">-- Select Table --</option>
                          {tables.map((table) => (
                            <option key={table.id} value={table.id}>
                              {table.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Seat Number</label>
                        <select 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          value={seatAssignment.seatNumber}
                          onChange={(e) => setSeatAssignment({...seatAssignment, seatNumber: e.target.value})}
                          disabled={!seatAssignment.tableId}
                        >
                          <option value="">-- Select Seat --</option>
                          {seatAssignment.tableId && Array.from({length: 8}, (_, i) => i + 1).map((seatNum) => {
                            const available = isSeatAvailable(parseInt(seatAssignment.tableId), seatNum);
                            const selectedEntry = waitlist.find(w => w.id === parseInt(seatAssignment.playerId));
                            const isPreferred = selectedEntry?.preferredSeat === seatNum && 
                                                selectedEntry?.preferredTable === parseInt(seatAssignment.tableId);
                            
                            return (
                              <option key={seatNum} value={seatNum}>
                                Seat {seatNum} {!available ? "(Occupied)" : ""} {isPreferred ? "(Preferred)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      {seatAssignment.playerId && seatAssignment.tableId && seatAssignment.seatNumber && (
                        <div className="p-2 bg-blue-500/20 rounded border border-blue-400/30">
                          <div className="text-xs text-blue-300">
                            {(() => {
                              const selectedEntry = waitlist.find(w => w.id === parseInt(seatAssignment.playerId));
                              const isPreferred = selectedEntry?.preferredSeat === parseInt(seatAssignment.seatNumber) && 
                                                  selectedEntry?.preferredTable === parseInt(seatAssignment.tableId);
                              return isPreferred ? "✓ This is the player's preferred seat" : "";
                            })()}
                          </div>
                        </div>
                      )}
                      <button 
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
                        disabled={!seatAssignment.playerId || !seatAssignment.tableId || !seatAssignment.seatNumber}
                        onClick={() => {
                          const tableId = parseInt(seatAssignment.tableId);
                          const seatNum = parseInt(seatAssignment.seatNumber);
                          
                          if (!isSeatAvailable(tableId, seatNum)) {
                            alert(`Seat ${seatNum} at Table ${tableId} is not available`);
                            return;
                          }
                          
                          // Assign seat
                          setOccupiedSeats(prev => ({
                            ...prev,
                            [tableId]: [...(prev[tableId] || []), seatNum]
                          }));
                          
                          // Remove from waitlist
                          setWaitlist(prev => prev.filter(item => item.id !== parseInt(seatAssignment.playerId)));
                          
                          alert(`Assigned ${seatAssignment.playerName} to Table ${tableId}, Seat ${seatNum}`);
                          
                          // Reset form
                          setSeatAssignment({
                            playerId: "",
                            tableId: "",
                            seatNumber: ""
                          });
                        }}
                      >
                        Assign Seat
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-blue-500/20 to-cyan-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Call & Reorder</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Call Players</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Call Next Player
                      </button>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Call All Players
                      </button>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Send SMS Notification
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Reorder Waitlist</h3>
                    <div className="space-y-2">
                      {waitlist.map((entry, index) => (
                        <div key={entry.id} className="bg-white/5 p-2 rounded flex justify-between items-center">
                          <span className="text-white">
                            {entry.position}. {entry.playerName}
                            {entry.preferredSeat && (
                              <span className="text-xs text-yellow-300 ml-2">
                                (Pref: T{entry.preferredTable}-S{entry.preferredSeat})
                              </span>
                            )}
                          </span>
                        <div className="flex gap-1">
                            <button 
                              className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
                              disabled={index === 0}
                              onClick={() => {
                                if (index > 0) {
                                  const newWaitlist = [...waitlist];
                                  [newWaitlist[index], newWaitlist[index - 1]] = [newWaitlist[index - 1], newWaitlist[index]];
                                  newWaitlist[index].position = index + 1;
                                  newWaitlist[index - 1].position = index;
                                  setWaitlist(newWaitlist);
                                }
                              }}
                            >
                              ↑
                            </button>
                            <button 
                              className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
                              disabled={index === waitlist.length - 1}
                              onClick={() => {
                                if (index < waitlist.length - 1) {
                                  const newWaitlist = [...waitlist];
                                  [newWaitlist[index], newWaitlist[index + 1]] = [newWaitlist[index + 1], newWaitlist[index]];
                                  newWaitlist[index].position = index + 1;
                                  newWaitlist[index + 1].position = index + 2;
                                  setWaitlist(newWaitlist);
                                }
                              }}
                            >
                              ↓
                            </button>
                        </div>
                      </div>
                      ))}
                      {waitlist.length === 0 && (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No players to reorder
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Waitlist & Seating Overrides */}
          {activeItem === "Waitlist & Seating Overrides" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Waitlist & Seating Overrides</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Move Between Tables/Sessions</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Select Player</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option value="">-- Select Player --</option>
                          {waitlist.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              {entry.playerName} - Position {entry.position} ({entry.gameType})
                            </option>
                          ))}
                          {/* Also show players currently seated */}
                          <option value="seated-1">John Doe - Table 1, Seat 3</option>
                          <option value="seated-2">Jane Smith - Table 2, Seat 5</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-white text-sm">From Table</label>
                          <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                            <option value="">-- Select Table --</option>
                            {tables.map((table) => (
                              <option key={table.id} value={table.id}>{table.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-white text-sm">From Seat (Optional)</label>
                          <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                            <option value="">Any Seat</option>
                            {[1,2,3,4,5,6,7,8].map(seat => (
                              <option key={seat} value={seat}>Seat {seat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-white text-sm">To Table</label>
                          <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                            <option value="">-- Select Table --</option>
                            {tables.map((table) => (
                              <option key={table.id} value={table.id}>{table.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-white text-sm">To Seat (Optional)</label>
                          <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                            <option value="">Any Available Seat</option>
                            {[1,2,3,4,5,6,7,8].map(seat => (
                              <option key={seat} value={seat}>Seat {seat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Move Player
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Force Seat Assignment (Override)</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Select Player</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option value="">-- Select Player --</option>
                          {waitlist.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              {entry.playerName} - Position {entry.position}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-white text-sm">Table</label>
                          <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                            <option value="">-- Select Table --</option>
                            {tables.map((table) => (
                              <option key={table.id} value={table.id}>{table.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-white text-sm">Seat Number</label>
                          <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                            <option value="">-- Select Seat --</option>
                            {[1,2,3,4,5,6,7,8].map(seat => (
                              <option key={seat} value={seat}>Seat {seat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="bg-yellow-500/20 border border-yellow-400/30 p-2 rounded text-xs text-yellow-300">
                        ⚠️ Force assignment will override seat availability and move existing player if needed
                      </div>
                      <button className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Force Assign Seat (Override)
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Override Waitlist Priority</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm">Select Player from Waitlist</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option value="">-- Select Player --</option>
                          {waitlist.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              Position {entry.position}: {entry.playerName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">New Priority Position</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder={`Enter position (1-${waitlist.length || 1})`}
                          min="1"
                          max={waitlist.length || 1}
                        />
                      </div>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Update Priority
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Waitlist Actions</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-white text-sm">Select Player to Remove</label>
                        <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option value="">-- Select Player --</option>
                          {waitlist.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              {entry.playerName} - Position {entry.position}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Remove from Waitlist
                      </button>
                      <div className="border-t border-white/20 pt-3 mt-3">
                        <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold mb-2">
                          Call Next Player
                        </button>
                        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                          Call All Waitlisted Players
                        </button>
                      </div>
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

