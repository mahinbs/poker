import React, { useState, useEffect } from 'react';
import { apiRequest, staffAPI } from '../lib/api';

const WEEKDAYS = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

export default function RosterManagement({ selectedClubId }) {
  const [activeTab, setActiveTab] = useState('templates'); // templates, generate, overview
  const [templates, setTemplates] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Generate roster state
  const [generateConfig, setGenerateConfig] = useState({
    startDate: new Date().toISOString().split('T')[0],
    periodType: 'weekly',
    overwriteExisting: false,
  });

  // Overview state
  const [overviewConfig, setOverviewConfig] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [rosterOverview, setRosterOverview] = useState(null);
  const [staffSearch, setStaffSearch] = useState('');

  useEffect(() => {
    if (selectedClubId) {
      loadTemplates();
      loadStaff();
    }
  }, [selectedClubId]);

  const loadTemplates = async () => {
    try {
      const response = await apiRequest(`/clubs/${selectedClubId}/roster/templates`);
      if (response.success) {
        setTemplates(response.templates || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      alert('Failed to load roster templates');
    }
  };

  const loadStaff = async () => {
    try {
      const response = await staffAPI.getAllStaffMembers(selectedClubId);
      if (response.success) {
        // Include all staff members (dealers, managers, etc.)
        setStaff(response.staff || []);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const handleCreateTemplate = (staffMember) => {
    setEditingTemplate({
      staffId: staffMember.id,
      staffName: staffMember.name,
      staffRole: staffMember.role,
      offDays: [],
      defaultShiftStartTime: '18:00',
      defaultShiftEndTime: '02:00',
      shiftCrossesMidnight: true,
      isActive: true,
      notes: '',
    });
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate({
      ...template,
      defaultShiftStartTime: template.defaultShiftStartTime.substring(0, 5),
      defaultShiftEndTime: template.defaultShiftEndTime.substring(0, 5),
    });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      
      // Strip read-only fields and prepare payload
      const payload = {
        staffName: editingTemplate.staffName,
        staffRole: editingTemplate.staffRole,
        offDays: editingTemplate.offDays,
        defaultShiftStartTime: editingTemplate.defaultShiftStartTime + ':00',
        defaultShiftEndTime: editingTemplate.defaultShiftEndTime + ':00',
        shiftCrossesMidnight: editingTemplate.shiftCrossesMidnight,
        isActive: editingTemplate.isActive,
        notes: editingTemplate.notes || '',
      };

      // If editing existing template, use PATCH; otherwise POST
      if (editingTemplate.id) {
        await apiRequest(`/clubs/${selectedClubId}/roster/templates/${editingTemplate.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        // For new templates, include staffId
        payload.staffId = editingTemplate.staffId;
        await apiRequest(`/clubs/${selectedClubId}/roster/templates`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      
      alert('Roster template saved successfully!');
      setShowTemplateModal(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert(error.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this roster template?')) return;

    try {
      await apiRequest(`/clubs/${selectedClubId}/roster/templates/${templateId}`, {
        method: 'DELETE',
      });
      alert('Template deleted successfully');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const handleGenerateRoster = async () => {
    // Calculate end date for monthly
    let endDateInfo = '';
    if (generateConfig.periodType === 'monthly') {
      const startDate = new Date(generateConfig.startDate);
      const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), lastDay).toISOString().split('T')[0];
      endDateInfo = `End: ${endDate} (${lastDay} days in month)`;
    } else {
      const startDate = new Date(generateConfig.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDateInfo = `End: ${endDate.toISOString().split('T')[0]} (7 days)`;
    }

    if (!window.confirm(
      `Generate ${generateConfig.periodType} roster from ${generateConfig.startDate}?\n${endDateInfo}${
        generateConfig.overwriteExisting ? '\n\n⚠️ This will overwrite existing shifts!' : ''
      }`
    )) return;

    try {
      setLoading(true);
      const response = await apiRequest(`/clubs/${selectedClubId}/roster/generate`, {
        method: 'POST',
        body: JSON.stringify(generateConfig),
      });
      
      if (response.success) {
        alert(
          `Roster generated successfully!\n\n` +
          `Period: ${generateConfig.periodType}\n` +
          `Start: ${response.startDate}\n` +
          `End: ${response.endDate}\n` +
          `Shifts Created: ${response.totalShiftsCreated}\n` +
          `Staff Processed: ${response.staffProcessed}`
        );
      }
    } catch (error) {
      console.error('Error generating roster:', error);
      alert(error.message || 'Failed to generate roster');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadOverview = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(
        `/clubs/${selectedClubId}/roster/overview?startDate=${overviewConfig.startDate}&endDate=${overviewConfig.endDate}`
      );
      
      if (response.success) {
        setRosterOverview(response);
      }
    } catch (error) {
      console.error('Error loading overview:', error);
      alert('Failed to load roster overview');
    } finally {
      setLoading(false);
    }
  };

  const toggleOffDay = (dayValue) => {
    setEditingTemplate(prev => {
      const offDays = prev.offDays.includes(dayValue)
        ? prev.offDays.filter(d => d !== dayValue)
        : [...prev.offDays, dayValue].sort();
      return { ...prev, offDays };
    });
  };

  const staffWithoutTemplates = staff.filter(s => 
    !templates.some(t => t.staffId === s.id) && s.status === 'Active'
  );

  // Filter staff for overview based on search
  const filteredStaffForOverview = rosterOverview?.staff?.filter(s => 
    staffSearch === '' || s.staffName.toLowerCase().includes(staffSearch.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Sub-tabs for Roster Management */}
      <div className="flex gap-2 border-b border-gray-700">
        {[
          { id: 'templates', label: 'Templates', icon: '👥' },
          { id: 'generate', label: 'Generate Roster', icon: '📅' },
          { id: 'overview', label: 'Roster Overview', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Existing Templates */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Roster Templates ({templates.length})
            </h2>
            
            {templates.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No roster templates created yet. Create templates for staff members below.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-semibold">{template.staffName}</h3>
                        <p className="text-sm text-gray-400">{template.staffRole}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        template.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-400'
                      }`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Shift Time:</span>
                        <span className="text-white ml-2">
                          {template.defaultShiftStartTime.substring(0, 5)} - {template.defaultShiftEndTime.substring(0, 5)}
                          {template.shiftCrossesMidnight && ' (next day)'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Off Days:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.offDays.length === 0 ? (
                            <span className="text-gray-500 text-xs">No off days</span>
                          ) : (
                            template.offDays.map(day => (
                              <span key={day} className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                                {WEEKDAYS.find(w => w.value === day)?.short}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Templates */}
          {staffWithoutTemplates.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Staff Without Templates ({staffWithoutTemplates.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffWithoutTemplates.map(staffMember => (
                  <div key={staffMember.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="mb-3">
                      <h3 className="text-white font-semibold">{staffMember.name}</h3>
                      <p className="text-sm text-gray-400">{staffMember.role}</p>
                      {staffMember.email && (
                        <p className="text-xs text-gray-500 mt-1">{staffMember.email}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleCreateTemplate(staffMember)}
                      className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors text-sm"
                    >
                      Create Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generate Roster Tab */}
      {activeTab === 'generate' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Generate Roster</h2>
          
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">
                You need to create roster templates first before generating a roster.
              </p>
              <button
                onClick={() => setActiveTab('templates')}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
              >
                Go to Templates
              </button>
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={generateConfig.startDate}
                  onChange={(e) => setGenerateConfig(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Period Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="weekly"
                      checked={generateConfig.periodType === 'weekly'}
                      onChange={(e) => setGenerateConfig(prev => ({ ...prev, periodType: e.target.value }))}
                      className="text-orange-600"
                    />
                    <span className="text-white">Weekly (7 days)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="monthly"
                      checked={generateConfig.periodType === 'monthly'}
                      onChange={(e) => setGenerateConfig(prev => ({ ...prev, periodType: e.target.value }))}
                      className="text-orange-600"
                    />
                    <span className="text-white">Monthly (rest of the month)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateConfig.overwriteExisting}
                    onChange={(e) => setGenerateConfig(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                    className="rounded text-orange-600"
                  />
                  <span className="text-white">Overwrite existing shifts in this period</span>
                </label>
                {generateConfig.overwriteExisting && (
                  <p className="text-sm text-yellow-500 mt-1">
                    ⚠️ Warning: This will delete and recreate all shifts in the selected period
                  </p>
                )}
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Summary</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• {templates.length} staff members with templates</li>
                  <li>• Period: {generateConfig.periodType}</li>
                  <li>• Start: {generateConfig.startDate}</li>
                  {generateConfig.periodType === 'monthly' && (
                    <li>• Will create roster till end of month (28/29/30/31 days based on month)</li>
                  )}
                  {generateConfig.periodType === 'weekly' && (
                    <li>• Will create 7 days roster</li>
                  )}
                </ul>
              </div>

              <button
                onClick={handleGenerateRoster}
                disabled={loading}
                className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Roster'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Roster Calendar View</h2>
              
              {/* Legend */}
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/20 border border-green-500/50 rounded"></div>
                  <span className="text-gray-400">Working</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/50 rounded"></div>
                  <span className="text-gray-400">On Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded"></div>
                  <span className="text-gray-400">Off Day</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-white font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={overviewConfig.startDate}
                  onChange={(e) => setOverviewConfig(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-white font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={overviewConfig.endDate}
                  onChange={(e) => setOverviewConfig(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleLoadOverview}
                  disabled={loading}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load'}
                </button>
              </div>
            </div>

            {/* Staff Search */}
            {rosterOverview && rosterOverview.staff && rosterOverview.staff.length > 0 && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search staff by name..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {filteredStaffForOverview.length > 0 && (
              <div className="space-y-6">
                {filteredStaffForOverview.map(staffData => (
                  <div key={staffData.staffId} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{staffData.staffName}</h3>
                        <p className="text-sm text-gray-400">{staffData.staffRole}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-300">
                          <span className="text-green-400 font-semibold">{staffData.workingDaysCount}</span> working
                          {staffData.leaveDaysCount > 0 && (
                            <> · <span className="text-yellow-400 font-semibold">{staffData.leaveDaysCount}</span> on leave</>
                          )}
                          {staffData.offDaysCount > 0 && (
                            <> · <span className="text-red-400">{staffData.offDaysCount}</span> off</>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="overflow-x-auto">
                      <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                        {/* Weekday Headers */}
                        {WEEKDAYS.map(day => (
                          <div key={day.value} className="text-center py-2 text-xs font-semibold text-gray-400 border-b border-gray-600">
                            {day.short}
                          </div>
                        ))}
                        
                        {/* Shift Cells */}
                        {staffData.shifts.map(shift => {
                          const isOff = shift.isOffDay;
                          const onLeave = shift.onLeave;
                          
                          // Determine cell styling
                          let bgClass = 'bg-green-500/20 border-green-500/50';
                          let textClass = 'text-green-400';
                          
                          if (onLeave) {
                            bgClass = 'bg-yellow-500/20 border-yellow-500/50';
                            textClass = 'text-yellow-400';
                          } else if (isOff) {
                            bgClass = 'bg-red-500/20 border-red-500/50';
                            textClass = 'text-red-400';
                          }
                          
                          return (
                            <div
                              key={shift.id}
                              className={`p-2 rounded text-center text-xs ${bgClass} border`}
                            >
                              <div className={`font-semibold mb-1 ${textClass}`}>
                                {new Date(shift.date).getDate()}
                              </div>
                              {onLeave ? (
                                <div className="text-yellow-400 font-semibold text-[10px]">ON LEAVE</div>
                              ) : !isOff ? (
                                <div className="text-gray-300">
                                  <div>{shift.startTime}</div>
                                  <div className="text-gray-500 text-[8px]">to</div>
                                  <div>{shift.endTime}</div>
                                </div>
                              ) : (
                                <div className="text-red-400 font-semibold">OFF</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shift Times Info */}
                    {staffData.defaultShiftTimes && (
                      <div className="mt-3 text-xs text-gray-400">
                        Default: {staffData.defaultShiftTimes.start} - {staffData.defaultShiftTimes.end}
                        {staffData.defaultShiftTimes.crossesMidnight && ' (next day)'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {rosterOverview && (!rosterOverview.staff || rosterOverview.staff.length === 0) && (
              <div className="text-center py-12 text-gray-400">
                No roster data found for the selected period.
              </div>
            )}

            {filteredStaffForOverview.length === 0 && rosterOverview?.staff?.length > 0 && (
              <div className="text-center py-12 text-gray-400">
                No staff found matching "{staffSearch}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingTemplate.id ? 'Edit' : 'Create'} Roster Template
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Staff Member</label>
                  <input
                    type="text"
                    value={`${editingTemplate.staffName} (${editingTemplate.staffRole})`}
                    disabled
                    className="w-full px-4 py-2 bg-gray-700 text-gray-400 rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Shift Start Time</label>
                    <input
                      type="time"
                      value={editingTemplate.defaultShiftStartTime}
                      onChange={(e) => setEditingTemplate(prev => ({ ...prev, defaultShiftStartTime: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Shift End Time</label>
                    <input
                      type="time"
                      value={editingTemplate.defaultShiftEndTime}
                      onChange={(e) => setEditingTemplate(prev => ({ ...prev, defaultShiftEndTime: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.shiftCrossesMidnight}
                      onChange={(e) => setEditingTemplate(prev => ({ ...prev, shiftCrossesMidnight: e.target.checked }))}
                      className="rounded text-orange-600"
                    />
                    <span className="text-white">Shift crosses midnight (ends next day)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Weekly Off Days</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {WEEKDAYS.map(day => (
                      <button
                        key={day.value}
                        onClick={() => toggleOffDay(day.value)}
                        className={`px-3 py-2 rounded transition-colors text-sm ${
                          editingTemplate.offDays.includes(day.value)
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    These days will be marked as off days in the roster
                  </p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    value={editingTemplate.notes || ''}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Any additional notes about this roster template..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.isActive}
                      onChange={(e) => setEditingTemplate(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded text-orange-600"
                    />
                    <span className="text-white">Active (will be used when generating roster)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveTemplate}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Template'}
                </button>
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    setEditingTemplate(null);
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
