import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollAPI } from "../lib/api";
import toast from "react-hot-toast";

export default function EmployeeSalary({ selectedClubId }) {
  const queryClient = useQueryClient();
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    staffId: "",
  });

  const [salaryForm, setSalaryForm] = useState({
    staffId: "",
    payPeriod: "Weekly",
    baseSalary: "",
    overtimeHours: "",
    overtimeAmount: "",
    deductions: "",
    periodStartDate: "",
    periodEndDate: "",
    notes: "",
  });

  // Get staff list
  const { data: staffData } = useQuery({
    queryKey: ["payroll-staff", selectedClubId],
    queryFn: () => payrollAPI.getAllStaffForPayroll(selectedClubId),
    enabled: !!selectedClubId,
  });

  // Get salary payments with pagination
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["salary-payments", selectedClubId, currentPage, filters],
    queryFn: () =>
      payrollAPI.getSalaryPayments(selectedClubId, {
        page: currentPage,
        limit: 10,
        ...filters,
      }),
    enabled: !!selectedClubId,
  });

  // Process salary mutation
  const processMutation = useMutation({
    mutationFn: (data) => payrollAPI.processSalary(selectedClubId, data),
    onSuccess: () => {
      toast.success("Salary processed successfully!");
      queryClient.invalidateQueries(["salary-payments", selectedClubId]);
      setShowProcessModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process salary");
    },
  });

  const resetForm = () => {
    setSalaryForm({
      staffId: "",
      payPeriod: "Weekly",
      baseSalary: "",
      overtimeHours: "",
      overtimeAmount: "",
      deductions: "",
      periodStartDate: "",
      periodEndDate: "",
      notes: "",
    });
    setSelectedEmployee(null);
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setSalaryForm({
      ...salaryForm,
      staffId: employee.id,
      baseSalary: Number(employee.baseSalary || 0) > 0 ? String(employee.baseSalary) : "",
      payPeriod: employee.salaryType || "Monthly",
    });
    setShowProcessModal(true);
  };

  const handleProcessSalary = () => {
    if (!salaryForm.staffId || !salaryForm.baseSalary || !salaryForm.periodStartDate || !salaryForm.periodEndDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    processMutation.mutate({
      ...salaryForm,
      baseSalary: Number(salaryForm.baseSalary),
      overtimeHours: salaryForm.overtimeHours ? Number(salaryForm.overtimeHours) : 0,
      overtimeAmount: salaryForm.overtimeAmount ? Number(salaryForm.overtimeAmount) : 0,
      deductions: salaryForm.deductions ? Number(salaryForm.deductions) : 0,
    });
  };

  const staff = staffData?.staff || [];
  const payments = paymentsData?.payments || [];
  const totalPages = paymentsData?.totalPages || 1;
  const total = paymentsData?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Employee Salary Processing</h2>
        <div className="text-white">Total Records: {total}</div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-white text-sm mb-1 block">Search</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label className="text-white text-sm mb-1 block">Start Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-white text-sm mb-1 block">End Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-white text-sm mb-1 block">Employee</label>
            <select
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              value={filters.staffId}
              onChange={(e) => setFilters({ ...filters, staffId: e.target.value })}
            >
              <option value="">All Employees</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Select Employee to Process Salary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
          {staff.map((employee) => (
            <button
              key={employee.id}
              onClick={() => handleEmployeeClick(employee)}
              className="bg-slate-700 hover:bg-slate-600 p-4 rounded-lg text-left transition-colors"
            >
              <div className="text-white font-semibold">{employee.name}</div>
              <div className="text-sm text-gray-400">{employee.role}</div>
              <div className="text-xs text-gray-500 mt-1">{employee.email}</div>
              {Number(employee.baseSalary || 0) > 0 && (
                <div className="text-xs text-green-400 mt-1">
                  ₹{Number(employee.baseSalary).toFixed(0)} / {employee.salaryType || "Monthly"}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Payments History */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Salary Payment History</h3>
        
        {isLoading ? (
          <div className="text-white text-center py-8">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No salary payments found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-white font-semibold p-3">Employee</th>
                    <th className="text-left text-white font-semibold p-3">Period</th>
                    <th className="text-left text-white font-semibold p-3">Pay Period</th>
                    <th className="text-right text-white font-semibold p-3">Base Salary</th>
                    <th className="text-right text-white font-semibold p-3">Overtime</th>
                    <th className="text-right text-white font-semibold p-3">Deductions</th>
                    <th className="text-right text-white font-semibold p-3">Net Amount</th>
                    <th className="text-left text-white font-semibold p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-700 hover:bg-slate-700">
                      <td className="text-white p-3">{payment.staff?.name}</td>
                      <td className="text-white p-3 text-sm">
                        {new Date(payment.periodStartDate).toLocaleDateString()} -{" "}
                        {new Date(payment.periodEndDate).toLocaleDateString()}
                      </td>
                      <td className="text-white p-3">{payment.payPeriod}</td>
                      <td className="text-right text-white p-3">₹{Number(payment.baseSalary).toFixed(2)}</td>
                      <td className="text-right text-green-400 p-3">
                        +₹{Number(payment.overtimeAmount).toFixed(2)}
                      </td>
                      <td className="text-right text-red-400 p-3">
                        -₹{Number(payment.deductions).toFixed(2)}
                      </td>
                      <td className="text-right text-white font-semibold p-3">
                        ₹{Number(payment.netAmount).toFixed(2)}
                      </td>
                      <td className="text-white p-3">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-400 text-sm">
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, total)} of {total} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === i + 1
                          ? "bg-purple-600 text-white"
                          : "bg-slate-700 hover:bg-slate-600 text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Process Salary Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-xl p-6 max-w-2xl w-full border border-purple-600 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Process Staff Salary</h2>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-1 block">Select Staff Member *</label>
                <select
                  className="w-full px-3 py-2 bg-purple-800/50 border border-purple-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  value={salaryForm.staffId}
                  onChange={(e) => {
                    const selected = staffData?.staff.find((s) => s.id === e.target.value);
                    setSalaryForm({
                      ...salaryForm,
                      staffId: e.target.value,
                      baseSalary: selected && Number(selected.baseSalary || 0) > 0 ? String(selected.baseSalary) : salaryForm.baseSalary,
                      payPeriod: selected?.salaryType || salaryForm.payPeriod,
                    });
                    setSelectedEmployee(selected);
                  }}
                >
                  <option value="">Select an option</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Pay Period *</label>
                <select
                  className="w-full px-3 py-2 bg-purple-800/50 border border-purple-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  value={salaryForm.payPeriod}
                  onChange={(e) => setSalaryForm({ ...salaryForm, payPeriod: e.target.value })}
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-1 block">Period Start Date *</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-purple-800/50 border border-purple-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    value={salaryForm.periodStartDate}
                    onChange={(e) => setSalaryForm({ ...salaryForm, periodStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-1 block">Period End Date *</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-purple-800/50 border border-purple-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    value={salaryForm.periodEndDate}
                    onChange={(e) => setSalaryForm({ ...salaryForm, periodEndDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Base Salary *</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-purple-800/50 border border-purple-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="₹0.00"
                  value={salaryForm.baseSalary}
                  onChange={(e) => setSalaryForm({ ...salaryForm, baseSalary: e.target.value })}
                />
                {selectedEmployee && Number(selectedEmployee.baseSalary || 0) > 0 && (
                  <p className="text-xs text-green-400 mt-1">
                    Staff configured salary: ₹{Number(selectedEmployee.baseSalary).toFixed(2)} / {selectedEmployee.salaryType || "Monthly"}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-1 block">Overtime Hours</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-purple-800/50 border border-purple-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                    value={salaryForm.overtimeHours}
                    onChange={(e) => setSalaryForm({ ...salaryForm, overtimeHours: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-1 block">Overtime Amount</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-purple-800/50 border border-purple-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="₹0.00"
                    value={salaryForm.overtimeAmount}
                    onChange={(e) => setSalaryForm({ ...salaryForm, overtimeAmount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Deductions</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-purple-800/50 border border-purple-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="₹0.00"
                  value={salaryForm.deductions}
                  onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
                />
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Notes</label>
                <textarea
                  className="w-full px-3 py-2 bg-purple-800/50 border border-purple-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 h-20"
                  placeholder="Additional notes..."
                  value={salaryForm.notes}
                  onChange={(e) => setSalaryForm({ ...salaryForm, notes: e.target.value })}
                />
              </div>

              {/* Calculated Summary */}
              {salaryForm.baseSalary && (
                <div className="bg-purple-800/30 border border-purple-500 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Calculation Summary</h3>
                  <div className="space-y-1 text-white">
                    <div className="flex justify-between">
                      <span>Base Salary:</span>
                      <span>₹{Number(salaryForm.baseSalary || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-400">
                      <span>Overtime:</span>
                      <span>+₹{Number(salaryForm.overtimeAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-400">
                      <span>Deductions:</span>
                      <span>-₹{Number(salaryForm.deductions || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-purple-500 pt-2 mt-2">
                      <span>Net Amount:</span>
                      <span>
                        ₹
                        {(
                          Number(salaryForm.baseSalary || 0) +
                          Number(salaryForm.overtimeAmount || 0) -
                          Number(salaryForm.deductions || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleProcessSalary}
                disabled={processMutation.isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {processMutation.isLoading ? "Processing..." : "Process Salary"}
              </button>
              <button
                onClick={() => {
                  setShowProcessModal(false);
                  resetForm();
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
