import React, { useState } from "react";
import CustomSelect from "./common/CustomSelect";

export default function TipsProcessing() {
  const [selectedStaff, setSelectedStaff] = useState("");
  const [totalTips, setTotalTips] = useState("");
  const [clubPercentage, setClubPercentage] = useState("15");
  const [staffShare, setStaffShare] = useState("");

  // Calculate staff share when tips or percentage changes
  const calculateStaffShare = (tips, percentage) => {
    if (tips && percentage) {
      const tipsNum = parseFloat(tips) || 0;
      const percentageNum = parseFloat(percentage) || 0;
      const clubShare = (tipsNum * percentageNum) / 100;
      const share = tipsNum - clubShare;
      return share.toFixed(2);
    }
    return "";
  };

  const handleTipsChange = (value) => {
    setTotalTips(value);
    setStaffShare(calculateStaffShare(value, clubPercentage));
  };

  const handlePercentageChange = (value) => {
    setClubPercentage(value);
    setStaffShare(calculateStaffShare(totalTips, value));
  };

  const handleProcessTips = () => {
    if (!selectedStaff) {
      alert("Please select a staff member");
      return;
    }
    if (!totalTips || parseFloat(totalTips) <= 0) {
      alert("Please enter a valid tips amount");
      return;
    }
    if (!clubPercentage || parseFloat(clubPercentage) < 0 || parseFloat(clubPercentage) > 100) {
      alert("Please enter a valid club percentage (0-100)");
      return;
    }
    alert(`Tips processed successfully for ${selectedStaff}\nTotal Tips: ₹${totalTips}\nClub Share: ₹${((parseFloat(totalTips) * parseFloat(clubPercentage)) / 100).toFixed(2)}\nStaff Share: ₹${staffShare}`);
  };

  return (
    <div className="bg-white/10 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Tips Processing</h3>
      <div className="space-y-4">
        <div>
          <label className="text-white text-sm">Staff Member</label>
          <CustomSelect
            className="w-full mt-1"
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
          >
            <option value="">-- Select Staff Member --</option>
            <option value="Sarah Johnson - Dealer">Sarah Johnson - Dealer</option>
            <option value="Mike Chen - Floor Manager">Mike Chen - Floor Manager</option>
            <option value="Emma Davis - Cashier">Emma Davis - Cashier</option>
          </CustomSelect>
        </div>
        <div>
          <label className="text-white text-sm">Total Tips Earned</label>
          <input
            type="number"
            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            placeholder="₹0.00"
            value={totalTips}
            onChange={(e) => handleTipsChange(e.target.value)}
          />
        </div>
        <div>
          <label className="text-white text-sm">Club Percentage</label>
          <input
            type="number"
            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            placeholder="15%"
            value={clubPercentage}
            onChange={(e) => handlePercentageChange(e.target.value)}
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="text-white text-sm">Staff Share</label>
          <input
            type="number"
            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            placeholder="₹0.00"
            value={staffShare}
            readOnly
          />
        </div>
        <button
          onClick={handleProcessTips}
          className="w-full bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Process Tips
        </button>
      </div>
    </div>
  );
}

