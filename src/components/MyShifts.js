import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MyShifts({ selectedClubId, compact = false }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStaff, setCurrentStaff] = useState(null);

  useEffect(() => {
    if (selectedClubId) {
      loadMyShifts();
    }
  }, [selectedClubId]);

  const loadMyShifts = async () => {
    try {
      setLoading(true);
      
      // Get next 14 days of shifts
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 14);

      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const response = await apiRequest(
        `/clubs/${selectedClubId}/shifts?startDate=${startDateStr}&endDate=${endDateStr}`
      );

      if (response.success) {
        setShifts(response.shifts || []);
        
        // Get current staff info if available
        if (response.shifts && response.shifts.length > 0 && response.shifts[0].staff) {
          setCurrentStaff(response.shifts[0].staff);
        }
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      return dateTimeString;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const isToday = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) === today.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      const isTomorrow = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) === tomorrow.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

      if (isToday) return 'Today';
      if (isTomorrow) return 'Tomorrow';

      return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${date.toLocaleDateString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' })}`;
    } catch (error) {
      return dateString;
    }
  };

  const isToday = (dateString) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) === today.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
      return false;
    }
  };

  const upcomingShifts = shifts
    .filter(shift => {
      const shiftDate = new Date(shift.shiftDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return shiftDate >= today;
    })
    .slice(0, compact ? 5 : 14);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">📅 My Shifts</h2>
        <div className="text-center py-8">
          <p className="text-gray-400">No upcoming shifts scheduled</p>
          <p className="text-sm text-gray-500 mt-2">
            Contact your manager if you need shift assignments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">📅 My Shifts</h2>
        {currentStaff && (
          <span className="text-sm text-gray-400">
            {currentStaff.name} • {currentStaff.role}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {upcomingShifts.map((shift, index) => {
          const isTodayShift = isToday(shift.shiftDate);
          
          return (
            <div
              key={shift.id}
              className={`rounded-lg p-4 transition-all ${
                shift.isOffDay
                  ? 'bg-gray-700/50 border border-gray-600'
                  : isTodayShift
                  ? 'bg-gradient-to-r from-orange-600/20 to-orange-500/10 border-2 border-orange-500'
                  : 'bg-gray-700 border border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold ${
                      isTodayShift ? 'text-orange-400' : 'text-white'
                    }`}>
                      {formatDate(shift.shiftDate)}
                    </span>
                    {isTodayShift && (
                      <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">
                        TODAY
                      </span>
                    )}
                    {shift.isOffDay && (
                      <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs font-bold rounded">
                        OFF DAY
                      </span>
                    )}
                  </div>

                  {!shift.isOffDay ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-400 font-mono">
                        {formatTime(shift.shiftStartTime)}
                      </span>
                      <span className="text-gray-500">→</span>
                      <span className="text-red-400 font-mono">
                        {formatTime(shift.shiftEndTime)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      {shift.notes || 'Scheduled day off'}
                    </p>
                  )}

                  {shift.notes && !shift.isOffDay && (
                    <p className="text-xs text-gray-400 mt-1">
                      💬 {shift.notes}
                    </p>
                  )}
                </div>

                {!shift.isOffDay && (
                  <div className="text-right">
                    <span className={`text-xs ${
                      isTodayShift ? 'text-orange-400' : 'text-gray-500'
                    }`}>
                      {(() => {
                        const start = new Date(shift.shiftStartTime);
                        const end = new Date(shift.shiftEndTime);
                        const hours = Math.abs(end - start) / 36e5;
                        return `${hours}h`;
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!compact && shifts.length > 14 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Showing next 14 days • {shifts.length} total shifts
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Start Time</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>End Time</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Today's Shift</span>
          </div>
        </div>
      </div>
    </div>
  );
}
