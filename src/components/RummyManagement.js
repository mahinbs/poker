import React, { useState } from "react";
import RummyTournamentManagement from "./RummyTournamentManagement";
import RummyTableManagement from "./RummyTableManagement";

/**
 * Rummy Management Component
 * Handles Rummy Tournaments and Rummy Tables CRUD operations
 * Only visible when rummy is enabled for the club
 * Uses rummy-specific components with rummy-specific fields
 */
export default function RummyManagement({ selectedClubId }) {
  const [activeTab, setActiveTab] = useState("tournaments"); // "tournaments" or "tables"

  if (!selectedClubId) {
    return (
      <div className="text-white">
        <h1 className="text-3xl font-bold mb-6">Rummy Management</h1>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <p className="text-gray-400">Please select a club to manage Rummy tournaments and tables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rummy Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-700">
        <button
          onClick={() => setActiveTab("tournaments")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "tournaments"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Rummy Tournaments
        </button>
        <button
          onClick={() => setActiveTab("tables")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "tables"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Rummy Tables
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "tournaments" && (
          <RummyTournamentManagement selectedClubId={selectedClubId} />
        )}

        {activeTab === "tables" && (
          <RummyTableManagement selectedClubId={selectedClubId} />
        )}
      </div>
    </div>
  );
}

