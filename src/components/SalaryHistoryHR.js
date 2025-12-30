import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { clubsAPI } from "../lib/api";

// HR-restricted Salary History - Read-only list of salary payments
export default function SalaryHistoryHR({ selectedClubId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    staffId: "",
  });

  // Get salary payments (read-only)
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["salary-payments", selectedClubId, currentPage, filters],
    queryFn: async () => {
      const result = await clubsAPI.getSalaryPayments(selectedClubId, {
        page: currentPage,
        limit: 10,
        ...filters,
      });
      return result;
    },
    enabled: !!selectedClubId,
  });

  const payments = paymentsData?.payments || [];
  const totalPages = paymentsData?.totalPages || 1;
  const totalRecords = paymentsData?.total || 0;

  const formatCurrency = (value) => `₹${(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="text-white space-y-6">
      <h1 className="text-3xl font-bold">Salary History</h1>
      <p className="text-gray-400">View-only: Salary payment history for all employees</p>

      {!selectedClubId && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 text-yellow-100">
          <p className="font-medium">Please select a club to view salary history.</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by staff name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            placeholder="Start Date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            placeholder="End Date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setFilters({ search: "", startDate: "", endDate: "", staffId: "" })}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Salary Payments Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading salary history...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-xl text-gray-300">No salary payments found</p>
          </div>
        ) : (
          <>
            <div className="p-4 text-sm text-gray-400 flex justify-between items-center">
              <span>Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalRecords)} of {totalRecords} payments</span>
            </div>
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Staff Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Pay Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Base Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Overtime</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Deductions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Gross Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Net Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Payment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-750">
                    <td className="px-6 py-4 font-medium">{payment.staff?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-400">{payment.payPeriod || '-'}</td>
                    <td className="px-6 py-4 text-white">{formatCurrency(payment.baseSalary)}</td>
                    <td className="px-6 py-4 text-white">{formatCurrency(payment.overtimeAmount)}</td>
                    <td className="px-6 py-4 text-red-400">{formatCurrency(payment.deductions)}</td>
                    <td className="px-6 py-4 text-white font-medium">{formatCurrency(payment.grossAmount)}</td>
                    <td className="px-6 py-4 text-green-400 font-bold">{formatCurrency(payment.netAmount)}</td>
                    <td className="px-6 py-4 text-gray-400">{formatDate(payment.paymentDate)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          payment.status === 'Processed'
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-yellow-600/20 text-yellow-400'
                        }`}
                      >
                        {payment.status || 'Processed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}




