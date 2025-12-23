import React, { useState } from "react";
import CustomSelect from "./common/CustomSelect";

export default function BonusProcessingSection({ players = [], staff = [] }) {
  // Player bonus state
  const [bonusPlayerSearch, setBonusPlayerSearch] = useState("");
  const [selectedBonusPlayer, setSelectedBonusPlayer] = useState(null);
  const [playerBonusForm, setPlayerBonusForm] = useState({
    type: "Welcome Bonus",
    amount: "",
    reason: ""
  });

  // Staff bonus state
  const [selectedStaffMember, setSelectedStaffMember] = useState("");
  const [staffBonusForm, setStaffBonusForm] = useState({
    type: "Performance Bonus",
    amount: "",
    approval: "Pending Approval",
    reason: ""
  });

  // Recent bonuses state (mock data)
  const [recentPlayerBonuses] = useState([
    { player: "John Smith", type: "Welcome Bonus", amount: 1000, processed: "2 hours ago" },
    { player: "Maria Garcia", type: "Loyalty Bonus", amount: 500, processed: "1 day ago" }
  ]);

  const [recentStaffBonuses] = useState([
    { staff: "Sarah Johnson", type: "Performance Bonus", amount: 2000, processed: "1 day ago" },
    { staff: "Mike Chen", type: "Attendance Bonus", amount: 1500, processed: "3 days ago" }
  ]);

  // Filter players for search
  const filteredBonusPlayers = bonusPlayerSearch.length >= 3
    ? players.filter(player => {
        const searchLower = bonusPlayerSearch.toLowerCase();
        return (
          player.name?.toLowerCase().includes(searchLower) ||
          player.id?.toLowerCase().includes(searchLower) ||
          player.email?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Handle player bonus processing
  const handleProcessPlayerBonus = () => {
    if (!selectedBonusPlayer) {
      alert("Please select a player");
      return;
    }
    if (!playerBonusForm.amount || parseFloat(playerBonusForm.amount) <= 0) {
      alert("Please enter a valid bonus amount");
      return;
    }
    alert(`Player bonus processed successfully!\n\nPlayer: ${selectedBonusPlayer.name}\nType: ${playerBonusForm.type}\nAmount: ₹${parseFloat(playerBonusForm.amount).toLocaleString('en-IN')}`);
    // Reset form
    setSelectedBonusPlayer(null);
    setBonusPlayerSearch("");
    setPlayerBonusForm({
      type: "Welcome Bonus",
      amount: "",
      reason: ""
    });
  };

  // Handle staff bonus processing
  const handleProcessStaffBonus = () => {
    if (!selectedStaffMember) {
      alert("Please select a staff member");
      return;
    }
    if (!staffBonusForm.amount || parseFloat(staffBonusForm.amount) <= 0) {
      alert("Please enter a valid bonus amount");
      return;
    }
    alert(`Staff bonus processed successfully!\n\nStaff: ${selectedStaffMember}\nType: ${staffBonusForm.type}\nAmount: ₹${parseFloat(staffBonusForm.amount).toLocaleString('en-IN')}\nApproval: ${staffBonusForm.approval}`);
    // Reset form
    setSelectedStaffMember("");
    setStaffBonusForm({
      type: "Performance Bonus",
      amount: "",
      approval: "Pending Approval",
      reason: ""
    });
  };

  return (
    <div className="space-y-6">
      {/* Player Bonuses Section */}
      <section className="p-6 bg-gradient-to-r from-yellow-600/30 via-orange-500/20 to-red-700/30 rounded-xl shadow-md border border-yellow-800/40">
        <h2 className="text-xl font-bold text-white mb-6">Player Bonuses</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Process Player Bonus</h3>
            <div className="space-y-4">
              <div className="relative">
                <label className="text-white text-sm">Search Player (Type at least 3 characters)</label>
                <input 
                  type="text" 
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                  placeholder="Search by name, ID, or email..." 
                  value={bonusPlayerSearch}
                  onChange={(e) => {
                    setBonusPlayerSearch(e.target.value);
                    setSelectedBonusPlayer(null);
                  }}
                />
                {bonusPlayerSearch.length >= 3 && filteredBonusPlayers.length > 0 && !selectedBonusPlayer && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredBonusPlayers.map(player => (
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
                  <div className="mt-2 p-2 bg-green-500/20 border border-green-400/30 rounded text-sm">
                    <span className="text-green-300">Selected: {selectedBonusPlayer.name} ({selectedBonusPlayer.id})</span>
                    <button 
                      onClick={() => {
                        setSelectedBonusPlayer(null);
                        setBonusPlayerSearch("");
                      }}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-white text-sm">Bonus Type</label>
                <CustomSelect 
                  className="w-full mt-1"
                  value={playerBonusForm.type}
                  onChange={(e) => setPlayerBonusForm({ ...playerBonusForm, type: e.target.value })}
                >
                  <option>Welcome Bonus</option>
                  <option>Loyalty Bonus</option>
                  <option>Referral Bonus</option>
                  <option>Tournament Bonus</option>
                  <option>Special Event Bonus</option>
                </CustomSelect>
              </div>
              <div>
                <label className="text-white text-sm">Bonus Amount</label>
                <input 
                  type="number" 
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                  placeholder="₹0.00"
                  value={playerBonusForm.amount}
                  onChange={(e) => setPlayerBonusForm({ ...playerBonusForm, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm">Reason</label>
                <textarea 
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                  rows="3" 
                  placeholder="Bonus reason..."
                  value={playerBonusForm.reason}
                  onChange={(e) => setPlayerBonusForm({ ...playerBonusForm, reason: e.target.value })}
                ></textarea>
              </div>
              <button 
                onClick={handleProcessPlayerBonus}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Process Player Bonus
              </button>
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Player Bonuses</h3>
            <div className="space-y-2">
              {recentPlayerBonuses.map((bonus, index) => (
                <div key={index} className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                  <div className="font-semibold text-white">Player: {bonus.player}</div>
                  <div className="text-sm text-gray-300">{bonus.type}: ₹{bonus.amount.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-yellow-300">Processed {bonus.processed}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Staff Bonuses Section */}
      <section className="p-6 bg-gradient-to-r from-pink-600/30 via-rose-500/20 to-red-700/30 rounded-xl shadow-md border border-pink-800/40">
        <h2 className="text-xl font-bold text-white mb-6">Staff Bonuses</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Process Staff Bonus</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm">Staff Member</label>
                <CustomSelect 
                  className="w-full mt-1"
                  value={selectedStaffMember}
                  onChange={(e) => setSelectedStaffMember(e.target.value)}
                >
                  <option value="">Select Staff Member</option>
                  {staff.length > 0 ? (
                    staff.map(member => (
                      <option key={member.id} value={`${member.name} - ${member.role || 'Staff'}`}>
                        {member.name} - {member.role || 'Staff'}
                      </option>
                    ))
                  ) : (
                    <>
                      <option>Sarah Johnson - Dealer</option>
                      <option>Mike Chen - Floor Manager</option>
                      <option>Emma Davis - Cashier</option>
                      <option>John Smith - Security</option>
                    </>
                  )}
                </CustomSelect>
              </div>
              <div>
                <label className="text-white text-sm">Bonus Type</label>
                <CustomSelect 
                  className="w-full mt-1"
                  value={staffBonusForm.type}
                  onChange={(e) => setStaffBonusForm({ ...staffBonusForm, type: e.target.value })}
                >
                  <option>Performance Bonus</option>
                  <option>Attendance Bonus</option>
                  <option>Special Achievement</option>
                  <option>Holiday Bonus</option>
                  <option>Year-end Bonus</option>
                </CustomSelect>
              </div>
              <div>
                <label className="text-white text-sm">Bonus Amount</label>
                <input 
                  type="number" 
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                  placeholder="₹0.00"
                  value={staffBonusForm.amount}
                  onChange={(e) => setStaffBonusForm({ ...staffBonusForm, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-white text-sm">Approval Required</label>
                <CustomSelect 
                  className="w-full mt-1"
                  value={staffBonusForm.approval}
                  onChange={(e) => setStaffBonusForm({ ...staffBonusForm, approval: e.target.value })}
                >
                  <option>Manager Approved</option>
                  <option>HR Approved</option>
                  <option>Pending Approval</option>
                </CustomSelect>
              </div>
              <div>
                <label className="text-white text-sm">Reason</label>
                <textarea 
                  className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" 
                  rows="3" 
                  placeholder="Bonus reason..."
                  value={staffBonusForm.reason}
                  onChange={(e) => setStaffBonusForm({ ...staffBonusForm, reason: e.target.value })}
                ></textarea>
              </div>
              <button 
                onClick={handleProcessStaffBonus}
                className="w-full bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Process Staff Bonus
              </button>
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Staff Bonuses</h3>
            <div className="space-y-2">
              {recentStaffBonuses.map((bonus, index) => (
                <div key={index} className="bg-pink-500/20 p-3 rounded-lg border border-pink-400/30">
                  <div className="font-semibold text-white">{bonus.staff}</div>
                  <div className="text-sm text-gray-300">{bonus.type}: ₹{bonus.amount.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-pink-300">Processed {bonus.processed}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

