import React from 'react';
import MyShiftsDashboard from '../components/MyShiftsDashboard';

/**
 * EXAMPLE: How to add "My Shifts" widget to any staff dashboard
 * 
 * This example shows integration for Dealer, but works for ANY staff role:
 * - Dealers
 * - Managers  
 * - Cashiers
 * - HR
 * - GRE
 * - FNB Staff
 * - Any custom staff role
 */

function ExampleStaffDashboard({ selectedClubId }) {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back!</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Main Content (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">This Week</div>
                <div className="text-2xl font-bold text-white">5 Shifts</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Total Hours</div>
                <div className="text-2xl font-bold text-white">40h</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Next Off Day</div>
                <div className="text-2xl font-bold text-white">Sunday</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              {/* Your activity content here */}
              <p className="text-gray-400">Recent transactions, actions, etc...</p>
            </div>

            {/* Additional Content */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">More Content</h2>
              <p className="text-gray-400">Performance metrics, notifications, etc...</p>
            </div>
          </div>

          {/* RIGHT COLUMN - Sidebar (1/3 width on desktop) */}
          <div className="space-y-6">
            
            {/* ⭐ MY SHIFTS WIDGET - ADD HERE ⭐ */}
            <MyShiftsDashboard selectedClubId={selectedClubId} />

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors text-sm">
                  Clock In/Out
                </button>
                <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm">
                  Request Leave
                </button>
                <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm">
                  View Pay Slips
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-3">Notifications</h3>
              <div className="space-y-2">
                <div className="text-sm text-gray-300 p-2 bg-gray-700/50 rounded">
                  🔔 New shift assigned
                </div>
                <div className="text-sm text-gray-300 p-2 bg-gray-700/50 rounded">
                  💰 Salary processed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExampleStaffDashboard;

/**
 * ALTERNATIVE LAYOUTS:
 * 
 * 1. MOBILE-FIRST (Shifts at top)
 * ================================
 * <div className="space-y-6">
 *   <MyShiftsDashboard selectedClubId={selectedClubId} />
 *   <OtherComponents />
 * </div>
 * 
 * 
 * 2. FULL-WIDTH (Below header)
 * ============================
 * <div className="space-y-6">
 *   <Header />
 *   <div className="max-w-md">
 *     <MyShiftsDashboard selectedClubId={selectedClubId} />
 *   </div>
 *   <MainContent />
 * </div>
 * 
 * 
 * 3. FOUR-COLUMN GRID (Manager Dashboard)
 * =======================================
 * <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 *   <div className="lg:col-span-3">
 *     <Analytics />
 *   </div>
 *   <div>
 *     <MyShiftsDashboard selectedClubId={selectedClubId} />
 *   </div>
 * </div>
 */
