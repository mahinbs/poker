import React, { useState } from "react";
import EmployeeSalary from "./EmployeeSalary";
import DealerTips from "./DealerTips";

export default function PayrollManagement({ selectedClubId }) {
  const [activeTab, setActiveTab] = useState("salary"); // 'salary' or 'tips'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Payroll Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab("salary")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "salary"
              ? "text-white border-b-2 border-purple-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Employee Salary
        </button>
        <button
          onClick={() => setActiveTab("tips")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "tips"
              ? "text-white border-b-2 border-purple-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Dealer Tips
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "salary" && <EmployeeSalary selectedClubId={selectedClubId} />}
      {activeTab === "tips" && <DealerTips selectedClubId={selectedClubId} />}
    </div>
  );
}

