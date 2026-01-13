import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clubsAPI, staffAPI } from "../lib/api";
import toast from "react-hot-toast";
import { toDateIST, todayISTString } from "../utils/dateUtils";

// Attendance Management Component for HR
export default function AttendanceManagement({ selectedClubId }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const today = todayISTString();
  const [attendanceForm, setAttendanceForm] = useState({
    staffId: "",
    loginDate: today,
    loginTime: "",
    logoutDate: today,
    logoutTime: "",
    notes: "",
  });
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0], // Today by default
    endDate: new Date().toISOString().split('T')[0],
    searchTerm: "", // Changed from staffId to searchTerm for clarity
  });

  // Fetch staff members for dropdown
  const { data: staffData } = useQuery({
    queryKey: ['staff-list', selectedClubId],
    queryFn: () => staffAPI.getAllStaffMembers(selectedClubId, { status: 'Active' }),
    enabled: !!selectedClubId,
  });

  const staffMembers = staffData?.staff || [];

  // Fetch attendance records (without staffId filter - we'll filter client-side)
  const { data: allAttendanceRecords = [], isLoading } = useQuery({
    queryKey: ['attendance', selectedClubId, filters.startDate, filters.endDate],
    queryFn: () => clubsAPI.getAttendanceRecords(selectedClubId, filters.startDate, filters.endDate),
    enabled: !!selectedClubId,
  });

  // Filter attendance records client-side based on search term
  const attendanceRecords = useMemo(() => {
    if (!filters.searchTerm.trim()) {
      return allAttendanceRecords;
    }
    
    const searchLower = filters.searchTerm.toLowerCase().trim();
    return allAttendanceRecords.filter(record => {
      const staffName = (record.staffName || '').toLowerCase();
      const staffEmail = (record.staffEmail || record.email || '').toLowerCase();
      
      return staffName.includes(searchLower) || 
             staffEmail.includes(searchLower);
    });
  }, [allAttendanceRecords, filters.searchTerm]);

  // Fetch attendance stats
  const { data: stats } = useQuery({
    queryKey: ['attendanceStats', selectedClubId, filters.startDate, filters.endDate],
    queryFn: () => clubsAPI.getAttendanceStats(selectedClubId, filters.startDate, filters.endDate),
    enabled: !!selectedClubId,
  });

  // Create attendance mutation
  const createAttendanceMutation = useMutation({
    mutationFn: async (data) => {
      // Combine date and time for loginTime and logoutTime
      const loginDateTime = data.loginDate && data.loginTime 
        ? `${data.loginDate}T${data.loginTime}:00`
        : null;
      const logoutDateTime = data.logoutDate && data.logoutTime 
        ? `${data.logoutDate}T${data.logoutTime}:00`
        : null;

      // Use login date as the primary date for the record
      // Only include notes if it has a value
      const payload = {
        staffId: data.staffId,
        date: data.loginDate,
        loginTime: loginDateTime,
        logoutTime: logoutDateTime,
      };
      
      if (data.notes && data.notes.trim()) {
        payload.notes = data.notes.trim();
      }

      return await clubsAPI.createAttendanceRecord(selectedClubId, payload);
    },
    onSuccess: () => {
      toast.success('Attendance record created successfully!');
      queryClient.invalidateQueries(['attendance', selectedClubId]);
      queryClient.invalidateQueries(['attendanceStats', selectedClubId]);
      setShowCreateModal(false);
      const today = new Date().toISOString().split('T')[0];
      setAttendanceForm({
        staffId: "",
        loginDate: today,
        loginTime: "",
        logoutDate: today,
        logoutTime: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create attendance record');
    },
  });

  const handleCreateAttendance = (e) => {
    e.preventDefault();
    if (!attendanceForm.staffId || !attendanceForm.loginDate || !attendanceForm.loginTime || !attendanceForm.logoutDate || !attendanceForm.logoutTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validate logout datetime is after login datetime
    const loginDateTime = new Date(`${attendanceForm.loginDate}T${attendanceForm.loginTime}`);
    const logoutDateTime = new Date(`${attendanceForm.logoutDate}T${attendanceForm.logoutTime}`);
    
    if (logoutDateTime <= loginDateTime) {
      toast.error('Logout date & time must be after login date & time');
      return;
    }
    
    createAttendanceMutation.mutate(attendanceForm);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateHours = (loginTime, logoutTime) => {
    if (!loginTime || !logoutTime) return '-';
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const diffMs = logout - login;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(2);
  };

  console.log({attendanceRecords})

  return (
    <div className="text-white space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-gray-400">Track login and logout times for all employees</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          + Create Attendance
        </button>
      </div>

      {!selectedClubId && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 text-yellow-100">
          <p className="font-medium">Please select a club to view attendance records.</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Total Records</p>
            <p className="text-3xl font-bold text-white">{stats.totalRecords || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Active Sessions</p>
            <p className="text-3xl font-bold text-blue-400">{stats.activeSessions || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Completed Sessions</p>
            <p className="text-3xl font-bold text-green-400">{stats.completedSessions || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <p className="text-gray-400 text-sm mb-2">Avg Hours/Day</p>
            <p className="text-3xl font-bold text-purple-400">{stats.avgHours || '0.00'}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <input
            type="text"
            placeholder="Search by staff name or email..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setFilters({ startDate: today, endDate: today, searchTerm: "" });
            }}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-colors"
          >
            Reset to Today
          </button>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading attendance records...</p>
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏰</div>
            <p className="text-xl text-gray-300">No attendance records found</p>
          </div>
        ) : (
          <>
            <div className="p-4 text-sm text-gray-400">
              Showing {attendanceRecords.length} attendance record(s)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Staff Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Login Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Logout Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-750">
                      <td className="px-6 py-4 font-medium">{record.staffName}</td>
                      <td className="px-6 py-4 text-gray-400">{record.staffRole || '-'}</td>
                      <td className="px-6 py-4 text-gray-400">{formatDate(record.date)}</td>
                      <td className="px-6 py-4 text-green-400 font-medium">{formatTime(record.loginTime)}</td>
                      <td className="px-6 py-4 text-red-400 font-medium">
                        {record.logoutTime ? formatTime(record.logoutTime) : '-'}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {record.totalHours ? `${record.totalHours} hrs` : calculateHours(record.loginTime, record.logoutTime) !== '-' ? `${calculateHours(record.loginTime, record.logoutTime)} hrs` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            record.status === 'active'
                              ? 'bg-blue-600/20 text-blue-400'
                              : record.status === 'completed'
                              ? 'bg-green-600/20 text-green-400'
                              : 'bg-yellow-600/20 text-yellow-400'
                          }`}
                        >
                          {record.status === 'active' ? 'Active' : record.status === 'completed' ? 'Completed' : 'Incomplete'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      
      {/* Create Attendance Modal */}
      {showCreateModal && (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-2xl w-full border border-blue-600 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create Attendance Record</h2>
          <button
            onClick={() => {
              setShowCreateModal(false);
              const today = new Date().toISOString().split('T')[0];
              setAttendanceForm({
                staffId: "",
                loginDate: today,
                loginTime: "",
                logoutDate: today,
                logoutTime: "",
                notes: "",
              });
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleCreateAttendance} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Staff Member *</label>
            <select
              value={attendanceForm.staffId}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, staffId: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Staff Member</option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} - {staff.role || 'Staff'} {staff.employeeId ? `(${staff.employeeId})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Login Date & Time *</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Login Date</label>
                  <input
                    type="date"
                    value={attendanceForm.loginDate}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, loginDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Login Time</label>
                  <input
                    type="time"
                    value={attendanceForm.loginTime}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, loginTime: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Logout Date & Time *</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Logout Date</label>
                  <input
                    type="date"
                    value={attendanceForm.logoutDate}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, logoutDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    min={attendanceForm.loginDate}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Logout Time</label>
                  <input
                    type="time"
                    value={attendanceForm.logoutTime}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, logoutTime: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">💡 Logout can be on a different day (e.g., login 7pm Dec 25, logout 2am Dec 26)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
            <textarea
              value={attendanceForm.notes}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                const today = new Date().toISOString().split('T')[0];
                setAttendanceForm({
                  staffId: "",
                  loginDate: today,
                  loginTime: "",
                  logoutDate: today,
                  logoutTime: "",
                  notes: "",
                });
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAttendanceMutation.isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {createAttendanceMutation.isLoading ? 'Creating...' : 'Create Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
      )}
    </div>
  );

  function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

