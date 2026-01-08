import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomSelect from "../../components/common/CustomSelect";
import TableView from "../../components/hologram/TableView";
import TableManagementSection from "../../components/TableManagementSection";
import SessionControl from "../../components/SessionControl";
import PlayerManagementSection from "../../components/PlayerManagementSection";
import TournamentManagementSection from "../../components/TournamentManagementSection";
import ChatSection from "../../components/ChatSection";
import PushNotificationsSection from "../../components/PushNotificationsSection";
import EmployeeSalaryProcessingSection from "../../components/EmployeeSalaryProcessingSection";
import RakeCountAndCollection from "../../components/RakeCountAndCollection";
import ManagerSidebar from "../../components/sidebars/ManagerSidebar";
import LeaveManagement from "../../components/LeaveManagement";

export default function ManagerDashboardPage() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const navigate = useNavigate();

  // State for session control
  // const [selectedTable, setSelectedTable] = useState(null);
  // const [sessionParams, setSessionParams] = useState({
  //   playWindow: 30,
  //   callWindow: 5,
  //   cashoutWindow: 10,
  //   sessionTimeout: 120
  // });

  // Mock table data - in real app, this would come from API
  const [tables, setTables] = useState([
    {
      id: 1,
      name: "Table 1 - Texas Hold'em",
      status: "Active",
      gameType: "Texas Hold'em",
      maxPlayers: 6,
      stakes: "₹1000.00/10000.00",
    },
    {
      id: 2,
      name: "Table 2 - Omaha",
      status: "Paused",
      gameType: "Omaha",
      maxPlayers: 9,
      stakes: "₹5000.00/50000.00",
    },
    {
      id: 3,
      name: "Table 3 - Stud",
      status: "Ended",
      gameType: "Seven Card Stud",
      maxPlayers: 6,
      stakes: "₹10000.00/100000.00",
    },
  ]);

  const activeTables = tables.filter((table) => table.status === "Active");

  // Mock dealers data
  const dealers = [
    { id: 1, name: "John" },
    { id: 2, name: "Sarah" },
    { id: 3, name: "Mike" },
  ];

  // Mock players data with balances (connected across all portals)
  const [playerBalances, setPlayerBalances] = useState({
    P001: {
      id: "P001",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      availableBalance: 35000,
      tableBalance: 0,
      tableId: null,
      seatNumber: null,
    },
    P002: {
      id: "P002",
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      availableBalance: 28000,
      tableBalance: 0,
      tableId: null,
      seatNumber: null,
    },
    P003: {
      id: "P003",
      name: "David Wilson",
      email: "david.wilson@example.com",
      availableBalance: 42000,
      tableBalance: 0,
      tableId: null,
      seatNumber: null,
    },
    P101: {
      id: "P101",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      availableBalance: 25000,
      tableBalance: 5000,
      tableId: 1,
      seatNumber: 3,
    },
    P102: {
      id: "P102",
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      availableBalance: 15000,
      tableBalance: 0,
      tableId: null,
      seatNumber: null,
    },
    P103: {
      id: "P103",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      availableBalance: 45000,
      tableBalance: 10000,
      tableId: 1,
      seatNumber: 5,
    },
    P104: {
      id: "P104",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      availableBalance: 32000,
      tableBalance: 0,
      tableId: null,
      seatNumber: null,
    },
    P105: {
      id: "P105",
      name: "Amit Patel",
      email: "amit.patel@example.com",
      availableBalance: 18000,
      tableBalance: 7500,
      tableId: 2,
      seatNumber: 2,
    },
    P106: {
      id: "P106",
      name: "John Doe",
      email: "john.doe@example.com",
      availableBalance: 28000,
      tableBalance: 0,
      tableId: null,
      seatNumber: null,
    },
    P107: {
      id: "P107",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      availableBalance: 35000,
      tableBalance: 0,
      tableId: null,
      seatNumber: null,
    },
  });

  // Mock players data for search (for backward compatibility)
  const mockPlayers = Object.values(playerBalances).map(
    ({ availableBalance, tableBalance, tableId, seatNumber, ...player }) =>
      player
  );

  // Table balances tracking
  const [tableBalances, setTableBalances] = useState({
    1: { id: 1, name: "Table 1 - Texas Hold'em", totalBalance: 15000, players: ["P001", "P103"] },
    2: { id: 2, name: "Table 2 - Omaha", totalBalance: 7500, players: ["P105"] },
    3: { id: 3, name: "Table 3 - Stud", totalBalance: 0, players: [] }
  });

  // State for waitlist and seating management
  const [waitlist, setWaitlist] = useState([
    {
      id: 1,
      playerName: "Alex Johnson",
      playerId: "P001",
      position: 1,
      gameType: "Texas Hold'em",
      preferredSeat: 3,
      preferredTable: 1,
    },
    {
      id: 2,
      playerName: "Maria Garcia",
      playerId: "P002",
      position: 2,
      gameType: "Omaha",
      preferredSeat: 5,
      preferredTable: 2,
    },
    {
      id: 3,
      playerName: "David Wilson",
      playerId: "P003",
      position: 3,
      gameType: "Texas Hold'em",
      preferredSeat: null, // No preference
      preferredTable: 1,
    },
  ]);

  // Track occupied seats by table (tableId -> array of occupied seat numbers)
  const [occupiedSeats, setOccupiedSeats] = useState({
    1: [1, 2, 4, 7], // Table 1 has seats 1, 2, 4, 7 occupied
    2: [2, 3, 6], // Table 2 has seats 2, 3, 6 occupied
    3: [], // Table 3 is empty
  });

  // State for table view modal (manager mode)
  const [showTableView, setShowTableView] = useState(false);
  const [selectedPlayerForSeating, setSelectedPlayerForSeating] =
    useState(null);
  const [selectedTableForSeating, setSelectedTableForSeating] = useState(null);

  // Player search states for Cash-in/Cash-out operations
  const [adjustmentPlayerSearch, setAdjustmentPlayerSearch] = useState("");
  const [selectedAdjustmentPlayer, setSelectedAdjustmentPlayer] =
    useState(null);
  const filteredAdjustmentPlayers =
    adjustmentPlayerSearch.length >= 3
      ? mockPlayers.filter((player) => {
          const searchLower = adjustmentPlayerSearch.toLowerCase();
          return (
            player.name.toLowerCase().includes(searchLower) ||
            player.id.toLowerCase().includes(searchLower) ||
            player.email.toLowerCase().includes(searchLower)
          );
        })
      : [];


  // State for Players (KYC Pending) management
  const [playersSearch, setPlayersSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playersFilter, setPlayersFilter] = useState({
    kycStatus: "pending",
    registrationDate: "all",
    documentType: "all",
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
    },
  ]);

  // Filter players for dropdown search
  const filteredPlayersForSearch =
    playersSearch.length >= 2
      ? allPlayers.filter((player) => {
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
  const filteredPlayers = allPlayers.filter((player) => {
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
    if (
      playersFilter.documentType !== "all" &&
      player.documentType !== playersFilter.documentType
    ) {
      return false;
    }

    // Filter by registration date
    if (playersFilter.registrationDate !== "all") {
      const registrationDate = new Date(player.registrationDate);
      const now = new Date();
      const daysDiff = Math.floor(
        (now - registrationDate) / (1000 * 60 * 60 * 24)
      );

      if (playersFilter.registrationDate === "today" && daysDiff !== 0)
        return false;
      if (playersFilter.registrationDate === "week" && daysDiff > 7)
        return false;
      if (playersFilter.registrationDate === "month" && daysDiff > 30)
        return false;
    }

    return true;
  });

  // Handle KYC verification actions
  const handleKYCVerification = (playerId, action, notes = "") => {
    setAllPlayers((prev) =>
      prev.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            kycStatus:
              action === "approve"
                ? "approved"
                : action === "reject"
                ? "rejected"
                : player.kycStatus,
            verificationNotes: notes,
            verifiedDate: new Date().toISOString().split("T")[0],
          };
        }
        return player;
      })
    );
    alert(
      `KYC ${
        action === "approve"
          ? "approved"
          : action === "reject"
          ? "rejected"
          : "updated"
      } for ${playerId}`
    );
  };

  // State for Registered Players (Verified/Approved users)
  const [registeredPlayersSearch, setRegisteredPlayersSearch] = useState("");
  const [selectedRegisteredPlayer, setSelectedRegisteredPlayer] =
    useState(null);
  const [registeredPlayersFilter, setRegisteredPlayersFilter] = useState({
    status: "all",
    registrationDate: "all",
    documentType: "all",
    verifiedDate: "all",
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
    },
  ]);

  // Filter registered players for dropdown search
  const filteredRegisteredPlayersForSearch =
    registeredPlayersSearch.length >= 2
      ? registeredPlayers.filter((player) => {
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
  const filteredRegisteredPlayers = registeredPlayers.filter((player) => {
    if (player.kycStatus !== "approved") return false;

    // If a player is selected, show only that player
    if (selectedRegisteredPlayer && player.id !== selectedRegisteredPlayer.id)
      return false;

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

    if (
      registeredPlayersFilter.status !== "all" &&
      player.accountStatus !== registeredPlayersFilter.status
    ) {
      return false;
    }

    if (
      registeredPlayersFilter.documentType !== "all" &&
      player.documentType !== registeredPlayersFilter.documentType
    ) {
      return false;
    }

    if (registeredPlayersFilter.registrationDate !== "all") {
      const registrationDate = new Date(player.registrationDate);
      const now = new Date();
      const daysDiff = Math.floor(
        (now - registrationDate) / (1000 * 60 * 60 * 24)
      );
      if (
        registeredPlayersFilter.registrationDate === "today" &&
        daysDiff !== 0
      )
        return false;
      if (registeredPlayersFilter.registrationDate === "week" && daysDiff > 7)
        return false;
      if (registeredPlayersFilter.registrationDate === "month" && daysDiff > 30)
        return false;
    }

    if (registeredPlayersFilter.verifiedDate !== "all") {
      const verifiedDate = new Date(player.verifiedDate);
      const now = new Date();
      const daysDiff = Math.floor((now - verifiedDate) / (1000 * 60 * 60 * 24));
      if (registeredPlayersFilter.verifiedDate === "today" && daysDiff !== 0)
        return false;
      if (registeredPlayersFilter.verifiedDate === "week" && daysDiff > 7)
        return false;
      if (registeredPlayersFilter.verifiedDate === "month" && daysDiff > 30)
        return false;
    }

    return true;
  });

  // Handle download KYC document
  const handleDownloadKYCDoc = (player) => {
    // In real app, this would fetch the actual file from server
    alert(
      `Downloading KYC document for ${player.name}\nDocument: ${player.kycDocUrl}\nDocument Type: ${player.documentType}`
    );
    // Simulate download
    console.log(`Downloading: ${player.kycDocUrl}`);
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    const csvContent = [
      [
        "Player ID",
        "Name",
        "Email",
        "Phone",
        "Status",
        "Registration Date",
        "Verified Date",
        "Document Type",
      ],
      ...filteredRegisteredPlayers.map((p) => [
        p.id,
        p.name,
        p.email,
        p.phone,
        p.accountStatus,
        p.registrationDate,
        p.verifiedDate,
        p.documentType,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registered_players_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get all players for search (combine registered and pending)
  const allPlayersForSearch = [
    ...registeredPlayers,
    ...allPlayers.filter(
      (p) => !registeredPlayers.find((rp) => rp.id === p.id)
    ),
  ];

  // Player search for Cash-out Verification
  const [cashoutPlayerSearch, setCashoutPlayerSearch] = useState("");
  const [selectedCashoutPlayer, setSelectedCashoutPlayer] = useState(null);
  const [tableBalance, setTableBalance] = useState("");
  const filteredCashoutPlayers =
    cashoutPlayerSearch.length >= 3
      ? allPlayersForSearch.filter((player) => {
          const searchLower = cashoutPlayerSearch.toLowerCase();
          return (
            player.name.toLowerCase().includes(searchLower) ||
            player.id.toLowerCase().includes(searchLower) ||
            player.email.toLowerCase().includes(searchLower)
          );
        })
      : [];


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

    if (
      isSeatAvailable(waitlistEntry.preferredTable, waitlistEntry.preferredSeat)
    ) {
      // Assign to preferred seat
      setOccupiedSeats((prev) => ({
        ...prev,
        [waitlistEntry.preferredTable]: [
          ...(prev[waitlistEntry.preferredTable] || []),
          waitlistEntry.preferredSeat,
        ],
      }));
      // Remove from waitlist
      setWaitlist((prev) =>
        prev.filter((item) => item.id !== waitlistEntry.id)
      );
      alert(
        `Assigned ${waitlistEntry.playerName} to Table ${waitlistEntry.preferredTable}, Seat ${waitlistEntry.preferredSeat}`
      );
    } else {
      alert(
        `Preferred seat ${waitlistEntry.preferredSeat} at Table ${waitlistEntry.preferredTable} is not available`
      );
    }
  };

  // Handle opening table view for seat assignment
  const handleOpenTableView = (waitlistEntry, tableId = null) => {
    setSelectedPlayerForSeating(waitlistEntry);
    setSelectedTableForSeating(
      tableId || waitlistEntry.preferredTable || tables[0]?.id || 1
    );
    setShowTableView(true);
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
    setOccupiedSeats((prev) => ({
      ...prev,
      [tableIdNum]: [...(prev[tableIdNum] || []), seatNum],
    }));

    // Remove from waitlist
    setWaitlist((prev) =>
      prev.filter(
        (item) => item.id !== parseInt(playerId) && item.playerId !== playerId
      )
    );

    alert(`Assigned ${playerName} to Table ${tableIdNum}, Seat ${seatNum}`);

    // Close table view
    setShowTableView(false);
    setSelectedPlayerForSeating(null);
    setSelectedTableForSeating(null);
  };

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
      createdBy: "Manager",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
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
    clockPauseRules: "Standard",
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
    "Badugi",
  ];

  // Blind structures
  const blindStructures = [
    "Standard",
    "Turbo",
    "Super Turbo",
    "Deep Stack",
    "Hyper Turbo",
    "Custom",
  ];

  // Break structures
  const breakStructures = [
    "Every 4 levels",
    "Every 6 levels",
    "Every 8 levels",
    "Every 10 levels",
    "No breaks",
    "Custom",
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
    "Custom",
  ];

  // Handle tournament creation
  const handleCreateTournament = () => {
    if (
      !tournamentForm.name ||
      !tournamentForm.buyIn ||
      !tournamentForm.startingChips
    ) {
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
      startTime:
        tournamentForm.startTime ||
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      registeredPlayers: 0,
      maxPlayers: tournamentForm.maxPlayers
        ? parseInt(tournamentForm.maxPlayers)
        : null,
      blindStructure: tournamentForm.blindStructure,
      blindLevels: tournamentForm.blindLevels,
      rebuyAllowed: tournamentForm.rebuyAllowed,
      addOnAllowed: tournamentForm.addOnAllowed,
      reEntryAllowed: tournamentForm.reEntryAllowed,
      bountyAmount: tournamentForm.bountyAmount
        ? parseFloat(tournamentForm.bountyAmount)
        : 0,
      lateRegistration: tournamentForm.lateRegistration,
      breakStructure: tournamentForm.breakStructure,
      payoutStructure: tournamentForm.payoutStructure,
      createdBy: "Manager",
      createdAt: new Date().toISOString(),
      ...tournamentForm,
    };
    setTournaments((prev) => [newTournament, ...prev]);
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
      clockPauseRules: "Standard",
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
      playerId: "P001",
      playerName: "Alex Johnson",
      status: "open",
      lastMessage: "Need assistance at Table 2",
      lastMessageTime: new Date(Date.now() - 180000).toISOString(),
      messages: [
        {
          id: "M1",
          sender: "player",
          senderName: "Alex Johnson",
          text: "Need assistance at Table 2",
          timestamp: new Date(Date.now() - 180000).toISOString(),
        },
        {
          id: "M2",
          sender: "staff",
          senderName: "Manager",
          text: "On my way!",
          timestamp: new Date(Date.now() - 120000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
  ]);

  // Staff chats
  const [staffChats, setStaffChats] = useState([
    {
      id: "SC001",
      staffId: "ST001",
      staffName: "Sarah Johnson",
      staffRole: "Dealer",
      status: "open",
      lastMessage: "Player dispute at Table 3",
      lastMessageTime: new Date(Date.now() - 300000).toISOString(),
      messages: [
        {
          id: "M3",
          sender: "staff",
          senderName: "Sarah Johnson",
          text: "Player dispute at Table 3",
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: "M4",
          sender: "manager",
          senderName: "Manager",
          text: "I'll handle it.",
          timestamp: new Date(Date.now() - 240000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
  ]);

  const filteredChats =
    chatType === "player"
      ? playerChats.filter(
          (chat) => statusFilter === "all" || chat.status === statusFilter
        )
      : staffChats.filter(
          (chat) => statusFilter === "all" || chat.status === statusFilter
        );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message = {
      id: `M${Date.now()}`,
      sender: chatType === "player" ? "staff" : "manager",
      senderName: "Manager",
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    if (chatType === "player") {
      setPlayerChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                messages: [...chat.messages, message],
                lastMessage: message.text,
                lastMessageTime: message.timestamp,
                status: chat.status === "closed" ? "in_progress" : chat.status,
              }
            : chat
        )
      );
    } else {
      setStaffChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                messages: [...chat.messages, message],
                lastMessage: message.text,
                lastMessageTime: message.timestamp,
                status: chat.status === "closed" ? "in_progress" : chat.status,
              }
            : chat
        )
      );
    }
    setNewMessage("");
  };

  const handleStatusChange = (chatId, newStatus) => {
    if (chatType === "player") {
      setPlayerChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, status: newStatus } : chat
        )
      );
      if (selectedChat && selectedChat.id === chatId) {
        const updatedChat = playerChats.find((c) => c.id === chatId);
        if (updatedChat) setSelectedChat({ ...updatedChat, status: newStatus });
      }
    } else {
      setStaffChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, status: newStatus } : chat
        )
      );
      if (selectedChat && selectedChat.id === chatId) {
        const updatedChat = staffChats.find((c) => c.id === chatId);
        if (updatedChat) setSelectedChat({ ...updatedChat, status: newStatus });
      }
    }
  };

  useEffect(() => {
    if (selectedChat) {
      const currentChats = chatType === "player" ? playerChats : staffChats;
      const updatedChat = currentChats.find((c) => c.id === selectedChat.id);
      if (updatedChat) {
        setSelectedChat(updatedChat);
      } else {
        setSelectedChat(null);
      }
    }
  }, [chatType, playerChats, staffChats]);

  const menuItems = [
    "Dashboard",
    "Session Control",
    "Table Management",
    "Player Management",
    "Payroll Management",
    "Tournaments",
    "Player Flow",
    "Rake Count and Collection",
    "Chat",
    "KYC Review",
    "Push Notifications",
    "Leave Management",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="flex">
        {/* Sidebar */}
        <ManagerSidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          menuItems={menuItems}
        />

        {/* Main Section */}
        <main className="flex-1 lg:ml-0 min-w-0">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-10 space-y-8">
          {/* Header */}
          <header className="bg-gradient-to-r from-emerald-600 via-green-500 to-yellow-400 p-6 rounded-xl shadow-md flex justify-between items-center mt-16 lg:mt-0">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Manager Portal - {activeItem}
              </h1>
              <p className="text-gray-200 mt-1">
                Monitor tables, players, and manage operations
              </p>
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
                  {
                    title: "Active Tables",
                    value: "3",
                    color: "from-yellow-400 via-orange-500 to-red-500",
                  },
                  {
                    title: "Online Players",
                    value: "8",
                    color: "from-green-400 via-emerald-500 to-teal-500",
                  },
                  {
                    title: "Pending KYC",
                    value: "1",
                    color: "from-pink-400 via-red-500 to-rose-600",
                  },
                  // { title: "Daily Revenue", value: "₹0.00", color: "from-blue-400 via-indigo-500 to-violet-500" },
                ].map((card, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}
                  >
                    <div className="text-sm opacity-90 text-white/90">
                      {card.title}
                    </div>
                    <div className="text-3xl font-bold mt-2 text-white">
                      {card.value}
                    </div>
                    <div className="text-xs mt-1 text-white/70">
                      Updated just now
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <section className="p-6 bg-gradient-to-r from-lime-400/30 via-green-500/20 to-emerald-700/20 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Quick Actions
                </h2>
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
                <h2 className="text-lg font-semibold text-white mb-4">
                  Recent KYC Requests
                </h2>
                <div className="flex items-center justify-between bg-gradient-to-r from-yellow-500/20 to-green-500/20 p-4 rounded-xl shadow border border-yellow-400/30">
                  <div>
                    <div className="font-bold text-white">Test Player</div>
                    <div className="text-gray-300 text-sm">
                      test@supabase.com
                    </div>
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
                <h2 className="text-lg font-semibold text-white mb-4">
                  System Status
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    "Database Operational",
                    "Player Portal Connected",
                    "KYC System Active",
                  ].map((item, i) => (
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
            <SessionControl tables={tables} setTables={setTables} />
          )}

          {/* Table Management */}
          {activeItem === "Table Management" && (
            <div className="space-y-6">
              <TableManagementSection
                userRole="manager"
                tables={tables}
                setTables={setTables}
                playerBalances={playerBalances}
                setPlayerBalances={setPlayerBalances}
                tableBalances={tableBalances}
                setTableBalances={setTableBalances}
                occupiedSeats={occupiedSeats}
                setOccupiedSeats={setOccupiedSeats}
                mockPlayers={mockPlayers}
                onSeatAssign={handleSeatAssign}
                showTableView={showTableView}
                setShowTableView={setShowTableView}
                selectedPlayerForSeating={selectedPlayerForSeating}
                setSelectedPlayerForSeating={setSelectedPlayerForSeating}
                selectedTableForSeating={selectedTableForSeating}
                setSelectedTableForSeating={setSelectedTableForSeating}
                waitlist={waitlist}
                setWaitlist={setWaitlist}
                isSeatAvailable={isSeatAvailable}
                handleAssignPreferredSeat={handleAssignPreferredSeat}
                handleOpenTableViewForWaitlist={handleOpenTableView}
                dealers={dealers}
              />
            </div>
          )}

          {/* Rake Count and Collection */}
          {activeItem === "Rake Count and Collection" && (
            <RakeCountAndCollection />
          )}

          {/* Player Flow */}
          {activeItem === "Player Flow" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">
                  Player Cash-out Approval
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Pending Cash-outs
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-white">
                              Player: John Doe
                            </div>
                            <div className="text-sm text-gray-300">
                              Table 1 - Seat 3
                            </div>
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
                            <div className="font-semibold text-white">
                              Player: Jane Smith
                            </div>
                            <div className="text-sm text-gray-300">
                              Table 2 - Seat 7
                            </div>
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
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Cash-out Verification
                    </h3>
                    <div className="space-y-3">
                      <div className="relative">
                        <label className="text-white text-sm">
                          Search Player (Type at least 3 characters)
                        </label>
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
                        {cashoutPlayerSearch.length >= 3 &&
                          filteredCashoutPlayers.length > 0 &&
                          !selectedCashoutPlayer && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredCashoutPlayers.map((player) => (
                                <div
                                  key={player.id}
                                  onClick={() => {
                                    setSelectedCashoutPlayer(player);
                                    setCashoutPlayerSearch(
                                      `${player.name} (${player.id})`
                                    );
                                  }}
                                  className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                                >
                                  <div className="text-white font-medium">
                                    {player.name}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    ID: {player.id} | Email: {player.email}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        {selectedCashoutPlayer && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                            <span className="text-green-300">
                              Selected: {selectedCashoutPlayer.name} (
                              {selectedCashoutPlayer.id})
                            </span>
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
                        <label className="text-white text-sm">
                          Table Balance
                        </label>
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
                          const formattedBalance = `₹${parseFloat(
                            tableBalance
                          ).toLocaleString("en-IN")}`;
                          alert(
                            `Notification sent to Cashier:\n\n${selectedCashoutPlayer.name} has left the table with a table balance of ${formattedBalance}`
                          );

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

          {/* Real-Time Chat - Full Chat System */}
          {/* Payroll Management */}
          {activeItem === "Payroll Management" && (
            <div className="space-y-6">
              <EmployeeSalaryProcessingSection />
            </div>
          )}

          {/* Tournaments */}
          {activeItem === "Tournaments" && (
            <TournamentManagementSection
              userRole="manager"
              tournaments={tournaments}
              setTournaments={setTournaments}
            />
          )}

          {/* Legacy Tournament Section (removed, using TournamentManagementSection above) */}
          {false && activeItem === "Tournaments" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-orange-700/30 rounded-xl shadow-md border border-amber-800/40">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Tournament Management
                  </h2>
                  <button
                    onClick={() => setShowTournamentForm(!showTournamentForm)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all"
                  >
                    {showTournamentForm ? "Cancel" : "➕ Create Tournament"}
                  </button>
                </div>

                {/* Create Tournament Form */}
                {showTournamentForm && (
                  <div className="bg-white/10 p-6 rounded-lg border border-amber-400/30 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Create New Tournament
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-white font-semibold border-b border-white/20 pb-2">
                          Basic Information
                        </h4>
                        <div>
                          <label className="text-white text-sm mb-1 block">
                            Tournament Name *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                            placeholder="Monday Night Hold'em"
                            value={tournamentForm.name}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-white text-sm mb-1 block">
                            Tournament Type *
                          </label>
                          <CustomSelect
                            className="w-full"
                            value={tournamentForm.type}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                type: e.target.value,
                              })
                            }
                          >
                            {tournamentTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </CustomSelect>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-white text-sm mb-1 block">
                              Buy-in (₹) *
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                              placeholder="1000"
                              value={tournamentForm.buyIn}
                              onChange={(e) =>
                                setTournamentForm({
                                  ...tournamentForm,
                                  buyIn: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm mb-1 block">
                              Entry Fee (₹)
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                              placeholder="100"
                              value={tournamentForm.entryFee}
                              onChange={(e) =>
                                setTournamentForm({
                                  ...tournamentForm,
                                  entryFee: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-white text-sm mb-1 block">
                            Starting Chips *
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                            placeholder="10000"
                            value={tournamentForm.startingChips}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                startingChips: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-white text-sm mb-1 block">
                              Start Time
                            </label>
                            <input
                              type="datetime-local"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                              value={tournamentForm.startTime}
                              onChange={(e) =>
                                setTournamentForm({
                                  ...tournamentForm,
                                  startTime: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm mb-1 block">
                              Max Players (unlimited if blank)
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                              placeholder="Unlimited"
                              value={tournamentForm.maxPlayers}
                              onChange={(e) =>
                                setTournamentForm({
                                  ...tournamentForm,
                                  maxPlayers: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-white font-semibold border-b border-white/20 pb-2">
                          Tournament Rules
                        </h4>
                        <div>
                          <label className="text-white text-sm mb-1 block">
                            Blind Structure *
                          </label>
                          <CustomSelect
                            className="w-full"
                            value={tournamentForm.blindStructure}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                blindStructure: e.target.value,
                              })
                            }
                          >
                            {blindStructures.map((structure) => (
                              <option key={structure} value={structure}>
                                {structure}
                              </option>
                            ))}
                          </CustomSelect>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-white text-sm mb-1 block">
                              Number of Levels
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                              placeholder="15"
                              value={tournamentForm.blindLevels}
                              onChange={(e) =>
                                setTournamentForm({
                                  ...tournamentForm,
                                  blindLevels: parseInt(e.target.value) || 15,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm mb-1 block">
                              Minutes per Level
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                              placeholder="15"
                              value={tournamentForm.blindInterval}
                              onChange={(e) =>
                                setTournamentForm({
                                  ...tournamentForm,
                                  blindInterval: parseInt(e.target.value) || 15,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-white text-sm mb-1 block">
                            Break Structure
                          </label>
                          <CustomSelect
                            className="w-full"
                            value={tournamentForm.breakStructure}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                breakStructure: e.target.value,
                              })
                            }
                          >
                            {breakStructures.map((structure) => (
                              <option key={structure} value={structure}>
                                {structure}
                              </option>
                            ))}
                          </CustomSelect>
                        </div>
                        {tournamentForm.breakStructure !== "No breaks" && (
                          <div>
                            <label className="text-white text-sm mb-1 block">
                              Break Duration (minutes)
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                              placeholder="10"
                              value={tournamentForm.breakDuration}
                              onChange={(e) =>
                                setTournamentForm({
                                  ...tournamentForm,
                                  breakDuration: parseInt(e.target.value) || 10,
                                })
                              }
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-white text-sm mb-1 block">
                            Late Registration (minutes)
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                            placeholder="60"
                            value={tournamentForm.lateRegistration}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                lateRegistration:
                                  parseInt(e.target.value) || 60,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-white text-sm mb-1 block">
                            Payout Structure
                          </label>
                          <CustomSelect
                            className="w-full"
                            value={tournamentForm.payoutStructure}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                payoutStructure: e.target.value,
                              })
                            }
                          >
                            {payoutStructures.map((structure) => (
                              <option key={structure} value={structure}>
                                {structure}
                              </option>
                            ))}
                          </CustomSelect>
                        </div>
                        <div>
                          <label className="text-white text-sm mb-1 block">
                            Seat Draw Method
                          </label>
                          <CustomSelect
                            className="w-full"
                            value={tournamentForm.seatDrawMethod}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                seatDrawMethod: e.target.value,
                              })
                            }
                          >
                            <option value="Random">Random</option>
                            <option value="Table Balance">Table Balance</option>
                            <option value="Manual">Manual</option>
                          </CustomSelect>
                        </div>
                        <div>
                          <label className="text-white text-sm mb-1 block">
                            Clock Pause Rules
                          </label>
                          <CustomSelect
                            className="w-full"
                            value={tournamentForm.clockPauseRules}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                clockPauseRules: e.target.value,
                              })
                            }
                          >
                            <option value="Standard">
                              Standard (pause on breaks)
                            </option>
                            <option value="No Pause">No Pause</option>
                            <option value="Pause on All-in">
                              Pause on All-in
                            </option>
                            <option value="Custom">Custom</option>
                          </CustomSelect>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-white font-semibold border-b border-white/20 pb-2">
                          Rebuy, Add-on & Re-entry
                        </h4>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="rebuy-allowed"
                            className="w-4 h-4"
                            checked={tournamentForm.rebuyAllowed}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                rebuyAllowed: e.target.checked,
                              })
                            }
                          />
                          <label
                            htmlFor="rebuy-allowed"
                            className="text-white text-sm"
                          >
                            Allow Rebuys
                          </label>
                        </div>
                        {tournamentForm.rebuyAllowed && (
                          <div className="grid grid-cols-3 gap-3 ml-7">
                            <div>
                              <label className="text-white text-xs mb-1 block">
                                Rebuy Chips
                              </label>
                              <input
                                type="number"
                                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                placeholder="10000"
                                value={tournamentForm.rebuyChips}
                                onChange={(e) =>
                                  setTournamentForm({
                                    ...tournamentForm,
                                    rebuyChips: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-white text-xs mb-1 block">
                                Rebuy Fee (₹)
                              </label>
                              <input
                                type="number"
                                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                placeholder="1000"
                                value={tournamentForm.rebuyFee}
                                onChange={(e) =>
                                  setTournamentForm({
                                    ...tournamentForm,
                                    rebuyFee: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-white text-xs mb-1 block">
                                Rebuy Period (levels)
                              </label>
                              <input
                                type="number"
                                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                placeholder="6"
                                value={tournamentForm.rebuyPeriod}
                                onChange={(e) =>
                                  setTournamentForm({
                                    ...tournamentForm,
                                    rebuyPeriod: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="addon-allowed"
                            className="w-4 h-4"
                            checked={tournamentForm.addOnAllowed}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                addOnAllowed: e.target.checked,
                              })
                            }
                          />
                          <label
                            htmlFor="addon-allowed"
                            className="text-white text-sm"
                          >
                            Allow Add-on
                          </label>
                        </div>
                        {tournamentForm.addOnAllowed && (
                          <div className="grid grid-cols-2 gap-3 ml-7">
                            <div>
                              <label className="text-white text-xs mb-1 block">
                                Add-on Chips
                              </label>
                              <input
                                type="number"
                                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                placeholder="10000"
                                value={tournamentForm.addOnChips}
                                onChange={(e) =>
                                  setTournamentForm({
                                    ...tournamentForm,
                                    addOnChips: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="text-white text-xs mb-1 block">
                                Add-on Fee (₹)
                              </label>
                              <input
                                type="number"
                                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                placeholder="500"
                                value={tournamentForm.addOnFee}
                                onChange={(e) =>
                                  setTournamentForm({
                                    ...tournamentForm,
                                    addOnFee: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="reentry-allowed"
                            className="w-4 h-4"
                            checked={tournamentForm.reEntryAllowed}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                reEntryAllowed: e.target.checked,
                              })
                            }
                          />
                          <label
                            htmlFor="reentry-allowed"
                            className="text-white text-sm"
                          >
                            Allow Re-entry
                          </label>
                        </div>
                        {tournamentForm.reEntryAllowed && (
                          <div className="ml-7">
                            <label className="text-white text-xs mb-1 block">
                              Re-entry Period (minutes)
                            </label>
                            <input
                              type="number"
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                              placeholder="60"
                              value={tournamentForm.reEntryPeriod}
                              onChange={(e) =>
                                setTournamentForm({
                                  ...tournamentForm,
                                  reEntryPeriod: e.target.value,
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-white font-semibold border-b border-white/20 pb-2">
                          Bounty Options
                        </h4>
                        <div>
                          <label className="text-white text-sm mb-1 block">
                            Bounty Amount (₹) - Leave blank for regular
                            tournament
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                            placeholder="0"
                            value={tournamentForm.bountyAmount}
                            onChange={(e) =>
                              setTournamentForm({
                                ...tournamentForm,
                                bountyAmount: e.target.value,
                              })
                            }
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            If set, this becomes a knockout/bounty tournament
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={handleCreateTournament}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
                      >
                        Create Tournament
                      </button>
                      <button
                        onClick={() => setShowTournamentForm(false)}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Tournaments List */}
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Tournaments ({tournaments.length})
                  </h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {tournaments.length > 0 ? (
                      tournaments.map((tournament) => (
                        <div
                          key={tournament.id}
                          className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                          onClick={() => setSelectedTournament(tournament)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-semibold text-lg">
                                  {tournament.name}
                                </h4>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    tournament.status === "Active"
                                      ? "bg-green-500/30 text-green-300 border border-green-400/50"
                                      : tournament.status === "Scheduled"
                                      ? "bg-blue-500/30 text-blue-300 border border-blue-400/50"
                                      : "bg-gray-500/30 text-gray-300 border border-gray-400/50"
                                  }`}
                                >
                                  {tournament.status}
                                </span>
                                <span className="px-2 py-1 rounded text-xs bg-purple-500/30 text-purple-300 border border-purple-400/50">
                                  {tournament.type}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300">
                                <div>
                                  <span className="text-gray-400">Buy-in:</span>{" "}
                                  <span className="text-white font-semibold">
                                    ₹{tournament.buyIn.toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">
                                    Starting Chips:
                                  </span>{" "}
                                  <span className="text-white font-semibold">
                                    {tournament.startingChips.toLocaleString(
                                      "en-IN"
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">
                                    Registered:
                                  </span>{" "}
                                  <span className="text-white font-semibold">
                                    {tournament.registeredPlayers}
                                    {tournament.maxPlayers
                                      ? `/${tournament.maxPlayers}`
                                      : "/∞"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Start:</span>{" "}
                                  <span className="text-white">
                                    {new Date(
                                      tournament.startTime
                                    ).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {tournament.rebuyAllowed && (
                                  <span className="px-2 py-1 rounded text-xs bg-yellow-500/30 text-yellow-300 border border-yellow-400/50">
                                    Rebuy
                                  </span>
                                )}
                                {tournament.addOnAllowed && (
                                  <span className="px-2 py-1 rounded text-xs bg-blue-500/30 text-blue-300 border border-blue-400/50">
                                    Add-on
                                  </span>
                                )}
                                {tournament.reEntryAllowed && (
                                  <span className="px-2 py-1 rounded text-xs bg-purple-500/30 text-purple-300 border border-purple-400/50">
                                    Re-entry
                                  </span>
                                )}
                                {tournament.bountyAmount > 0 && (
                                  <span className="px-2 py-1 rounded text-xs bg-red-500/30 text-red-300 border border-red-400/50">
                                    Bounty ₹{tournament.bountyAmount}
                                  </span>
                                )}
                                <span className="px-2 py-1 rounded text-xs bg-indigo-500/30 text-indigo-300 border border-indigo-400/50">
                                  {tournament.blindStructure}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTournament(tournament);
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold"
                              >
                                View Details
                              </button>
                              {tournament.status === "Scheduled" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTournaments((prev) =>
                                      prev.map((t) =>
                                        t.id === tournament.id
                                          ? { ...t, status: "Active" }
                                          : t
                                      )
                                    );
                                    alert(
                                      `Tournament "${tournament.name}" started!`
                                    );
                                  }}
                                  className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold"
                                >
                                  Start
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    window.confirm(
                                      `Delete tournament "${tournament.name}"?`
                                    )
                                  ) {
                                    setTournaments((prev) =>
                                      prev.filter((t) => t.id !== tournament.id)
                                    );
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <div className="text-lg mb-2">
                          No tournaments created yet
                        </div>
                        <div className="text-sm">
                          Click "Create Tournament" to get started
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Tournament Details Modal */}
              {selectedTournament && (
                <div
                  className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                  onClick={() => setSelectedTournament(null)}
                >
                  <div
                    className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl border border-amber-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6 border-b border-white/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">
                            {selectedTournament.name}
                          </h2>
                          <p className="text-gray-400 text-sm">
                            Tournament Details & Settings
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedTournament(null)}
                          className="text-white/70 hover:text-white text-2xl font-bold"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">
                            Basic Info
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-gray-400 text-xs">
                                Tournament ID
                              </label>
                              <div className="text-white font-medium">
                                {selectedTournament.id}
                              </div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">
                                Type
                              </label>
                              <div className="text-white">
                                {selectedTournament.type}
                              </div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">
                                Status
                              </label>
                              <div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs border font-medium ${
                                    selectedTournament.status === "Active"
                                      ? "bg-green-500/30 text-green-300 border-green-400/50"
                                      : selectedTournament.status ===
                                        "Scheduled"
                                      ? "bg-blue-500/30 text-blue-300 border-blue-400/50"
                                      : "bg-gray-500/30 text-gray-300 border-gray-400/50"
                                  }`}
                                >
                                  {selectedTournament.status}
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">
                                Buy-in
                              </label>
                              <div className="text-white font-semibold">
                                ₹
                                {selectedTournament.buyIn.toLocaleString(
                                  "en-IN"
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">
                                Entry Fee
                              </label>
                              <div className="text-white">
                                ₹
                                {selectedTournament.entryFee.toLocaleString(
                                  "en-IN"
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">
                                Starting Chips
                              </label>
                              <div className="text-white font-semibold">
                                {selectedTournament.startingChips.toLocaleString(
                                  "en-IN"
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">
                            Structure
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-gray-400 text-xs">
                                Blind Structure
                              </label>
                              <div className="text-white">
                                {selectedTournament.blindStructure}
                              </div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">
                                Blind Levels
                              </label>
                              <div className="text-white">
                                {selectedTournament.blindLevels} levels
                              </div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">
                                Break Structure
                              </label>
                              <div className="text-white">
                                {selectedTournament.breakStructure}
                              </div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">
                                Payout Structure
                              </label>
                              <div className="text-white">
                                {selectedTournament.payoutStructure}
                              </div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">
                                Players
                              </label>
                              <div className="text-white">
                                {selectedTournament.registeredPlayers}
                                {selectedTournament.maxPlayers
                                  ? ` / ${selectedTournament.maxPlayers}`
                                  : " / Unlimited"}
                              </div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">
                                Start Time
                              </label>
                              <div className="text-white">
                                {new Date(
                                  selectedTournament.startTime
                                ).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Rules & Options
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-white/5 rounded border border-white/10">
                            <div className="text-xs text-gray-400 mb-1">
                              Rebuy
                            </div>
                            <div
                              className={`text-sm font-semibold ${
                                selectedTournament.rebuyAllowed
                                  ? "text-green-300"
                                  : "text-gray-500"
                              }`}
                            >
                              {selectedTournament.rebuyAllowed
                                ? "✓ Allowed"
                                : "✗ Not Allowed"}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white/5 rounded border border-white/10">
                            <div className="text-xs text-gray-400 mb-1">
                              Add-on
                            </div>
                            <div
                              className={`text-sm font-semibold ${
                                selectedTournament.addOnAllowed
                                  ? "text-green-300"
                                  : "text-gray-500"
                              }`}
                            >
                              {selectedTournament.addOnAllowed
                                ? "✓ Allowed"
                                : "✗ Not Allowed"}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white/5 rounded border border-white/10">
                            <div className="text-xs text-gray-400 mb-1">
                              Re-entry
                            </div>
                            <div
                              className={`text-sm font-semibold ${
                                selectedTournament.reEntryAllowed
                                  ? "text-green-300"
                                  : "text-gray-500"
                              }`}
                            >
                              {selectedTournament.reEntryAllowed
                                ? "✓ Allowed"
                                : "✗ Not Allowed"}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-white/5 rounded border border-white/10">
                            <div className="text-xs text-gray-400 mb-1">
                              Bounty
                            </div>
                            <div
                              className={`text-sm font-semibold ${
                                selectedTournament.bountyAmount > 0
                                  ? "text-red-300"
                                  : "text-gray-500"
                              }`}
                            >
                              {selectedTournament.bountyAmount > 0
                                ? `₹${selectedTournament.bountyAmount}`
                                : "None"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button
                          onClick={() => {
                            setSelectedTournament(null);
                            setShowTournamentForm(true);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold"
                        >
                          Edit Tournament
                        </button>
                        <button
                          onClick={() => setSelectedTournament(null)}
                          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeItem === "Chat" && (
            <ChatSection
              userRole="manager"
              playerChats={playerChats}
              setPlayerChats={setPlayerChats}
              staffChats={staffChats}
              setStaffChats={setStaffChats}
            />
          )}

          {/* Players */}
          {activeItem === "Players" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">
                  Players - KYC Pending Review
                </h2>

                {/* Search and Filters */}
                <div className="bg-white/10 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="text-white text-sm mb-1 block">
                        Search Player
                      </label>
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
                        {playersSearch.length >= 2 &&
                          filteredPlayersForSearch.length > 0 &&
                          !selectedPlayer && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredPlayersForSearch.map((player) => (
                                <div
                                  key={player.id}
                                  onClick={() => {
                                    setSelectedPlayer(player);
                                    setPlayersSearch(
                                      `${player.name} (${player.id})`
                                    );
                                  }}
                                  className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-0"
                                >
                                  <div className="text-white font-medium">
                                    {player.name}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    ID: {player.id} | Email: {player.email} |
                                    Phone: {player.phone}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        {selectedPlayer && (
                          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm flex items-center justify-between">
                            <span className="text-green-300">
                              Selected: {selectedPlayer.name} (
                              {selectedPlayer.id})
                            </span>
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
                      <label className="text-white text-sm mb-1 block">
                        Registration Date
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        value={playersFilter.registrationDate}
                        onChange={(e) =>
                          setPlayersFilter({
                            ...playersFilter,
                            registrationDate: e.target.value,
                          })
                        }
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white text-sm mb-1 block">
                        Document Type
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        value={playersFilter.documentType}
                        onChange={(e) =>
                          setPlayersFilter({
                            ...playersFilter,
                            documentType: e.target.value,
                          })
                        }
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
                      Showing{" "}
                      <span className="font-semibold">
                        {filteredPlayers.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold">
                        {
                          allPlayers.filter((p) => p.kycStatus === "pending")
                            .length
                        }
                      </span>{" "}
                      pending KYC verifications
                    </div>
                    <button
                      onClick={() => {
                        setPlayersSearch("");
                        setSelectedPlayer(null);
                        setPlayersFilter({
                          kycStatus: "pending",
                          registrationDate: "all",
                          documentType: "all",
                        });
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
                      {filteredPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="bg-white/5 p-4 rounded-lg border border-yellow-400/30"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            {/* Player Info */}
                            <div className="md:col-span-8 space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="font-semibold text-white text-lg">
                                  {player.name}
                                </div>
                                <span className="bg-yellow-500/30 text-yellow-300 font-medium px-3 py-1 rounded-full text-xs border border-yellow-400/50">
                                  KYC Pending
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">ID:</span>{" "}
                                  <span className="text-white">
                                    {player.id}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Email:</span>{" "}
                                  <span className="text-white">
                                    {player.email}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Phone:</span>{" "}
                                  <span className="text-white">
                                    {player.phone}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">
                                    Doc Type:
                                  </span>{" "}
                                  <span className="text-white">
                                    {player.documentType}
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300">
                                <div>
                                  Registered:{" "}
                                  {new Date(
                                    player.registrationDate
                                  ).toLocaleDateString()}
                                </div>
                                <div>
                                  Submitted:{" "}
                                  {new Date(
                                    player.submittedDate
                                  ).toLocaleDateString()}
                                </div>
                                <div className="md:col-span-2">
                                  Days Pending:{" "}
                                  {Math.floor(
                                    (new Date() -
                                      new Date(player.submittedDate)) /
                                      (1000 * 60 * 60 * 24)
                                  )}{" "}
                                  days
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-4 flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleKYCVerification(player.id, "approve")
                                  }
                                  className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const notes = prompt(
                                      "Enter rejection reason (optional):"
                                    );
                                    if (notes !== null) {
                                      handleKYCVerification(
                                        player.id,
                                        "reject",
                                        notes
                                      );
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
                                  onClick={() =>
                                    alert(
                                      `View documents for ${player.name} (${player.id})\nDocument Type: ${player.documentType}`
                                    )
                                  }
                                >
                                  View Docs
                                </button>
                                <button
                                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                                  onClick={() =>
                                    alert(
                                      `Player Details:\n\nName: ${player.name}\nEmail: ${player.email}\nPhone: ${player.phone}\nDocument: ${player.documentType}\nRegistration: ${player.registrationDate}`
                                    )
                                  }
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
                      <div className="text-gray-400 text-lg mb-2">
                        No players found
                      </div>
                      <div className="text-gray-500 text-sm">
                        {playersSearch ||
                        playersFilter.registrationDate !== "all" ||
                        playersFilter.documentType !== "all"
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
          {activeItem === "Player Management" && (
            <PlayerManagementSection
              userRole="manager"
              allPlayers={registeredPlayers.map((player) => ({
                id: player.id,
                name: player.name,
                email: player.email,
                phone: player.phone,
                status: player.accountStatus,
                kycStatus:
                  player.kycStatus === "approved"
                    ? "Verified"
                    : player.kycStatus,
                registrationDate: player.registrationDate,
                referredBy: player.referredBy || "N/A",
                balance: playerBalances[player.id]?.availableBalance || 0,
              }))}
              setAllPlayers={(updater) => {
                if (typeof updater === "function") {
                  const updated = updater(
                    registeredPlayers.map((player) => ({
                      id: player.id,
                      name: player.name,
                      email: player.email,
                      phone: player.phone,
                      status: player.accountStatus,
                      kycStatus:
                        player.kycStatus === "approved"
                          ? "Verified"
                          : player.kycStatus,
                      registrationDate: player.registrationDate,
                      referredBy: player.referredBy || "N/A",
                      balance: playerBalances[player.id]?.availableBalance || 0,
                    }))
                  );
                  // Update the original registeredPlayers state by mapping back
                  setRegisteredPlayers((prev) =>
                    prev
                      .map((p) => {
                        const updatedPlayer = updated.find(
                          (u) => u.id === p.id
                        );
                        if (updatedPlayer) {
                          return {
                            ...p,
                            accountStatus: updatedPlayer.status,
                          };
                        }
                        return p;
                      })
                      .filter((p) => updated.some((u) => u.id === p.id))
                  );
                }
              }}
            />
          )}

          {/* Push Notifications */}
          {activeItem === "Push Notifications" && (
            <PushNotificationsSection registeredPlayers={registeredPlayers} />
          )}

          {/* Leave Management */}
          {activeItem === "Leave Management" && (
            <LeaveManagement clubId={selectedClubId} userRole="MANAGER" />
          )}

          {/* Table View Modal for Seat Assignment (Manager Mode) */}
          {showTableView && selectedPlayerForSeating && (
            <div className="fixed inset-0 z-50 bg-black/90 overflow-y-auto hide-scrollbar">
              <TableView
                tableId={selectedTableForSeating}
                onClose={() => {
                  setShowTableView(false);
                  setSelectedPlayerForSeating(null);
                  setSelectedTableForSeating(null);
                }}
                isManagerMode={true}
                selectedPlayerForSeating={selectedPlayerForSeating}
                occupiedSeats={occupiedSeats}
                onSeatAssign={handleSeatAssign}
                tables={tables}
              />
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
