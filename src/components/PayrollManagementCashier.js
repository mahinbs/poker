import React, { useState } from "react";
import EmployeeSalary from "./EmployeeSalary";
import DealerTips from "./DealerTips";

export default function PayrollManagementCashier({ selectedClubId }) {
  const [activeTab, setActiveTab] = useState('salary'); // 'salary' or 'dealer'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Payroll Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('salary')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'salary'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Employee Salary
        </button>
        <button
          onClick={() => setActiveTab('dealer')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'dealer'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Dealer Tips & Cashouts
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'salary' ? (
        <EmployeeSalary selectedClubId={selectedClubId} />
      ) : (
        <DealerTips selectedClubId={selectedClubId} />
      )}
    </div>
  );
}


