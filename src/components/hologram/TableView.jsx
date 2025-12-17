import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

// Simple icon components (replace lucide-react icons)
const ArrowLeft = ({ className }) => <span className={className}>←</span>;
const Users = ({ className }) => <span className={className}>👥</span>;
const Clock = ({ className }) => <span className={className}>🕐</span>;
const DollarSign = ({ className }) => <span className={className}>₹</span>;
const UserPlus = ({ className }) => <span className={className}>+</span>;
const Plus = ({ className }) => <span className={className}>+</span>;
const X = ({ className }) => <span className={className}>×</span>;

// Stub toast hook
const useToast = () => ({
  toast: ({ title, description, variant }) => {
    console.log(`Toast [${variant || "info"}]: ${title} - ${description}`);
    alert(`${title}: ${description}`);
  },
});

// Stub auth hook
const useUltraFastAuth = () => ({
  user: { id: null },
});

// Stub game status hook
const usePlayerGameStatus = () => ({
  isInActiveGame: false,
  activeGameInfo: null,
  seatedSessionFallback: null,
});

// PlaytimeTracker stub (won't be used in manager mode)
const PlaytimeTracker = () => null;

export default function TableView({
  tableId: propTableId,
  onNavigate,
  onClose,
  isManagerMode = false,
  selectedPlayerForSeating = null,
  occupiedSeats = {},
  onSeatAssign = null,
  tables: propTables = null,
}) {
  // Normalize tableId to string for comparison
  const tableId = propTableId ? String(propTableId) : "1";
  const setLocation =
    onNavigate ||
    ((path) => {
      console.log("Navigate to:", path);
    });

  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const { toast } = useToast();

  // DUMMY DATA: Mock table data - IDs match PlayerDashboard static tables
  const DUMMY_TABLES = [
    {
      id: "1",
      name: "Main Table",
      gameType: "Texas Hold'em",
      stakes: "₹1000.00/10000.00",
      maxPlayers: 6,
      status: "active",
    },
    {
      id: "2",
      name: "VIP Table",
      gameType: "Texas Hold'em",
      stakes: "₹5000.00/50000.00",
      maxPlayers: 9,
      status: "active",
    },
    {
      id: "3",
      name: "High Stakes",
      gameType: "Texas Hold'em",
      stakes: "₹10000.00/100000.00",
      maxPlayers: 6,
      status: "active",
    },
  ];

  const tables = propTables || DUMMY_TABLES;
  const tablesArray = Array.isArray(tables) ? tables : [];

  const { user } = useUltraFastAuth();
  const gameStatus = usePlayerGameStatus();

  // Find table by ID (normalize both to strings for comparison)
  const currentTable = tablesArray.find(
    (table) => String(table.id) === String(tableId)
  );

  // Manager mode: Get occupied seats from prop, otherwise use dummy data
  const managerOccupiedSeats = isManagerMode
    ? occupiedSeats[tableId] || []
    : [];

  // DUMMY DATA: Empty waitlist and seated players
  const userWaitlist = [];
  const waitlistArray = Array.isArray(userWaitlist) ? userWaitlist : [];
  const seatedPlayers = isManagerMode
    ? managerOccupiedSeats.map((seatNum, idx) => ({
        seatNumber: seatNum,
        player: { firstName: "Player", lastName: String(seatNum) },
        session_buy_in_amount: 0,
      }))
    : [];
  const seatedPlayersArray = Array.isArray(seatedPlayers) ? seatedPlayers : [];
  const potData = { pot: "50000" };

  const isOnWaitlist = waitlistArray.some((req) => req.tableId === tableId);
  const waitlistEntry = waitlistArray.find((req) => req.tableId === tableId);
  const isUserSeated =
    !isManagerMode &&
    gameStatus.isInActiveGame &&
    gameStatus.activeGameInfo?.tableId === tableId;
  const userSeatInfo =
    gameStatus.activeGameInfo || gameStatus.seatedSessionFallback;

  // Manager mode: Handle seat assignment
  const handleManagerSeatClick = (seatNumber) => {
    if (!isManagerMode || !selectedPlayerForSeating) return;

    const isOccupied = managerOccupiedSeats.includes(seatNumber);
    if (isOccupied) {
      toast({
        title: "Seat Occupied",
        description: `Seat ${seatNumber} is already occupied`,
        variant: "destructive",
      });
      return;
    }

    setSelectedSeat(seatNumber);
    setShowJoinDialog(true);
  };

  // DUMMY: Mock mutation
  const handleJoinWaitlist = (seatNumber) => {
    if (isManagerMode && onSeatAssign && selectedPlayerForSeating) {
      // Manager mode: Assign seat
      onSeatAssign({
        playerId:
          selectedPlayerForSeating.id || selectedPlayerForSeating.playerId,
        playerName:
          selectedPlayerForSeating.playerName || selectedPlayerForSeating.name,
        tableId: parseInt(tableId),
        seatNumber: seatNumber,
      });
      toast({
        title: "Seat Assigned!",
        description: `${
          selectedPlayerForSeating.playerName || selectedPlayerForSeating.name
        } assigned to Seat ${seatNumber}`,
      });
      setSelectedSeat(null);
      setShowJoinDialog(false);
      if (onClose) onClose();
    } else {
      // Player mode
      toast({
        title: "Joined Waitlist!",
        description: `You've been added to the waitlist successfully (dummy mode)`,
      });
      setSelectedSeat(null);
      setShowJoinDialog(false);
    }
  };

  if (!currentTable) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Table not found</h2>
          <Button onClick={() => (onClose ? onClose() : setLocation("/"))}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-fit bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="p-4 flex justify-between">
        <Button
          variant="ghost"
          onClick={() => (onClose ? onClose() : setLocation("/"))}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-4 w-fit flex-col">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">
              {currentTable.name}
            </h1>
            <p className="text-slate-300">
              {currentTable.gameType} • {currentTable.stakes}
            </p>
          </div>
          {/* Table Value - Top Left */}
          <div className="">
            <div className="bg-gradient-to-br from-yellow-600 via-amber-500 to-orange-500 border-2 border-yellow-400/80 px-4 py-2 rounded-lg text-center shadow-xl">
              <div className="text-yellow-200 text-xs font-semibold">
                Table Value
              </div>
              <div className="text-white text-lg font-bold">
                ₹{potData?.pot ? parseFloat(potData.pot).toLocaleString() : "0"}
              </div>
            </div>
          </div>
        </div>
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>

      {/* Waitlist Status Banner - Only show if not seated */}
      {isOnWaitlist && waitlistEntry && !isUserSeated && (
        <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-amber-600/20 to-amber-500/20 border border-amber-500/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-amber-200 font-semibold">
                You're on the waitlist!
              </h3>
              <p className="text-amber-100 text-sm">
                Waiting for seat{" "}
                {waitlistEntry.seatNumber || waitlistEntry.preferredSeat} •
                Position in queue: {waitlistEntry.position || "TBD"}
              </p>
            </div>
            <div className="text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* PlaytimeTracker for Seated Players - Only in player mode */}
      {!isManagerMode && isUserSeated && user?.id && (
        <div className="mx-4 mb-4">
          <PlaytimeTracker
            playerId={user.id.toString()}
            gameStatus={gameStatus}
          />
        </div>
      )}

      {/* Main Table Area - Staff Portal Style */}
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="relative w-full max-w-4xl">
          {/* Poker Table - Oval Shape matching staff portal */}
          <div className="relative aspect-[5/3] max-w-2xl mx-auto mb-12 mt-8">
            {/* Table Background with Golden Border */}
            <div className="absolute inset-0 rounded-[50%] bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-600 p-2 shadow-2xl">
              {/* Green Felt Surface */}
              <div className="absolute inset-2 rounded-[50%] bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 shadow-inner">
                {/* Dynamic Seat Positions - Based on table maxPlayers */}
                {Array.from(
                  { length: currentTable.maxPlayers || 6 },
                  (_, index) => {
                    const seatNumber = index + 1;
                    const totalPositions = (currentTable.maxPlayers || 6) + 1;
                    const angleStep = (2 * Math.PI) / totalPositions;
                    const angle = (index + 1) * angleStep - Math.PI / 2;
                    const radiusX = 42;
                    const radiusY = 32;
                    const x = 50 + radiusX * Math.cos(angle);
                    const y = 50 + radiusY * Math.sin(angle);
                    const isSelected = selectedSeat === seatNumber;

                    const seatedPlayer = seatedPlayersArray.find(
                      (p) => p.seatNumber === seatNumber
                    );
                    const isOccupied = isManagerMode
                      ? managerOccupiedSeats.includes(seatNumber)
                      : !!seatedPlayer;
                    const playerBuyIn =
                      seatedPlayer?.session_buy_in_amount ||
                      seatedPlayer?.sessionBuyInAmount ||
                      0;

                    // Check if this is the preferred seat for the selected player
                    const isPreferredSeat =
                      isManagerMode && selectedPlayerForSeating
                        ? selectedPlayerForSeating.preferredSeat ===
                            seatNumber &&
                          String(selectedPlayerForSeating.preferredTable) ===
                            String(tableId)
                        : false;

                    return (
                      <div
                        key={seatNumber}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-50"
                        style={{ left: `${x}%`, top: `${y}%` }}
                      >
                        {/* ELEGANT SEAT BUTTON */}
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300 select-none ${
                            isOccupied
                              ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 cursor-not-allowed"
                              : isSelected || isPreferredSeat
                              ? "border-emerald-400 shadow-emerald-500/50 scale-110 bg-gradient-to-br from-emerald-600 to-emerald-700 animate-pulse cursor-pointer"
                              : isManagerMode
                              ? "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 hover:border-yellow-400 hover:shadow-yellow-400/50 hover:scale-105 cursor-pointer active:scale-95"
                              : "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 hover:border-emerald-400 hover:shadow-emerald-400/50 hover:scale-105 cursor-pointer active:scale-95"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isOccupied) {
                              if (isManagerMode) {
                                handleManagerSeatClick(seatNumber);
                              } else {
                                setSelectedSeat(seatNumber);
                                setShowJoinDialog(true);
                              }
                            }
                          }}
                          style={{
                            pointerEvents: "auto",
                            touchAction: "manipulation",
                          }}
                          title={
                            isManagerMode && isPreferredSeat
                              ? `Preferred seat for ${
                                  selectedPlayerForSeating.playerName ||
                                  selectedPlayerForSeating.name
                                }`
                              : `Seat ${seatNumber}`
                          }
                        >
                          {isOccupied && seatedPlayer?.player ? (
                            <span className="text-white text-xs font-bold">
                              {seatedPlayer.player.firstName.charAt(0)}
                              {seatedPlayer.player.lastName.charAt(0)}
                            </span>
                          ) : (
                            <Plus
                              className={`w-3 h-3 text-emerald-400 font-bold transition-transform duration-300 ${
                                isSelected
                                  ? "rotate-45 scale-110"
                                  : "hover:rotate-90 hover:scale-110"
                              }`}
                            />
                          )}
                        </div>
                        {/* Seat Label with Enhanced Info */}
                        <div
                          className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center transition-colors ${
                            isOccupied
                              ? "text-blue-400"
                              : isSelected || isPreferredSeat
                              ? "text-emerald-400"
                              : "text-slate-300"
                          }`}
                        >
                          <div className="text-xs font-medium">
                            {isOccupied && seatedPlayer?.player
                              ? seatedPlayer.player.firstName
                              : `Seat ${seatNumber}`}
                          </div>
                          {isPreferredSeat && (
                            <div className="text-[9px] text-yellow-400 bg-yellow-900/50 px-1 rounded mt-1 font-semibold">
                              ⭐ Preferred
                            </div>
                          )}
                          {isOccupied && playerBuyIn > 0 && (
                            <div className="text-[10px] text-slate-400 bg-slate-800/80 px-1 rounded mt-1">
                              ₹{playerBuyIn.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}

                {/* Dealer Position - Visible outside the table */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
                  style={{ left: "50%", top: "8%" }}
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full border-2 border-yellow-500 flex items-center justify-center shadow-xl">
                    <span className="text-xs font-bold text-white">D</span>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 font-medium whitespace-nowrap">
                    Dealer
                  </div>
                </div>

                {/* Center Logo Area */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    {/* Table Logo */}
                    <div className="w-24 h-24 bg-white/10 rounded-full border-2 border-white/20 flex items-center justify-center shadow-xl backdrop-blur-sm overflow-hidden">
                      <img
                        src="https://img.freepik.com/free-vector/flat-design-culture-logo-template_23-2149845368.jpg?semt=ais_hybrid&w=740&q=80"
                        alt="Table Logo"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Info Cards - Staff Portal Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full max-w-4xl">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-slate-400 text-sm">Players</div>
              <div className="text-white text-xl font-bold">
                {seatedPlayersArray.length || 0}/{currentTable?.maxPlayers || 6}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-slate-400 text-sm">Buy-in Range</div>
              <div className="text-white text-lg font-bold">
                {currentTable?.stakes || "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-slate-400 text-sm">Blinds</div>
              <div className="text-white text-lg font-bold">₹10/₹20</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-slate-400 text-sm">Status</div>
              <div className="text-white text-lg font-bold">Waiting</div>
            </CardContent>
          </Card>
        </div>

        {/* Seated Player Controls - Call Time & Session Info */}
        {!isManagerMode && isUserSeated && userSeatInfo && (
          <div className="mt-8 w-full max-w-4xl">
            <Card className="bg-gradient-to-r from-blue-800 to-blue-900 border-blue-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <h3 className="text-xl font-bold text-blue-200">
                      You are seated at Seat {userSeatInfo.seatNumber}
                    </h3>
                  </div>
                  <div className="text-blue-300 text-sm">Seated at Table</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Buy-in Info */}
                  <div className="bg-blue-900/50 rounded-lg p-4 border border-blue-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      <span className="text-blue-200 font-semibold">
                        Session Buy-in
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      ₹{(userSeatInfo.buyInAmount || 5000).toLocaleString()}
                    </div>
                  </div>

                  {/* Call Time Status */}
                  <div className="bg-blue-900/50 rounded-lg p-4 border border-blue-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-blue-200 font-semibold">
                        Call Time
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white">
                      <div className="text-green-400">Available</div>
                    </div>
                  </div>

                  {/* Cashout Window */}
                  <div className="bg-blue-900/50 rounded-lg p-4 border border-blue-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <ArrowLeft className="w-5 h-5 text-purple-400" />
                      <span className="text-blue-200 font-semibold">
                        Cash Out
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white">
                      <div className="text-slate-400">Pending</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Seat Selection and Join Controls */}
        {!isUserSeated && (
          <div className="mt-8 text-center">
            {selectedSeat ? (
              <div className="space-y-4">
                <div
                  className={`bg-slate-800 border rounded-lg p-4 max-w-md mx-auto ${
                    isManagerMode
                      ? "border-yellow-500/50"
                      : "border-emerald-500/50"
                  }`}
                >
                  <h3
                    className={`font-semibold mb-2 ${
                      isManagerMode ? "text-yellow-400" : "text-emerald-400"
                    }`}
                  >
                    {isManagerMode
                      ? `Assign Seat ${selectedSeat}`
                      : `Seat ${selectedSeat} Selected`}
                  </h3>
                  {isManagerMode && selectedPlayerForSeating ? (
                    <>
                      <p className="text-slate-300 text-sm mb-2">
                        Assign{" "}
                        <span className="font-semibold text-white">
                          {selectedPlayerForSeating.playerName ||
                            selectedPlayerForSeating.name}
                        </span>{" "}
                        to Seat {selectedSeat}
                      </p>
                      <p className="text-slate-400 text-xs mb-4">
                        Table: {currentTable?.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-300 text-sm mb-2">
                        Reserve this seat position for {currentTable?.name}
                      </p>
                      <p className="text-slate-400 text-xs mb-4">
                        Note: Multiple players can reserve the same seat. Staff
                        will assign final seating.
                      </p>
                    </>
                  )}
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => {
                        handleJoinWaitlist(selectedSeat);
                      }}
                      className={`shadow-lg transition-all duration-300 ${
                        isManagerMode
                          ? "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white hover:shadow-yellow-500/25"
                          : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:shadow-emerald-500/25"
                      }`}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isManagerMode
                        ? `Assign Seat ${selectedSeat}`
                        : `Reserve Seat ${selectedSeat}`}
                    </Button>
                    <Button
                      onClick={() => setSelectedSeat(null)}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-slate-300 text-sm">
                  {isManagerMode && selectedPlayerForSeating
                    ? `Click on any available seat to assign ${
                        selectedPlayerForSeating.playerName ||
                        selectedPlayerForSeating.name
                      }`
                    : "Click on any seat to reserve your preferred position"}
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  {isManagerMode
                    ? "Seats highlighted in yellow are preferred seats for this player"
                    : "Staff will manage final table assignments"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Text */}
        <div className="mt-8 text-center text-slate-400">
          <p className="text-sm">
            This is a local offline poker game managed by casino staff.
          </p>
          <p className="text-xs mt-2">
            Players are seated by super admin, admin, or manager only.
          </p>
        </div>
      </div>

      {/* Seat Selection Confirmation Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle
              className={`text-xl ${
                isManagerMode ? "text-yellow-400" : "text-emerald-400"
              }`}
            >
              {isManagerMode ? "Assign Seat" : "Join Table Waitlist"}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              {isManagerMode
                ? `Confirm seat assignment for ${
                    selectedPlayerForSeating?.playerName ||
                    selectedPlayerForSeating?.name ||
                    "player"
                  }`
                : `Confirm your seat reservation for ${currentTable?.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <h4
                className={`font-semibold mb-2 ${
                  isManagerMode ? "text-yellow-400" : "text-emerald-400"
                }`}
              >
                {isManagerMode ? "Assignment Information" : "Table Information"}
              </h4>
              <div className="text-sm space-y-1 text-slate-300">
                {isManagerMode && selectedPlayerForSeating && (
                  <>
                    <div>
                      • Player:{" "}
                      <span className="text-white font-semibold">
                        {selectedPlayerForSeating.playerName ||
                          selectedPlayerForSeating.name}
                      </span>
                    </div>
                    <div>
                      • Player ID:{" "}
                      {selectedPlayerForSeating.playerId ||
                        selectedPlayerForSeating.id}
                    </div>
                    {selectedPlayerForSeating.preferredSeat && (
                      <div>
                        • Preferred Seat:{" "}
                        {selectedPlayerForSeating.preferredSeat ===
                        selectedSeat ? (
                          <span className="text-yellow-400 font-semibold">
                            ✓ Seat {selectedSeat} (Matches preference)
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            Seat {selectedPlayerForSeating.preferredSeat}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
                <div>• Table: {currentTable?.name}</div>
                <div>• Game: {currentTable?.gameType}</div>
                <div>• Stakes: {currentTable?.stakes}</div>
                <div>
                  • Selected Seat:{" "}
                  <span className="text-white font-semibold">
                    {selectedSeat}
                  </span>
                </div>
              </div>
            </div>

            {!isManagerMode && (
              <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-3">
                <p className="text-amber-200 text-sm">
                  <strong>Note:</strong> You will be added to the waitlist for
                  this table. Staff will assign seating when a spot becomes
                  available.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowJoinDialog(false);
                  setSelectedSeat(null);
                }}
                className="border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>

              <Button
                onClick={() => {
                  if (selectedSeat) {
                    handleJoinWaitlist(selectedSeat);
                  }
                }}
                className={
                  isManagerMode
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                }
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isManagerMode
                  ? `Assign Seat ${selectedSeat}`
                  : `Confirm Seat ${selectedSeat}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
