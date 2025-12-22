import React from "react";
import CustomSelect from "./common/CustomSelect";

export default function EmployeeSalaryProcessingSection() {
  return (
    <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
      <h2 className="text-xl font-bold text-white mb-6">Salary & Payroll Processing</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Staff Salary Processing</h3>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm">Select Staff Member</label>
              <CustomSelect className="w-full mt-1">
                <option>Sarah Johnson - Dealer</option>
                <option>Mike Chen - Floor Manager</option>
                <option>Emma Davis - Cashier</option>
                <option>John Smith - Security</option>
              </CustomSelect>
            </div>
            <div>
              <label className="text-white text-sm">Pay Period</label>
              <CustomSelect className="w-full mt-1">
                <option>Weekly</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
              </CustomSelect>
            </div>
            <div>
              <label className="text-white text-sm">Base Salary</label>
              <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
            </div>
            <div>
              <label className="text-white text-sm">Overtime Hours</label>
              <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="0" />
            </div>
            <div>
              <label className="text-white text-sm">Deductions</label>
              <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
              Process Salary
            </button>
          </div>
        </div>

        <div className="bg-white/10 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Tips Processing</h3>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm">Staff Member</label>
              <CustomSelect className="w-full mt-1">
                <option>Sarah Johnson - Dealer</option>
                <option>Mike Chen - Floor Manager</option>
                <option>Emma Davis - Cashier</option>
              </CustomSelect>
            </div>
            <div>
              <label className="text-white text-sm">Total Tips Earned</label>
              <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" />
            </div>
            <div>
              <label className="text-white text-sm">Club Percentage</label>
              <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="15%" />
            </div>
            <div>
              <label className="text-white text-sm">Staff Share</label>
              <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="₹0.00" readOnly />
            </div>
            <button className="w-full bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold">
              Process Tips
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

