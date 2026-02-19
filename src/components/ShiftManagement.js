import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shiftsAPI } from "../lib/api";
import toast from "react-hot-toast";
import { formatDateIST, toDateIST, toDateTimeLocalIST } from "../utils/dateUtils";

export default function ShiftManagement({ selectedClubId }) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // 'week' or 'month'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedShifts, setSelectedShifts] = useState([]);

  // Form state
  const [shiftForm, setShiftForm] = useState({
    staffId: "",
    shiftDate: "",
    shiftStartTime: "",
    shiftEndTime: "",
    isOffDay: false,
    notes: "",
  });

  // Get dealers list (all dealers)
  const { data: dealersData } = useQuery({
    queryKey: ["dealers", selectedClubId],
    queryFn: () => shiftsAPI.getDealers(selectedClubId),
    enabled: !!selectedClubId,
  });

  // Get dealers filtered by date (for shift creation modal)
  const { data: dealersForDate } = useQuery({
    queryKey: ["dealers", selectedClubId, shiftForm.shiftDate],
    queryFn: () => shiftsAPI.getDealers(selectedClubId, shiftForm.shiftDate),
    enabled: !!selectedClubId && !!shiftForm.shiftDate,
  });

  // Get date range for current view
  const getDateRange = () => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (viewMode === "week") {
      // Start from Monday of current week
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      end.setDate(start.getDate() + 6);
    } else {
      // Month view
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  // Get shifts for the current view
  const { data: shiftsData, isLoading } = useQuery({
    queryKey: ["shifts", selectedClubId, selectedDate, viewMode],
    queryFn: () => {
      const { startDate, endDate } = getDateRange();
      return shiftsAPI.getShifts(selectedClubId, {
        startDate,
        endDate,
        role: "Dealer",
      });
    },
    enabled: !!selectedClubId,
  });

  // Create shift mutation
  const createMutation = useMutation({
    mutationFn: (data) => shiftsAPI.createShift(selectedClubId, data),
    onSuccess: () => {
      toast.success("Shift created successfully!");
      queryClient.invalidateQueries(["shifts", selectedClubId]);
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create shift");
    },
  });

  // Update shift mutation
  const updateMutation = useMutation({
    mutationFn: ({ shiftId, data }) => shiftsAPI.updateShift(selectedClubId, shiftId, data),
    onSuccess: () => {
      toast.success("Shift updated successfully!");
      queryClient.invalidateQueries(["shifts", selectedClubId]);
      setShowEditModal(false);
      setSelectedShift(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update shift");
    },
  });

  // Delete shift mutation
  const deleteMutation = useMutation({
    mutationFn: (shiftId) => shiftsAPI.deleteShift(selectedClubId, shiftId),
    onSuccess: () => {
      toast.success("Shift deleted successfully!");
      queryClient.invalidateQueries(["shifts", selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete shift");
    },
  });

  // Copy shifts mutation
  const copyMutation = useMutation({
    mutationFn: (data) => shiftsAPI.copyShifts(selectedClubId, data),
    onSuccess: (response) => {
      toast.success(response.message || "Shifts copied successfully!");
      queryClient.invalidateQueries(["shifts", selectedClubId]);
      setSelectedShifts([]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to copy shifts");
    },
  });

  const resetForm = () => {
    setShiftForm({
      staffId: "",
      shiftDate: "",
      shiftStartTime: "",
      shiftEndTime: "",
      isOffDay: false,
      notes: "",
    });
  };

  const handleCreateShift = () => {
    if (!shiftForm.staffId || !shiftForm.shiftDate) {
      toast.error("Please select a dealer and date");
      return;
    }

    if (!shiftForm.isOffDay && (!shiftForm.shiftStartTime || !shiftForm.shiftEndTime)) {
      toast.error("Please provide start and end times");
      return;
    }

    createMutation.mutate(shiftForm);
  };

  const handleUpdateShift = () => {
    if (!selectedShift) return;
    updateMutation.mutate({
      shiftId: selectedShift.id,
      data: shiftForm,
    });
  };

  const handleEditShift = (shift) => {
    setSelectedShift(shift);
    setShiftForm({
      staffId: shift.staffId,
      shiftDate: new Date(shift.shiftDate).toISOString().split("T")[0],
      shiftStartTime: new Date(shift.shiftStartTime).toISOString().slice(0, 16),
      shiftEndTime: new Date(shift.shiftEndTime).toISOString().slice(0, 16),
      isOffDay: shift.isOffDay,
      notes: shift.notes || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteShift = (shift) => {
    if (window.confirm(`Delete shift for ${shift.staff?.name}?`)) {
      deleteMutation.mutate(shift.id);
    }
  };

  const handleCopyShifts = () => {
    if (selectedShifts.length === 0) {
      toast.error("Please select shifts to copy");
      return;
    }

    const targetDate = prompt("Enter target date (YYYY-MM-DD):");
    if (!targetDate) return;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      toast.error("Invalid date format. Use YYYY-MM-DD");
      return;
    }

    copyMutation.mutate({
      shiftIds: selectedShifts,
      targetDates: [targetDate],
    });
  };

  const handleCopyToNextDays = () => {
    if (selectedShifts.length === 0) {
      toast.error("Please select shifts to copy");
      return;
    }

    const days = prompt("Copy to how many consecutive days?");
    if (!days || isNaN(days) || days < 1) return;

    const numDays = parseInt(days);
    const targetDates = [];
    const baseDate = new Date(selectedDate);

    for (let i = 1; i <= numDays; i++) {
      const newDate = new Date(baseDate);
      newDate.setDate(newDate.getDate() + i);
      targetDates.push(newDate.toISOString().split("T")[0]);
    }

    copyMutation.mutate({
      shiftIds: selectedShifts,
      targetDates,
    });
  };

  const toggleShiftSelection = (shiftId) => {
    setSelectedShifts((prev) =>
      prev.includes(shiftId) ? prev.filter((id) => id !== shiftId) : [...prev, shiftId]
    );
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setSelectedDate(newDate);
  };

  const dealers = dealersData?.dealers || [];
  const shifts = shiftsData?.shifts || [];
  
  // Use filtered dealers for modal if date is selected, otherwise use all dealers
  const dealersForModal = shiftForm.shiftDate && dealersForDate?.dealers 
    ? dealersForDate.dealers 
    : dealers;

  // Group shifts by date and dealer
  const getShiftsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return shifts.filter((shift) => {
      const shiftDateStr = new Date(shift.shiftDate).toISOString().split("T")[0];
      return shiftDateStr === dateStr;
    });
  };

  // Generate week dates
  const getWeekDates = () => {
    const dates = [];
    const { startDate } = getDateRange();
    const start = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const formatDateHeader = (date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  if (isLoading) {
    return <div className="text-white text-center py-8">Loading shifts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Shift Management</h1>
        <div className="flex gap-3">
          {selectedShifts.length > 0 && (
            <>
              <button
                onClick={handleCopyShifts}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Copy to Date ({selectedShifts.length})
              </button>
              <button
                onClick={handleCopyToNextDays}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Copy to Next Days ({selectedShifts.length})
              </button>
            </>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            + Create Shift
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
        <button
          onClick={() => navigateDate(-1)}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          ← Previous
        </button>

        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">
            {selectedDate.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" })}
          </h2>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
          >
            Today
          </button>
        </div>

        <button
          onClick={() => navigateDate(1)}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Week View */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 gap-px bg-slate-700">
          {/* Header row */}
          <div className="bg-slate-900 p-3 text-white font-semibold">Dealer</div>
          {getWeekDates().map((date) => (
            <div key={date.toISOString()} className="bg-slate-900 p-3 text-white font-semibold text-center">
              {formatDateHeader(date)}
            </div>
          ))}

          {/* Dealer rows */}
          {dealers.map((dealer) => (
            <React.Fragment key={dealer.id}>
              <div className="bg-slate-800 p-3 text-white font-semibold">{dealer.name}</div>
              {getWeekDates().map((date) => {
                const dayShifts = getShiftsForDate(date).filter((s) => s.staffId === dealer.id);
                return (
                  <div key={`${dealer.id}-${date.toISOString()}`} className="bg-slate-800 p-2 min-h-[100px]">
                    {dayShifts.length > 0 ? (
                      <div className="space-y-1">
                        {dayShifts.map((shift) => (
                          <div
                            key={shift.id}
                            className={`rounded p-2 text-xs cursor-pointer transition-all ${
                              shift.isOffDay
                                ? "bg-gray-700 text-gray-300"
                                : selectedShifts.includes(shift.id)
                                ? "bg-purple-600 text-white ring-2 ring-purple-400"
                                : "bg-green-900 text-green-200 hover:bg-green-800"
                            }`}
                            onClick={() => toggleShiftSelection(shift.id)}
                          >
                            {shift.isOffDay ? (
                              <div className="font-semibold">OFF DAY</div>
                            ) : (
                              <>
                                <div className="font-semibold">
                                  {formatTime(shift.shiftStartTime)} - {formatTime(shift.shiftEndTime)}
                                </div>
                                {shift.notes && <div className="text-xs mt-1 opacity-80">{shift.notes}</div>}
                                {shift.onLeave && (
                                  <div className="text-xs mt-1 text-yellow-400 font-semibold bg-yellow-900/30 px-2 py-1 rounded">
                                    ⚠️ Dealer on leave
                                  </div>
                                )}
                              </>
                            )}
                            <div className="flex gap-1 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditShift(shift);
                                }}
                                className="text-blue-300 hover:text-blue-100 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteShift(shift);
                                }}
                                className="text-red-300 hover:text-red-100 text-xs"
                              >
                                Del
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-xs text-center pt-4">No shift</div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {dealers.length === 0 && (
        <div className="bg-slate-800 rounded-lg p-8 text-center text-gray-400">
          <p className="text-lg mb-2">No dealers found</p>
          <p className="text-sm">Create dealer staff members to start managing shifts</p>
        </div>
      )}

      {/* Create Shift Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-purple-600 max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Shift</h2>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-1 block">Dealer *</label>
                <select
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  value={shiftForm.staffId}
                  onChange={(e) => setShiftForm({ ...shiftForm, staffId: e.target.value })}
                >
                  <option value="">Select Dealer</option>
                  {dealersForModal.map((dealer) => (
                    <option key={dealer.id} value={dealer.id}>
                      {dealer.name}
                    </option>
                  ))}
                  {shiftForm.shiftDate && dealersForModal.length === 0 && dealers.length > 0 && (
                    <option disabled>All dealers are on leave for this date</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Date *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  value={shiftForm.shiftDate}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftDate: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isOffDay"
                  checked={shiftForm.isOffDay}
                  onChange={(e) => setShiftForm({ ...shiftForm, isOffDay: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isOffDay" className="text-white text-sm">
                  Mark as Off Day
                </label>
              </div>

              {!shiftForm.isOffDay && (
                <>
                  <div>
                    <label className="text-white text-sm mb-1 block">Start Time *</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      value={shiftForm.shiftStartTime}
                      onChange={(e) => setShiftForm({ ...shiftForm, shiftStartTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm mb-1 block">End Time *</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                      value={shiftForm.shiftEndTime}
                      onChange={(e) => setShiftForm({ ...shiftForm, shiftEndTime: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-white text-sm mb-1 block">Notes</label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 h-20"
                  placeholder="Shift notes..."
                  value={shiftForm.notes}
                  onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateShift}
                disabled={createMutation.isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {createMutation.isLoading ? "Creating..." : "Create Shift"}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
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

      {/* Edit Shift Modal */}
      {showEditModal && selectedShift && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-blue-600 max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Shift</h2>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-1 block">Dealer</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-400"
                  value={selectedShift.staff?.name || ""}
                  disabled
                />
              </div>

              <div>
                <label className="text-white text-sm mb-1 block">Date *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  value={shiftForm.shiftDate}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftDate: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsOffDay"
                  checked={shiftForm.isOffDay}
                  onChange={(e) => setShiftForm({ ...shiftForm, isOffDay: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="editIsOffDay" className="text-white text-sm">
                  Mark as Off Day
                </label>
              </div>

              {!shiftForm.isOffDay && (
                <>
                  <div>
                    <label className="text-white text-sm mb-1 block">Start Time *</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      value={shiftForm.shiftStartTime}
                      onChange={(e) => setShiftForm({ ...shiftForm, shiftStartTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm mb-1 block">End Time *</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      value={shiftForm.shiftEndTime}
                      onChange={(e) => setShiftForm({ ...shiftForm, shiftEndTime: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-white text-sm mb-1 block">Notes</label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 h-20"
                  placeholder="Shift notes..."
                  value={shiftForm.notes}
                  onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateShift}
                disabled={updateMutation.isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {updateMutation.isLoading ? "Updating..." : "Update Shift"}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedShift(null);
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
