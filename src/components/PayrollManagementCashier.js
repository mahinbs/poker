import React, { useState } from "react";
import EmployeeSalary from "./EmployeeSalary";

export default function PayrollManagementCashier({ selectedClubId }) {
  // Cashier can only see Employee Salary, not Dealer Tips
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Payroll Management</h1>
      </div>

      {/* Employee Salary Only */}
      <EmployeeSalary selectedClubId={selectedClubId} />
    </div>
  );
}


