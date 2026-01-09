import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Compact "My Shifts" widget for staff dashboards
 * Shows today's shift + next few upcoming shifts
 */
export default function MyShiftsDashboard({ selectedClubId }) {
  const [todayShift, setTodayShift] = useState(null);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedClubId) {
      loadMyShifts();
      // Refresh every 5 minutes
      const interval = setInterval(loadMyShifts, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [selectedClubId]);

  const loadMyShifts = async () => {
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);

      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const response = await apiRequest(
        'GET',
        `/clubs/${selectedClubId}/shifts?startDate=${startDateStr}&endDate=${endDateStr}`
      );

      if (response.success) {
        const shifts = response.shifts || [];
        
        // Find today's shift
        const todayStr = today.toISOString().split('T')[0];
        const today_shift = shifts.find(s => 
          s.shiftDate.split('T')[0] === todayStr
        );
        setTodayShift(today_shift || null);

        // Get next 3 upcoming shifts (excluding today)
        const upcoming = shifts
          .filter(s => {
            const shiftDate = new Date(s.shiftDate);
            shiftDate.setHours(0, 0, 0, 0);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            return shiftDate > todayDate;
          })
          .slice(0, 3);
        setUpcomingShifts(upcoming);
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
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
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

      const isToday = date.toDateString() === today.toDateString();
      const isTomorrow = date.toDateString() === tomorrow.toDateString();

      if (isToday) return 'Today';
      if (isTomorrow) return 'Tomorrow';

      return `${WEEKDAYS[date.getDay()]}, ${date.getDate()}`;
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>⏰</span>
          My Shifts
        </h3>
        <button
          onClick={loadMyShifts}
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Today's Shift - Highlighted */}
      {todayShift ? (
        <div className={`rounded-lg p-3 mb-3 ${
          todayShift.isOffDay
            ? 'bg-gray-700 border border-gray-600'
            : 'bg-gradient-to-r from-orange-600 to-orange-500'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-white flex items-center gap-2">
              Today
              {!todayShift.isOffDay && (
                <span className="px-1.5 py-0.5 bg-white/20 text-white text-xs rounded">
                  ACTIVE
                </span>
              )}
            </span>
          </div>
          
          {todayShift.isOffDay ? (
            <div className="text-gray-300 text-sm">
              🌴 Off Day
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">
                {formatTime(todayShift.shiftStartTime)}
              </span>
              <span className="text-white/60">→</span>
              <span className="text-white font-bold text-lg">
                {formatTime(todayShift.shiftEndTime)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-700/50 rounded-lg p-3 mb-3 text-center">
          <p className="text-gray-400 text-sm">No shift scheduled today</p>
        </div>
      )}

      {/* Upcoming Shifts */}
      {upcomingShifts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Upcoming</h4>
          <div className="space-y-2">
            {upcomingShifts.map(shift => (
              <div
                key={shift.id}
                className="bg-gray-700/50 rounded p-2 text-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium">
                    {formatDate(shift.shiftDate)}
                  </span>
                  {shift.isOffDay && (
                    <span className="px-1.5 py-0.5 bg-gray-600 text-gray-300 text-xs rounded">
                      OFF
                    </span>
                  )}
                </div>
                {!shift.isOffDay && (
                  <div className="text-gray-300 text-xs">
                    {formatTime(shift.shiftStartTime)} - {formatTime(shift.shiftEndTime)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!todayShift && upcomingShifts.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">No shifts scheduled</p>
          <p className="text-gray-500 text-xs mt-1">
            Contact your manager
          </p>
        </div>
      )}
    </div>
  );
}
