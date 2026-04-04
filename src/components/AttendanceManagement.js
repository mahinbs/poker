import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clubsAPI, staffAPI } from "../lib/api";
import toast from "react-hot-toast";
import { todayISTString, formatHhmm12h, formatAttendanceOrHhmm12h } from "../utils/dateUtils";

// Attendance Management Component for HR
export default function AttendanceManagement({ selectedClubId }) {
  const [activeTab, setActiveTab] = useState("daily"); // 'daily' or 'records'
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
    startDate: today,
    endDate: today,
    searchTerm: "",
  });

  // ========== DAILY ATTENDANCE STATE ==========
  const [dailyDate, setDailyDate] = useState(today);
  const [checkedStaff, setCheckedStaff] = useState({});
  const [customTimes, setCustomTimes] = useState({});
  /** Per staff: roster off-day row unlocked for overtime marking (tap status pill on that row) */
  const [offDayOvertimeByStaff, setOffDayOvertimeByStaff] = useState({});
  const [overtimeByStaff, setOvertimeByStaff] = useState({});
  const [editForm, setEditForm] = useState(null);

  const canEditAttendance = useMemo(() => {
    try {
      const u = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        ...JSON.parse(localStorage.getItem("superadminuser") || "{}"),
      };
      const role = String(u.role || "")
        .toUpperCase()
        .replace(/\s+/g, "_");
      if (u.isMasterAdmin) return true;
      if (role === "SUPER_ADMIN" || role === "MASTER_ADMIN") return true;
      if (["HR", "ADMIN", "MANAGER"].includes(role)) return true;
      if (String(u.role) === "Super Admin") return true;
    } catch (_) {
      /* ignore */
    }
    return false;
  }, []);

  const [selectedRecordIds, setSelectedRecordIds] = useState({});

  // Fetch staff members for dropdown
  const { data: staffData } = useQuery({
    queryKey: ['staff-list', selectedClubId],
    queryFn: () => staffAPI.getAllStaffMembers(selectedClubId, { status: 'Active' }),
    enabled: !!selectedClubId,
  });

  const staffMembers = staffData?.staff || [];

  // Fetch attendance records
  const { data: allAttendanceRecords = [], isLoading } = useQuery({
    queryKey: ['attendance', selectedClubId, filters.startDate, filters.endDate],
    queryFn: () => clubsAPI.getAttendanceRecords(selectedClubId, filters.startDate, filters.endDate),
    enabled: !!selectedClubId && activeTab === 'records',
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
    enabled: !!selectedClubId && activeTab === 'records',
  });

  // ========== DAILY ROSTER QUERY ==========
  const { data: dailyRoster = [], isLoading: rosterLoading, refetch: refetchRoster } = useQuery({
    queryKey: ['daily-roster', selectedClubId, dailyDate],
    queryFn: () => clubsAPI.getDailyRoster(selectedClubId, dailyDate),
    enabled: !!selectedClubId && activeTab === 'daily',
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    onSuccess: (data) => {
      const newChecked = {};
      data.forEach((s) => {
        if (s.alreadyLogged || s.isOnLeave) return;
        if (s.isOffDay) return;
        newChecked[s.staffId] = false;
      });
      setCheckedStaff(newChecked);
      setCustomTimes({});
      setOvertimeByStaff({});
      setOffDayOvertimeByStaff({});
    },
  });

  // Create attendance mutation
  const createAttendanceMutation = useMutation({
    mutationFn: async (data) => {
      const loginDateTime = data.loginDate && data.loginTime 
        ? `${data.loginDate}T${data.loginTime}:00`
        : null;
      const logoutDateTime = data.logoutDate && data.logoutTime 
        ? `${data.logoutDate}T${data.logoutTime}:00`
        : null;

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
      queryClient.invalidateQueries(['daily-roster', selectedClubId]);
      setShowCreateModal(false);
      const today = todayISTString();
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

  // ========== BULK ATTENDANCE MUTATION ==========
  const bulkAttendanceMutation = useMutation({
    mutationFn: async ({ entries, allowOffDayExtraAttendance }) => {
      return await clubsAPI.bulkCreateAttendance(selectedClubId, entries, allowOffDayExtraAttendance);
    },
    onSuccess: (result) => {
      toast.success(`Attendance marked: ${result.created} created, ${result.skipped} skipped`);
      queryClient.invalidateQueries(['daily-roster', selectedClubId]);
      queryClient.invalidateQueries(['attendance', selectedClubId]);
      queryClient.invalidateQueries(['attendanceStats', selectedClubId]);
      setCheckedStaff({});
      setCustomTimes({});
      setOvertimeByStaff({});
      setOffDayOvertimeByStaff({});
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit bulk attendance');
    },
  });

  const bulkDeleteAttendanceMutation = useMutation({
    mutationFn: (recordIds) => clubsAPI.bulkDeleteAttendanceRecords(selectedClubId, recordIds),
    onSuccess: (res) => {
      toast.success(`Deleted ${res.deleted ?? 0} attendance record(s)`);
      setSelectedRecordIds({});
      queryClient.invalidateQueries(['attendance', selectedClubId]);
      queryClient.invalidateQueries(['attendanceStats', selectedClubId]);
      queryClient.invalidateQueries(['daily-roster', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete attendance records');
    },
  });

  const deleteAttendanceMutation = useMutation({
    mutationFn: (recordId) => clubsAPI.deleteAttendanceRecord(selectedClubId, recordId),
    onSuccess: () => {
      toast.success('Attendance record deleted');
      queryClient.invalidateQueries(['attendance', selectedClubId]);
      queryClient.invalidateQueries(['attendanceStats', selectedClubId]);
      queryClient.invalidateQueries(['daily-roster', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete attendance');
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: ({ recordId, payload }) =>
      clubsAPI.updateAttendanceRecord(selectedClubId, recordId, payload),
    onSuccess: () => {
      toast.success('Attendance updated');
      setEditForm(null);
      queryClient.invalidateQueries(['attendance', selectedClubId]);
      queryClient.invalidateQueries(['attendanceStats', selectedClubId]);
      queryClient.invalidateQueries(['daily-roster', selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update attendance');
    },
  });

  const handleCreateAttendance = (e) => {
    e.preventDefault();
    if (!attendanceForm.staffId || !attendanceForm.loginDate || !attendanceForm.loginTime || !attendanceForm.logoutDate || !attendanceForm.logoutTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const todayCap = todayISTString();
    if (attendanceForm.loginDate > todayCap || attendanceForm.logoutDate > todayCap) {
      toast.error('Cannot record attendance for a future date');
      return;
    }
    
    const loginDateTime = new Date(`${attendanceForm.loginDate}T${attendanceForm.loginTime}`);
    const logoutDateTime = new Date(`${attendanceForm.logoutDate}T${attendanceForm.logoutTime}`);
    
    if (logoutDateTime <= loginDateTime) {
      toast.error('Logout date & time must be after login date & time');
      return;
    }
    
    createAttendanceMutation.mutate(attendanceForm);
  };

  const isoToWallHHmm = useCallback((iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const h = String(d.getUTCHours()).padStart(2, "0");
    const m = String(d.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }, []);

  const ymdFromIso = useCallback((iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  useEffect(() => {
    setSelectedRecordIds({});
  }, [filters.startDate, filters.endDate, selectedClubId, activeTab]);

  const calculateHours = (loginTime, logoutTime) => {
    if (!loginTime || !logoutTime) return '-';
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const diffMs = logout - login;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(2);
  };

  // ========== DAILY ATTENDANCE HELPERS ==========
  const eligibleStaff = dailyRoster.filter(
    (s) => !s.alreadyLogged && !s.isOnLeave && (!s.isOffDay || offDayOvertimeByStaff[s.staffId])
  );
  const checkedCount = eligibleStaff.filter((s) => checkedStaff[s.staffId]).length;

  const rosterById = useMemo(() => {
    const m = {};
    dailyRoster.forEach((s) => {
      m[s.staffId] = s;
    });
    return m;
  }, [dailyRoster]);

  const handleToggleStaff = (staffId) => {
    setCheckedStaff(prev => ({ ...prev, [staffId]: !prev[staffId] }));
  };

  const handleMarkAll = () => {
    const newChecked = {};
    eligibleStaff.forEach(s => {
      newChecked[s.staffId] = true;
    });
    setCheckedStaff(newChecked);
  };

  const handleUnmarkAll = () => {
    const newChecked = {};
    eligibleStaff.forEach(s => {
      newChecked[s.staffId] = false;
    });
    setCheckedStaff(newChecked);
  };

  const handleCustomTimeChange = (staffId, field, value) => {
    setCustomTimes(prev => ({
      ...prev,
      [staffId]: { ...(prev[staffId] || {}), [field]: value },
    }));
  };

  const handleOvertimeChange = (staffId, value) => {
    const n = parseFloat(value);
    const safe = Number.isFinite(n) && n >= 0 ? n : 0;
    setOvertimeByStaff((prev) => ({ ...prev, [staffId]: safe }));
  };

  const toggleOffDayOvertimeForStaff = (staffId) => {
    setOffDayOvertimeByStaff((prev) => {
      const was = !!prev[staffId];
      if (was) {
        setCheckedStaff((c) => ({ ...c, [staffId]: false }));
      }
      return { ...prev, [staffId]: !was };
    });
  };

  const openEditRecord = (record) => {
    const loginDate = ymdFromIso(record.loginTime);
    const logoutDate = record.logoutTime ? ymdFromIso(record.logoutTime) : loginDate;
    setEditForm({
      id: record.id,
      staffName: record.staffName || "",
      loginDate: loginDate || todayISTString(),
      loginTime: record.loginDisplay || isoToWallHHmm(record.loginTime),
      logoutDate: logoutDate || loginDate || todayISTString(),
      logoutTime: record.logoutDisplay || (record.logoutTime ? isoToWallHHmm(record.logoutTime) : ""),
      overtimeHours: record.overtimeHours ?? 0,
      editReason: "",
    });
  };

  const handleSaveEditAttendance = (e) => {
    e.preventDefault();
    if (!editForm) return;
    if (!editForm.loginDate || !editForm.loginTime || !editForm.logoutDate || !editForm.logoutTime) {
      toast.error("Login and logout date & time are required");
      return;
    }
    if (!editForm.editReason || !editForm.editReason.trim()) {
      toast.error("Please enter a reason for this edit (required for audit)");
      return;
    }
    const loginDt = new Date(`${editForm.loginDate}T${editForm.loginTime}:00`);
    const logoutDt = new Date(`${editForm.logoutDate}T${editForm.logoutTime}:00`);
    if (logoutDt <= loginDt) {
      toast.error("Logout must be after login");
      return;
    }
    updateAttendanceMutation.mutate({
      recordId: editForm.id,
      payload: {
        loginTime: `${editForm.loginDate}T${editForm.loginTime}:00`,
        logoutTime: `${editForm.logoutDate}T${editForm.logoutTime}:00`,
        overtimeHours: Number(editForm.overtimeHours) || 0,
        editReason: editForm.editReason.trim(),
      },
    });
  };

  const handleSubmitBulkAttendance = () => {
    const todayCap = todayISTString();
    if (dailyDate > todayCap) {
      toast.error('Cannot submit attendance for a future date');
      return;
    }

    const selectedStaffIds = eligibleStaff.filter((s) => checkedStaff[s.staffId]).map((s) => s.staffId);

    if (selectedStaffIds.length === 0) {
      toast.error('Please select at least one staff member');
      return;
    }

    const entries = selectedStaffIds.map((staffId) => {
      const member = rosterById[staffId];
      const ct = customTimes[staffId];
      const hasCustomTimes = ct?.loginTime && ct?.logoutTime;
      const otRaw = overtimeByStaff[staffId];
      const overtimeHours = Number.isFinite(Number(otRaw)) ? Number(otRaw) : 0;
      const workedRosterOffDay = Boolean(member?.isOffDay && offDayOvertimeByStaff[staffId]);

      if (hasCustomTimes) {
        return {
          staffId,
          date: dailyDate,
          loginTime: `${dailyDate}T${ct.loginTime}:00`,
          logoutTime: `${dailyDate}T${ct.logoutTime}:00`,
          useShiftTimes: false,
          overtimeHours,
          ...(workedRosterOffDay ? { workedRosterOffDay: true } : {}),
        };
      }

      return {
        staffId,
        date: dailyDate,
        useShiftTimes: true,
        overtimeHours,
        ...(workedRosterOffDay ? { workedRosterOffDay: true } : {}),
      };
    });

    bulkAttendanceMutation.mutate({ entries, allowOffDayExtraAttendance: false });
  };

  // ========== TABS ==========
  const tabs = [
    { id: 'daily', label: 'Daily Attendance' },
    { id: 'records', label: 'Records & Stats' },
  ];

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
          + Manual Entry
        </button>
      </div>

      {!selectedClubId && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 text-yellow-100">
          <p className="font-medium">Please select a club to view attendance records.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========== DAILY ATTENDANCE TAB ========== */}
      {activeTab === 'daily' && selectedClubId && (
        <div className="space-y-4">
          {/* Date Picker & Actions */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Date</label>
              <input
                type="date"
                value={dailyDate}
                max={todayISTString()}
                onChange={(e) => setDailyDate(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 items-end mt-auto">
              <button
                onClick={handleMarkAll}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                Mark All Present ({eligibleStaff.length})
              </button>
              <button
                onClick={handleUnmarkAll}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Unmark All
              </button>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="text-sm text-gray-400">
                <span className="text-white font-bold">{checkedCount}</span> / {eligibleStaff.length} selected
              </div>
              <button
                onClick={handleSubmitBulkAttendance}
                disabled={checkedCount === 0 || bulkAttendanceMutation.isLoading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkAttendanceMutation.isLoading ? 'Submitting...' : `Submit Attendance (${checkedCount})`}
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {rosterLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Loading staff roster...</p>
              </div>
            ) : dailyRoster.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-xl text-gray-300">No active staff found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase w-12">
                        <input
                          type="checkbox"
                          checked={
                            eligibleStaff.length > 0 &&
                            eligibleStaff.every((s) => checkedStaff[s.staffId])
                          }
                          onChange={() => {
                            if (eligibleStaff.length > 0 && eligibleStaff.every((s) => checkedStaff[s.staffId])) {
                              handleUnmarkAll();
                            } else {
                              handleMarkAll();
                            }
                          }}
                          className="w-4 h-4 rounded bg-slate-600 border-slate-500 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Staff Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Shift Times</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Custom Login</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Custom Logout</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase w-28">
                        OT (hrs)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {dailyRoster.map((member) => {
                      const offDayUnlocked = !!offDayOvertimeByStaff[member.staffId];
                      const isDisabled =
                        member.alreadyLogged ||
                        member.isOnLeave ||
                        (member.isOffDay && !offDayUnlocked);
                      const isChecked = checkedStaff[member.staffId] || false;
                      const ct = customTimes[member.staffId] || {};

                      let statusBadge;
                      if (member.alreadyLogged) {
                        statusBadge = (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-600/20 text-green-400 border border-green-500/30">
                              Logged
                            </span>
                            {member.attendanceWorkedRosterOffDay ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-500/35">
                                Overtime day
                              </span>
                            ) : null}
                          </div>
                        );
                      } else if (member.isOnLeave) {
                        statusBadge = (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-600/20 text-yellow-400 border border-yellow-500/30">
                            On Leave
                          </span>
                        );
                      } else if (member.isOffDay) {
                        if (!offDayUnlocked) {
                          statusBadge = (
                            <button
                              type="button"
                              onClick={() => toggleOffDayOvertimeForStaff(member.staffId)}
                              className="px-2 py-1 rounded-md text-xs font-semibold bg-red-950/50 text-red-300 border border-red-500/40 hover:bg-red-900/40 hover:border-red-400/60 transition-colors text-left cursor-pointer"
                            >
                              Off day
                            </button>
                          );
                        } else if (isChecked) {
                          statusBadge = (
                            <button
                              type="button"
                              onClick={() => toggleOffDayOvertimeForStaff(member.staffId)}
                              className="px-2 py-1 rounded-md text-xs font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/40 transition-colors text-left cursor-pointer"
                            >
                              Overtime day · tap to undo
                            </button>
                          );
                        } else {
                          statusBadge = (
                            <button
                              type="button"
                              onClick={() => toggleOffDayOvertimeForStaff(member.staffId)}
                              className="px-2 py-1 rounded-md text-xs font-semibold bg-amber-950/40 text-amber-200 border border-amber-500/35 hover:bg-amber-900/35 transition-colors text-left cursor-pointer"
                            >
                              Overtime
                            </button>
                          );
                        }
                      } else if (isChecked) {
                        statusBadge = (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                            Present
                          </span>
                        );
                      } else {
                        statusBadge = (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-600/20 text-gray-500 border border-slate-500/30">
                            Pending
                          </span>
                        );
                      }

                      return (
                        <tr
                          key={member.staffId}
                          className={`hover:bg-slate-750 ${isDisabled ? 'opacity-60' : ''} ${isChecked ? 'bg-blue-900/10' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleStaff(member.staffId)}
                              disabled={isDisabled}
                              className="w-4 h-4 rounded bg-slate-600 border-slate-500 text-blue-600 focus:ring-blue-500 disabled:opacity-40"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{member.staffName}</div>
                            {member.employeeId && (
                              <div className="text-xs text-gray-500">{member.employeeId}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-400">{member.staffRole}</td>
                          <td className="px-4 py-3 text-gray-400 text-sm">
                            {member.hasShift && member.shiftStartDisplay && member.shiftEndDisplay ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-gray-200">
                                    {formatHhmm12h(member.shiftStartDisplay)} –{' '}
                                    {formatHhmm12h(member.shiftEndDisplay)}
                                  </span>
                                  {member.shiftCrossesMidnight ? (
                                    <span className="inline-flex items-center rounded-full border border-violet-400/35 bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-100 shadow-sm">
                                      Next day
                                    </span>
                                  ) : null}
                                </div>
                                {member.isOffDay && !offDayUnlocked && (
                                  <span className="text-xs text-amber-400/90">
                                    Roster off — tap <strong className="text-red-200">Off day</strong> in Status to mark overtime
                                  </span>
                                )}
                              </div>
                            ) : member.hasShift && !member.isOffDay ? (
                              <span>
                                {formatAttendanceOrHhmm12h(member.shiftStartTime)} –{' '}
                                {formatAttendanceOrHhmm12h(member.shiftEndTime)}
                              </span>
                            ) : member.isOffDay ? (
                              <span className="text-gray-500 italic">No scheduled shift (off)</span>
                            ) : (
                              <span className="text-gray-500 italic">No shift</span>
                            )}
                          </td>
                          <td className="px-4 py-3">{statusBadge}</td>
                          <td className="px-4 py-3">
                            {!isDisabled && (
                              <input
                                type="time"
                                value={ct.loginTime || ''}
                                onChange={(e) => handleCustomTimeChange(member.staffId, 'loginTime', e.target.value)}
                                className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 w-28"
                                placeholder="Custom"
                              />
                            )}
                            {member.alreadyLogged && (
                              <span className="text-gray-600 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {!isDisabled && (
                              <input
                                type="time"
                                value={ct.logoutTime || ''}
                                onChange={(e) => handleCustomTimeChange(member.staffId, 'logoutTime', e.target.value)}
                                className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 w-28"
                                placeholder="Custom"
                              />
                            )}
                            {member.alreadyLogged && (
                              <span className="text-gray-600 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {!isDisabled && (
                              <input
                                type="number"
                                min={0}
                                step={0.25}
                                value={
                                  overtimeByStaff[member.staffId] === undefined
                                    ? ''
                                    : overtimeByStaff[member.staffId]
                                }
                                placeholder="0"
                                onChange={(e) => handleOvertimeChange(member.staffId, e.target.value)}
                                className="w-24 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                            {member.alreadyLogged &&
                              (member.attendanceOvertimeHours != null && member.attendanceOvertimeHours > 0 ? (
                                <span className="text-amber-300 text-sm font-medium">
                                  {member.attendanceOvertimeHours}h OT
                                </span>
                              ) : (
                                <span className="text-gray-500 text-sm">0</span>
                              ))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-sm text-gray-400 mb-2">How it works:</p>
            <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
              <li>Check the box next to staff members who are <strong className="text-white">present</strong> today.</li>
              <li>If <strong className="text-white">no custom times</strong> are entered, their <strong className="text-white">shift times</strong> will be used as login/logout.</li>
              <li>Enter <strong className="text-white">custom login/logout times</strong> to override shift timings for specific staff.</li>
              <li>
                On roster <strong className="text-white">off days</strong>, tap the red <strong className="text-red-300">Off day</strong> pill in <strong className="text-white">Status</strong> to allow overtime for that person only; tap again on the amber/green pill to undo.
              </li>
              <li>
                <strong className="text-white">OT (hrs)</strong> is overtime beyond the roster (default 0). Shifts ending after midnight show a <strong className="text-violet-300">Next day</strong> tag.
              </li>
              <li>Staff already marked or on leave are skipped for bulk marking; logged rows show <strong className="text-white">Logged</strong> (custom time columns stay empty unless you use them while marking).</li>
              <li>Click <strong className="text-white">"Mark All Present"</strong> to select all eligible staff at once.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ========== RECORDS & STATS TAB ========== */}
      {activeTab === 'records' && selectedClubId && (
        <div className="space-y-6">
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
                max={todayISTString()}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                placeholder="End Date"
                value={filters.endDate}
                max={todayISTString()}
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
                  const today = todayISTString();
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
                <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700">
                  <div className="text-sm text-gray-400">
                    Showing {attendanceRecords.length} attendance record(s)
                    {(() => {
                      const n = attendanceRecords.filter((r) => selectedRecordIds[r.id]).length;
                      return n > 0 ? (
                        <span className="text-white font-medium ml-2">· {n} selected</span>
                      ) : null;
                    })()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const all = attendanceRecords.every((r) => selectedRecordIds[r.id]);
                        if (all) {
                          setSelectedRecordIds({});
                        } else {
                          const next = {};
                          attendanceRecords.forEach((r) => {
                            next[r.id] = true;
                          });
                          setSelectedRecordIds(next);
                        }
                      }}
                      className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                    >
                      {attendanceRecords.length > 0 &&
                      attendanceRecords.every((r) => selectedRecordIds[r.id])
                        ? 'Deselect all'
                        : 'Select all'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ids = attendanceRecords
                          .filter((r) => selectedRecordIds[r.id])
                          .map((r) => r.id);
                        if (ids.length === 0) {
                          toast.error('Select at least one record');
                          return;
                        }
                        if (
                          window.confirm(
                            `Delete ${ids.length} attendance record(s)? This cannot be undone.`
                          )
                        ) {
                          bulkDeleteAttendanceMutation.mutate(ids);
                        }
                      }}
                      disabled={
                        bulkDeleteAttendanceMutation.isLoading ||
                        !attendanceRecords.some((r) => selectedRecordIds[r.id])
                      }
                      className="px-3 py-2 text-sm bg-red-900/50 hover:bg-red-900/70 border border-red-500/40 rounded-lg text-red-200 disabled:opacity-40"
                    >
                      {bulkDeleteAttendanceMutation.isLoading ? 'Deleting…' : 'Delete selected'}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-4 py-3 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded bg-slate-600 border-slate-500"
                            checked={
                              attendanceRecords.length > 0 &&
                              attendanceRecords.every((r) => selectedRecordIds[r.id])
                            }
                            onChange={() => {
                              const all = attendanceRecords.every((r) => selectedRecordIds[r.id]);
                              if (all) setSelectedRecordIds({});
                              else {
                                const next = {};
                                attendanceRecords.forEach((r) => {
                                  next[r.id] = true;
                                });
                                setSelectedRecordIds(next);
                              }
                            }}
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Staff Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Login Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Logout Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">OT (hrs)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase min-w-[9rem] whitespace-nowrap">
                          Day type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Last edit note</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {attendanceRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-750">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded bg-slate-600 border-slate-500"
                              checked={!!selectedRecordIds[record.id]}
                              onChange={() =>
                                setSelectedRecordIds((prev) => ({
                                  ...prev,
                                  [record.id]: !prev[record.id],
                                }))
                              }
                            />
                          </td>
                          <td className="px-6 py-4 font-medium">{record.staffName}</td>
                          <td className="px-6 py-4 text-gray-400">{record.staffRole || '-'}</td>
                          <td className="px-6 py-4 text-gray-400">{formatDate(record.date)}</td>
                          <td className="px-6 py-4 text-green-400 font-medium">
                            {record.loginDisplay ? formatHhmm12h(record.loginDisplay) : formatAttendanceOrHhmm12h(record.loginTime)}
                          </td>
                          <td className="px-6 py-4 text-red-400 font-medium">
                            {record.logoutDisplay ? formatHhmm12h(record.logoutDisplay) : (record.logoutTime ? formatAttendanceOrHhmm12h(record.logoutTime) : '-')}
                          </td>
                          <td className="px-6 py-4 text-white font-medium">
                            {record.totalHours ? `${record.totalHours} hrs` : calculateHours(record.loginTime, record.logoutTime) !== '-' ? `${calculateHours(record.loginTime, record.logoutTime)} hrs` : '-'}
                          </td>
                          <td className="px-6 py-4 text-amber-200/90 font-medium">
                            {record.overtimeHours != null ? Number(record.overtimeHours).toFixed(2) : '0.00'}
                          </td>
                          <td className="px-6 py-4 align-top min-w-[9rem]">
                            {(() => {
                              const worked =
                                record.workedRosterOffDay === true ||
                                record.worked_roster_off_day === true;
                              return worked ? (
                                <span className="inline-flex whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-500/40">
                                  Overtime day
                                </span>
                              ) : (
                                <span className="inline-flex whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-700/80 text-slate-200 border border-slate-500/40">
                                  Regular day
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm max-w-[200px]">
                            {(() => {
                              const note = record.lastEditReason ?? record.last_edit_reason;
                              return note ? (
                                <span className="line-clamp-2" title={note}>
                                  {note}
                                </span>
                              ) : (
                                <span className="text-gray-500">—</span>
                              );
                            })()}
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
                          <td className="px-6 py-4 flex flex-wrap gap-2">
                            {canEditAttendance && (
                              <button
                                type="button"
                                onClick={() => openEditRecord(record)}
                                disabled={
                                  updateAttendanceMutation.isLoading ||
                                  deleteAttendanceMutation.isLoading ||
                                  bulkDeleteAttendanceMutation.isLoading
                                }
                                className="text-sm px-3 py-1 rounded bg-blue-900/40 text-blue-200 border border-blue-500/40 hover:bg-blue-900/60 disabled:opacity-50"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Delete this attendance record?')) {
                                  deleteAttendanceMutation.mutate(record.id);
                                }
                              }}
                              disabled={
                                deleteAttendanceMutation.isLoading ||
                                bulkDeleteAttendanceMutation.isLoading
                              }
                              className="text-sm px-3 py-1 rounded bg-red-900/40 text-red-300 border border-red-500/40 hover:bg-red-900/60 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Attendance Modal (Manual Entry) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-2xl w-full border border-blue-600 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create Attendance Record</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  const today = todayISTString();
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
                        max={todayISTString()}
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
                        max={todayISTString()}
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
                    const today = todayISTString();
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

      {editForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-2xl w-full border border-blue-600 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit attendance</h2>
              <button
                type="button"
                onClick={() => setEditForm(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Staff: <span className="text-white font-medium">{editForm.staffName}</span>
            </p>
            <form onSubmit={handleSaveEditAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Login date & time *</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={editForm.loginDate}
                      max={todayISTString()}
                      onChange={(e) => setEditForm({ ...editForm, loginDate: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Time</label>
                    <input
                      type="time"
                      value={editForm.loginTime}
                      onChange={(e) => setEditForm({ ...editForm, loginTime: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Logout date & time *</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={editForm.logoutDate}
                      max={todayISTString()}
                      min={editForm.loginDate}
                      onChange={(e) => setEditForm({ ...editForm, logoutDate: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Time</label>
                    <input
                      type="time"
                      value={editForm.logoutTime}
                      onChange={(e) => setEditForm({ ...editForm, logoutTime: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Overtime hours</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  value={Number.isFinite(Number(editForm.overtimeHours)) ? editForm.overtimeHours : 0}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value);
                    setEditForm({
                      ...editForm,
                      overtimeHours: Number.isFinite(n) && n >= 0 ? n : 0,
                    });
                  }}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Hours beyond normal roster (e.g. stayed late).</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Reason for this edit <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={editForm.editReason}
                  onChange={(e) => setEditForm({ ...editForm, editReason: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Required — visible to HR and Super Admin"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditForm(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateAttendanceMutation.isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50"
                >
                  {updateAttendanceMutation.isLoading ? 'Saving…' : 'Save changes'}
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  }
}
