import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navigate = useNavigate();

  const menuItems = [
    "Dashboard",
    "Players",
    "Registered Players",
    "Credit Management",
    "Staff Bonuses Approval",
    "Core Management", 
    "Player Registration",
    "Session Control",
    "Seating Management",
    "Waitlist & Seating Overrides",
    "VIP Store",
    "Reports & Analytics",
    "Push Notifications",
    "Player Support",
    "System Settings",
    "FNB Portal"
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
      verificationNotes: "",
      referredBy: "Agent X",
      referralCode: "AGTX-ALPHA"
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
      verificationNotes: "",
      referredBy: "Agent X",
      referralCode: "AGTX-BETA"
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
      verificationNotes: "",
      referredBy: "Agent Y",
      referralCode: "AGTY-GAMMA"
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
      verificationNotes: "",
      referredBy: "Agent A",
      referralCode: "AGTA-DELTA"
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
      verificationNotes: "",
      referredBy: "Agent B",
      referralCode: "AGTB-EPSILON"
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

  // Helper function to get date/time strings
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      full: now.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
  };

  const getPreviousDayDateTime = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      date: yesterday.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: yesterday.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      full: yesterday.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
  };

  // Revenue and Rake data with date/time
  const currentDateTime = getCurrentDateTime();
  const previousDateTime = getPreviousDayDateTime();
  
  const TIP_HOLD_PERCENT = 0.15;

  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  const calculateTipShares = (amount) => ({
    club: Math.round(amount * TIP_HOLD_PERCENT),
    staff: Math.round(amount * (1 - TIP_HOLD_PERCENT))
  });

  const revenueData = {
    previousDay: {
      revenue: 125000,
      rake: 12500,
      tips: 3750,
      date: previousDateTime.date,
      time: previousDateTime.time,
      lastUpdated: previousDateTime.full
    },
    currentDay: {
      revenue: 45230,
      rake: 4523,
      tips: 1357,
      date: currentDateTime.date,
      time: currentDateTime.time,
      lastUpdated: currentDateTime.full
    }
  };

  const previousDayTipShares = calculateTipShares(revenueData.previousDay.tips);
  const currentDayTipShares = calculateTipShares(revenueData.currentDay.tips);

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

  // State for Push Notifications
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

  // Validate image file
  const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) return "Image must be JPG, PNG, GIF, or WebP format";
    if (file.size > maxSize) return "Image size must be less than 5MB";
    return null;
  };

  // Validate video URL
  const validateVideoUrl = (url) => {
    if (!url) return null;
    const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|facebook\.com|instagram\.com)\/.+$/i;
    return videoUrlPattern.test(url) ? null : "Please enter a valid video URL (YouTube, Vimeo, DailyMotion, Facebook, Instagram)";
  };

  // Handle image file selection
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) { 
      setNotificationErrors(prev => ({...prev, image: error})); 
      return; 
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNotificationForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result,
        imageUrl: ""
      }));
      setNotificationErrors(prev => ({...prev, image: null}));
    };
    reader.readAsDataURL(file);
  };

  // Handle image URL input
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
    setNotificationForm(prev => ({
      ...prev,
      imageUrl: url,
      imageFile: null,
      imagePreview: null
    }));
    setNotificationErrors(prev => ({...prev, image: null}));
  };

  // Handle video URL input
  const handleVideoUrlChange = (url) => {
    setNotificationForm(prev => ({...prev, videoUrl: url}));
    setNotificationErrors(prev => ({...prev, video: validateVideoUrl(url)}));
  };

  // Handle send notification
  const handleSendNotification = () => {
    const errors = {};
    if (!notificationForm.title.trim()) errors.title = "Title is required";
    if (!notificationForm.message.trim()) errors.message = "Message is required";
    if (notificationForm.imageFile && notificationForm.imageUrl) errors.image = "Use either image upload OR image URL, not both";
    if (notificationForm.videoUrl) {
      const v = validateVideoUrl(notificationForm.videoUrl);
      if (v) errors.video = v;
    }
    if (Object.keys(errors).length) { 
      setNotificationErrors(errors); 
      return; 
    }

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
      kycDocUrl: "/documents/pan_alex_johnson.pdf",
      referredBy: "Agent X",
      referralCode: "AGTX-ALPHA"
    },
    {
      id: "P102", name: "Maria Garcia", email: "maria.garcia@example.com", phone: "+91 9876543216",
      kycStatus: "approved", registrationDate: "2024-01-08", documentType: "Aadhaar Card",
      verifiedDate: "2024-01-09", verificationNotes: "Documents verified successfully",
      accountStatus: "Active", totalGames: 123, lastActive: "5 minutes ago",
      kycDocUrl: "/documents/aadhaar_maria_garcia.pdf",
      referredBy: "Agent X",
      referralCode: "AGTX-BETA"
    },
    {
      id: "P103", name: "Rajesh Kumar", email: "rajesh.kumar@example.com", phone: "+91 9876543217",
      kycStatus: "approved", registrationDate: "2024-01-10", documentType: "Passport",
      verifiedDate: "2024-01-11", verificationNotes: "Passport verified",
      accountStatus: "Suspended", totalGames: 67, lastActive: "3 days ago",
      kycDocUrl: "/documents/passport_rajesh_kumar.pdf",
      referredBy: "Agent Y",
      referralCode: "AGTY-GAMMA"
    }
  ]);

  const [referralAgentSearch, setReferralAgentSearch] = useState("");
  const [referralCodeSearch, setReferralCodeSearch] = useState("");
  const [selectedReferralAgent, setSelectedReferralAgent] = useState(null);
  const [selectedReferralCode, setSelectedReferralCode] = useState(null);

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

  const allReferredPlayers = registeredPlayers.filter(player => player.referredBy || player.referralCode);
  const uniqueReferrers = Array.from(new Set(allReferredPlayers.map(player => player.referredBy).filter(Boolean)));
  const uniqueReferralCodes = Array.from(new Set(allReferredPlayers.map(player => player.referralCode).filter(Boolean)));

  const filteredReferrersForSearch = referralAgentSearch.length >= 2 && !selectedReferralAgent
    ? uniqueReferrers.filter(agent => (agent || "").toLowerCase().includes(referralAgentSearch.toLowerCase()))
    : [];

  const filteredReferralCodesForSearch = referralCodeSearch.length >= 2 && !selectedReferralCode
    ? uniqueReferralCodes.filter(code => (code || "").toLowerCase().includes(referralCodeSearch.toLowerCase()))
    : [];

  const filteredReferralPlayers = allReferredPlayers.filter(player => {
    const playerAgent = (player.referredBy || "").toLowerCase();
    const playerCode = (player.referralCode || "").toLowerCase();

    const agentMatch = selectedReferralAgent
      ? playerAgent === selectedReferralAgent.toLowerCase()
      : referralAgentSearch
        ? playerAgent.includes(referralAgentSearch.toLowerCase())
        : true;

    const codeMatch = selectedReferralCode
      ? playerCode === selectedReferralCode.toLowerCase()
      : referralCodeSearch
        ? playerCode.includes(referralCodeSearch.toLowerCase())
        : true;

    return agentMatch && codeMatch;
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
    navigate('/admin/signin');
  };

  // Reports & Analytics State
  const [selectedReportType, setSelectedReportType] = useState("");
  const [reportDateRange, setReportDateRange] = useState({ start: "", end: "" });
  const [selectedPlayerForReport, setSelectedPlayerForReport] = useState(null);
  const [selectedTableForReport, setSelectedTableForReport] = useState("");
  const [customReportSelection, setCustomReportSelection] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [savedReports, setSavedReports] = useState([
    { id: 1, name: "Daily Revenue - Jan 2024", type: "daily_transactions", dateRange: "2024-01-01 to 2024-01-31", created: "2024-01-15" },
    { id: 2, name: "Player Report - Alex Johnson", type: "individual_player", player: "P101", created: "2024-01-20" }
  ]);

  // Available report types
  const reportTypes = [
    { id: "individual_player", name: "Individual Player Report", icon: "👤" },
    { id: "cumulative_player", name: "Cumulative Player Report", icon: "📊" },
    { id: "daily_transactions", name: "Daily Transactions Report", icon: "💰" },
    { id: "daily_rake", name: "Daily Rake Report", icon: "🎰" },
    { id: "per_table_transactions", name: "Per Table Transactions Report", icon: "🃏" },
    { id: "credit_transactions", name: "Credit Transactions Report", icon: "💳" },
    { id: "expenses", name: "Expenses Report", icon: "📉" },
    { id: "bonus", name: "Bonus Report", icon: "🎁" },
    { id: "custom", name: "Custom Report", icon: "🔧" }
  ];

  // Handle export CSV for reports
  const handleExportReportCSV = (reportType, data) => {
    const csvContent = [
      ["Report Type", "Date Range", "Generated Date"],
      [reportType, `${reportDateRange.start} to ${reportDateRange.end}`, new Date().toLocaleString('en-IN')],
      [],
      ...(data || []).map(row => Array.isArray(row) ? row : Object.values(row))
    ].map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle export PDF for reports (mock implementation)
  const handleExportReportPDF = (reportType) => {
    alert(`PDF Export for ${reportType} would be generated here.\n\nIn production, this would use a PDF library like jsPDF or pdfmake to generate the report.`);
  };

  // Generate report data (mock)
  const generateReport = () => {
    if (!selectedReportType) {
      alert("Please select a report type");
      return;
    }
    if (!reportDateRange.start || !reportDateRange.end) {
      alert("Please select date range");
      return;
    }

    // Mock data generation based on report type
    let mockData = [];
    switch(selectedReportType) {
      case "individual_player":
        if (!selectedPlayerForReport) {
          alert("Please select a player for individual report");
          return;
        }
        mockData = [
          ["Player ID", "Name", "Total Games", "Total Revenue", "Total Rake", "Win/Loss"],
          [selectedPlayerForReport.id, selectedPlayerForReport.name, "45", "₹12,500", "₹1,250", "₹-5,000"]
        ];
        break;
      case "cumulative_player":
        mockData = [
          ["Player ID", "Name", "Total Games", "Total Revenue", "Average Session", "Total Rake"],
          ["P101", "Alex Johnson", "125", "₹45,000", "₹360", "₹4,500"],
          ["P102", "Maria Garcia", "89", "₹32,500", "₹365", "₹3,250"]
        ];
        break;
      case "daily_transactions":
        mockData = [
          ["Date", "Total Transactions", "Revenue", "Deposits", "Withdrawals"],
          ["2024-01-20", "45", "₹12,450", "₹25,000", "₹10,000"],
          ["2024-01-19", "38", "₹11,200", "₹22,500", "₹8,500"]
        ];
        break;
      case "daily_rake":
        mockData = [
          ["Date", "Total Rake", "Tables", "Average Rake per Table", "Top Table"],
          ["2024-01-20", "₹1,245", "8", "₹155.63", "Table 1"],
          ["2024-01-19", "₹1,120", "8", "₹140.00", "Table 2"]
        ];
        break;
      case "per_table_transactions":
        mockData = [
          ["Table", "Date", "Transactions", "Revenue", "Rake", "Players"],
          ["Table 1", "2024-01-20", "12", "₹5,200", "₹520", "8"],
          ["Table 2", "2024-01-20", "10", "₹4,100", "₹410", "6"]
        ];
        break;
      case "credit_transactions":
        mockData = [
          ["Date", "Player", "Type", "Amount", "Balance Before", "Balance After"],
          ["2024-01-20", "P101", "Credit Granted", "₹50,000", "₹0", "₹50,000"],
          ["2024-01-20", "P102", "Credit Adjustment", "₹25,000", "₹25,000", "₹50,000"]
        ];
        break;
      case "expenses":
        mockData = [
          ["Date", "Category", "Description", "Amount", "Approved By"],
          ["2024-01-20", "Operations", "Staff Payment", "₹15,000", "Admin"],
          ["2024-01-19", "Maintenance", "Equipment Repair", "₹8,500", "Admin"]
        ];
        break;
      case "bonus":
        mockData = [
          ["Date", "Player", "Bonus Type", "Amount", "Status", "Expiry"],
          ["2024-01-20", "P101", "Welcome Bonus", "₹1,000", "Active", "2024-02-20"],
          ["2024-01-19", "P102", "Referral Bonus", "₹500", "Used", "N/A"]
        ];
        break;
      case "custom":
        if (customReportSelection.length === 0) {
          alert("Please select at least one report type for custom report");
          return;
        }
        mockData = [
          ["Custom Report", "Compiled from multiple reports"],
          ["Report Types", customReportSelection.join(", ")],
          ["Generated", new Date().toLocaleString('en-IN')]
        ];
        break;
    }
    setReportData(mockData);
    alert(`Report generated successfully! Preview below.`);
  };

  // Player search for reports
  const [playerReportSearch, setPlayerReportSearch] = useState("");
  const filteredPlayersForReport = playerReportSearch.length >= 3
    ? allPlayersForCredit.filter(player => {
        const searchLower = playerReportSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Player search for Core Management and other sections
  const [playerManagementSearch, setPlayerManagementSearch] = useState("");
  const [selectedPlayerForManagement, setSelectedPlayerForManagement] = useState(null);
  const filteredPlayersForManagement = playerManagementSearch.length >= 3
    ? allPlayersForCredit.filter(player => {
        const searchLower = playerManagementSearch.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Credit Management State
  const [creditEligiblePlayers, setCreditEligiblePlayers] = useState([
    { id: "P101", name: "Alex Johnson", creditLimit: 100000, currentBalance: 0 },
    { id: "P102", name: "Maria Garcia", creditLimit: 50000, currentBalance: 0 }
  ]);
  const [creditRequests, setCreditRequests] = useState([
    { id: "CR001", playerId: "P101", playerName: "Alex Johnson", amount: 50000, requestedLimit: 100000, status: "pending", requestedDate: "2024-01-20T10:30:00", reason: "Need credit for ongoing session" },
    { id: "CR002", playerId: "P102", playerName: "Maria Garcia", amount: 25000, requestedLimit: 50000, status: "pending", requestedDate: "2024-01-20T11:15:00", reason: "Lost ₹10 lakh, requesting credit" }
  ]);
  const [creditPlayerSearch, setCreditPlayerSearch] = useState("");
  const [creditPlayerSearchLimit, setCreditPlayerSearchLimit] = useState("");
  const [selectedCreditPlayer, setSelectedCreditPlayer] = useState(null);
  const [selectedCreditPlayerLimit, setSelectedCreditPlayerLimit] = useState(null);
  const [creditLimitAmount, setCreditLimitAmount] = useState("");
  const [creditEffectiveDate, setCreditEffectiveDate] = useState("");
  const [creditAdjustmentPlayer, setCreditAdjustmentPlayer] = useState(null);
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState("");
  const [creditAdjustmentNotes, setCreditAdjustmentNotes] = useState("");

  // Get all players for search (combine registered and pending)
  const allPlayersForCredit = [...registeredPlayers, ...allPlayers.filter(p => !registeredPlayers.find(rp => rp.id === p.id))];

  // Filter all players for credit limit setting (searches all players, not just eligible)
  const filteredPlayersForLimit = creditPlayerSearchLimit.length >= 3
    ? allPlayersForCredit.filter(player => {
        const searchLower = creditPlayerSearchLimit.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.id.toLowerCase().includes(searchLower) ||
          player.email.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Handle setting credit limit (automatically makes player eligible)
  const handleSetCreditLimit = () => {
    if (!selectedCreditPlayerLimit || !creditLimitAmount) {
      alert("Please select a player and enter credit limit amount");
      return;
    }
    const amount = parseFloat(creditLimitAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid credit limit amount");
      return;
    }
    
    // Check if player is already in eligible list
    const existingPlayer = creditEligiblePlayers.find(p => p.id === selectedCreditPlayerLimit.id);
    
    if (existingPlayer) {
      // Update existing player's limit
      setCreditEligiblePlayers(prev => prev.map(p => 
        p.id === selectedCreditPlayerLimit.id ? {...p, creditLimit: amount} : p
      ));
      alert(`Credit limit updated for ${selectedCreditPlayerLimit.name} to ₹${amount.toLocaleString('en-IN')}`);
    } else {
      // Add new player to eligible list
      setCreditEligiblePlayers(prev => [...prev, {
        id: selectedCreditPlayerLimit.id,
        name: selectedCreditPlayerLimit.name,
        creditLimit: amount,
        currentBalance: 0
      }]);
      alert(`${selectedCreditPlayerLimit.name} has been added to credit-eligible players with limit ₹${amount.toLocaleString('en-IN')}`);
    }
    
    // Reset form
    setCreditPlayerSearchLimit("");
    setSelectedCreditPlayerLimit(null);
    setCreditLimitAmount("");
    setCreditEffectiveDate("");
  };

  // Handle credit request approval/rejection
  const handleCreditRequestAction = (requestId, action) => {
    setCreditRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        if (action === "approve") {
          // Update request status and send to cashier
          return { ...req, status: "approved", approvedDate: new Date().toISOString() };
        } else {
          return { ...req, status: "rejected", rejectedDate: new Date().toISOString() };
        }
      }
      return req;
    }));
    const request = creditRequests.find(r => r.id === requestId);
    if (action === "approve") {
      alert(`Credit request approved for ${request.playerName}. Request sent to cashier for processing.`);
    } else {
      alert(`Credit request rejected for ${request.playerName}.`);
    }
  };

  // Handle credit adjustment
  const handleCreditAdjustment = (type) => {
    if (!creditAdjustmentPlayer || !creditAdjustmentAmount) {
      alert("Please select a player and enter amount");
      return;
    }
    const amount = parseFloat(creditAdjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    // Update player's current balance
    setCreditEligiblePlayers(prev => prev.map(p => {
      if (p.id === creditAdjustmentPlayer.id) {
        const newBalance = type === "credit" 
          ? p.currentBalance + amount 
          : Math.max(0, p.currentBalance - amount);
        return { ...p, currentBalance: newBalance };
      }
      return p;
    }));
    
    alert(`Credit ${type === "credit" ? "added" : "deducted"} for ${creditAdjustmentPlayer.name}: ₹${amount.toLocaleString('en-IN')}`);
    
    // Reset form
    setCreditAdjustmentPlayer(null);
    setCreditAdjustmentAmount("");
    setCreditAdjustmentNotes("");
  };

  // State for Staff Bonuses Approval
  const [staffBonusRequests, setStaffBonusRequests] = useState([
    { id: "SB001", staffId: "ST001", staffName: "Sarah Johnson", staffRole: "Dealer", bonusType: "Performance Bonus", amount: 5000, reason: "Excellent performance this month", requestedBy: "Manager", requestedDate: "2024-01-20T10:30:00", status: "pending" },
    { id: "SB002", staffId: "ST002", staffName: "Mike Chen", staffRole: "Floor Manager", bonusType: "Attendance Bonus", amount: 3000, reason: "Perfect attendance for 3 months", requestedBy: "HR", requestedDate: "2024-01-20T11:15:00", status: "pending" },
    { id: "SB003", staffId: "ST003", staffName: "Emma Davis", staffRole: "Cashier", bonusType: "Special Achievement", amount: 7500, reason: "Outstanding customer service feedback", requestedBy: "Manager", requestedDate: "2024-01-19T14:20:00", status: "pending" }
  ]);

  const [bonusApprovalConfig, setBonusApprovalConfig] = useState({
    requireApproval: true,
    minAmountRequiringApproval: 10000,
    autoApproveUnder: 2000,
    requireSuperAdminForAmountOver: 50000
  });

  // VIP Store state
  const [vipProducts, setVipProducts] = useState([
    { id: 'vip-1', title: 'VIP Hoodie', points: 1500 },
    { id: 'vip-2', title: 'Free Dinner', points: 800 },
    { id: 'vip-3', title: 'VIP Poker Set', points: 2500 },
    { id: 'vip-4', title: 'Premium Tournament Entry', points: 3000 }
  ]);

  // Chat/Support System State
  const [chatType, setChatType] = useState("player"); // "player" or "staff"
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "open", "in_progress", "closed"

  // Player chats
  const [playerChats, setPlayerChats] = useState([
    {
      id: "PC001",
      playerId: "P101",
      playerName: "Alex Johnson",
      status: "open",
      lastMessage: "I'm having trouble with my account login.",
      lastMessageTime: new Date(Date.now() - 300000).toISOString(),
      messages: [
        { id: "M1", sender: "player", senderName: "Alex Johnson", text: "I'm having trouble with my account login.", timestamp: new Date(Date.now() - 300000).toISOString() },
        { id: "M2", sender: "staff", senderName: "Admin", text: "Hi Alex, I'm here to help. Can you describe the issue?", timestamp: new Date(Date.now() - 240000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "PC002",
      playerId: "P102",
      playerName: "Maria Garcia",
      status: "in_progress",
      lastMessage: "Thank you, the issue is resolved.",
      lastMessageTime: new Date(Date.now() - 600000).toISOString(),
      messages: [
        { id: "M3", sender: "player", senderName: "Maria Garcia", text: "I need help with my KYC verification.", timestamp: new Date(Date.now() - 1800000).toISOString() },
        { id: "M4", sender: "staff", senderName: "Admin", text: "Sure, let me check your documents.", timestamp: new Date(Date.now() - 1500000).toISOString() },
        { id: "M5", sender: "player", senderName: "Maria Garcia", text: "Thank you, the issue is resolved.", timestamp: new Date(Date.now() - 600000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "PC003",
      playerId: "P103",
      playerName: "Rajesh Kumar",
      status: "closed",
      lastMessage: "Thanks for your help!",
      lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
      messages: [
        { id: "M6", sender: "player", senderName: "Rajesh Kumar", text: "How do I withdraw my winnings?", timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: "M7", sender: "staff", senderName: "Admin", text: "You can withdraw from the cashier desk or use our online portal.", timestamp: new Date(Date.now() - 7000000).toISOString() },
        { id: "M8", sender: "player", senderName: "Rajesh Kumar", text: "Thanks for your help!", timestamp: new Date(Date.now() - 6800000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 14400000).toISOString()
    }
  ]);

  // Staff chats
  const [staffChats, setStaffChats] = useState([
    {
      id: "SC001",
      staffId: "ST001",
      staffName: "Sarah Johnson",
      staffRole: "Dealer",
      status: "open",
      lastMessage: "Need assistance with Table 3",
      lastMessageTime: new Date(Date.now() - 180000).toISOString(),
      messages: [
        { id: "M9", sender: "staff", senderName: "Sarah Johnson", text: "Need assistance with Table 3", timestamp: new Date(Date.now() - 180000).toISOString() },
        { id: "M10", sender: "admin", senderName: "Admin", text: "On my way!", timestamp: new Date(Date.now() - 120000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 180000).toISOString()
    },
    {
      id: "SC002",
      staffId: "ST002",
      staffName: "Mike Chen",
      staffRole: "Cashier",
      status: "in_progress",
      lastMessage: "Processing large withdrawal request",
      lastMessageTime: new Date(Date.now() - 600000).toISOString(),
      messages: [
        { id: "M11", sender: "staff", senderName: "Mike Chen", text: "Processing large withdrawal request - need approval", timestamp: new Date(Date.now() - 900000).toISOString() },
        { id: "M12", sender: "admin", senderName: "Admin", text: "Please hold and I'll review.", timestamp: new Date(Date.now() - 750000).toISOString() },
        { id: "M13", sender: "staff", senderName: "Mike Chen", text: "Processing large withdrawal request", timestamp: new Date(Date.now() - 600000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 1800000).toISOString()
    }
  ]);

  // Filter chats by status
  const filteredChats = chatType === "player" 
    ? playerChats.filter(chat => statusFilter === "all" || chat.status === statusFilter)
    : staffChats.filter(chat => statusFilter === "all" || chat.status === statusFilter);

  // Handle sending message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const message = {
      id: `M${Date.now()}`,
      sender: chatType === "player" ? "staff" : "admin",
      senderName: "Admin",
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    if (chatType === "player") {
      setPlayerChats(prev => prev.map(chat => 
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: [...chat.messages, message],
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
              status: chat.status === "closed" ? "in_progress" : chat.status
            }
          : chat
      ));
    } else {
      setStaffChats(prev => prev.map(chat => 
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: [...chat.messages, message],
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
              status: chat.status === "closed" ? "in_progress" : chat.status
            }
          : chat
      ));
    }
    setNewMessage("");
  };

  // Handle status change
  const handleStatusChange = (chatId, newStatus) => {
    if (chatType === "player") {
      setPlayerChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, status: newStatus } : chat
      ));
      // Update selected chat if it's the one being changed
      if (selectedChat && selectedChat.id === chatId) {
        const updatedChat = playerChats.find(c => c.id === chatId);
        if (updatedChat) setSelectedChat({ ...updatedChat, status: newStatus });
      }
    } else {
      setStaffChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, status: newStatus } : chat
      ));
      // Update selected chat if it's the one being changed
      if (selectedChat && selectedChat.id === chatId) {
        const updatedChat = staffChats.find(c => c.id === chatId);
        if (updatedChat) setSelectedChat({ ...updatedChat, status: newStatus });
      }
    }
  };

  // Update selected chat when switching chat types or when chat data changes
  useEffect(() => {
    if (selectedChat) {
      const currentChats = chatType === "player" ? playerChats : staffChats;
      const updatedChat = currentChats.find(c => c.id === selectedChat.id);
      if (updatedChat) {
        setSelectedChat(updatedChat);
      } else {
        setSelectedChat(null);
      }
    }
  }, [chatType, playerChats, staffChats]);

  // Handle staff bonus approval/rejection
  const handleStaffBonusAction = (requestId, action, notes = "") => {
    setStaffBonusRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        if (action === "approve") {
          return { ...req, status: "approved", approvedDate: new Date().toISOString(), approvedBy: "Admin", notes: notes };
        } else {
          return { ...req, status: "rejected", rejectedDate: new Date().toISOString(), rejectedBy: "Admin", notes: notes };
        }
      }
      return req;
    }));
    const request = staffBonusRequests.find(r => r.id === requestId);
    if (action === "approve") {
      alert(`Staff bonus approved for ${request.staffName}. Bonus will be processed.`);
    } else {
      alert(`Staff bonus rejected for ${request.staffName}.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-red-500/20 via-purple-600/30 to-blue-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-300 to-blue-400 drop-shadow-lg mb-6">
            Admin
          </div>
          <div className="flex items-center mb-6 text-white min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-purple-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-gray-900 font-bold text-sm">A</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold truncate">System Administrator</div>
              <div className="text-sm opacity-80 truncate">admin@pokerroom.com</div>
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
                    ? "bg-gradient-to-r from-red-400 to-purple-600 text-gray-900 font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-red-400/20 hover:to-purple-500/20 text-white"
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
          <header className="bg-gradient-to-r from-red-600 via-purple-500 to-blue-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Complete system administration and management</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate("/manager")}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                Manager Portal
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
              </button>
              <button 
                onClick={() => navigate("/master-admin")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                Master Admin
              </button>
              <button 
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
              >
                Sign Out
              </button>
            </div>
          </header>

          {/* Dynamic Content Based on Active Item */}
          {activeItem === "Dashboard" && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Active Tables", value: "8", color: "from-red-400 via-orange-500 to-yellow-500" },
                  { title: "Total Players", value: "156", color: "from-blue-400 via-indigo-500 to-purple-500" },
                  { title: "Active Dealers", value: "12", color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "System Status", value: "Online", color: "from-emerald-400 via-green-500 to-teal-500" },
                ].map((card, i) => (
                  <div key={i} className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}>
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Updated just now</div>
                  </div>
                ))}
              </div>

              {/* Revenue & Rake Section */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Revenue, Rake & Tips Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Previous Day Revenue */}
                  <div className="bg-white/10 p-4 rounded-lg border border-purple-400/30">
                    <div className="text-sm text-gray-300 mb-1">Previous Day Revenue</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.previousDay.revenue)}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      <div>Date: {revenueData.previousDay.date}</div>
                      <div>Last Updated: {revenueData.previousDay.lastUpdated}</div>
                    </div>
                    <div className="text-xs text-purple-300 font-semibold mt-2">Yesterday's Sessions</div>
                  </div>

                  {/* Current Day Revenue */}
                  <div className="bg-white/10 p-4 rounded-lg border border-green-400/30">
                    <div className="text-sm text-gray-300 mb-1">Current Day Revenue</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.currentDay.revenue)}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      <div>Date: {revenueData.currentDay.date}</div>
                      <div>Last Updated: {revenueData.currentDay.lastUpdated}</div>
                    </div>
                    <div className="text-xs text-green-300 font-semibold mt-2">Today's Sessions</div>
                  </div>

                  {/* Previous Day Rake */}
                  <div className="bg-white/10 p-4 rounded-lg border border-blue-400/30">
                    <div className="text-sm text-gray-300 mb-1">Previous Day Rake</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.previousDay.rake)}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      <div>Date: {revenueData.previousDay.date}</div>
                      <div>Last Updated: {revenueData.previousDay.lastUpdated}</div>
                    </div>
                    <div className="text-xs text-blue-300 font-semibold mt-2">Yesterday's Sessions</div>
                  </div>

                  {/* Current Day Rake */}
                  <div className="bg-white/10 p-4 rounded-lg border border-yellow-400/30">
                    <div className="text-sm text-gray-300 mb-1">Current Day Rake</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.currentDay.rake)}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      <div>Date: {revenueData.currentDay.date}</div>
                      <div>Last Updated: {revenueData.currentDay.lastUpdated}</div>
                    </div>
                    <div className="text-xs text-yellow-300 font-semibold mt-2">Today's Sessions</div>
                  </div>

                  {/* Previous Day Tips */}
                  <div className="bg-white/10 p-4 rounded-lg border border-cyan-400/30">
                    <div className="text-sm text-gray-300 mb-1">Previous Day Tips</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.previousDay.tips)}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      <div>Club Share: {formatCurrency(previousDayTipShares.club)}</div>
                      <div>Staff Share: {formatCurrency(previousDayTipShares.staff)}</div>
                    </div>
                    <div className="text-xs text-cyan-300 font-semibold mt-2">Hold {Math.round(TIP_HOLD_PERCENT * 100)}% • Staff {Math.round((1 - TIP_HOLD_PERCENT) * 100)}%</div>
                  </div>

                  {/* Current Day Tips */}
                  <div className="bg-white/10 p-4 rounded-lg border border-orange-400/30">
                    <div className="text-sm text-gray-300 mb-1">Current Day Tips</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.currentDay.tips)}</div>
                    <div className="text-xs text-gray-400 mb-1">
                      <div>Club Share: {formatCurrency(currentDayTipShares.club)}</div>
                      <div>Staff Share: {formatCurrency(currentDayTipShares.staff)}</div>
                    </div>
                    <div className="text-xs text-orange-300 font-semibold mt-2">Hold {Math.round(TIP_HOLD_PERCENT * 100)}% • Staff {Math.round((1 - TIP_HOLD_PERCENT) * 100)}%</div>
                  </div>
                </div>
              </section>

              {/* CRUD Operations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Tables CRUD */}
                <section className="p-6 bg-gradient-to-r from-red-600/30 via-orange-500/20 to-yellow-700/30 rounded-xl shadow-md border border-red-800/40">
                  <h2 className="text-lg font-semibold text-white mb-4">Active Tables Management</h2>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Table 1 - Texas Hold'em</span>
                        <span className="text-green-300 text-sm">Active</span>
                      </div>
                      <div className="text-sm text-gray-300">Players: 6/9 | Dealer: John</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                          Pause
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          End
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Table 2 - Omaha</span>
                        <span className="text-yellow-300 text-sm">Paused</span>
                      </div>
                      <div className="text-sm text-gray-300">Players: 4/8 | Dealer: Sarah</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                          Resume
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          End
                        </button>
                      </div>
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Create New Table
                    </button>
                  </div>
                </section>

                {/* Players Management */}
                <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                  <h2 className="text-lg font-semibold text-white mb-4">Players Management</h2>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">John Doe</span>
                        <span className="text-green-300 text-sm">Active</span>
                      </div>
                      <div className="text-sm text-gray-300">ID: P001 | Table: 1 | Chips: ₹2,500</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                          Block
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Jane Smith</span>
                        <span className="text-yellow-300 text-sm">Blocked</span>
                      </div>
                      <div className="text-sm text-gray-300">ID: P002 | Table: None | Chips: ₹0</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                          Unblock
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Add New Player
                    </button>
                  </div>
                </section>

                {/* Managers Management */}
                <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                  <h2 className="text-lg font-semibold text-white mb-4">Managers Management</h2>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Manager 1 - Floor Manager</span>
                        <span className="text-green-300 text-sm">Online</span>
                      </div>
                      <div className="text-sm text-gray-300">Name: Mike Johnson | Shift: Day</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                          Assign
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Manager 2 - Shift Manager</span>
                        <span className="text-gray-300 text-sm">Offline</span>
                      </div>
                      <div className="text-sm text-gray-300">Name: Sarah Wilson | Shift: Night</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                          Assign
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Add New Manager
                    </button>
                  </div>
                </section>

                {/* Dealers Management */}
                <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                  <h2 className="text-lg font-semibold text-white mb-4">Dealers Management</h2>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Dealer 1 - John</span>
                        <span className="text-green-300 text-sm">Active</span>
                      </div>
                      <div className="text-sm text-gray-300">Table: 1 | Experience: 5 years</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">
                          Reassign
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold">Dealer 2 - Sarah</span>
                        <span className="text-yellow-300 text-sm">Break</span>
                      </div>
                      <div className="text-sm text-gray-300">Table: None | Experience: 3 years</div>
                      <div className="flex gap-2 mt-2">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                          Assign
                        </button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Add New Dealer
                    </button>
                  </div>
                </section>
              </div>

              {/* Quick Actions */}
              <section className="p-6 bg-gradient-to-r from-red-600/30 via-purple-500/20 to-blue-700/30 rounded-xl shadow-md border border-red-800/40">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Create New Table
                  </button>
                  <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Block Player
                  </button>
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    Generate Report
                  </button>
                  <button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">
                    System Settings
                  </button>
                </div>
              </section>

              {/* System Status */}
              <section className="p-6 bg-gradient-to-r from-green-700/30 via-emerald-600/30 to-teal-700/30 rounded-xl shadow-md border border-green-700/40">
                <h2 className="text-lg font-semibold text-white mb-4">System Status</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["Database Operational", "All Services Running", "Security Active"].map((item, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-lg text-center font-semibold text-white shadow-inner border border-white/10">
                      {item}
                    </div>
                  ))}
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
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" value={registeredPlayersFilter.status} onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, status: e.target.value})}>
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Registration Date</label>
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" value={registeredPlayersFilter.registrationDate} onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, registrationDate: e.target.value})}>
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">Document Type</label>
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" value={registeredPlayersFilter.documentType} onChange={(e) => setRegisteredPlayersFilter({...registeredPlayersFilter, documentType: e.target.value})}>
                        <option value="all">All Documents</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                      </select>
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
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                            <div className="md:col-span-8 space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="font-semibold text-white text-lg">{player.name}</div>
                                <span className={`px-3 py-1 rounded-full text-xs border font-medium ${player.accountStatus === "Active" ? "bg-green-500/30 text-green-300 border-green-400/50" : player.accountStatus === "Suspended" ? "bg-red-500/30 text-red-300 border-red-400/50" : "bg-gray-500/30 text-gray-300 border-gray-400/50"}`}>{player.accountStatus}</span>
                                <span className="bg-blue-500/30 text-blue-300 font-medium px-3 py-1 rounded-full text-xs border border-blue-400/50">✓ Verified</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div><span className="text-gray-400">ID:</span> <span className="text-white">{player.id}</span></div>
                                <div><span className="text-gray-400">Email:</span> <span className="text-white">{player.email}</span></div>
                                <div><span className="text-gray-400">Phone:</span> <span className="text-white">{player.phone}</span></div>
                                <div><span className="text-gray-400">Doc:</span> <span className="text-white">{player.documentType}</span></div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-300">
                                <div>Registered: {new Date(player.registrationDate).toLocaleDateString()}</div>
                                <div>Verified: {new Date(player.verifiedDate).toLocaleDateString()}</div>
                                <div>Games: {player.totalGames}</div>
                                <div>Last Active: {player.lastActive}</div>
                              </div>
                            </div>
                            <div className="md:col-span-4 flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button onClick={() => setSelectedPlayerDetails(player)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">View Details</button>
                                <button onClick={() => handleDownloadKYCDoc(player)} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">📥 Download KYC</button>
                              </div>
                              <div className="flex gap-2">
                                <button className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg font-semibold text-sm" onClick={() => { const newStatus = player.accountStatus === "Active" ? "Suspended" : "Active"; setRegisteredPlayers(prev => prev.map(p => p.id === player.id ? {...p, accountStatus: newStatus} : p)); alert(`${player.name} account status changed to ${newStatus}`); }}>{player.accountStatus === "Active" ? "Suspend" : "Activate"}</button>
                                <button className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm" onClick={() => { if (window.confirm(`Are you sure you want to delete ${player.name}?`)) { setRegisteredPlayers(prev => prev.filter(p => p.id !== player.id)); alert(`${player.name} removed from system`); } }}>Delete</button>
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

          {activeItem === "Credit Management" && (
            <div className="space-y-6">
              {/* Credit-Eligible Players Management */}
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Credit-Eligible Players Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Set Player Credit Limit</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="text-white text-sm">Search Player (Type at least 3 characters)</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Search by name, ID, or email..." 
                          value={creditPlayerSearchLimit}
                          onChange={(e) => {
                            setCreditPlayerSearchLimit(e.target.value);
                            setSelectedCreditPlayerLimit(null);
                          }}
                        />
                        {creditPlayerSearchLimit.length >= 3 && filteredPlayersForLimit.length > 0 && !selectedCreditPlayerLimit && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredPlayersForLimit.map(player => {
                              const eligiblePlayer = creditEligiblePlayers.find(p => p.id === player.id);
                              return (
                                <div
                                  key={player.id}
                                  onClick={() => {
                                    setSelectedCreditPlayerLimit(player);
                                    setCreditPlayerSearchLimit(`${player.name} (${player.id})`);
                                  }}
                                  className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                                >
                                  <div className="text-white font-medium">{player.name}</div>
                                  <div className="text-gray-400 text-xs">
                                    ID: {player.id} | {eligiblePlayer ? `Current Limit: ₹${eligiblePlayer.creditLimit.toLocaleString('en-IN')}` : 'Not eligible'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {selectedCreditPlayerLimit && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                            <span className="text-green-300">Selected: {selectedCreditPlayerLimit.name} ({selectedCreditPlayerLimit.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedCreditPlayerLimit(null);
                                setCreditPlayerSearchLimit("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-white text-sm">Credit Limit (₹)</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Enter credit limit amount" 
                          value={creditLimitAmount}
                          onChange={(e) => setCreditLimitAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm">Effective From (Optional)</label>
                        <input 
                          type="date" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          value={creditEffectiveDate}
                          onChange={(e) => setCreditEffectiveDate(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={handleSetCreditLimit}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Set Credit Limit (Makes Player Eligible)
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Credit-Eligible Players List</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {creditEligiblePlayers.length > 0 ? (
                        creditEligiblePlayers.map(player => (
                          <div key={player.id} className="bg-white/5 p-3 rounded border border-green-400/30">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-white">{player.name}</div>
                                <div className="text-xs text-gray-400">ID: {player.id}</div>
                                <div className="text-sm text-gray-300 mt-1">
                                  Limit: ₹{player.creditLimit.toLocaleString('en-IN')} | 
                                  Balance: ₹{player.currentBalance.toLocaleString('en-IN')} | 
                                  Available: ₹{(player.creditLimit - player.currentBalance).toLocaleString('en-IN')}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Remove ${player.name} from credit-eligible players?`)) {
                                    setCreditEligiblePlayers(prev => prev.filter(p => p.id !== player.id));
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          No credit-eligible players. Set a credit limit to add players.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Credit Requests Management */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-indigo-500/20 to-blue-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Credit Requests - Approval Required</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  {creditRequests.filter(r => r.status === "pending").length > 0 ? (
                    <div className="space-y-3">
                      {creditRequests.filter(r => r.status === "pending").map(request => {
                        const player = creditEligiblePlayers.find(p => p.id === request.playerId);
                        const availableCredit = player ? player.creditLimit - player.currentBalance : 0;
                        return (
                          <div key={request.id} className="bg-white/5 p-4 rounded-lg border border-yellow-400/30">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              <div className="md:col-span-8">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="font-semibold text-white text-lg">{request.playerName}</div>
                                  <span className="bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded text-xs">Pending Approval</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-300">
                                  <div>Player ID: <span className="text-white">{request.playerId}</span></div>
                                  <div>Requested Amount: <span className="text-white font-semibold">₹{request.amount.toLocaleString('en-IN')}</span></div>
                                  <div>Credit Limit: <span className="text-white">₹{request.requestedLimit.toLocaleString('en-IN')}</span></div>
                                  <div>Available: <span className="text-white">₹{availableCredit.toLocaleString('en-IN')}</span></div>
                                </div>
                                <div className="mt-2 text-xs text-gray-400">
                                  Requested: {new Date(request.requestedDate).toLocaleString('en-IN')}
                                </div>
                                {request.reason && (
                                  <div className="mt-2 p-2 bg-white/5 rounded text-sm text-gray-300">
                                    Reason: {request.reason}
                                  </div>
                                )}
                              </div>
                              <div className="md:col-span-4 flex flex-col gap-2">
                                {request.amount > availableCredit ? (
                                  <div className="bg-red-500/20 border border-red-400/30 p-2 rounded text-xs text-red-300 mb-2">
                                    Request exceeds available credit (₹{availableCredit.toLocaleString('en-IN')})
                                  </div>
                                ) : null}
                                <button
                                  onClick={() => handleCreditRequestAction(request.id, "approve")}
                                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                                >
                                  ✓ Approve & Send to Cashier
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt("Enter rejection reason (optional):");
                                    if (reason !== null) {
                                      handleCreditRequestAction(request.id, "reject");
                                    }
                                  }}
                                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                                >
                                  ✗ Reject Request
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      No pending credit requests
                    </div>
                  )}
                </div>

                {/* Recent Requests History */}
                {creditRequests.filter(r => r.status !== "pending").length > 0 && (
                  <div className="mt-6 bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Requests History</h3>
                    <div className="space-y-2">
                      {creditRequests.filter(r => r.status !== "pending").map(request => (
                        <div key={request.id} className="bg-white/5 p-3 rounded border border-white/10">
                          <div className="flex justify-between items-center">
                      <div>
                              <span className="text-white font-medium">{request.playerName}</span>
                              <span className="text-gray-400 text-sm ml-2">- ₹{request.amount.toLocaleString('en-IN')}</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              request.status === "approved" 
                                ? "bg-green-500/30 text-green-300" 
                                : "bg-red-500/30 text-red-300"
                            }`}>
                              {request.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Credit Adjustments */}
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Credit Adjustments</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Adjust Credit Balance</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="text-white text-sm">Search Credit-Eligible Player</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Type at least 3 characters to search..." 
                          value={creditPlayerSearch}
                          onChange={(e) => {
                            setCreditPlayerSearch(e.target.value);
                            setCreditAdjustmentPlayer(null);
                          }}
                        />
                        {creditPlayerSearch.length >= 3 && creditPlayerSearch.length > 0 && !creditAdjustmentPlayer && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {creditEligiblePlayers.filter(p => 
                              p.name.toLowerCase().includes(creditPlayerSearch.toLowerCase()) ||
                              p.id.toLowerCase().includes(creditPlayerSearch.toLowerCase())
                            ).map(player => (
                              <div
                                key={player.id}
                                onClick={() => {
                                  setCreditAdjustmentPlayer(player);
                                  setCreditPlayerSearch(`${player.name} (${player.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{player.name}</div>
                                <div className="text-gray-400 text-xs">
                                  ID: {player.id} | Balance: ₹{player.currentBalance.toLocaleString('en-IN')} / ₹{player.creditLimit.toLocaleString('en-IN')}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {creditAdjustmentPlayer && (
                          <div className="mt-2 p-2 bg-blue-500/20 border border-blue-400/30 rounded text-sm">
                            <span className="text-blue-300">Selected: {creditAdjustmentPlayer.name} - Balance: ₹{creditAdjustmentPlayer.currentBalance.toLocaleString('en-IN')} / ₹{creditAdjustmentPlayer.creditLimit.toLocaleString('en-IN')}</span>
                            <button 
                              onClick={() => {
                                setCreditAdjustmentPlayer(null);
                                setCreditPlayerSearch("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-white text-sm">Amount (₹)</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Enter amount" 
                          value={creditAdjustmentAmount}
                          onChange={(e) => setCreditAdjustmentAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm">Notes/Reason</label>
                        <textarea 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          rows="3" 
                          placeholder="Enter reason for adjustment..."
                          value={creditAdjustmentNotes}
                          onChange={(e) => setCreditAdjustmentNotes(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleCreditAdjustment("credit")}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Add Credit
                        </button>
                        <button 
                          onClick={() => handleCreditAdjustment("debit")}
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Deduct Credit
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Credit Ledger</h3>
                    <div className="bg-white/5 p-4 rounded-lg overflow-x-auto max-h-96">
                      <table className="min-w-full text-left text-white/90 text-sm">
                        <thead className="text-white/70 text-xs border-b border-white/20">
                          <tr>
                            <th className="py-2 pr-4">Date</th>
                            <th className="py-2 pr-4">Player</th>
                            <th className="py-2 pr-4">Type</th>
                            <th className="py-2 pr-4">Amount (₹)</th>
                            <th className="py-2 pr-4">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { date: new Date().toLocaleDateString('en-IN'), player: 'P101', type: 'Credit Limit Set', amount: 100000, notes: 'Initial limit set' },
                            { date: new Date().toLocaleDateString('en-IN'), player: 'P102', type: 'Credit Limit Set', amount: 50000, notes: 'Initial limit set' },
                            { date: new Date().toLocaleDateString('en-IN'), player: 'P101', type: 'Credit Adjustment', amount: 50000, notes: 'Manual adjustment' },
                          ].map((row, idx) => (
                            <tr key={idx} className="border-b border-white/10">
                              <td className="py-2 pr-4">{row.date}</td>
                              <td className="py-2 pr-4">{row.player}</td>
                              <td className="py-2 pr-4">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  row.type.includes('Credit') ? 'bg-green-500/30 text-green-300' : 'bg-blue-500/30 text-blue-300'
                                }`}>
                                  {row.type}
                                </span>
                              </td>
                              <td className="py-2 pr-4">₹{row.amount.toLocaleString('en-IN')}</td>
                              <td className="py-2 pr-4 text-xs">{row.notes}</td>
                            </tr>
                      ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Core Management" && (
            <div className="space-y-6">
              {/* Player Management */}
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Player Actions</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="text-white text-sm">Search Player (Type at least 3 characters)</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Search by name, ID, or email..." 
                          value={playerManagementSearch}
                          onChange={(e) => {
                            setPlayerManagementSearch(e.target.value);
                            setSelectedPlayerForManagement(null);
                          }}
                        />
                        {playerManagementSearch.length >= 3 && filteredPlayersForManagement.length > 0 && !selectedPlayerForManagement && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredPlayersForManagement.map(player => (
                              <div
                                key={player.id}
                                onClick={() => {
                                  setSelectedPlayerForManagement(player);
                                  setPlayerManagementSearch(`${player.name} (${player.id})`);
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                              >
                                <div className="text-white font-medium">{player.name}</div>
                                <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedPlayerForManagement && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                            <span className="text-green-300">Selected: {selectedPlayerForManagement.name} ({selectedPlayerForManagement.id})</span>
                            <button 
                              onClick={() => {
                                setSelectedPlayerForManagement(null);
                                setPlayerManagementSearch("");
                              }}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (!selectedPlayerForManagement) {
                              alert("Please select a player first");
                              return;
                            }
                            alert(`Blocking player: ${selectedPlayerForManagement.name} (${selectedPlayerForManagement.id})`);
                          }}
                          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow"
                        >
                          Block Player
                        </button>
                        <button 
                          onClick={() => {
                            if (!selectedPlayerForManagement) {
                              alert("Please select a player first");
                              return;
                            }
                            alert(`Unblocking player: ${selectedPlayerForManagement.name} (${selectedPlayerForManagement.id})`);
                          }}
                          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow"
                        >
                          Unblock Player
                        </button>
                        <button 
                          onClick={() => {
                            if (!selectedPlayerForManagement) {
                              alert("Please select a player first");
                              return;
                            }
                            alert(`Resetting status for player: ${selectedPlayerForManagement.name} (${selectedPlayerForManagement.id})`);
                          }}
                          className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold shadow"
                        >
                          Reset Status
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Player History</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="font-semibold text-white">Player: John Doe</div>
                        <div className="text-sm text-gray-300">Last Login: 2 hours ago</div>
                        <div className="text-sm text-gray-300">Total Sessions: 45</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="font-semibold text-white">Player: Jane Smith</div>
                        <div className="text-sm text-gray-300">Last Login: 1 day ago</div>
                        <div className="text-sm text-gray-300">Total Sessions: 23</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Table & Tournament Management */}
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Table & Tournament Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Table</h3>
                    <div className="space-y-4">
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
                        <label className="text-white text-sm">Blind Level</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>₹10/₹20</option>
                          <option>₹25/₹50</option>
                          <option>₹50/₹100</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Max Players</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="9" />
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
                      <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow w-full mt-4">
                        Create Table
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Dealer Assignment</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Select Table</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1</option>
                          <option>Table 2</option>
                          <option>Table 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Assign Dealer</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Dealer 1</option>
                          <option>Dealer 2</option>
                          <option>Dealer 3</option>
                        </select>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Assign Dealer
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Player Registration" && (
            <div className="space-y-6">
              {/* Offers & Promotions */}
              <section className="p-6 bg-gradient-to-r from-yellow-600/30 via-orange-500/20 to-red-700/30 rounded-xl shadow-md border border-yellow-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Offers & Promotions</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Create Promotion</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Promotion Title</label>
                        <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Welcome Bonus" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Description</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Get 100% bonus on first deposit"></textarea>
                      </div>
                      <div>
                        <label className="text-white text-sm">Target Audience</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>All Players</option>
                          <option>New Players</option>
                          <option>VIP Players</option>
                        </select>
                      </div>
                      <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Create Promotion
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Bulk Operations</h3>
                    <div className="space-y-4">
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Send Bulk Email
                      </button>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Send SMS Campaign
                      </button>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Push Notifications
                      </button>
                      <button className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Download Player List
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Reports & Analytics */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Reports & Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Player Analytics</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-sm text-gray-300">Total Players: 156</div>
                        <div className="text-sm text-gray-300">Active Today: 23</div>
                        <div className="text-sm text-gray-300">New This Week: 8</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Revenue Reports</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-sm text-gray-300">Today: ₹12,450</div>
                        <div className="text-sm text-gray-300">This Week: ₹78,230</div>
                        <div className="text-sm text-gray-300">This Month: ₹245,680</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
                    <div className="space-y-2">
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm">
                        Export CSV
                      </button>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm">
                        Export PDF
                      </button>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded text-sm">
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Session Control" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Session Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Start New Session</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Table Selection</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1</option>
                          <option>Table 2</option>
                          <option>Table 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Session Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Cash Game</option>
                          <option>Tournament</option>
                          <option>Special Event</option>
                        </select>
                      </div>
                      <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Start Session
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Active Sessions</h3>
                    <div className="space-y-2">
                      <div className="bg-green-500/20 p-3 rounded border border-green-400/30">
                        <div className="font-semibold text-white">Table 1 - Cash Game</div>
                        <div className="text-sm text-gray-300">Players: 6/9</div>
                        <div className="text-xs text-green-300">Status: Active</div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded border border-yellow-400/30">
                        <div className="font-semibold text-white">Table 2 - Tournament</div>
                        <div className="text-sm text-gray-300">Players: 8/8</div>
                        <div className="text-xs text-yellow-300">Status: Starting</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Seating Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Seating Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Waitlist Management</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="font-semibold text-white">Player: Mike Johnson</div>
                        <div className="text-sm text-gray-300">Wait Time: 15 minutes</div>
                        <div className="text-xs text-blue-300">Priority: High</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="font-semibold text-white">Player: Sarah Wilson</div>
                        <div className="text-sm text-gray-300">Wait Time: 8 minutes</div>
                        <div className="text-xs text-green-300">Priority: Normal</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Seat Allocation</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Select Player</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Mike Johnson</option>
                          <option>Sarah Wilson</option>
                          <option>Tom Brown</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Assign Table</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1 - Seat 3</option>
                          <option>Table 2 - Seat 7</option>
                          <option>Table 3 - Seat 1</option>
                        </select>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Assign Seat
                      </button>
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
                          <option value="waitlist-1">Alex Johnson - Waitlist Position 1</option>
                          <option value="waitlist-2">Maria Garcia - Waitlist Position 2</option>
                          <option value="seated-1">John Doe - Table 1, Seat 3</option>
                          <option value="seated-2">Jane Smith - Table 2, Seat 5</option>
                          <option value="seated-3">Mike Johnson - Table 1, Seat 7</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-white text-sm">From Table</label>
                          <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                            <option value="">-- Select Table --</option>
                            <option value="1">Table 1 - Texas Hold'em</option>
                            <option value="2">Table 2 - Omaha</option>
                            <option value="3">Table 3 - Seven Card Stud</option>
                            <option value="waitlist">Waitlist</option>
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
                            <option value="1">Table 1 - Texas Hold'em</option>
                            <option value="2">Table 2 - Omaha</option>
                            <option value="3">Table 3 - Seven Card Stud</option>
                            <option value="waitlist">Waitlist</option>
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
                          <option value="waitlist-1">Alex Johnson - Waitlist Position 1</option>
                          <option value="waitlist-2">Maria Garcia - Waitlist Position 2</option>
                          <option value="waitlist-3">David Wilson - Waitlist Position 3</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-white text-sm">Table</label>
                          <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                            <option value="">-- Select Table --</option>
                            <option value="1">Table 1 - Texas Hold'em</option>
                            <option value="2">Table 2 - Omaha</option>
                            <option value="3">Table 3 - Seven Card Stud</option>
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
                          <option value="1">Position 1: Alex Johnson</option>
                          <option value="2">Position 2: Maria Garcia</option>
                          <option value="3">Position 3: David Wilson</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">New Priority Position</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Enter position (1-10)"
                          min="1"
                          max="10"
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
                          <option value="1">Alex Johnson - Position 1</option>
                          <option value="2">Maria Garcia - Position 2</option>
                          <option value="3">David Wilson - Position 3</option>
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

          {/* VIP Store */}
          {activeItem === "VIP Store" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">VIP Store Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">VIP Products</h3>
                    <div className="flex gap-2 mb-3">
                      <input 
                        id="vip-title" 
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                        placeholder="Product name" 
                      />
                      <input 
                        id="vip-points" 
                        type="number" 
                        className="w-32 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                        placeholder="Points" 
                      />
                      <button 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded" 
                        onClick={() => {
                          const t = document.getElementById('vip-title');
                          const p = document.getElementById('vip-points');
                          const title = t && 'value' in t ? t.value : '';
                          const pts = p && 'value' in p ? parseInt(p.value || '0', 10) : 0;
                          if (title.trim() && pts > 0) {
                            setVipProducts(prev => [...prev, { id: `vip-${Date.now()}`, title, points: pts }]);
                            if (t) t.value = '';
                            if (p) p.value = '';
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {vipProducts.map(v => (
                        <div key={v.id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="text-white text-sm">{v.title}</div>
                          <div className="flex items-center gap-2">
                            <div className="text-white/80 text-xs">{v.points} pts</div>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Delete "${v.title}"?`)) {
                                  setVipProducts(prev => prev.filter(p => p.id !== v.id));
                                }
                              }}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                      {vipProducts.length === 0 && (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No products. Add products above.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Points Calculator</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white text-sm mb-1 block">Buy-in Total</label>
                        <input 
                          id="calc-buyin" 
                          type="number" 
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Enter buy-in amount" 
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm mb-1 block">Hours Played</label>
                        <input 
                          id="calc-hours" 
                          type="number" 
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Enter hours played" 
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm mb-1 block">Visit Frequency</label>
                        <input 
                          id="calc-visits" 
                          type="number" 
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          placeholder="Enter visit frequency" 
                        />
                      </div>
                      <button 
                        className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold" 
                        onClick={() => {
                          const b = document.getElementById('calc-buyin');
                          const h = document.getElementById('calc-hours');
                          const v = document.getElementById('calc-visits');
                          const buyin = b && 'value' in b ? parseFloat(b.value || '0') : 0;
                          const hours = h && 'value' in h ? parseFloat(h.value || '0') : 0;
                          const visits = v && 'value' in v ? parseFloat(v.value || '0') : 0;
                          const points = (buyin * 0.5) + (hours * 0.3) + (visits * 0.2);
                          alert(`Estimated Points: ${Math.round(points)}`);
                        }}
                      >
                        Calculate Points
                      </button>
                      <div className="text-xs text-white/70 bg-white/5 p-2 rounded">
                        <strong>Formula:</strong> (Buy-in × 0.5) + (Hours × 0.3) + (Visits × 0.2)
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Reports & Analytics" && (
            <div className="space-y-6">
              {/* Report Type Selection */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Generate Reports</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Report Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm mb-2 block">Select Report Type</label>
                        <select 
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          value={selectedReportType}
                          onChange={(e) => {
                            setSelectedReportType(e.target.value);
                            setReportData(null);
                            if (e.target.value !== "individual_player") setSelectedPlayerForReport(null);
                            if (e.target.value !== "custom") setCustomReportSelection([]);
                          }}
                        >
                          <option value="">-- Select Report Type --</option>
                          {reportTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Player Selection for Individual Player Report */}
                      {selectedReportType === "individual_player" && (
                        <div className="relative">
                          <label className="text-white text-sm mb-2 block">Search Player (Type at least 3 characters)</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                            placeholder="Search by name, ID, or email..." 
                            value={playerReportSearch}
                            onChange={(e) => {
                              setPlayerReportSearch(e.target.value);
                              setSelectedPlayerForReport(null);
                            }}
                          />
                          {playerReportSearch.length >= 3 && filteredPlayersForReport.length > 0 && !selectedPlayerForReport && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredPlayersForReport.map(player => (
                                <div
                                  key={player.id}
                                  onClick={() => {
                                    setSelectedPlayerForReport(player);
                                    setPlayerReportSearch(`${player.name} (${player.id})`);
                                  }}
                                  className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                                >
                                  <div className="text-white font-medium">{player.name}</div>
                                  <div className="text-gray-400 text-xs">ID: {player.id}</div>
                    </div>
                              ))}
                  </div>
                          )}
                          {selectedPlayerForReport && (
                            <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                              <span className="text-green-300">Selected: {selectedPlayerForReport.name} ({selectedPlayerForReport.id})</span>
                              <button 
                                onClick={() => {
                                  setSelectedPlayerForReport(null);
                                  setPlayerReportSearch("");
                                }}
                                className="ml-2 text-red-400 hover:text-red-300"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Table Selection for Per Table Transactions */}
                      {selectedReportType === "per_table_transactions" && (
                        <div>
                          <label className="text-white text-sm mb-2 block">Select Table (Optional - leave blank for all tables)</label>
                          <select 
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                            value={selectedTableForReport}
                            onChange={(e) => setSelectedTableForReport(e.target.value)}
                          >
                            <option value="">All Tables</option>
                            <option value="Table 1">Table 1</option>
                            <option value="Table 2">Table 2</option>
                            <option value="Table 3">Table 3</option>
                            <option value="Table 4">Table 4</option>
                          </select>
                        </div>
                      )}

                      {/* Custom Report Multi-Select */}
                      {selectedReportType === "custom" && (
                        <div>
                          <label className="text-white text-sm mb-2 block">Select Multiple Report Types to Compile</label>
                          <div className="space-y-2 max-h-48 overflow-y-auto bg-white/5 p-3 rounded border border-white/10">
                            {reportTypes.filter(t => t.id !== "custom").map(type => (
                              <label key={type.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white/5 p-2 rounded">
                                <input
                                  type="checkbox"
                                  checked={customReportSelection.includes(type.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCustomReportSelection([...customReportSelection, type.id]);
                                    } else {
                                      setCustomReportSelection(customReportSelection.filter(id => id !== type.id));
                                    }
                                  }}
                                  className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded"
                                />
                                <span className="text-white text-sm">{type.icon} {type.name}</span>
                              </label>
                            ))}
                          </div>
                          {customReportSelection.length > 0 && (
                            <div className="mt-2 p-2 bg-blue-500/20 border border-blue-400/30 rounded text-sm">
                              <span className="text-blue-300">Selected: {customReportSelection.length} report type(s)</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="text-white text-sm mb-2 block">Date Range</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-gray-400 text-xs">Start Date</label>
                            <input 
                              type="date" 
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                              value={reportDateRange.start}
                              onChange={(e) => setReportDateRange({...reportDateRange, start: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs">End Date</label>
                            <input 
                              type="date" 
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                              value={reportDateRange.end}
                              onChange={(e) => setReportDateRange({...reportDateRange, end: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={generateReport}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Generate Report
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Report Preview</h3>
                    {reportData ? (
                      <div className="space-y-4">
                        <div className="bg-white/5 p-4 rounded-lg max-h-96 overflow-y-auto">
                          <table className="min-w-full text-left text-white/90 text-sm">
                            <thead className="text-white/70 text-xs border-b border-white/20">
                              <tr>
                                {reportData[0]?.map((header, idx) => (
                                  <th key={idx} className="py-2 pr-4">{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.slice(1).map((row, rowIdx) => (
                                <tr key={rowIdx} className="border-b border-white/10">
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="py-2 pr-4">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                      </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleExportReportCSV(selectedReportType, reportData)}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                          >
                            📥 Export CSV
                          </button>
                          <button 
                            onClick={() => handleExportReportPDF(selectedReportType)}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                          >
                            📄 Export PDF
                          </button>
                          <button 
                            onClick={() => {
                              const reportName = prompt("Enter report name to save:");
                              if (reportName) {
                                setSavedReports(prev => [...prev, {
                                  id: Date.now(),
                                  name: reportName,
                                  type: selectedReportType,
                                  dateRange: `${reportDateRange.start} to ${reportDateRange.end}`,
                                  created: new Date().toISOString().split('T')[0],
                                  player: selectedPlayerForReport?.id || null
                                }]);
                                alert("Report saved successfully!");
                              }
                            }}
                            className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                          >
                            💾 Save Report
                          </button>
                    </div>
                  </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <div className="text-lg mb-2">No report generated yet</div>
                        <div className="text-sm">Select a report type and generate to preview</div>
                </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Report Types Grid */}
              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-blue-500/20 to-cyan-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Available Report Types</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedReportType(type.id);
                        setReportData(null);
                        if (type.id !== "individual_player") setSelectedPlayerForReport(null);
                        if (type.id !== "custom") setCustomReportSelection([]);
                        // Scroll to top
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedReportType === type.id
                          ? "bg-white/20 border-white/40 shadow-lg scale-105"
                          : "bg-white/10 border-white/20 hover:bg-white/15"
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="text-white font-semibold text-sm">{type.name}</div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Saved Reports Management */}
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Saved Reports (CRUD Operations)</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  {savedReports.length > 0 ? (
                    <div className="space-y-3">
                      {savedReports.map(report => (
                        <div key={report.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-semibold">{report.name}</h4>
                                <span className="bg-blue-500/30 text-blue-300 px-2 py-1 rounded text-xs">
                                  {reportTypes.find(t => t.id === report.type)?.name || report.type}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-300">
                                <div>Date Range: {report.dateRange}</div>
                                <div>Created: {report.created}</div>
                                {report.player && <div>Player: {report.player}</div>}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => {
                                  const reportTypeObj = reportTypes.find(t => t.id === report.type);
                                  if (reportTypeObj) {
                                    setSelectedReportType(report.type);
                                    if (report.player) {
                                      const player = allPlayersForCredit.find(p => p.id === report.player);
                                      if (player) {
                                        setSelectedPlayerForReport(player);
                                        setPlayerReportSearch(`${player.name} (${player.id})`);
                                      }
                                    }
                                    setReportDateRange({
                                      start: report.dateRange.split(" to ")[0],
                                      end: report.dateRange.split(" to ")[1] || report.dateRange.split(" to ")[0]
                                    });
                                    alert("Report configuration loaded. Click 'Generate Report' to regenerate.");
                                  }
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                              >
                                🔄 Load
                              </button>
                              <button
                                onClick={() => {
                                  const newName = prompt("Enter new report name:", report.name);
                                  if (newName) {
                                    setSavedReports(prev => prev.map(r => 
                                      r.id === report.id ? {...r, name: newName} : r
                                    ));
                                    alert("Report updated successfully!");
                                  }
                                }}
                                className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete report "${report.name}"?`)) {
                                    setSavedReports(prev => prev.filter(r => r.id !== report.id));
                                    alert("Report deleted successfully!");
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                              >
                                🗑️ Delete
                              </button>
                              <button
                                onClick={() => {
                                  handleExportReportCSV(report.type, reportData);
                                }}
                                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
                              >
                                📥 CSV
                              </button>
                              <button
                                onClick={() => {
                                  handleExportReportPDF(report.type);
                                }}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm"
                              >
                                📄 PDF
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No saved reports. Generate and save a report to see it here.
                    </div>
                  )}
                </div>
              </section>

              {/* Quick Report Access */}
              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Quick Report Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setSelectedReportType("daily_transactions");
                      setReportDateRange({ start: today, end: today });
                      setTimeout(() => {
                        const mockData = [
                          ["Date", "Total Transactions", "Revenue", "Deposits", "Withdrawals"],
                          [today, "45", "₹12,450", "₹25,000", "₹10,000"]
                        ];
                        setReportData(mockData);
                      }, 100);
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold shadow"
                  >
                    📊 Today's Transactions
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setSelectedReportType("daily_rake");
                      setReportDateRange({ start: today, end: today });
                      setTimeout(() => {
                        const mockData = [
                          ["Date", "Total Rake", "Tables", "Average Rake per Table", "Top Table"],
                          [today, "₹1,245", "8", "₹155.63", "Table 1"]
                        ];
                        setReportData(mockData);
                      }, 100);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-4 py-3 rounded-lg font-semibold shadow"
                  >
                    🎰 Today's Rake
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setSelectedReportType("credit_transactions");
                      setReportDateRange({ start: today, end: today });
                      setTimeout(() => {
                        const mockData = [
                          ["Date", "Player", "Type", "Amount", "Balance Before", "Balance After"],
                          [today, "P101", "Credit Granted", "₹50,000", "₹0", "₹50,000"]
                        ];
                        setReportData(mockData);
                      }, 100);
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-4 py-3 rounded-lg font-semibold shadow"
                  >
                    💳 Today's Credit
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setSelectedReportType("expenses");
                      setReportDateRange({ start: today, end: today });
                      setTimeout(() => {
                        const mockData = [
                          ["Date", "Category", "Description", "Amount", "Approved By"],
                          [today, "Operations", "Staff Payment", "₹15,000", "Admin"]
                        ];
                        setReportData(mockData);
                      }, 100);
                    }}
                    className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white px-4 py-3 rounded-lg font-semibold shadow"
                  >
                    📉 Today's Expenses
                  </button>
                </div>
              </section>

              {/* Referral Analytics */}
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Referral Analytics & Tracking</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Filter Referred Players</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="text-white text-sm">Search by Agent / Referrer</label>
                        <input
                          type="text"
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          placeholder="Enter agent or partner name"
                          value={selectedReferralAgent ?? referralAgentSearch}
                          onChange={(e) => {
                            setReferralAgentSearch(e.target.value);
                            setSelectedReferralAgent(null);
                          }}
                        />
                        {referralAgentSearch.length >= 2 && filteredReferrersForSearch.length > 0 && !selectedReferralAgent && (
                          <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredReferrersForSearch.map(agent => (
                              <div
                                key={agent}
                                onClick={() => {
                                  setSelectedReferralAgent(agent);
                                  setReferralAgentSearch("");
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0 text-sm text-white"
                              >
                                {agent}
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedReferralAgent && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-xs text-green-200 flex items-center justify-between">
                            <span>Selected Referrer: {selectedReferralAgent}</span>
                            <button
                              onClick={() => {
                                setSelectedReferralAgent(null);
                                setReferralAgentSearch("");
                              }}
                              className="ml-2 text-red-300 hover:text-red-200 font-semibold"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <label className="text-white text-sm">Search by Referral Code</label>
                        <input
                          type="text"
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          placeholder="Enter full or partial referral code"
                          value={selectedReferralCode ?? referralCodeSearch}
                          onChange={(e) => {
                            setReferralCodeSearch(e.target.value);
                            setSelectedReferralCode(null);
                          }}
                        />
                        {referralCodeSearch.length >= 2 && filteredReferralCodesForSearch.length > 0 && !selectedReferralCode && (
                          <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredReferralCodesForSearch.map(code => (
                              <div
                                key={code}
                                onClick={() => {
                                  setSelectedReferralCode(code);
                                  setReferralCodeSearch("");
                                }}
                                className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0 text-sm text-white"
                              >
                                {code}
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedReferralCode && (
                          <div className="mt-2 p-2 bg-cyan-500/20 border border-cyan-400/30 rounded text-xs text-cyan-200 flex items-center justify-between">
                            <span>Selected Code: {selectedReferralCode}</span>
                            <button
                              onClick={() => {
                                setSelectedReferralCode(null);
                                setReferralCodeSearch("");
                              }}
                              className="ml-2 text-red-300 hover:text-red-200 font-semibold"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      {uniqueReferrers.length > 0 && (
                        <div>
                          <div className="text-white text-sm mb-2">Top Referrers</div>
                          <div className="flex flex-wrap gap-2">
                            {uniqueReferrers.map(agent => (
                              <button
                                key={agent}
                                onClick={() => {
                                  setSelectedReferralAgent(agent || "");
                                  setReferralAgentSearch("");
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
                                  (selectedReferralAgent || "").toLowerCase() === (agent || "").toLowerCase()
                                    ? "bg-green-500/40 border-green-400/50 text-green-100"
                                    : "bg-white/10 border-white/20 text-white/80 hover:bg-white/15"
                                }`}
                              >
                                {agent || "Unknown"}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const snapshot = filteredReferralPlayers.length;
                            alert(`Referral report ready for export. ${snapshot} player(s) match the current filter.`);
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Prepare Referral Report
                        </button>
                        <button
                          onClick={() => {
                            setReferralAgentSearch("");
                            setReferralCodeSearch("");
                            setSelectedReferralAgent(null);
                            setSelectedReferralCode(null);
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="bg-white/5 p-3 rounded border border-white/10 text-sm text-gray-200">
                        <div>Total referred players: <span className="font-semibold text-white">{allReferredPlayers.length}</span></div>
                        <div>Unique referrers: <span className="font-semibold text-white">{uniqueReferrers.length}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Referred Players ({filteredReferralPlayers.length}/{allReferredPlayers.length})
                    </h3>
                    {filteredReferralPlayers.length > 0 ? (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {filteredReferralPlayers.map(player => (
                          <div key={player.id} className="bg-white/5 p-3 rounded-lg border border-green-400/30">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-white font-semibold text-base">{player.name}</div>
                                <div className="text-xs text-gray-300">ID: {player.id} • Email: {player.email}</div>
                                <div className="text-xs text-gray-300">Phone: {player.phone}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Referred By: <span className="text-green-200 font-medium">{player.referredBy || "Unknown"}</span>
                                  {player.referralCode && (
                                    <>
                                      <span className="text-gray-500 mx-1">•</span>
                                      Referral Code: <span className="text-cyan-200 font-medium">{player.referralCode}</span>
                                    </>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Registered: {new Date(player.registrationDate).toLocaleDateString()} • Last Active: {player.lastActive}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <span className={`px-2 py-1 rounded text-xs text-center font-semibold ${
                                  player.accountStatus === "Active"
                                    ? "bg-green-500/30 text-green-200"
                                    : player.accountStatus === "Suspended"
                                    ? "bg-red-500/30 text-red-200"
                                    : "bg-gray-500/30 text-gray-200"
                                }`}>
                                  {player.accountStatus}
                                </span>
                                <button
                                  onClick={() => setSelectedPlayerDetails(player)}
                                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-300 border border-dashed border-white/20 rounded-lg">
                        <div className="text-lg font-semibold mb-2">No referred players found</div>
                        <div className="text-sm">Adjust the referral filters to see matching players</div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "FNB Portal" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">FNB Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {[
                    { title: "Total Menu Items", value: "45", color: "from-orange-400 via-red-500 to-pink-500" },
                    { title: "Active Orders", value: "12", color: "from-yellow-400 via-orange-500 to-red-500" },
                    { title: "Low Stock Items", value: "8", color: "from-red-400 via-pink-500 to-rose-500" },
                    { title: "Today's Revenue", value: "₹15,250", color: "from-green-400 via-emerald-500 to-teal-500" },
                  ].map((card, i) => (
                    <div key={i} className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}>
                      <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                      <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                      <div className="text-xs mt-1 text-white/70">Updated just now</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Quick FNB Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">Add Menu Item</button>
                  <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">Update Inventory</button>
                  <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">Create Order</button>
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">Generate Bill</button>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h3 className="text-lg font-semibold text-white mb-4">Active Orders</h3>
                <div className="space-y-2">
                  {[{id:'#001', table:'Table 1', items:'2x Biryani, 1x Curry', status:'Preparing'}, {id:'#002', table:'Table 3', items:'1x Fish Fry, 2x Pulao', status:'Pending'}].map(o => (
                    <div key={o.id} className="bg-white/10 p-3 rounded border border-white/20 flex items-center justify-between">
                      <div className="text-white">
                        <div className="font-semibold">Order {o.id} • {o.table}</div>
                        <div className="text-sm text-white/80">{o.items}</div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded">{o.status}</span>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">Advance</button>
                        <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Push Notifications */}
          {activeItem === "Push Notifications" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl shadow-md border border-indigo-800/40">
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
                                id="image-upload-admin-dashboard"
                                onChange={handleImageUpload}
                              />
                              <label htmlFor="image-upload-admin-dashboard" className="cursor-pointer">
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
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold mt-4"
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

          {/* Staff Bonuses Approval */}
          {activeItem === "Staff Bonuses Approval" && (
            <div className="space-y-6">
              {/* Approval Configuration */}
              <section className="p-6 bg-gradient-to-r from-amber-600/30 via-orange-500/20 to-red-700/30 rounded-xl shadow-md border border-amber-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Staff Bonus Approval Configuration</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-semibold">Require Approval for Staff Bonuses</div>
                        <div className="text-gray-400 text-sm">All staff bonuses must be approved by Admin/Admin</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bonusApprovalConfig.requireApproval}
                          onChange={(e) => setBonusApprovalConfig({...bonusApprovalConfig, requireApproval: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-white text-sm">Minimum Amount Requiring Approval (₹)</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          value={bonusApprovalConfig.minAmountRequiringApproval}
                          onChange={(e) => setBonusApprovalConfig({...bonusApprovalConfig, minAmountRequiringApproval: parseFloat(e.target.value) || 0})}
                          placeholder="10000"
                        />
                        <p className="text-xs text-gray-400 mt-1">Bonuses above this amount require approval</p>
                      </div>
                      <div>
                        <label className="text-white text-sm">Auto-Approve Under (₹)</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          value={bonusApprovalConfig.autoApproveUnder}
                          onChange={(e) => setBonusApprovalConfig({...bonusApprovalConfig, autoApproveUnder: parseFloat(e.target.value) || 0})}
                          placeholder="2000"
                        />
                        <p className="text-xs text-gray-400 mt-1">Bonuses under this amount auto-approve</p>
                      </div>
                      <div>
                        <label className="text-white text-sm">Require Admin for Amount Over (₹)</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                          value={bonusApprovalConfig.requireSuperAdminForAmountOver}
                          onChange={(e) => setBonusApprovalConfig({...bonusApprovalConfig, requireSuperAdminForAmountOver: parseFloat(e.target.value) || 0})}
                          placeholder="50000"
                        />
                        <p className="text-xs text-gray-400 mt-1">Bonuses above this require Admin approval</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        alert("Staff bonus approval configuration saved successfully!");
                      }}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </section>

              {/* Pending Staff Bonus Requests */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Pending Staff Bonus Requests - Approval Required</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  {staffBonusRequests.filter(r => r.status === "pending").length > 0 ? (
                    <div className="space-y-4">
                      {staffBonusRequests.filter(r => r.status === "pending").map(request => (
                        <div key={request.id} className="bg-white/5 p-4 rounded-lg border border-yellow-400/30">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-8">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="font-semibold text-white text-lg">{request.staffName}</div>
                                <span className="bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded text-xs">Pending Approval</span>
                                <span className="bg-blue-500/30 text-blue-300 px-2 py-1 rounded text-xs">{request.staffRole}</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-300">
                                <div>Staff ID: <span className="text-white">{request.staffId}</span></div>
                                <div>Bonus Type: <span className="text-white">{request.bonusType}</span></div>
                                <div>Amount: <span className="text-white font-semibold">₹{request.amount.toLocaleString('en-IN')}</span></div>
                                <div>Requested By: <span className="text-white">{request.requestedBy}</span></div>
                              </div>
                              <div className="mt-2 text-xs text-gray-400">
                                Requested: {new Date(request.requestedDate).toLocaleString('en-IN')}
                              </div>
                              {request.reason && (
                                <div className="mt-2 p-2 bg-white/5 rounded text-sm text-gray-300">
                                  Reason: {request.reason}
                                </div>
                              )}
                            </div>
                            <div className="md:col-span-4 flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  const notes = prompt("Enter approval notes (optional):");
                                  if (notes !== null) {
                                    handleStaffBonusAction(request.id, "approve", notes);
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                              >
                                ✓ Approve Bonus
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt("Enter rejection reason (required):");
                                  if (reason && reason.trim()) {
                                    handleStaffBonusAction(request.id, "reject", reason);
                                  } else if (reason !== null) {
                                    alert("Please provide a rejection reason");
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                              >
                                ✗ Reject Bonus
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      No pending staff bonus requests
                    </div>
                  )}
                </div>

                {/* Recent Approval History */}
                {staffBonusRequests.filter(r => r.status !== "pending").length > 0 && (
                  <div className="mt-6 bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Approval History</h3>
                    <div className="space-y-2">
                      {staffBonusRequests.filter(r => r.status !== "pending").map(request => (
                        <div key={request.id} className="bg-white/5 p-3 rounded border border-white/10">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-white font-medium">{request.staffName}</span>
                              <span className="text-gray-400 text-sm ml-2">- {request.bonusType} - ₹{request.amount.toLocaleString('en-IN')}</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              request.status === "approved" 
                                ? "bg-green-500/30 text-green-300" 
                                : "bg-red-500/30 text-red-300"
                            }`}>
                              {request.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                            </span>
                          </div>
                          {request.approvedBy && (
                            <div className="text-xs text-gray-400 mt-1">
                              {request.status === "approved" ? "Approved" : "Rejected"} by {request.approvedBy || request.rejectedBy} on {new Date(request.approvedDate || request.rejectedDate).toLocaleDateString('en-IN')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Player Support - Chat System */}
          {activeItem === "Player Support" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Player & Staff Support Chat</h2>
                
                {/* Chat Type Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => {
                      setChatType("player");
                      setSelectedChat(null);
                      setStatusFilter("all");
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      chatType === "player"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    📱 Player Chat
                  </button>
                  <button
                    onClick={() => {
                      setChatType("staff");
                      setSelectedChat(null);
                      setStatusFilter("all");
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      chatType === "staff"
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    👥 Staff Chat
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chat List Sidebar */}
                  <div className="lg:col-span-1 bg-white/10 p-4 rounded-lg">
                    <div className="mb-4">
                      <label className="text-white text-sm mb-2 block">Filter by Status</label>
                      <select
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {filteredChats.length > 0 ? (
                        filteredChats.map(chat => (
                          <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedChat?.id === chat.id
                                ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400/50"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="font-semibold text-white text-sm">
                                {chatType === "player" ? chat.playerName : chat.staffName}
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                chat.status === "open"
                                  ? "bg-yellow-500/30 text-yellow-300"
                                  : chat.status === "in_progress"
                                  ? "bg-blue-500/30 text-blue-300"
                                  : "bg-gray-500/30 text-gray-300"
                              }`}>
                                {chat.status === "open" ? "Open" : chat.status === "in_progress" ? "In Progress" : "Closed"}
                              </span>
                            </div>
                            {chatType === "staff" && (
                              <div className="text-xs text-gray-400 mb-1">{chat.staffRole}</div>
                            )}
                            <div className="text-xs text-gray-300 truncate">{chat.lastMessage}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(chat.lastMessageTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          No {statusFilter !== "all" ? statusFilter : ""} chats found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Window */}
                  <div className="lg:col-span-2 bg-white/10 p-4 rounded-lg">
                    {selectedChat ? (
                      <div className="flex flex-col h-[600px]">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
                          <div>
                            <div className="font-semibold text-white text-lg">
                              {chatType === "player" ? selectedChat.playerName : selectedChat.staffName}
                            </div>
                            {chatType === "staff" && (
                              <div className="text-sm text-gray-400">{selectedChat.staffRole}</div>
                            )}
                            {chatType === "player" && (
                              <div className="text-sm text-gray-400">ID: {selectedChat.playerId}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                              value={selectedChat.status}
                              onChange={(e) => handleStatusChange(selectedChat.id, e.target.value)}
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                          {selectedChat.messages.map(message => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === "staff" || message.sender === "admin" ? "justify-end" : "justify-start"}`}
                            >
                              <div className={`max-w-[70%] rounded-lg p-3 ${
                                message.sender === "staff" || message.sender === "admin"
                                  ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                                  : "bg-white/20 text-white"
                              }`}>
                                <div className="text-xs font-semibold mb-1 opacity-90">{message.senderName}</div>
                                <div className="text-sm">{message.text}</div>
                                <div className="text-xs opacity-70 mt-1">
                                  {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Message Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            disabled={selectedChat.status === "closed"}
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={selectedChat.status === "closed" || !newMessage.trim()}
                            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Send
                          </button>
                        </div>
                        {selectedChat.status === "closed" && (
                          <div className="text-xs text-gray-400 mt-2 text-center">
                            This chat is closed. Change status to reopen.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[600px] text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-4">💬</div>
                          <div className="text-lg">Select a {chatType === "player" ? "player" : "staff"} chat to start messaging</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "System Settings" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-gray-600/30 via-slate-500/20 to-gray-700/30 rounded-xl shadow-md border border-gray-800/40">
                <h2 className="text-xl font-bold text-white mb-6">System Configuration</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Two-Factor Authentication</span>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">
                          Enabled
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Session Timeout</span>
                        <select className="bg-white/10 border border-white/20 rounded text-white px-2 py-1">
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">System Maintenance</h3>
                    <div className="space-y-4">
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Backup Database
                      </button>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        Clear Cache
                      </button>
                      <button className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow">
                        System Restart
                      </button>
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
