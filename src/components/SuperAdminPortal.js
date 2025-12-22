import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "./common/CustomSelect";
import StaffManagement from './StaffManagement';
import TableManagementSection from "./TableManagementSection";
import SessionControl from "./SessionControl";
import PlayerManagementSection from "./PlayerManagementSection";
import TournamentManagementSection from "./TournamentManagementSection";
import ChatSection from "./ChatSection";

export default function SuperAdminPortal() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("Dashboard");

  // Club selection state
  const [selectedClubId, setSelectedClubId] = useState('club-01');
  const [isClubDropdownOpen, setIsClubDropdownOpen] = useState(false);
  const clubs = [
    { id: 'club-01', name: 'Emerald Poker Mumbai' },
    { id: 'club-02', name: 'Teal Poker Bangalore' },
    { id: 'club-03', name: 'Cyan Poker Delhi' },
    { id: 'club-04', name: 'Royal Poker Chennai' }
  ];
  const selectedClub = clubs.find(c => c.id === selectedClubId) || clubs[0];

  // Helper functions for date/time
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

  // Revenue, Rake & Tips data with date/time
  const currentDateTime = getCurrentDateTime();
  const previousDateTime = getPreviousDayDateTime();

  const TIP_HOLD_PERCENT = 0.15;

  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  const calculateTipShares = (amount) => ({
    club: Math.round(amount * TIP_HOLD_PERCENT),
    staff: Math.round(amount * (1 - TIP_HOLD_PERCENT))
  });

  const [revenueData, setRevenueData] = useState({
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
  });

  const previousDayTipShares = calculateTipShares(revenueData.previousDay.tips);
  const currentDayTipShares = calculateTipShares(revenueData.currentDay.tips);

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
      kycDocUrl: "/documents/pan_alex_johnson.pdf",
      referredBy: "Agent X",
      referralCode: "AGTX-ALPHA"
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
      kycDocUrl: "/documents/aadhaar_maria_garcia.pdf",
      referredBy: "Agent Y",
      referralCode: "AGTY-BETA"
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
      kycDocUrl: "/documents/passport_rajesh_kumar.pdf",
      referredBy: "Agent Z",
      referralCode: "AGTZ-GAMMA"
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
      kycDocUrl: "/documents/dl_priya_sharma.pdf",
      referredBy: "Affiliate Club",
      referralCode: "AFF-DELTA"
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

  // Handle download KYC document
  const handleDownloadKYCDoc = (playerId, docUrl) => {
    const player = registeredPlayers.find(p => p.id === playerId);
    if (player) {
      alert(`Downloading KYC document for ${player.name}\nDocument: ${player.documentType}\nURL: ${docUrl}`);
      // In real implementation, this would trigger a download
    }
  };

  // Handle export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Account Status', 'Registration Date', 'Document Type', 'Verified Date', 'Total Games', 'Last Active'];
    const rows = filteredRegisteredPlayers.map(p => [
      p.id, p.name, p.email, p.phone, p.accountStatus, p.registrationDate, p.documentType, p.verifiedDate, p.totalGames, p.lastActive
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registered_players_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get all players for search (combine registered and pending)
  const allPlayersForReport = [...registeredPlayers, ...allPlayers.filter(p => !registeredPlayers.find(rp => rp.id === p.id))];

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

  // Player search for reports
  const [playerReportSearch, setPlayerReportSearch] = useState("");
  const filteredPlayersForReport = playerReportSearch.length >= 3
    ? allPlayersForReport.filter(player => {
      const searchLower = playerReportSearch.toLowerCase();
      return (
        player.name.toLowerCase().includes(searchLower) ||
        player.id.toLowerCase().includes(searchLower) ||
        player.email.toLowerCase().includes(searchLower)
      );
    })
    : [];

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

  // Handle export PDF for reports (client-side print)
  const handleExportReportPDF = (reportType) => {
    const printWindow = window.open('', '_blank');
    const reportTitle = reportTypes.find(t => t.id === reportType)?.name || reportType;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .header { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <p><strong>Date Range:</strong> ${reportDateRange.start} to ${reportDateRange.end}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString('en-IN')}</p>
          </div>
          <table>
            ${reportData ? `
              <thead>
                <tr>
                  ${reportData[0]?.map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${reportData.slice(1).map(row => `
                  <tr>
                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            ` : '<tr><td>No data available</td></tr>'}
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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

    let mockData = [];
    switch (selectedReportType) {
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

  const menuItems = useMemo(() => [
    "Dashboard",
    "Player Management",
    "Table Management",
    "Session Control",
    "Staff Management",
    "Affiliates",
    "Credit Approvals",
    "Financial Overrides",
    "Tournaments",
    "VIP Store",
    "Analytics & Reports",
    "Push Notifications",
    "Chat",
    "Global Settings",
    "Logs & Audits",
    "System Control",
  ], []);



  const [staff, setStaff] = useState([
    { id: "S001", name: "Alice Brown", role: "GRE", status: "Active", email: "alice@example.com" },
    { id: "S002", name: "Bob Green", role: "Dealer", status: "Active", email: "bob@example.com" },
    { id: "S003", name: "Sara White", role: "Cashier", status: "Deactivated", email: "sara@example.com" }
  ]);

  // State for custom staff role
  const [selectedStaffRole, setSelectedStaffRole] = useState("GRE");
  const [customStaffRole, setCustomStaffRole] = useState("");

  // Custom Groups Management (using localStorage for persistence)
  const loadCustomGroups = () => {
    try {
      const stored = localStorage.getItem('notification_custom_groups');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  const saveCustomGroups = (groups) => {
    try {
      localStorage.setItem('notification_custom_groups', JSON.stringify(groups));
    } catch (e) {
      console.error('Failed to save groups:', e);
    }
  };

  const [customGroups, setCustomGroups] = useState(loadCustomGroups);

  // Update groups in localStorage whenever they change
  useEffect(() => {
    saveCustomGroups(customGroups);
  }, [customGroups]);

  // Group creation state
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: "",
    type: "player", // "player" or "staff"
    memberIds: []
  });
  const [groupMemberSearch, setGroupMemberSearch] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);

  // Get available members based on group type
  const getAvailableMembers = () => {
    if (groupForm.type === "player") {
      return registeredPlayers.filter(p =>
        !groupForm.memberIds.includes(p.id) &&
        (!groupMemberSearch ||
          p.name.toLowerCase().includes(groupMemberSearch.toLowerCase()) ||
          p.id.toLowerCase().includes(groupMemberSearch.toLowerCase()) ||
          (p.email && p.email.toLowerCase().includes(groupMemberSearch.toLowerCase())))
      );
    } else {
      return staff.filter(s =>
        !groupForm.memberIds.includes(s.id) &&
        (!groupMemberSearch ||
          s.name.toLowerCase().includes(groupMemberSearch.toLowerCase()) ||
          s.id.toLowerCase().includes(groupMemberSearch.toLowerCase()) ||
          (s.email && s.email.toLowerCase().includes(groupMemberSearch.toLowerCase())))
      );
    }
  };

  // Handle create/update group
  const handleSaveGroup = () => {
    if (!groupForm.name.trim()) {
      alert("Please enter a group name");
      return;
    }
    if (groupForm.memberIds.length === 0) {
      alert("Please select at least one member for the group");
      return;
    }

    if (editingGroup) {
      // Update existing group
      setCustomGroups(prev => prev.map(g =>
        g.id === editingGroup.id
          ? { ...g, name: groupForm.name, type: groupForm.type, memberIds: groupForm.memberIds }
          : g
      ));
      alert(`Group "${groupForm.name}" updated successfully!`);
    } else {
      // Create new group
      const newGroup = {
        id: `group-${Date.now()}`,
        name: groupForm.name,
        type: groupForm.type,
        memberIds: groupForm.memberIds,
        createdAt: new Date().toISOString()
      };
      setCustomGroups(prev => [...prev, newGroup]);
      alert(`Group "${groupForm.name}" created successfully!`);
    }

    // Reset form
    setGroupForm({ name: "", type: "player", memberIds: [] });
    setGroupMemberSearch("");
    setShowGroupForm(false);
    setEditingGroup(null);
  };

  // Handle delete group
  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      setCustomGroups(prev => prev.filter(g => g.id !== groupId));
      alert("Group deleted successfully!");
    }
  };

  // Handle edit group
  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      type: group.type,
      memberIds: [...group.memberIds]
    });
    setShowGroupForm(true);
  };

  // Get group members details
  const getGroupMembersDetails = (group) => {
    if (group.type === "player") {
      return group.memberIds.map(id => registeredPlayers.find(p => p.id === id)).filter(Boolean);
    } else {
      return group.memberIds.map(id => staff.find(s => s.id === id)).filter(Boolean);
    }
  };

  // Get available audience options (including custom groups)
  const getAudienceOptions = () => {
    const standardOptions = [
      "All Players",
      "Tables in Play",
      "Waitlist",
      "VIP"
    ];
    const playerGroups = customGroups.filter(g => g.type === "player").map(g => `[Player Group] ${g.name}`);
    const staffGroups = customGroups.filter(g => g.type === "staff").map(g => `[Staff Group] ${g.name}`);
    return [...standardOptions, ...playerGroups, ...staffGroups];
  };

  // Push Notifications state
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
      setNotificationErrors(prev => ({ ...prev, image: error }));
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
      setNotificationErrors(prev => ({ ...prev, image: null }));
    };
    reader.readAsDataURL(file);
  };

  // Handle image URL input
  const handleImageUrlChange = (url) => {
    if (!url) {
      setNotificationForm(prev => ({ ...prev, imageUrl: "", imageFile: null, imagePreview: null }));
      setNotificationErrors(prev => ({ ...prev, image: null }));
      return;
    }
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      setNotificationErrors(prev => ({ ...prev, image: "Please enter a valid URL starting with http:// or https://" }));
      return;
    }
    setNotificationForm(prev => ({
      ...prev,
      imageUrl: url,
      imageFile: null,
      imagePreview: null
    }));
    setNotificationErrors(prev => ({ ...prev, image: null }));
  };

  // Handle video URL input
  const handleVideoUrlChange = (url) => {
    setNotificationForm(prev => ({ ...prev, videoUrl: url }));
    setNotificationErrors(prev => ({ ...prev, video: validateVideoUrl(url) }));
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

  const [creditRequests, setCreditRequests] = useState([
    { id: "CR-101", playerId: "P001", player: "John Doe", amount: 5000, status: "Pending", visibleToPlayer: false, limit: 0 },
    { id: "CR-102", playerId: "P003", player: "Mike Johnson", amount: 2500, status: "Pending", visibleToPlayer: false, limit: 0 }
  ]);

  const [transactions, setTransactions] = useState([
    { id: "TX-9001", type: "Deposit", player: "John Doe", amount: 3000, status: "Completed" },
    { id: "TX-9002", type: "Cashout", player: "Jane Smith", amount: 1800, status: "Pending" },
    { id: "TX-9003", type: "Bonus", player: "Mike Johnson", amount: 500, status: "Completed" }
  ]);

  // State for bonus creation
  const [bonusPlayerSearch, setBonusPlayerSearch] = useState("");
  const [selectedBonusPlayer, setSelectedBonusPlayer] = useState(null);
  const [bonusForm, setBonusForm] = useState({
    type: "Welcome Bonus",
    amount: "",
    reason: "",
    expiryDays: 30
  });

  // Filter players for bonus creation
  const filteredPlayersForBonus = bonusPlayerSearch.length >= 2
    ? allPlayersForReport.filter(player => {
      const searchLower = bonusPlayerSearch.toLowerCase();
      return (
        player.name.toLowerCase().includes(searchLower) ||
        player.id.toLowerCase().includes(searchLower) ||
        (player.email && player.email.toLowerCase().includes(searchLower))
      );
    })
    : [];

  // Handle bonus creation
  const handleCreateBonus = () => {
    if (!selectedBonusPlayer) {
      alert("Please select a player");
      return;
    }
    if (!bonusForm.amount || parseFloat(bonusForm.amount) <= 0) {
      alert("Please enter a valid bonus amount");
      return;
    }
    const bonusId = `BONUS-${Date.now()}`;
    const newBonus = {
      id: bonusId,
      playerId: selectedBonusPlayer.id,
      player: selectedBonusPlayer.name,
      type: bonusForm.type,
      amount: parseFloat(bonusForm.amount),
      reason: bonusForm.reason,
      expiryDays: bonusForm.expiryDays,
      status: "Active",
      createdAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + bonusForm.expiryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setTransactions(prev => [...prev, {
      id: bonusId,
      type: "Bonus",
      player: selectedBonusPlayer.name,
      amount: parseFloat(bonusForm.amount),
      status: "Completed"
    }]);
    alert(`Bonus created successfully!\n\nPlayer: ${selectedBonusPlayer.name}\nType: ${bonusForm.type}\nAmount: ₹${parseFloat(bonusForm.amount).toLocaleString('en-IN')}\nReason: ${bonusForm.reason || 'N/A'}`);
    // Reset form
    setSelectedBonusPlayer(null);
    setBonusPlayerSearch("");
    setBonusForm({
      type: "Welcome Bonus",
      amount: "",
      reason: "",
      expiryDays: 30
    });
  };

  // Mock table data
  const [tables, setTables] = useState([
    {
      id: 1,
      name: "Table 1 - Texas Hold'em",
      status: "Active",
      gameType: "Texas Hold'em",
      stakes: "₹1000.00/10000.00",
      maxPlayers: 6,
      minPlayTime: 30,
    },
    {
      id: 2,
      name: "Table 2 - Omaha",
      status: "Active",
      gameType: "Omaha",
      stakes: "₹5000.00/50000.00",
      maxPlayers: 9,
      minPlayTime: 30,
    },
    {
      id: 3,
      name: "Table 3 - Stud",
      status: "Paused",
      gameType: "Seven Card Stud",
      stakes: "₹10000.00/100000.00",
      maxPlayers: 6,
      minPlayTime: 30,
    },
  ]);

  const [waitlist, setWaitlist] = useState([
    {
      id: 1,
      pos: 1,
      player: "Alex Johnson",
      playerName: "Alex Johnson",
      playerId: "P001",
      game: "Hold'em",
      gameType: "Texas Hold'em",
      preferredSeat: 3,
      preferredTable: 1
    },
    {
      id: 2,
      pos: 2,
      player: "Maria Garcia",
      playerName: "Maria Garcia",
      playerId: "P002",
      game: "Omaha",
      gameType: "Omaha",
      preferredSeat: 5,
      preferredTable: 2
    }
  ]);

  // Track occupied seats by table
  const [occupiedSeats, setOccupiedSeats] = useState({
    1: [1, 2, 4, 7],
    2: [2, 3, 6],
    3: []
  });

  // State for table view modal (manager mode)
  const [showTableView, setShowTableView] = useState(false);
  const [selectedPlayerForSeating, setSelectedPlayerForSeating] = useState(null);
  const [selectedTableForSeating, setSelectedTableForSeating] = useState(null);

  // Live tables (for TableManagementSection)
  const superAdminMockPlayers = useMemo(
    () =>
      (registeredPlayers || []).map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email || "",
      })),
    [registeredPlayers]
  );
  const [liveTablePlayerSearch, setLiveTablePlayerSearch] = useState("");
  const [selectedLiveTablePlayer, setSelectedLiveTablePlayer] = useState(null);
  const [buyInAmount, setBuyInAmount] = useState("");

  const dealers = useMemo(
    () =>
      (staff || [])
        .filter((s) => (s.role || "").toLowerCase() === "dealer")
        .map((s) => ({ id: s.id, name: s.name })),
    [staff]
  );

  // Check if a seat is available
  const isSeatAvailable = (tableId, seatNumber) => {
    const occupied = occupiedSeats[tableId] || [];
    return !occupied.includes(seatNumber);
  };

  // Handle opening table view for seat assignment
  const handleOpenTableView = (waitlistEntry, tableId = null) => {
    setSelectedPlayerForSeating(waitlistEntry);
    setSelectedTableForSeating(tableId || waitlistEntry.preferredTable || tables[0]?.id || 1);
    setShowTableView(true);
    // Route to the unified TableManagementSection (so only it owns the hologram modal)
    setActiveItem("Table Management");
  };

  // Handle seat assignment from table view
  const handleSeatAssign = ({ playerId, playerName, tableId, seatNumber }) => {
    const tableIdNum = parseInt(tableId);
    const seatNum = parseInt(seatNumber);

    if (!isSeatAvailable(tableIdNum, seatNum)) {
      alert(`Seat ${seatNum} at Table ${tableIdNum} is not available`);
      return;
    }

    // Assign seat
    setOccupiedSeats(prev => ({
      ...prev,
      [tableIdNum]: [...(prev[tableIdNum] || []), seatNum]
    }));

    // Remove from waitlist
    setWaitlist(prev => prev.filter(item =>
      (item.id !== parseInt(playerId)) && (item.playerId !== playerId)
    ));

    alert(`Assigned ${playerName} to Table ${tableIdNum}, Seat ${seatNum}`);

    // Close table view
    setShowTableView(false);
    setSelectedPlayerForSeating(null);
    setSelectedTableForSeating(null);
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
      alert(`Assigned ${waitlistEntry.playerName || waitlistEntry.player} to Table ${waitlistEntry.preferredTable}, Seat ${waitlistEntry.preferredSeat}`);
    } else {
      alert(`Preferred seat ${waitlistEntry.preferredSeat} at Table ${waitlistEntry.preferredTable} is not available`);
    }
  };

  // VIP Store state
  const [vipProducts, setVipProducts] = useState([
    { id: 'vip-1', clubId: 'club-01', title: 'VIP Hoodie', points: 1500, image: "https://placehold.co/100x100/333/FFF?text=Hoodie" },
    { id: 'vip-2', clubId: 'club-01', title: 'Free Dinner', points: 800, image: "https://placehold.co/100x100/333/FFF?text=Dinner" },
    { id: 'vip-3', clubId: 'club-02', title: 'VIP Poker Set', points: 2500, image: "https://placehold.co/100x100/333/FFF?text=PokerSet" },
    { id: 'vip-4', clubId: 'club-02', title: 'Premium Tournament Entry', points: 3000, image: "https://placehold.co/100x100/333/FFF?text=Entry" }
  ]);

  // Tournament Management State
  const [tournaments, setTournaments] = useState([
    {
      id: "T001",
      name: "Monday Night Hold'em",
      type: "No Limit Hold'em",
      status: "Scheduled",
      buyIn: 1000,
      entryFee: 100,
      startingChips: 10000,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      registeredPlayers: 12,
      maxPlayers: 100,
      blindStructure: "Standard",
      blindLevels: 15,
      rebuyAllowed: false,
      addOnAllowed: true,
      reEntryAllowed: false,
      bountyAmount: 0,
      lateRegistration: 60,
      breakStructure: "Every 4 levels",
      payoutStructure: "Top 15%",
      createdBy: "Super Admin",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "T002",
      name: "PLO Bounty Tournament",
      type: "Pot Limit Omaha",
      status: "Active",
      buyIn: 2000,
      entryFee: 200,
      startingChips: 20000,
      startTime: new Date().toISOString(),
      registeredPlayers: 45,
      maxPlayers: 100,
      blindStructure: "Turbo",
      blindLevels: 12,
      rebuyAllowed: false,
      addOnAllowed: false,
      reEntryAllowed: true,
      bountyAmount: 500,
      lateRegistration: 30,
      breakStructure: "Every 6 levels",
      payoutStructure: "Top 20%",
      createdBy: "Super Admin",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    type: "No Limit Hold'em",
    buyIn: "",
    entryFee: "",
    startingChips: "",
    startTime: "",
    maxPlayers: "",
    blindStructure: "Standard",
    blindLevels: 15,
    blindInterval: 15,
    rebuyAllowed: false,
    rebuyChips: "",
    rebuyFee: "",
    rebuyPeriod: "",
    addOnAllowed: false,
    addOnChips: "",
    addOnFee: "",
    reEntryAllowed: false,
    reEntryPeriod: "",
    bountyAmount: "",
    lateRegistration: 60,
    breakStructure: "Every 4 levels",
    breakDuration: 10,
    payoutStructure: "Top 15%",
    seatDrawMethod: "Random",
    clockPauseRules: "Standard"
  });

  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showTournamentForm, setShowTournamentForm] = useState(false);

  // Tournament types
  const tournamentTypes = [
    "No Limit Hold'em",
    "Pot Limit Omaha",
    "Pot Limit Omaha Hi-Lo",
    "Limit Hold'em",
    "Seven Card Stud",
    "Seven Card Stud Hi-Lo",
    "HORSE (Mixed)",
    "8-Game Mix",
    "Triple Draw Lowball",
    "Razz",
    "Badugi"
  ];

  // Blind structures
  const blindStructures = [
    "Standard",
    "Turbo",
    "Super Turbo",
    "Deep Stack",
    "Hyper Turbo",
    "Custom"
  ];

  // Break structures
  const breakStructures = [
    "Every 4 levels",
    "Every 6 levels",
    "Every 8 levels",
    "Every 10 levels",
    "No breaks",
    "Custom"
  ];

  // Payout structures
  const payoutStructures = [
    "Top 10%",
    "Top 15%",
    "Top 20%",
    "Top 25%",
    "Winner takes all",
    "Top 3",
    "Top 5",
    "Top 9",
    "Custom"
  ];

  // Handle tournament creation
  const handleCreateTournament = () => {
    if (!tournamentForm.name || !tournamentForm.buyIn || !tournamentForm.startingChips) {
      alert("Please fill in all required fields");
      return;
    }
    const newTournament = {
      id: `T${Date.now().toString().slice(-6)}`,
      name: tournamentForm.name,
      type: tournamentForm.type,
      status: "Scheduled",
      buyIn: parseFloat(tournamentForm.buyIn),
      entryFee: parseFloat(tournamentForm.entryFee) || 0,
      startingChips: parseFloat(tournamentForm.startingChips),
      startTime: tournamentForm.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      registeredPlayers: 0,
      maxPlayers: tournamentForm.maxPlayers ? parseInt(tournamentForm.maxPlayers) : null, // null = unlimited
      blindStructure: tournamentForm.blindStructure,
      blindLevels: tournamentForm.blindLevels,
      rebuyAllowed: tournamentForm.rebuyAllowed,
      addOnAllowed: tournamentForm.addOnAllowed,
      reEntryAllowed: tournamentForm.reEntryAllowed,
      bountyAmount: tournamentForm.bountyAmount ? parseFloat(tournamentForm.bountyAmount) : 0,
      lateRegistration: tournamentForm.lateRegistration,
      breakStructure: tournamentForm.breakStructure,
      payoutStructure: tournamentForm.payoutStructure,
      createdBy: "Super Admin",
      createdAt: new Date().toISOString(),
      ...tournamentForm
    };
    setTournaments(prev => [newTournament, ...prev]);
    alert(`Tournament "${tournamentForm.name}" created successfully!`);
    setTournamentForm({
      name: "",
      type: "No Limit Hold'em",
      buyIn: "",
      entryFee: "",
      startingChips: "",
      startTime: "",
      maxPlayers: "",
      blindStructure: "Standard",
      blindLevels: 15,
      blindInterval: 15,
      rebuyAllowed: false,
      rebuyChips: "",
      rebuyFee: "",
      rebuyPeriod: "",
      addOnAllowed: false,
      addOnChips: "",
      addOnFee: "",
      reEntryAllowed: false,
      reEntryPeriod: "",
      bountyAmount: "",
      lateRegistration: 60,
      breakStructure: "Every 4 levels",
      breakDuration: 10,
      payoutStructure: "Top 15%",
      seatDrawMethod: "Random",
      clockPauseRules: "Standard"
    });
    setShowTournamentForm(false);
  };

  // Chat/Support System State
  const [chatType, setChatType] = useState("player");
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Player chats
  const [playerChats, setPlayerChats] = useState([
    {
      id: "PC001",
      playerId: "P101",
      playerName: "Alex Johnson",
      status: "open",
      lastMessage: "I need help with my account.",
      lastMessageTime: new Date(Date.now() - 240000).toISOString(),
      messages: [
        { id: "M1", sender: "player", senderName: "Alex Johnson", text: "I need help with my account.", timestamp: new Date(Date.now() - 240000).toISOString() },
        { id: "M2", sender: "staff", senderName: "Super Admin", text: "Hi Alex, how can I help you?", timestamp: new Date(Date.now() - 180000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 600000).toISOString()
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
      lastMessage: "Need urgent assistance",
      lastMessageTime: new Date(Date.now() - 300000).toISOString(),
      messages: [
        { id: "M3", sender: "staff", senderName: "Sarah Johnson", text: "Need urgent assistance", timestamp: new Date(Date.now() - 300000).toISOString() },
        { id: "M4", sender: "admin", senderName: "Super Admin", text: "I'll assist you right away.", timestamp: new Date(Date.now() - 240000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 300000).toISOString()
    }
  ]);

  const filteredChats = chatType === "player"
    ? playerChats.filter(chat => statusFilter === "all" || chat.status === statusFilter)
    : staffChats.filter(chat => statusFilter === "all" || chat.status === statusFilter);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message = {
      id: `M${Date.now()}`,
      sender: chatType === "player" ? "staff" : "admin",
      senderName: "Super Admin",
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

  const handleStatusChange = (chatId, newStatus) => {
    if (chatType === "player") {
      setPlayerChats(prev => prev.map(chat =>
        chat.id === chatId ? { ...chat, status: newStatus } : chat
      ));
      if (selectedChat && selectedChat.id === chatId) {
        const updatedChat = playerChats.find(c => c.id === chatId);
        if (updatedChat) setSelectedChat({ ...updatedChat, status: newStatus });
      }
    } else {
      setStaffChats(prev => prev.map(chat =>
        chat.id === chatId ? { ...chat, status: newStatus } : chat
      ));
      if (selectedChat && selectedChat.id === chatId) {
        const updatedChat = staffChats.find(c => c.id === chatId);
        if (updatedChat) setSelectedChat({ ...updatedChat, status: newStatus });
      }
    }
  };

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

  const approveCredit = (id) => {
    setCreditRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "Approved", visibleToPlayer: true, limit: r.amount } : r));
  };

  const denyCredit = (id) => {
    setCreditRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "Denied", visibleToPlayer: false, limit: 0 } : r));
  };

  const togglePlayerStatus = (playerId, nextStatus) => {
    setPlayers((prev) => prev.map((p) => p.id === playerId ? { ...p, status: nextStatus } : p));
  };

  const addStaff = (name, role) => {
    const id = `S${(Math.random() * 10000 | 0).toString().padStart(3, '0')}`;
    setStaff((prev) => [...prev, { id, name, role, status: "Active" }]);
  };

  const deactivateStaff = (id) => {
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, status: "Deactivated" } : s));
  };

  const factoryReset = () => {
    try {
      localStorage.clear();
    } catch { }
    window.location.reload();
  };

  // Affiliate Management State
  const [affiliates, setAffiliates] = useState([
    { id: "AFF001", name: "Agent X", email: "agent.x@example.com", referralCode: "AGTX-ALPHA", status: "Active", kycStatus: "Verified", totalReferrals: 12, earnings: 45000 },
    { id: "AFF002", name: "Agent Y", email: "agent.y@example.com", referralCode: "AGTY-BETA", status: "Active", kycStatus: "Pending", totalReferrals: 8, earnings: 28000 },
    { id: "AFF003", name: "Agent Z", email: "agent.z@example.com", referralCode: "AGTZ-GAMMA", status: "Inactive", kycStatus: "Rejected", totalReferrals: 3, earnings: 5000 }
  ]);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [viewingAffiliate, setViewingAffiliate] = useState(null);

  const [newAffiliate, setNewAffiliate] = useState({ name: "", email: "", referralCode: "" });
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const handleAddAffiliate = () => {
    if (!newAffiliate.name || !newAffiliate.email || !newAffiliate.referralCode) {
      alert("Please fill all fields");
      return;
    }

    // Generate simple random password
    const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();

    const newAff = {
      id: `AFF${Date.now()}`,
      ...newAffiliate,
      status: "Active",
      kycStatus: "Pending",
      totalReferrals: 0,
      earnings: 0
    };
    setAffiliates([...affiliates, newAff]);
    setShowAffiliateModal(false);
    setNewAffiliate({ name: "", email: "", referralCode: "" });

    // Show credentials popup
    setCreatedCredentials({
      name: newAff.name,
      referralCode: newAff.referralCode,
      password: tempPassword
    });
  };

  const getReferredUsers = (code) => {
    // In a real app, this would query backend. Here we filter mock registered players or generate mock data.
    const realMatches = registeredPlayers.filter(p => p.referralCode === code);
    // If no matches in our small mock data, let's fake some for demo purposes if the affiliate has stats
    if (realMatches.length === 0 && viewingAffiliate && viewingAffiliate.totalReferrals > 0) {
      return Array(viewingAffiliate.totalReferrals).fill(0).map((_, i) => ({
        id: `REF-${i}`,
        name: `Referred User ${i + 1}`,
        email: `user${i}@example.com`,
        registrationDate: "2024-01-20",
        status: "Active"
      }));
    }
    return realMatches;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1600px] px-6 py-10 grid grid-cols-12 gap-8">
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-red-500/20 via-purple-600/30 to-indigo-700/30 p-5 shadow-lg border border-gray-800">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-300 to-indigo-400 drop-shadow-lg mb-6">
            Super Admin
          </div>
          <div className="bg-white/10 rounded-xl p-4 mb-6 text-white shadow-inner">
            <div className="text-lg font-semibold">Root Administrator</div>
            <div className="text-sm opacity-80">super@admin.com</div>
          </div>

          {/* Club Selection Dropdown */}
          <div className="mb-6 relative">
            <label className="text-white text-sm mb-2 block">Select Club</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsClubDropdownOpen(!isClubDropdownOpen)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-left flex items-center justify-between hover:bg-white/15 transition-colors"
              >
                <span className="truncate">{selectedClub?.name || 'Select Club'}</span>
                <svg
                  className={`w-4 h-4 ml-2 transition-transform ${isClubDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isClubDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsClubDropdownOpen(false)}
                  ></div>
                  <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {clubs.map(club => (
                      <button
                        key={club.id}
                        type="button"
                        onClick={() => {
                          setSelectedClubId(club.id);
                          setIsClubDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-colors ${selectedClubId === club.id ? 'bg-blue-600/30' : ''
                          }`}
                      >
                        {club.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Managing: {selectedClub?.name}</p>
          </div>

          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md ${activeItem === item
                  ? "bg-gradient-to-r from-red-400 to-purple-600 text-white font-bold shadow-lg scale-[1.02]"
                  : "bg-white/5 hover:bg-gradient-to-r hover:from-red-400/20 hover:to-purple-500/20 text-white"
                  }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="col-span-12 lg:col-span-9 xl:col-span-9 space-y-8">
          <header className="bg-gradient-to-r from-red-600 via-purple-500 to-indigo-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Super Admin - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Ultimate control: players, staff, credit, overrides and more</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/manager")} className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Manager</button>
              <button onClick={() => navigate("/master-admin")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Master Admin</button>
              <button onClick={() => navigate("/admin")} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Admin</button>
              <button onClick={() => navigate("/super-admin/signin")} className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Sign Out</button>
            </div>
          </header>

          {activeItem === "Dashboard" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Total Players", value: allPlayers.length.toString(), color: "from-blue-400 via-indigo-500 to-purple-500" },
                  { title: "Active Staff", value: staff.filter(s => s.status === 'Active').length.toString(), color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "Pending Credit", value: creditRequests.filter(r => r.status === 'Pending').length.toString(), color: "from-yellow-400 via-orange-500 to-red-500" },
                  { title: "Open Overrides", value: transactions.filter(t => t.status !== 'Completed').length.toString(), color: "from-pink-400 via-red-500 to-rose-500" },
                ].map((card) => (
                  <div key={card.title} className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}>
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Updated just now</div>
                  </div>
                ))}
              </div>

              {/* Revenue, Rake & Tips Overview */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Revenue, Rake & Tips Overview - {selectedClub?.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Previous Day Revenue */}
                  <div className="bg-white/10 p-4 rounded-lg border border-purple-400/30">
                    <div className="text-sm text-gray-300 mb-1">Prev Day Revenue</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.previousDay.revenue)}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.previousDay.date}
                    </div>
                  </div>

                  {/* Current Day Revenue */}
                  <div className="bg-white/10 p-4 rounded-lg border border-green-400/30">
                    <div className="text-sm text-gray-300 mb-1">Today's Revenue</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.currentDay.revenue)}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.currentDay.date}
                    </div>
                  </div>

                  {/* Previous Day Rake */}
                  <div className="bg-white/10 p-4 rounded-lg border border-blue-400/30">
                    <div className="text-sm text-gray-300 mb-1">Prev Day Rake</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.previousDay.rake)}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.previousDay.date}
                    </div>
                  </div>

                  {/* Current Day Rake */}
                  <div className="bg-white/10 p-4 rounded-lg border border-yellow-400/30">
                    <div className="text-sm text-gray-300 mb-1">Today's Rake</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.currentDay.rake)}</div>
                    <div className="text-xs text-gray-400">
                      {revenueData.currentDay.date}
                    </div>
                  </div>

                  {/* Previous Day Tips */}
                  <div className="bg-white/10 p-4 rounded-lg border border-cyan-400/30">
                    <div className="text-sm text-gray-300 mb-1">Prev Day Tips</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.previousDay.tips)}</div>
                    <div className="text-xs text-gray-400">
                      Club: {formatCurrency(previousDayTipShares.club)} • Staff: {formatCurrency(previousDayTipShares.staff)}
                    </div>
                    <div className="text-xs text-cyan-300 font-semibold mt-2">Hold {Math.round(TIP_HOLD_PERCENT * 100)}% • Staff {Math.round((1 - TIP_HOLD_PERCENT) * 100)}%</div>
                  </div>

                  {/* Current Day Tips */}
                  <div className="bg-white/10 p-4 rounded-lg border border-orange-400/30">
                    <div className="text-sm text-gray-300 mb-1">Today's Tips</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatCurrency(revenueData.currentDay.tips)}</div>
                    <div className="text-xs text-gray-400">
                      Club: {formatCurrency(currentDayTipShares.club)} • Staff: {formatCurrency(currentDayTipShares.staff)}
                    </div>
                    <div className="text-xs text-orange-300 font-semibold mt-2">Hold {Math.round(TIP_HOLD_PERCENT * 100)}% • Staff {Math.round((1 - TIP_HOLD_PERCENT) * 100)}%</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  Last Updated: {revenueData.currentDay.lastUpdated} | Data for {selectedClub?.name}
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-purple-400/30 via-indigo-500/20 to-blue-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">New Staff</button>
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Approve All Credits</button>
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Export Report</button>
                  <button className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white px-5 py-3 rounded-xl font-semibold shadow transition" onClick={factoryReset}>Factory Reset</button>
                </div>
              </section>
            </>
          )}

          {/* Player Management */}
          {activeItem === "Player Management" && (() => {
            // Transform KYC requests from allPlayers with pending status
            const kycRequestsData = allPlayers
              .filter(p => p.kycStatus === "pending")
              .map((player, index) => ({
                id: index + 1,
                name: player.name,
                documentType: player.documentType || "N/A",
                docUrl: player.kycDocUrl || "#",
                status: "Pending",
                submittedDate: player.submittedDate || player.registrationDate,
                playerId: player.id,
                documentNumber: player.documentNumber || "",
                email: player.email,
                phone: player.phone,
              }));

            // Combine all players for allPlayers prop
            const combinedAllPlayers = [
              ...allPlayers.map(player => ({
                id: player.id,
                name: player.name,
                email: player.email,
                phone: player.phone,
                status: player.accountStatus || (player.kycStatus === "pending" ? "Pending Approval" : "Active"),
                kycStatus: player.kycStatus === "approved" ? "Verified" : player.kycStatus === "pending" ? "Pending" : player.kycStatus === "rejected" ? "Rejected" : "N/A",
                registrationDate: player.registrationDate,
                referredBy: player.referredBy || "N/A",
                balance: 0, // Add balance if available in player data
              })),
              ...registeredPlayers.map(player => ({
                id: player.id,
                name: player.name,
                email: player.email,
                phone: player.phone,
                status: player.accountStatus,
                kycStatus: player.kycStatus === "approved" ? "Verified" : "N/A",
                registrationDate: player.registrationDate,
                referredBy: player.referredBy || "N/A",
                balance: 0,
              })),
            ];

            // Remove duplicates based on id
            const uniqueAllPlayers = combinedAllPlayers.reduce((acc, current) => {
              const x = acc.find(item => item.id === current.id);
              if (!x) {
                return acc.concat([current]);
              } else {
                // Prefer registered player data over pending player data
                return acc.map(item => item.id === current.id ? current : item);
              }
            }, []);

            return (
              <PlayerManagementSection
                userRole="superadmin"
                kycRequests={kycRequestsData}
                setKycRequests={(updater) => {
                  if (typeof updater === 'function') {
                    const updated = updater(kycRequestsData);
                    // Update allPlayers when KYC is approved/rejected
                    updated.forEach(kycReq => {
                      if (kycReq.status === "Approved") {
                        setAllPlayers(prev => prev.map(p => 
                          p.id === kycReq.playerId 
                            ? { ...p, kycStatus: "approved", verifiedDate: new Date().toISOString().split('T')[0] }
                            : p
                        ));
                      } else if (kycReq.status === "Rejected") {
                        setAllPlayers(prev => prev.map(p => 
                          p.id === kycReq.playerId 
                            ? { ...p, kycStatus: "rejected" }
                            : p
                        ));
                      }
                    });
                  }
                }}
                allPlayers={uniqueAllPlayers}
                setAllPlayers={(updater) => {
                  if (typeof updater === 'function') {
                    const updated = updater(uniqueAllPlayers);
                    // Update registeredPlayers and allPlayers based on updates
                    updated.forEach(updatedPlayer => {
                      const isRegistered = registeredPlayers.find(rp => rp.id === updatedPlayer.id);
                      if (isRegistered) {
                        setRegisteredPlayers(prev => prev.map(p =>
                          p.id === updatedPlayer.id
                            ? { ...p, accountStatus: updatedPlayer.status }
                            : p
                        ));
                      } else {
                        setAllPlayers(prev => prev.map(p =>
                          p.id === updatedPlayer.id
                            ? { ...p, accountStatus: updatedPlayer.status }
                            : p
                        ));
                      }
                    });
                  }
                }}
              />
            );
          })()}

          {/* Legacy Players - KYC Pending Review (removed, using PlayerManagementSection above) */}
          {false && activeItem === "Players" && (
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
                        onChange={(e) => setPlayersFilter({ ...playersFilter, registrationDate: e.target.value })}
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
                        onChange={(e) => setPlayersFilter({ ...playersFilter, documentType: e.target.value })}
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
                        setPlayersFilter({ kycStatus: "pending", registrationDate: "all", documentType: "all" });
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

          {/* Registered Players - Removed, now using Player Management section above */}
          {false && activeItem === "Registered Players" && (
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
                      <CustomSelect
                        className="w-full"
                        value={registeredPlayersFilter.status}
                        onChange={(e) => setRegisteredPlayersFilter({ ...registeredPlayersFilter, status: e.target.value })}
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
                        onChange={(e) => setRegisteredPlayersFilter({ ...registeredPlayersFilter, registrationDate: e.target.value })}
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
                        onChange={(e) => setRegisteredPlayersFilter({ ...registeredPlayersFilter, documentType: e.target.value })}
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
                      Showing <span className="font-semibold">{filteredRegisteredPlayers.length}</span> of <span className="font-semibold">{registeredPlayers.length}</span> verified players
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setRegisteredPlayersSearch("");
                          setSelectedRegisteredPlayer(null);
                          setRegisteredPlayersFilter({ status: "all", registrationDate: "all", documentType: "all", verifiedDate: "all" });
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
                            <div className="md:col-span-8 space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="font-semibold text-white text-lg">{player.name}</div>
                                <span className={`px-3 py-1 rounded-full text-xs border font-medium ${player.accountStatus === "Active"
                                  ? "bg-green-500/30 text-green-300 border-green-400/50"
                                  : player.accountStatus === "Suspended"
                                    ? "bg-red-500/30 text-red-300 border-red-400/50"
                                    : "bg-gray-500/30 text-gray-300 border-gray-400/50"
                                  }`}>
                                  {player.accountStatus}
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
                                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() => setSelectedPlayerDetails(player)}
                                >
                                  View Details
                                </button>
                                <button
                                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() => handleDownloadKYCDoc(player.id, player.kycDocUrl)}
                                >
                                  Download KYC
                                </button>
                              </div>
                              <div className="flex gap-2">
                                {player.accountStatus === "Active" ? (
                                  <button
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                    onClick={() => {
                                      setRegisteredPlayers(prev => prev.map(p => p.id === player.id ? { ...p, accountStatus: "Suspended" } : p));
                                      alert(`Player ${player.name} has been suspended`);
                                    }}
                                  >
                                    Suspend
                                  </button>
                                ) : (
                                  <button
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                    onClick={() => {
                                      setRegisteredPlayers(prev => prev.map(p => p.id === player.id ? { ...p, accountStatus: "Active" } : p));
                                      alert(`Player ${player.name} has been activated`);
                                    }}
                                  >
                                    Activate
                                  </button>
                                )}
                                <button
                                  className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete ${player.name}?`)) {
                                      setRegisteredPlayers(prev => prev.filter(p => p.id !== player.id));
                                      alert(`Player ${player.name} has been deleted`);
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
                          : "No registered players"}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Player Details Modal */}
              {selectedPlayerDetails && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedPlayerDetails(null)}>
                  <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">Player Details</h3>
                      <button
                        onClick={() => setSelectedPlayerDetails(null)}
                        className="text-gray-400 hover:text-white text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-3 text-white">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-gray-400">Name:</span> <span className="font-semibold">{selectedPlayerDetails.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">ID:</span> <span className="font-semibold">{selectedPlayerDetails.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Email:</span> <span>{selectedPlayerDetails.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Phone:</span> <span>{selectedPlayerDetails.phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Account Status:</span> <span className={`font-semibold ${selectedPlayerDetails.accountStatus === "Active" ? "text-green-400" : "text-red-400"}`}>{selectedPlayerDetails.accountStatus}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Document Type:</span> <span>{selectedPlayerDetails.documentType}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Registration Date:</span> <span>{new Date(selectedPlayerDetails.registrationDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Verified Date:</span> <span>{new Date(selectedPlayerDetails.verifiedDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Games:</span> <span>{selectedPlayerDetails.totalGames}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Last Active:</span> <span>{selectedPlayerDetails.lastActive}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <span className="text-gray-400">Verification Notes:</span>
                        <p className="text-white mt-1">{selectedPlayerDetails.verificationNotes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeItem === "Session Control" && (
            <SessionControl
              tables={tables}
              setTables={setTables}
              userRole="super_admin"
            />
          )}

          {activeItem === "Staff Management" && (
            <div className="space-y-6">
              <StaffManagement />
            </div>
          )}

          {activeItem === "Credit Approvals" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-orange-700/30 rounded-xl shadow-md border border-amber-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Exclusive Player Credit System</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Pending Requests</h3>
                    <div className="space-y-2">
                      {creditRequests.map((r) => (
                        <div key={r.id} className="bg-white/5 p-3 rounded border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="text-white font-semibold">{r.player} • ₹{r.amount.toLocaleString('en-IN')}</div>
                            <span className={`text-xs px-2 py-1 rounded ${r.status === 'Approved' ? 'bg-green-500/30 text-green-300' : r.status === 'Denied' ? 'bg-red-500/30 text-red-300' : 'bg-yellow-500/30 text-yellow-300'}`}>{r.status}</span>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm" onClick={() => approveCredit(r.id)}>Approve</button>
                            <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm" onClick={() => denyCredit(r.id)}>Deny</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Dynamic Visibility & Limits</h3>
                    <div className="space-y-3">
                      {creditRequests.map((r) => (
                        <div key={`${r.id}-ctl`} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="text-white text-sm">
                            <div className="font-semibold">{r.player}</div>
                            <div className="text-white/70">Visible: {r.visibleToPlayer ? 'Yes' : 'No'} • Limit: ₹{r.limit.toLocaleString('en-IN')}</div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm" onClick={() => setCreditRequests(prev => prev.map(x => x.id === r.id ? { ...x, visibleToPlayer: !x.visibleToPlayer } : x))}>{r.visibleToPlayer ? 'Hide' : 'Show'}</button>
                            <input type="number" className="w-28 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="Set limit" onChange={(e) => setCreditRequests(prev => prev.map(x => x.id === r.id ? { ...x, limit: Number(e.target.value) || 0 } : x))} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Financial Overrides" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Financial Overrides</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Edit / Cancel Transactions</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {transactions.map((t) => (
                        <div key={t.id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="text-white">
                            <div className="font-semibold">{t.type} • {t.player}</div>
                            <div className="text-sm text-white/70">{t.id} • ₹{t.amount.toLocaleString('en-IN')} • {t.status}</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                            <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm" onClick={() => setTransactions(prev => prev.filter(x => x.id !== t.id))}>Cancel</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Cashouts & Bonuses</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input type="text" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Player ID" />
                        <input type="number" className="w-32 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Amount" />
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">Process Cashout</button>
                        <button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">Approve Bonus</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Bonus Creation Section */}
                <div className="mt-6">
                  <div className="p-6 bg-gradient-to-r from-yellow-600/30 via-amber-500/20 to-orange-700/30 rounded-xl shadow-md border border-yellow-800/40">
                    <h2 className="text-xl font-bold text-white mb-6">Create Custom Bonus</h2>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <div className="space-y-4">
                        {/* Player Search */}
                        <div className="relative">
                          <label className="text-white text-sm mb-1 block">Select Player</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                            placeholder="Type at least 2 characters to search..."
                            value={bonusPlayerSearch}
                            onChange={(e) => {
                              setBonusPlayerSearch(e.target.value);
                              setSelectedBonusPlayer(null);
                            }}
                          />
                          {bonusPlayerSearch.length >= 2 && filteredPlayersForBonus.length > 0 && !selectedBonusPlayer && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredPlayersForBonus.map(player => (
                                <div
                                  key={player.id}
                                  onClick={() => {
                                    setSelectedBonusPlayer(player);
                                    setBonusPlayerSearch(`${player.name} (${player.id})`);
                                  }}
                                  className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                                >
                                  <div className="text-white font-medium">{player.name}</div>
                                  <div className="text-gray-400 text-xs">ID: {player.id} | Email: {player.email || 'N/A'}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {selectedBonusPlayer && (
                            <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm flex items-center justify-between">
                              <span className="text-green-300">Selected: {selectedBonusPlayer.name} ({selectedBonusPlayer.id})</span>
                              <button
                                onClick={() => {
                                  setSelectedBonusPlayer(null);
                                  setBonusPlayerSearch("");
                                }}
                                className="ml-2 text-red-400 hover:text-red-300 font-bold"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Bonus Type */}
                        <div>
                          <label className="text-white text-sm mb-1 block">Bonus Type</label>
                          <CustomSelect
                            className="w-full"
                            value={bonusForm.type}
                            onChange={(e) => setBonusForm({ ...bonusForm, type: e.target.value })}
                          >
                            <option value="Welcome Bonus">Welcome Bonus</option>
                            <option value="Loyalty Bonus">Loyalty Bonus</option>
                            <option value="Referral Bonus">Referral Bonus</option>
                            <option value="Tournament Bonus">Tournament Bonus</option>
                            <option value="Special Event Bonus">Special Event Bonus</option>
                            <option value="Custom Bonus">Custom Bonus</option>
                          </CustomSelect>
                        </div>

                        {/* Bonus Amount */}
                        <div>
                          <label className="text-white text-sm mb-1 block">Bonus Amount (₹)</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                            placeholder="₹0.00"
                            value={bonusForm.amount}
                            onChange={(e) => setBonusForm({ ...bonusForm, amount: e.target.value })}
                          />
                        </div>

                        {/* Expiry Days */}
                        <div>
                          <label className="text-white text-sm mb-1 block">Expiry (Days)</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                            placeholder="30"
                            value={bonusForm.expiryDays}
                            onChange={(e) => setBonusForm({ ...bonusForm, expiryDays: parseInt(e.target.value) || 30 })}
                            min="1"
                          />
                        </div>

                        {/* Reason */}
                        <div>
                          <label className="text-white text-sm mb-1 block">Reason / Notes</label>
                          <textarea
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                            rows="3"
                            placeholder="Enter reason for this bonus..."
                            value={bonusForm.reason}
                            onChange={(e) => setBonusForm({ ...bonusForm, reason: e.target.value })}
                          ></textarea>
                        </div>

                        {/* Create Bonus Button */}
                        <button
                          onClick={handleCreateBonus}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-4 py-3 rounded-lg font-semibold shadow-lg transition-all"
                        >
                          ✨ Create Bonus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Table Management" && (
            <TableManagementSection
              userRole="superadmin"
              tables={tables}
              setTables={setTables}
              dealers={dealers}
              // Seating
              waitlist={waitlist}
              setWaitlist={setWaitlist}
              occupiedSeats={occupiedSeats}
              isSeatAvailable={isSeatAvailable}
              handleAssignPreferredSeat={handleAssignPreferredSeat}
              handleOpenTableViewForWaitlist={handleOpenTableView}
              onSeatAssign={handleSeatAssign}
              // Live tables (SuperAdmin can view + seat via hologram)
              mockPlayers={superAdminMockPlayers}
              playerBalances={{}}
              tableBalances={{}}
              liveTablePlayerSearch={liveTablePlayerSearch}
              setLiveTablePlayerSearch={setLiveTablePlayerSearch}
              selectedLiveTablePlayer={selectedLiveTablePlayer}
              setSelectedLiveTablePlayer={setSelectedLiveTablePlayer}
              buyInAmount={buyInAmount}
              setBuyInAmount={setBuyInAmount}
              // TableView modal control (owned by TableManagementSection)
              showTableView={showTableView}
              setShowTableView={setShowTableView}
              selectedPlayerForSeating={selectedPlayerForSeating}
              setSelectedPlayerForSeating={setSelectedPlayerForSeating}
              selectedTableForSeating={selectedTableForSeating}
              setSelectedTableForSeating={setSelectedTableForSeating}
            />
          )}



          {/* Tournaments */}
          {activeItem === "Tournaments" && (
            <TournamentManagementSection
              userRole="superadmin"
              tournaments={tournaments}
              setTournaments={setTournaments}
            />
          )}

          {/* Legacy Tournament Section (removed, using TournamentManagementSection above) */}
          {false && activeItem === "Tournaments" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-orange-700/30 rounded-xl shadow-md border border-amber-800/40">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Tournament Management</h2>
                  <button
                    onClick={() => setShowTournamentForm(!showTournamentForm)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all"
                  >
                    {showTournamentForm ? "Cancel" : "➕ Create Tournament"}
                  </button>
                </div>

                {/* Create Tournament Form - Same as before but simplified for space */}
                {showTournamentForm && (
                  <div className="bg-white/10 p-6 rounded-lg border border-amber-400/30 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Tournament</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-white font-semibold border-b border-white/20 pb-2">Basic Information</h4>
                        <div>
                          <label className="text-white text-sm mb-1 block">Tournament Name *</label>
                          <input type="text" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Monday Night Hold'em" value={tournamentForm.name} onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-white text-sm mb-1 block">Tournament Type *</label>
                          <CustomSelect className="w-full" value={tournamentForm.type} onChange={(e) => setTournamentForm({ ...tournamentForm, type: e.target.value })}>
                            {tournamentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                          </CustomSelect>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-white text-sm mb-1 block">Buy-in (₹) *</label>
                            <input type="number" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="1000" value={tournamentForm.buyIn} onChange={(e) => setTournamentForm({ ...tournamentForm, buyIn: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-white text-sm mb-1 block">Entry Fee (₹)</label>
                            <input type="number" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="100" value={tournamentForm.entryFee} onChange={(e) => setTournamentForm({ ...tournamentForm, entryFee: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="text-white text-sm mb-1 block">Starting Chips *</label>
                          <input type="number" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="10000" value={tournamentForm.startingChips} onChange={(e) => setTournamentForm({ ...tournamentForm, startingChips: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-white text-sm mb-1 block">Start Time</label>
                            <input type="datetime-local" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" value={tournamentForm.startTime} onChange={(e) => setTournamentForm({ ...tournamentForm, startTime: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-white text-sm mb-1 block">Max Players (unlimited if blank)</label>
                            <input type="number" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Unlimited" value={tournamentForm.maxPlayers} onChange={(e) => setTournamentForm({ ...tournamentForm, maxPlayers: e.target.value })} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-white font-semibold border-b border-white/20 pb-2">Tournament Rules</h4>
                        <div>
                          <label className="text-white text-sm mb-1 block">Blind Structure *</label>
                          <CustomSelect className="w-full" value={tournamentForm.blindStructure} onChange={(e) => setTournamentForm({ ...tournamentForm, blindStructure: e.target.value })}>
                            {blindStructures.map(structure => <option key={structure} value={structure}>{structure}</option>)}
                          </CustomSelect>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-white text-sm mb-1 block">Number of Levels</label>
                            <input type="number" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="15" value={tournamentForm.blindLevels} onChange={(e) => setTournamentForm({ ...tournamentForm, blindLevels: parseInt(e.target.value) || 15 })} />
                          </div>
                          <div>
                            <label className="text-white text-sm mb-1 block">Minutes per Level</label>
                            <input type="number" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="15" value={tournamentForm.blindInterval} onChange={(e) => setTournamentForm({ ...tournamentForm, blindInterval: parseInt(e.target.value) || 15 })} />
                          </div>
                        </div>
                        <div>
                          <label className="text-white text-sm mb-1 block">Break Structure</label>
                          <CustomSelect className="w-full" value={tournamentForm.breakStructure} onChange={(e) => setTournamentForm({ ...tournamentForm, breakStructure: e.target.value })}>
                            {breakStructures.map(structure => <option key={structure} value={structure}>{structure}</option>)}
                          </CustomSelect>
                        </div>
                        {tournamentForm.breakStructure !== "No breaks" && (
                          <div>
                            <label className="text-white text-sm mb-1 block">Break Duration (minutes)</label>
                            <input type="number" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="10" value={tournamentForm.breakDuration} onChange={(e) => setTournamentForm({ ...tournamentForm, breakDuration: parseInt(e.target.value) || 10 })} />
                          </div>
                        )}
                        <div>
                          <label className="text-white text-sm mb-1 block">Late Registration (minutes)</label>
                          <input type="number" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="60" value={tournamentForm.lateRegistration} onChange={(e) => setTournamentForm({ ...tournamentForm, lateRegistration: parseInt(e.target.value) || 60 })} />
                        </div>
                        <div>
                          <label className="text-white text-sm mb-1 block">Payout Structure</label>
                          <CustomSelect className="w-full" value={tournamentForm.payoutStructure} onChange={(e) => setTournamentForm({ ...tournamentForm, payoutStructure: e.target.value })}>
                            {payoutStructures.map(structure => <option key={structure} value={structure}>{structure}</option>)}
                          </CustomSelect>
                        </div>
                        <div>
                          <label className="text-white text-sm mb-1 block">Seat Draw Method</label>
                          <CustomSelect className="w-full" value={tournamentForm.seatDrawMethod} onChange={(e) => setTournamentForm({ ...tournamentForm, seatDrawMethod: e.target.value })}>
                            <option value="Random">Random</option>
                            <option value="Table Balance">Table Balance</option>
                            <option value="Manual">Manual</option>
                          </CustomSelect>
                        </div>
                        <div>
                          <label className="text-white text-sm mb-1 block">Clock Pause Rules</label>
                          <CustomSelect className="w-full" value={tournamentForm.clockPauseRules} onChange={(e) => setTournamentForm({ ...tournamentForm, clockPauseRules: e.target.value })}>
                            <option value="Standard">Standard (pause on breaks)</option>
                            <option value="No Pause">No Pause</option>
                            <option value="Pause on All-in">Pause on All-in</option>
                            <option value="Custom">Custom</option>
                          </CustomSelect>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-white font-semibold border-b border-white/20 pb-2">Rebuy, Add-on & Re-entry</h4>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="rebuy-allowed" className="w-4 h-4" checked={tournamentForm.rebuyAllowed} onChange={(e) => setTournamentForm({ ...tournamentForm, rebuyAllowed: e.target.checked })} />
                          <label htmlFor="rebuy-allowed" className="text-white text-sm">Allow Rebuys</label>
                        </div>
                        {tournamentForm.rebuyAllowed && (
                          <div className="grid grid-cols-3 gap-3 ml-7">
                            <div>
                              <label className="text-white text-xs mb-1 block">Rebuy Chips</label>
                              <input type="number" className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="10000" value={tournamentForm.rebuyChips} onChange={(e) => setTournamentForm({ ...tournamentForm, rebuyChips: e.target.value })} />
                            </div>
                            <div>
                              <label className="text-white text-xs mb-1 block">Rebuy Fee (₹)</label>
                              <input type="number" className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="1000" value={tournamentForm.rebuyFee} onChange={(e) => setTournamentForm({ ...tournamentForm, rebuyFee: e.target.value })} />
                            </div>
                            <div>
                              <label className="text-white text-xs mb-1 block">Rebuy Period (levels)</label>
                              <input type="number" className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="6" value={tournamentForm.rebuyPeriod} onChange={(e) => setTournamentForm({ ...tournamentForm, rebuyPeriod: e.target.value })} />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="addon-allowed" className="w-4 h-4" checked={tournamentForm.addOnAllowed} onChange={(e) => setTournamentForm({ ...tournamentForm, addOnAllowed: e.target.checked })} />
                          <label htmlFor="addon-allowed" className="text-white text-sm">Allow Add-on</label>
                        </div>
                        {tournamentForm.addOnAllowed && (
                          <div className="grid grid-cols-2 gap-3 ml-7">
                            <div>
                              <label className="text-white text-xs mb-1 block">Add-on Chips</label>
                              <input type="number" className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="10000" value={tournamentForm.addOnChips} onChange={(e) => setTournamentForm({ ...tournamentForm, addOnChips: e.target.value })} />
                            </div>
                            <div>
                              <label className="text-white text-xs mb-1 block">Add-on Fee (₹)</label>
                              <input type="number" className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="500" value={tournamentForm.addOnFee} onChange={(e) => setTournamentForm({ ...tournamentForm, addOnFee: e.target.value })} />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="reentry-allowed" className="w-4 h-4" checked={tournamentForm.reEntryAllowed} onChange={(e) => setTournamentForm({ ...tournamentForm, reEntryAllowed: e.target.checked })} />
                          <label htmlFor="reentry-allowed" className="text-white text-sm">Allow Re-entry</label>
                        </div>
                        {tournamentForm.reEntryAllowed && (
                          <div className="ml-7">
                            <label className="text-white text-xs mb-1 block">Re-entry Period (minutes)</label>
                            <input type="number" className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="60" value={tournamentForm.reEntryPeriod} onChange={(e) => setTournamentForm({ ...tournamentForm, reEntryPeriod: e.target.value })} />
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-white font-semibold border-b border-white/20 pb-2">Bounty Options</h4>
                        <div>
                          <label className="text-white text-sm mb-1 block">Bounty Amount (₹) - Leave blank for regular tournament</label>
                          <input type="number" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="0" value={tournamentForm.bountyAmount} onChange={(e) => setTournamentForm({ ...tournamentForm, bountyAmount: e.target.value })} />
                          <p className="text-xs text-gray-400 mt-1">If set, this becomes a knockout/bounty tournament</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button onClick={handleCreateTournament} className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all">
                        Create Tournament
                      </button>
                      <button onClick={() => setShowTournamentForm(false)} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Tournaments List */}
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Tournaments ({tournaments.length})</h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {tournaments.length > 0 ? (
                      tournaments.map(tournament => (
                        <div key={tournament.id} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer" onClick={() => setSelectedTournament(tournament)}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-semibold text-lg">{tournament.name}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tournament.status === "Active" ? "bg-green-500/30 text-green-300 border border-green-400/50" : tournament.status === "Scheduled" ? "bg-blue-500/30 text-blue-300 border border-blue-400/50" : "bg-gray-500/30 text-gray-300 border border-gray-400/50"}`}>
                                  {tournament.status}
                                </span>
                                <span className="px-2 py-1 rounded text-xs bg-purple-500/30 text-purple-300 border border-purple-400/50">{tournament.type}</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300">
                                <div><span className="text-gray-400">Buy-in:</span> <span className="text-white font-semibold">₹{tournament.buyIn.toLocaleString('en-IN')}</span></div>
                                <div><span className="text-gray-400">Starting Chips:</span> <span className="text-white font-semibold">{tournament.startingChips.toLocaleString('en-IN')}</span></div>
                                <div><span className="text-gray-400">Registered:</span> <span className="text-white font-semibold">{tournament.registeredPlayers}{tournament.maxPlayers ? `/${tournament.maxPlayers}` : '/∞'}</span></div>
                                <div><span className="text-gray-400">Start:</span> <span className="text-white">{new Date(tournament.startTime).toLocaleString('en-IN')}</span></div>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {tournament.rebuyAllowed && <span className="px-2 py-1 rounded text-xs bg-yellow-500/30 text-yellow-300 border border-yellow-400/50">Rebuy</span>}
                                {tournament.addOnAllowed && <span className="px-2 py-1 rounded text-xs bg-blue-500/30 text-blue-300 border border-blue-400/50">Add-on</span>}
                                {tournament.reEntryAllowed && <span className="px-2 py-1 rounded text-xs bg-purple-500/30 text-purple-300 border border-purple-400/50">Re-entry</span>}
                                {tournament.bountyAmount > 0 && <span className="px-2 py-1 rounded text-xs bg-red-500/30 text-red-300 border border-red-400/50">Bounty ₹{tournament.bountyAmount}</span>}
                                <span className="px-2 py-1 rounded text-xs bg-indigo-500/30 text-indigo-300 border border-indigo-400/50">{tournament.blindStructure}</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <button onClick={(e) => { e.stopPropagation(); setSelectedTournament(tournament); }} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">View Details</button>
                              {tournament.status === "Scheduled" && <button onClick={(e) => { e.stopPropagation(); setTournaments(prev => prev.map(t => t.id === tournament.id ? { ...t, status: "Active" } : t)); alert(`Tournament "${tournament.name}" started!`); }} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">Start</button>}
                              <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete tournament "${tournament.name}"?`)) { setTournaments(prev => prev.filter(t => t.id !== tournament.id)); } }} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">Delete</button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <div className="text-lg mb-2">No tournaments created yet</div>
                        <div className="text-sm">Click "Create Tournament" to get started</div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Tournament Details Modal */}
              {selectedTournament && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTournament(null)}>
                  <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl border border-amber-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6 border-b border-white/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">{selectedTournament.name}</h2>
                          <p className="text-gray-400 text-sm">Tournament Details & Settings</p>
                        </div>
                        <button onClick={() => setSelectedTournament(null)} className="text-white/70 hover:text-white text-2xl font-bold">×</button>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Basic Info</h3>
                          <div className="space-y-3">
                            <div><label className="text-gray-400 text-xs">Tournament ID</label><div className="text-white font-medium">{selectedTournament.id}</div></div>
                            <div><label className="text-gray-400 text-xs">Type</label><div className="text-white">{selectedTournament.type}</div></div>
                            <div><label className="text-gray-400 text-xs">Status</label><div><span className={`px-3 py-1 rounded-full text-xs border font-medium ${selectedTournament.status === "Active" ? "bg-green-500/30 text-green-300 border-green-400/50" : selectedTournament.status === "Scheduled" ? "bg-blue-500/30 text-blue-300 border-blue-400/50" : "bg-gray-500/30 text-gray-300 border-gray-400/50"}`}>{selectedTournament.status}</span></div></div>
                            <div><label className="text-gray-400 text-xs">Buy-in</label><div className="text-white font-semibold">₹{selectedTournament.buyIn.toLocaleString('en-IN')}</div></div>
                            <div><label className="text-gray-400 text-xs">Entry Fee</label><div className="text-white">₹{selectedTournament.entryFee.toLocaleString('en-IN')}</div></div>
                            <div><label className="text-gray-400 text-xs">Starting Chips</label><div className="text-white font-semibold">{selectedTournament.startingChips.toLocaleString('en-IN')}</div></div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Structure</h3>
                          <div className="space-y-3">
                            <div><label className="text-gray-400 text-xs">Blind Structure</label><div className="text-white">{selectedTournament.blindStructure}</div></div>
                            <div><label className="text-gray-400 text-xs">Blind Levels</label><div className="text-white">{selectedTournament.blindLevels} levels</div></div>
                            <div><label className="text-gray-400 text-xs">Break Structure</label><div className="text-white">{selectedTournament.breakStructure}</div></div>
                            <div><label className="text-gray-400 text-xs">Payout Structure</label><div className="text-white">{selectedTournament.payoutStructure}</div></div>
                            <div><label className="text-gray-400 text-xs">Players</label><div className="text-white">{selectedTournament.registeredPlayers}{selectedTournament.maxPlayers ? ` / ${selectedTournament.maxPlayers}` : " / Unlimited"}</div></div>
                            <div><label className="text-gray-400 text-xs">Start Time</label><div className="text-white">{new Date(selectedTournament.startTime).toLocaleString('en-IN')}</div></div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Rules & Options</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-white/5 rounded border border-white/10">
                            <div className="text-xs text-gray-400 mb-1">Rebuy</div>
                            <div className={`text-sm font-semibold ${selectedTournament.rebuyAllowed ? 'text-green-300' : 'text-gray-500'}`}>{selectedTournament.rebuyAllowed ? '✓ Allowed' : '✗ Not Allowed'}</div>
                          </div>
                          <div className="text-center p-3 bg-white/5 rounded border border-white/10">
                            <div className="text-xs text-gray-400 mb-1">Add-on</div>
                            <div className={`text-sm font-semibold ${selectedTournament.addOnAllowed ? 'text-green-300' : 'text-gray-500'}`}>{selectedTournament.addOnAllowed ? '✓ Allowed' : '✗ Not Allowed'}</div>
                          </div>
                          <div className="text-center p-3 bg-white/5 rounded border border-white/10">
                            <div className="text-xs text-gray-400 mb-1">Re-entry</div>
                            <div className={`text-sm font-semibold ${selectedTournament.reEntryAllowed ? 'text-green-300' : 'text-gray-500'}`}>{selectedTournament.reEntryAllowed ? '✓ Allowed' : '✗ Not Allowed'}</div>
                          </div>
                          <div className="text-center p-3 bg-white/5 rounded border border-white/10">
                            <div className="text-xs text-gray-400 mb-1">Bounty</div>
                            <div className={`text-sm font-semibold ${selectedTournament.bountyAmount > 0 ? 'text-red-300' : 'text-gray-500'}`}>{selectedTournament.bountyAmount > 0 ? `₹${selectedTournament.bountyAmount}` : 'None'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button onClick={() => { setSelectedTournament(null); setShowTournamentForm(true); }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold">Edit Tournament</button>
                        <button onClick={() => setSelectedTournament(null)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold">Close</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIP Store */}
          {activeItem === "VIP Store" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">VIP Store Management - {selectedClub?.name}</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Products (Club)</h3>
                    <div className="mb-4">
                      <label className="text-white text-sm mb-2 block">Select Club</label>
                      <CustomSelect
                        className="w-full mb-4"
                        value={selectedClubId}
                        onChange={(e) => setSelectedClubId(e.target.value)}
                      >
                        {clubs.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </CustomSelect>
                    </div>
                    <div className="flex flex-col gap-3 mb-3">
                      <div className="flex gap-2">
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
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            id="vip-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const fileName = e.target.files[0]?.name;
                              if (fileName) document.getElementById('vip-image-label').innerText = fileName;
                            }}
                          />
                          <label
                            id="vip-image-label"
                            htmlFor="vip-image"
                            className="block w-full px-3 py-2 bg-white/10 border border-white/20 border-dashed rounded text-gray-400 cursor-pointer hover:bg-white/20 truncate"
                          >
                            Choose Product Image
                          </label>
                        </div>
                        <button
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded font-bold"
                          onClick={() => {
                            const t = document.getElementById('vip-title');
                            const p = document.getElementById('vip-points');
                            const i = document.getElementById('vip-image');

                            const title = t && 'value' in t ? t.value : '';
                            const pts = p && 'value' in p ? parseInt(p.value || '0', 10) : 0;
                            const file = i && i.files && i.files[0] ? i.files[0] : null;

                            if (title.trim() && pts > 0) {
                              let imageUrl = "https://placehold.co/100x100/333/FFF?text=Product";
                              if (file) {
                                imageUrl = URL.createObjectURL(file);
                              }

                              setVipProducts(prev => [...prev, {
                                id: `vip-${Date.now()}`,
                                clubId: selectedClubId,
                                title,
                                points: pts,
                                image: imageUrl
                              }]);

                              if (t) t.value = '';
                              if (p) p.value = '';
                              if (i) i.value = '';
                              document.getElementById('vip-image-label').innerText = "Choose Product Image";
                            } else {
                              alert("Please enter product name and points");
                            }
                          }}
                        >
                          Add Product
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {vipProducts.filter(v => v.clubId === selectedClubId).map(v => (
                        <div key={v.id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-gray-700 overflow-hidden flex-shrink-0">
                              {v.image && <img src={v.image} alt={v.title} className="w-full h-full object-cover" />}
                            </div>
                            <div className="text-white text-sm font-medium">{v.title}</div>
                          </div>
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
                      {vipProducts.filter(v => v.clubId === selectedClubId).length === 0 && (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No products for this club. Add products above.
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

              {/* All Clubs VIP Products Overview */}
              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <h2 className="text-xl font-bold text-white mb-6">All Clubs VIP Products Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {clubs.map(club => {
                    const clubProducts = vipProducts.filter(v => v.clubId === club.id);
                    return (
                      <div key={club.id} className="bg-white/10 p-4 rounded-lg border border-white/10">
                        <div className="font-semibold text-white mb-2">{club.name}</div>
                        <div className="text-sm text-gray-300 mb-3">
                          {clubProducts.length} product{clubProducts.length !== 1 ? 's' : ''}
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {clubProducts.length > 0 ? (
                            clubProducts.map(product => (
                              <div key={product.id} className="bg-white/5 p-2 rounded text-xs flex gap-2 items-center">
                                <div className="w-8 h-8 rounded bg-gray-800 flex-shrink-0 overflow-hidden">
                                  {product.image && <img src={product.image} alt={product.title} className="w-full h-full object-cover" />}
                                </div>
                                <div className="overflow-hidden">
                                  <div className="text-white truncate" title={product.title}>{product.title}</div>
                                  <div className="text-purple-300">{product.points} pts</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-400">No products</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {activeItem === "Analytics & Reports" && (
            <div className="space-y-6">
              {/* Report Type Selection */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Generate Reports</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Report Configuration</h3>
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="text-white text-sm mb-2 block">Select Report Type</label>
                        <CustomSelect
                          className="w-full"
                          value={selectedReportType}
                          onChange={(e) => {
                            setSelectedReportType(e.target.value);
                            setReportData(null);
                            if (e.target.value !== "individual_player") setSelectedPlayerForReport(null);
                            if (e.target.value !== "custom") setCustomReportSelection([]);
                          }}
                          placeholder="-- Select Report Type --"
                          allowSearch
                        >
                          <option value="w-full">-- Select Report Type --</option>
                          {reportTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                          ))}
                        </CustomSelect>
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
                          <CustomSelect
                            className="w-full"
                            value={selectedTableForReport}
                            onChange={(e) => setSelectedTableForReport(e.target.value)}
                          >
                            <option value="">All Tables</option>
                            <option value="Table 1">Table 1</option>
                            <option value="Table 2">Table 2</option>
                            <option value="Table 3">Table 3</option>
                            <option value="Table 4">Table 4</option>
                          </CustomSelect>
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
                              onChange={(e) => setReportDateRange({ ...reportDateRange, start: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs">End Date</label>
                            <input
                              type="date"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                              value={reportDateRange.end}
                              onChange={(e) => setReportDateRange({ ...reportDateRange, end: e.target.value })}
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
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`p-4 rounded-lg border transition-all ${selectedReportType === type.id
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
                                      const player = allPlayersForReport.find(p => p.id === report.player);
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
                                      r.id === report.id ? { ...r, name: newName } : r
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
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${(selectedReferralAgent || "").toLowerCase() === (agent || "").toLowerCase()
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
                                <span className={`px-2 py-1 rounded text-xs text-center font-semibold ${player.accountStatus === "Active"
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
                          className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded text-white ${notificationErrors.title ? 'border-red-500' : 'border-white/20'
                            }`}
                          placeholder="Enter title"
                          value={notificationForm.title}
                          onChange={(e) => {
                            setNotificationForm({ ...notificationForm, title: e.target.value });
                            setNotificationErrors({ ...notificationErrors, title: null });
                          }}
                        />
                        {notificationErrors.title && (
                          <p className="text-red-400 text-xs mt-1">{notificationErrors.title}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-white text-sm">Message</label>
                        <textarea
                          className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded text-white ${notificationErrors.message ? 'border-red-500' : 'border-white/20'
                            }`}
                          rows="3"
                          placeholder="Enter message..."
                          value={notificationForm.message}
                          onChange={(e) => {
                            setNotificationForm({ ...notificationForm, message: e.target.value });
                            setNotificationErrors({ ...notificationErrors, message: null });
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
                          onChange={(e) => setNotificationForm({ ...notificationForm, audience: e.target.value })}
                        >
                          {getAudienceOptions().map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
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
                                id="image-upload-super-admin"
                                onChange={handleImageUpload}
                              />
                              <label htmlFor="image-upload-super-admin" className="cursor-pointer">
                                <div className="text-white text-sm mb-1">Click to upload or drag and drop</div>
                                <div className="text-gray-400 text-xs">JPG, PNG, GIF, WebP (max 5MB)</div>
                              </label>
                              {notificationForm.imagePreview && (
                                <div className="mt-3">
                                  <img src={notificationForm.imagePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                                  <button
                                    type="button"
                                    onClick={() => setNotificationForm({ ...notificationForm, imageFile: null, imagePreview: null })}
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
                              className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded text-white text-sm ${notificationErrors.image ? 'border-red-500' : 'border-white/20'
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
                          className={`w-full mt-1 px-3 py-2 bg-white/10 border rounded text-white text-sm ${notificationErrors.video ? 'border-red-500' : 'border-white/20'
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
                      {[{ title: 'Welcome Offer', time: '2h ago' }, { title: 'Table 2 starting soon', time: '10m ago' }].map(n => (
                        <div key={n.title} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="text-white">{n.title}</div>
                          <div className="text-white/60 text-sm">{n.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Custom Groups Management */}
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Custom Notification Groups</h2>
                  <button
                    onClick={() => {
                      setShowGroupForm(true);
                      setEditingGroup(null);
                      setGroupForm({ name: "", type: "player", memberIds: [] });
                      setGroupMemberSearch("");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    ➕ Create Group
                  </button>
                </div>

                {/* Group Form */}
                {showGroupForm && (
                  <div className="bg-white/10 p-6 rounded-lg border border-emerald-400/30 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {editingGroup ? "Edit Group" : "Create New Group"}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm mb-1 block">Group Name *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                          placeholder="Enter group name"
                          value={groupForm.name}
                          onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm mb-1 block">Group Type *</label>
                        <CustomSelect
                          className="w-full"
                          value={groupForm.type}
                          onChange={(e) => {
                            setGroupForm({ ...groupForm, type: e.target.value, memberIds: [] });
                            setGroupMemberSearch("");
                          }}
                        >
                          <option value="player">Player Group</option>
                          <option value="staff">Staff Group</option>
                        </CustomSelect>
                      </div>
                      <div>
                        <label className="text-white text-sm mb-1 block">
                          Add Members ({groupForm.memberIds.length} selected)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white mb-2"
                          placeholder="Search by name, ID, or email..."
                          value={groupMemberSearch}
                          onChange={(e) => setGroupMemberSearch(e.target.value)}
                        />
                        <div className="max-h-48 overflow-y-auto border border-white/20 rounded bg-white/5 p-2 space-y-1">
                          {getAvailableMembers().length > 0 ? (
                            getAvailableMembers().map(member => (
                              <div
                                key={member.id}
                                onClick={() => {
                                  if (!groupForm.memberIds.includes(member.id)) {
                                    setGroupForm({
                                      ...groupForm,
                                      memberIds: [...groupForm.memberIds, member.id]
                                    });
                                  }
                                }}
                                className="p-2 hover:bg-white/10 cursor-pointer rounded text-white text-sm"
                              >
                                {member.name} ({member.id}) - {member.email || member.role}
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-400 text-sm p-2">No members found</div>
                          )}
                        </div>
                      </div>
                      {groupForm.memberIds.length > 0 && (
                        <div>
                          <label className="text-white text-sm mb-1 block">Selected Members</label>
                          <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded border border-white/20">
                            {groupForm.memberIds.map(memberId => {
                              const member = groupForm.type === "player"
                                ? registeredPlayers.find(p => p.id === memberId)
                                : staff.find(s => s.id === memberId);
                              if (!member) return null;
                              return (
                                <div
                                  key={memberId}
                                  className="bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                                >
                                  {member.name}
                                  <button
                                    onClick={() => {
                                      setGroupForm({
                                        ...groupForm,
                                        memberIds: groupForm.memberIds.filter(id => id !== memberId)
                                      });
                                    }}
                                    className="hover:text-red-300"
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveGroup}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          {editingGroup ? "Update Group" : "Create Group"}
                        </button>
                        <button
                          onClick={() => {
                            setShowGroupForm(false);
                            setEditingGroup(null);
                            setGroupForm({ name: "", type: "player", memberIds: [] });
                            setGroupMemberSearch("");
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Groups List */}
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Groups ({customGroups.length})</h3>
                  {customGroups.length > 0 ? (
                    <div className="space-y-3">
                      {customGroups.map(group => {
                        const members = getGroupMembersDetails(group);
                        return (
                          <div key={group.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-semibold text-lg">{group.name}</h4>
                                  <span className={`px-2 py-1 rounded text-xs ${group.type === "player"
                                    ? "bg-blue-500/30 text-blue-300 border border-blue-400/50"
                                    : "bg-purple-500/30 text-purple-300 border border-purple-400/50"
                                    }`}>
                                    {group.type === "player" ? "Player Group" : "Staff Group"}
                                  </span>
                                </div>
                                <div className="text-gray-400 text-sm">
                                  {members.length} member(s)
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditGroup(group)}
                                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            {members.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {members.slice(0, 5).map(member => (
                                  <div
                                    key={member.id}
                                    className="bg-white/5 text-gray-300 px-2 py-1 rounded text-xs"
                                  >
                                    {member.name}
                                  </div>
                                ))}
                                {members.length > 5 && (
                                  <div className="bg-white/5 text-gray-400 px-2 py-1 rounded text-xs">
                                    +{members.length - 5} more
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No custom groups created yet. Click "Create Group" to get started.
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Player Support - Chat System */}
          {activeItem === "Player Support" && (
            <ChatSection
              userRole="superadmin"
              playerChats={playerChats}
              setPlayerChats={setPlayerChats}
              staffChats={staffChats}
              setStaffChats={setStaffChats}
            />
          )}

          {activeItem === "Global Settings" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-gray-600/30 via-slate-500/20 to-zinc-700/30 rounded-xl shadow-md border border-gray-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Global Settings</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">General</h3>
                    <div className="space-y-3">
                      <input type="text" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Club Name" />
                      <CustomSelect className="w-full">
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                      </CustomSelect>
                      <CustomSelect className="w-full">
                        <option>Asia/Kolkata</option>
                        <option>America/New_York</option>
                        <option>Europe/London</option>
                      </CustomSelect>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Two-Factor Authentication</span>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">Enable</button>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-white">Session Timeout</span>
                        <CustomSelect className="min-w-[160px]">
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                        </CustomSelect>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Password Rotation (days)</span>
                        <input type="number" className="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="90" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Logs & Audits" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Audit Logs & Backups</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Audit Log</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {[
                        'User admin edited player P001',
                        'Cashout override approved by super admin',
                        'Backup completed successfully',
                        'Login failed for user jsmith'
                      ].map((line, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded border border-white/10 text-white/90 text-sm">{line}</div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Backup & Error Logs</h3>
                    <div className="space-y-3">
                      <div className="bg-white/5 p-3 rounded border border-white/10 text-white/90 text-sm">backup-2025-10-23-0200.tar.gz</div>
                      <div className="bg-white/5 p-3 rounded border border-white/10 text-white/90 text-sm">errors-2025-10-23.log</div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">Download Backup</button>
                        <button className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">Download Errors</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "System Control" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-gray-700/30 via-zinc-600/20 to-slate-700/30 rounded-xl shadow-md border border-gray-700/40">
                <h2 className="text-xl font-bold text-white mb-6">System Control</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="space-y-3">
                    <p className="text-white/80">Factory Reset clears local data and resets the UI. Use with caution.</p>
                    <button onClick={factoryReset} className="w-full bg-red-700 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold">Factory Reset</button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Affiliates" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Affiliate Management</h2>
                <button
                  onClick={() => setShowAffiliateModal(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  + Add Affiliate
                </button>
              </div>

              {/* Affiliates Table */}
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="text-gray-400 border-b border-gray-700 text-sm uppercase">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">KYC Status</th>
                      <th className="py-3 px-4">Referrals</th>
                      <th className="py-3 px-4">Earnings</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {affiliates.map((aff) => (
                      <tr key={aff.id} className="hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => setViewingAffiliate(aff)}>
                        <td className="py-4 px-4 font-medium">{aff.name}</td>
                        <td className="py-4 px-4 text-gray-400">{aff.email}</td>
                        <td className="py-4 px-4 font-mono text-yellow-500">{aff.referralCode}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${aff.kycStatus === 'Verified' ? 'bg-green-900/50 text-green-400' :
                            aff.kycStatus === 'Pending' ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-red-900/50 text-red-400'
                            }`}>
                            {aff.kycStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-blue-400">{aff.totalReferrals}</td>
                        <td className="py-4 px-4 text-green-400">₹{aff.earnings.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <span className={`w-2 h-2 inline-block rounded-full mr-2 ${aff.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                          {aff.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Affiliate Modal */}
      {showAffiliateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add New Affiliate</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  value={newAffiliate.name}
                  onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 focus:border-indigo-500 outline-none"
                  placeholder="John Agent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  value={newAffiliate.email}
                  onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 focus:border-indigo-500 outline-none"
                  placeholder="agent@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Referral Code</label>
                <input
                  value={newAffiliate.referralCode}
                  onChange={(e) => setNewAffiliate({ ...newAffiliate, referralCode: e.target.value })}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 focus:border-indigo-500 outline-none uppercase font-mono"
                  placeholder="AGENT2025"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAffiliateModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAffiliate}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-bold shadow-lg"
                >
                  Create Affiliate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Affiliate Details Overlay */}
      {viewingAffiliate && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto">
          <div className="min-h-screen p-8 max-w-5xl mx-auto">
            <button
              onClick={() => setViewingAffiliate(null)}
              className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
            >
              ← Back to List
            </button>

            <div className="bg-gray-900 border border-t-4 border-t-indigo-500 rounded-2xl p-8 mb-8 shadow-2xl bg-gradient-to-r from-gray-900 to-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{viewingAffiliate.name}</h2>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>Ref Code: <span className="text-yellow-400 font-mono">{viewingAffiliate.referralCode}</span></span>
                    <span>•</span>
                    <span>{viewingAffiliate.email}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Total Earnings</div>
                  <div className="text-3xl font-bold text-green-400">₹{viewingAffiliate.earnings.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
                  <div className="text-xs text-gray-500 uppercase">KYC Status</div>
                  <div className={`text-lg font-bold ${viewingAffiliate.kycStatus === 'Verified' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {viewingAffiliate.kycStatus}
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
                  <div className="text-xs text-gray-500 uppercase">Status</div>
                  <div className="text-lg font-bold text-white">{viewingAffiliate.status}</div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
                  <div className="text-xs text-gray-500 uppercase">Total Referrals</div>
                  <div className="text-lg font-bold text-blue-400">{viewingAffiliate.totalReferrals}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-gray-700 bg-gray-800/50">
                <h3 className="text-xl font-bold">Referred Players</h3>
                <p className="text-gray-400 text-sm">Users who signed up using {viewingAffiliate.name}'s code</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-gray-400 border-b border-gray-700 text-sm uppercase bg-gray-900/50">
                    <tr>
                      <th className="py-3 px-6">Player Name</th>
                      <th className="py-3 px-6">Email</th>
                      <th className="py-3 px-6">Joined Date</th>
                      <th className="py-3 px-6">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {getReferredUsers(viewingAffiliate.referralCode).length > 0 ? (
                      getReferredUsers(viewingAffiliate.referralCode).map((user, idx) => (
                        <tr key={user.id || idx} className="hover:bg-gray-700/30">
                          <td className="py-4 px-6 font-medium text-white">{user.name}</td>
                          <td className="py-4 px-6 text-gray-400">{user.email}</td>
                          <td className="py-4 px-6 text-gray-400">{user.registrationDate || "N/A"}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.accountStatus === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
                              }`}>
                              {user.accountStatus || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-500">
                          No referred users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Affiliate Credentials Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-green-500/50 rounded-2xl p-8 w-full max-w-md relative shadow-2xl bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Affiliate Created!</h3>
              <p className="text-gray-400 mt-2">Share these credentials with {createdCredentials.name}</p>
            </div>

            <div className="space-y-4 bg-black/40 p-6 rounded-xl border border-gray-700">
              <div>
                <label className="text-xs text-gray-500 uppercase font-semibold">Referral Code</label>
                <div className="flex justify-between items-center mt-1">
                  <div className="font-mono text-xl text-yellow-400 font-bold tracking-wider">{createdCredentials.referralCode}</div>
                  <button
                    onClick={() => navigator.clipboard.writeText(createdCredentials.referralCode)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-700/50 pt-4">
                <label className="text-xs text-gray-500 uppercase font-semibold">Temporary Password</label>
                <div className="flex justify-between items-center mt-1">
                  <div className="font-mono text-xl text-green-400 font-bold tracking-wider">{createdCredentials.password}</div>
                  <button
                    onClick={() => navigator.clipboard.writeText(createdCredentials.password)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setCreatedCredentials(null)}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}


