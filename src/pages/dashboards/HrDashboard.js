import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import StaffManagement from "../../components/StaffManagement";
import PlayerManagementHR from "../../components/PlayerManagementHR";
import SalaryHistoryHR from "../../components/SalaryHistoryHR";
import AttendanceManagement from "../../components/AttendanceManagement";
import ChatManagement from "../../components/ChatManagement";
import HrSidebar from "../../components/sidebars/HrSidebar";
import toast from "react-hot-toast";
import NotificationsInbox from "../../components/NotificationsInbox";
import MyShiftsDashboard from "../../components/MyShiftsDashboard";

export default function HrDashboard() {
  const [activeItem, setActiveItem] = useState("Staff Management");
  const navigate = useNavigate();
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Check if user needs to reset password
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const hrUser = JSON.parse(localStorage.getItem('hruser') || '{}');
    
    if (user.mustResetPassword || hrUser.mustResetPassword) {
      setShowPasswordResetModal(true);
    }
  }, []);

  // Password reset mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3333/api'}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Password reset successfully!');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.mustResetPassword = false;
      localStorage.setItem('user', JSON.stringify(user));
      const hrUser = JSON.parse(localStorage.getItem('hruser') || '{}');
      hrUser.mustResetPassword = false;
      localStorage.setItem('hruser', JSON.stringify(hrUser));
      setShowPasswordResetModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });

  const handlePasswordReset = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const hrUser = JSON.parse(localStorage.getItem('hruser') || '{}');
    const email = user.email || hrUser.email;
    if (!email) {
      toast.error('User email not found. Please login again.');
      return;
    }
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    resetPasswordMutation.mutate({
      email: email,
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  // PASSWORD RESET MODAL
  const passwordResetModal = showPasswordResetModal && (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200]">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-md w-full border border-emerald-600 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-yellow-400 text-5xl mb-3">🔒</div>
          <h2 className="text-2xl font-bold text-white">Password Reset Required</h2>
          <p className="text-gray-400 mt-2">Please set a new password to continue</p>
        </div>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
            <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter temporary password" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
            <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Enter new password" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
            <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="Confirm new password" required />
          </div>
          <button type="submit" disabled={resetPasswordMutation.isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50">
            {resetPasswordMutation.isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );

  const menuItems = [
    "Staff Management",
    "Notifications",
    "Salary History",
    // "Player Management",
    "Attendance Management",
    "Chat",
  ];

  // Get clubId from localStorage
  const [clubId, setClubId] = useState(null);
  
  useEffect(() => {
    const storedClubId = localStorage.getItem('clubId');
    if (storedClubId) {
      setClubId(storedClubId);
    }
  }, []);

  // Staff members data - should be populated from API
  const [staffMembers, setStaffMembers] = useState([]);

  // State for Attendance Management - Table format
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  // Initialize attendance records when staffMembers changes
  useEffect(() => {
    if (staffMembers.length > 0) {
      setAttendanceRecords(staffMembers.map(staff => ({
        staffId: staff.id,
        staffName: staff.name,
        position: staff.position,
        department: staff.department,
        date: currentDate,
        loginTime: "",
        logoutTime: "",
        status: "pending"
      })));
    }
  }, [staffMembers, currentDate]);

  // State for Staff Requests - should be populated from API
  const [staffRequests, setStaffRequests] = useState([]);

  const [requestFilter, setRequestFilter] = useState("all"); // "all", "pending", "in_progress", "approved", "rejected"
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestResponse, setRequestResponse] = useState("");
  const [requestStatus, setRequestStatus] = useState("pending");

  // State for Staff Directory
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [documentFileName, setDocumentFileName] = useState("");

  // Player Management State - should be populated from API
  const [kycRequests, setKycRequests] = useState([]);
  const [profileUpdates, setProfileUpdates] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [suspendedPlayers, setSuspendedPlayers] = useState([]);

  // Chat/Support System State - should be populated from API
  const [playerChats, setPlayerChats] = useState([]);
  const [staffChats, setStaffChats] = useState([]);

  // Update attendance records when date changes
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (currentDate !== today && staffMembers.length > 0) {
      // If viewing a different date, reinitialize records
      setAttendanceRecords(staffMembers.map(staff => ({
        staffId: staff.id,
        staffName: staff.name,
        position: staff.position,
        department: staff.department,
        date: today,
        loginTime: "",
        logoutTime: "",
        status: "pending"
      })));
    }
  }, [currentDate, staffMembers]);

  // Handle attendance time update
  const handleAttendanceUpdate = (staffId, field, value) => {
    setAttendanceRecords(prev => prev.map(record => {
      if (record.staffId === staffId) {
        const updated = { ...record, [field]: value };
        // Auto-update status based on times
        if (updated.loginTime && updated.logoutTime) {
          updated.status = "completed";
        } else if (updated.loginTime) {
          updated.status = "active";
        } else {
          updated.status = "pending";
        }
        return updated;
      }
      return record;
    }));
  };

  // Handle save attendance
  const handleSaveAttendance = () => {
    const completedRecords = attendanceRecords.filter(r => r.loginTime && r.logoutTime);
    if (completedRecords.length === 0) {
      alert("Please fill in at least one staff member's login and logout times");
      return;
    }
    alert(`Attendance saved for ${completedRecords.length} staff member(s)`);
    // In real implementation, this would save to backend
  };

  // Handle request response
  const handleRequestResponse = () => {
    if (!selectedRequest || !requestResponse.trim()) {
      alert("Please enter a response");
      return;
    }
    setStaffRequests(prev => prev.map(req =>
      req.id === selectedRequest.id
        ? {
          ...req,
          hrResponse: requestResponse.trim(),
          status: requestStatus
        }
        : req
    ));
    alert(`Request ${requestStatus === "approved" ? "approved" : requestStatus === "rejected" ? "rejected" : "updated"} successfully`);
    setSelectedRequest(null);
    setRequestResponse("");
    setRequestStatus("pending");
  };

  // Filter staff requests
  const filteredRequests = requestFilter === "all"
    ? staffRequests
    : staffRequests.filter(req => req.status === requestFilter);

  // Handle document upload
  const handleDocumentUpload = () => {
    if (!documentType || !documentFile) {
      alert("Please select document type and upload a file");
      return;
    }

    const newDocument = {
      type: documentType,
      status: "Pending Review",
      uploadedDate: new Date().toISOString().split('T')[0]
    };

    // Update the selected staff's documents
    setSelectedStaffDetails(prev => ({
      ...prev,
      documents: [...(prev.documents || []), newDocument]
    }));

    // Also update in staffMembers array
    setStaffMembers(prev => prev.map(staff =>
      staff.id === selectedStaffDetails.id
        ? { ...staff, documents: [...(staff.documents || []), newDocument] }
        : staff
    ));

    alert(`Document "${documentType}" uploaded successfully for ${selectedStaffDetails.name}`);

    // Reset form
    setDocumentType("");
    setDocumentFile(null);
    setDocumentFileName("");
    setShowUploadForm(false);
  };

  // Handle document status update
  const handleDocumentStatusUpdate = (docIndex, newStatus) => {
    setSelectedStaffDetails(prev => {
      const updatedDocuments = [...prev.documents];
      updatedDocuments[docIndex] = {
        ...updatedDocuments[docIndex],
        status: newStatus
      };
      return {
        ...prev,
        documents: updatedDocuments
      };
    });

    // Also update in staffMembers array
    setStaffMembers(prev => prev.map(staff => {
      if (staff.id === selectedStaffDetails.id) {
        const updatedDocs = [...(staff.documents || [])];
        updatedDocs[docIndex] = {
          ...updatedDocs[docIndex],
          status: newStatus
        };
        return { ...staff, documents: updatedDocs };
      }
      return staff;
    }));

    alert(`Document status updated to "${newStatus}"`);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      setDocumentFileName(file.name);
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB");
        setDocumentFile(null);
        setDocumentFileName("");
        e.target.value = "";
      }
    }
  };

  // Reset upload form when closing modal
  useEffect(() => {
    if (!selectedStaffDetails) {
      setShowUploadForm(false);
      setDocumentType("");
      setDocumentFile(null);
      setDocumentFileName("");
    }
  }, [selectedStaffDetails]);

  const handleSignOut = () => {
    // Clear all localStorage
    localStorage.clear();
    sessionStorage.clear();
    navigate("/hr/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="flex">
        {/* Sidebar */}
        <HrSidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          menuItems={menuItems}
          onSignOut={handleSignOut}
        />

        {/* Main Section */}
        <main className="flex-1 lg:ml-0 min-w-0">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-10 space-y-8">
          {/* Header */}
          <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 p-6 rounded-xl shadow-md flex justify-between items-center mt-16 lg:mt-0">
            <div>
              <h1 className="text-2xl font-bold text-white">HR Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Staff management, attendance, and performance</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
              Sign Out
            </button>
          </header>

          {/* Dynamic Content Based on Active Item */}

          {activeItem === "Staff Management" && (
            <>
              {/* My Shifts Widget - Only show on Staff Management (main page) */}
              {clubId && <MyShiftsDashboard selectedClubId={clubId} />}
            <StaffManagement selectedClubId={clubId} />
            </>
          )}

          {activeItem === "Salary History" && (
            <SalaryHistoryHR selectedClubId={clubId} />
          )}

          {/* {activeItem === "Player Management" && (
            <PlayerManagementHR selectedClubId={clubId} />
          )} */}

          {activeItem === "Attendance Management" && (
            <AttendanceManagement selectedClubId={clubId} />
          )}

          {activeItem === "Chat" && (
            <ChatManagement clubId={clubId} hidePlayerChat={true} />
          )}

          {/* Notifications */}
          {activeItem === "Notifications" && clubId && (
            <NotificationsInbox selectedClubId={clubId} recipientType="staff" />
          )}

          {/* OLD ATTENDANCE MANAGEMENT - REMOVED */}
          {false && activeItem === "Attendance Management OLD" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Daily Attendance Logging</h2>
                  <div className="flex items-center gap-4">
                    <div className="text-white text-sm">
                      <span className="text-gray-400">Date:</span> {new Date(currentDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    <button
                      onClick={handleSaveAttendance}
                      className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold"
                    >
                      Save All Attendance
                      </button>
                    </div>
                  </div>

                <div className="bg-white/10 p-4 rounded-lg overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-3 px-4 text-white font-semibold">Staff ID</th>
                        <th className="text-left py-3 px-4 text-white font-semibold">Name</th>
                        <th className="text-left py-3 px-4 text-white font-semibold">Position</th>
                        <th className="text-left py-3 px-4 text-white font-semibold">Department</th>
                        <th className="text-left py-3 px-4 text-white font-semibold">Date</th>
                        <th className="text-left py-3 px-4 text-white font-semibold">Log In Time</th>
                        <th className="text-left py-3 px-4 text-white font-semibold">Log Out Time</th>
                        <th className="text-left py-3 px-4 text-white font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record) => (
                        <tr key={record.staffId} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-3 px-4 text-white">{record.staffId}</td>
                          <td className="py-3 px-4 text-white font-medium">{record.staffName}</td>
                          <td className="py-3 px-4 text-gray-300">{record.position}</td>
                          <td className="py-3 px-4 text-gray-300">{record.department}</td>
                          <td className="py-3 px-4 text-gray-300">{record.date}</td>
                          <td className="py-3 px-4">
                            <input
                              type="time"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                              value={record.loginTime}
                              onChange={(e) => handleAttendanceUpdate(record.staffId, "loginTime", e.target.value)}
                              placeholder="HH:MM"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="time"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                              value={record.logoutTime}
                              onChange={(e) => handleAttendanceUpdate(record.staffId, "logoutTime", e.target.value)}
                              placeholder="HH:MM"
                              disabled={!record.loginTime}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${record.status === "completed"
                              ? "bg-green-500/30 text-green-300"
                              : record.status === "active"
                                ? "bg-blue-500/30 text-blue-300"
                                : "bg-yellow-500/30 text-yellow-300"
                              }`}>
                              {record.status === "completed" ? "Completed" : record.status === "active" ? "Active" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                      </div>

                <div className="mt-4 text-xs text-gray-400">
                  <p>💡 Fill in the real-time log in and log out times for each staff member based on their actual attendance at the club.</p>
                  <p>Date is automatically set to today. Log out time can only be entered after log in time is filled.</p>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Attendance Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Weekly Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Hours</span>
                        <span className="text-white font-bold">168</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Present Days</span>
                        <span className="text-green-300 font-bold">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Absent Days</span>
                        <span className="text-red-300 font-bold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Late Arrivals</span>
                        <span className="text-yellow-300 font-bold">1</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Monthly Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Hours</span>
                        <span className="text-white font-bold">720</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Present Days</span>
                        <span className="text-green-300 font-bold">22</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Absent Days</span>
                        <span className="text-red-300 font-bold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Overtime Hours</span>
                        <span className="text-blue-300 font-bold">8</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Department Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Operations</span>
                        <span className="text-white font-bold">25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Security</span>
                        <span className="text-white font-bold">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Maintenance</span>
                        <span className="text-white font-bold">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Kitchen</span>
                        <span className="text-white font-bold">7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Staff Directory */}
          {activeItem === "Staff Directory" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Staff Directory</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staffMembers && staffMembers.length > 0 ? staffMembers.map(staff => (
                    <div key={staff.id} className="bg-white/10 p-4 rounded-lg border border-blue-400/30">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-white">{staff.name}</h3>
                        <span className={`px-2 py-1 rounded text-sm ${staff.status === "Active"
                          ? "bg-green-500/30 text-green-300"
                          : "bg-yellow-500/30 text-yellow-300"
                          }`}>
                          {staff.status}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <div className="text-sm text-gray-300">Position: {staff.position}</div>
                        <div className="text-sm text-gray-300">Department: {staff.department}</div>
                        <div className="text-sm text-gray-300">Email: {staff.email}</div>
                        <div className="text-sm text-gray-300">Phone: {staff.phone}</div>
                        <div className="text-sm text-gray-300">Start Date: {staff.startDate}</div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                        Edit
                      </button>
                        <button
                          onClick={() => setSelectedStaffDetails(staff)}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm"
                        >
                        View Details
                      </button>
                    </div>
                  </div>
                  )) : (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      No staff members found. Please add staff members or check your API connection.
                    </div>
                  )}
                </div>
              </section>

              {/* Staff Details Modal */}
              {selectedStaffDetails && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-white/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">Staff Details</h2>
                          <p className="text-gray-400 text-sm">Complete information for {selectedStaffDetails.name}</p>
                    </div>
                        <button
                          onClick={() => setSelectedStaffDetails(null)}
                          className="text-white/70 hover:text-white text-2xl font-bold"
                        >
                          ×
                        </button>
                    </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">Staff ID</label>
                            <div className="text-white font-medium">{selectedStaffDetails.id}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Full Name</label>
                            <div className="text-white font-medium">{selectedStaffDetails.name}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Position</label>
                            <div className="text-white font-medium">{selectedStaffDetails.position}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Department</label>
                            <div className="text-white font-medium">{selectedStaffDetails.department}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Email</label>
                            <div className="text-white font-medium">{selectedStaffDetails.email}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Phone</label>
                            <div className="text-white font-medium">{selectedStaffDetails.phone}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Start Date</label>
                            <div className="text-white font-medium">{selectedStaffDetails.startDate}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Status</label>
                            <div>
                              <span className={`px-3 py-1 rounded-full text-xs border font-medium ${selectedStaffDetails.status === "Active"
                                ? "bg-green-500/30 text-green-300 border-green-400/50"
                                : "bg-yellow-500/30 text-yellow-300 border-yellow-400/50"
                                }`}>
                                {selectedStaffDetails.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Documents Section - Document Management */}
                      <div>
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                          <h3 className="text-lg font-semibold text-white">Document Management</h3>
                          <button
                            onClick={() => setShowUploadForm(!showUploadForm)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                          >
                            {showUploadForm ? "Cancel Upload" : "➕ Upload Document"}
                      </button>
                        </div>

                        {/* Upload Document Form */}
                        {showUploadForm && (
                          <div className="bg-white/5 p-4 rounded-lg border border-indigo-400/30 mb-4">
                            <h4 className="text-white font-semibold mb-4">Upload New Document</h4>
                            <div className="space-y-4">
                              <div>
                                <label className="text-white text-sm mb-2 block">Document Type</label>
                                <CustomSelect
                                  className="w-full"
                                  value={documentType}
                                  onChange={(e) => setDocumentType(e.target.value)}
                                >
                                  <option value="">Select Document Type</option>
                                  <option value="ID Card">ID Card</option>
                                  <option value="PAN Card">PAN Card</option>
                                  <option value="Aadhaar Card">Aadhaar Card</option>
                                  <option value="Passport">Passport</option>
                                  <option value="Driving License">Driving License</option>
                                  <option value="Educational Certificate">Educational Certificate</option>
                                  <option value="Experience Certificate">Experience Certificate</option>
                                  <option value="Medical Certificate">Medical Certificate</option>
                                  <option value="Contract Document">Contract Document</option>
                                  <option value="Other">Other</option>
                                </CustomSelect>
                              </div>
                              <div>
                                <label className="text-white text-sm mb-2 block">Upload Document</label>
                                <div className="mt-1 border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-indigo-400/50 transition-colors">
                                  <input
                                    type="file"
                                    id="document-upload"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                  />
                                  <label htmlFor="document-upload" className="cursor-pointer">
                                    <div className="text-white mb-2">
                                      {documentFileName ? `📄 ${documentFileName}` : "Click to upload or drag and drop"}
                                    </div>
                                    <div className="text-gray-400 text-sm">PNG, JPG, PDF up to 10MB</div>
                                  </label>
                                </div>
                              </div>
                              <button
                                onClick={handleDocumentUpload}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold"
                              >
                                Upload Document
                      </button>
                    </div>
                  </div>
                        )}

                        {/* Documents List */}
                        {selectedStaffDetails.documents && selectedStaffDetails.documents.length > 0 ? (
                          <div className="space-y-3">
                            {selectedStaffDetails.documents.map((doc, index) => (
                              <div
                                key={index}
                                className="bg-white/5 p-4 rounded-lg border border-white/10"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="text-white font-medium">{doc.type}</div>
                                      <span className={`px-3 py-1 rounded-full text-xs border font-medium ${doc.status === "Verified"
                                        ? "bg-green-500/30 text-green-300 border-green-400/50"
                                        : doc.status === "Pending Review"
                                          ? "bg-yellow-500/30 text-yellow-300 border-yellow-400/50"
                                          : "bg-red-500/30 text-red-300 border-red-400/50"
                                        }`}>
                                        {doc.status}
                                      </span>
                    </div>
                                    <div className="text-sm text-gray-400">
                                      Uploaded: {doc.uploadedDate}
                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                      onClick={() => alert(`Viewing document: ${doc.type}`)}
                                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                      👁️ View
                      </button>
                                    <button
                                      onClick={() => alert(`Downloading document: ${doc.type}`)}
                                      className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                      ⬇️ Download
                      </button>
                                    {doc.status !== "Verified" && (
                                      <button
                                        onClick={() => handleDocumentStatusUpdate(index, "Verified")}
                                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
                                      >
                                        ✓ Verify
                                      </button>
                                    )}
                                    {doc.status === "Pending Review" && (
                                      <button
                                        onClick={() => handleDocumentStatusUpdate(index, "Rejected")}
                                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                                      >
                                        ✗ Reject
                                      </button>
                                    )}
                                    {doc.status === "Verified" && (
                                      <button
                                        onClick={() => handleDocumentStatusUpdate(index, "Pending Review")}
                                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                                      >
                                        ↻ Reset
                                      </button>
                                    )}
                    </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400 border border-white/10 rounded-lg bg-white/5">
                            <div className="text-4xl mb-2">📄</div>
                            <div>No documents uploaded yet</div>
                            <div className="text-sm mt-2">Click "Upload Document" to add a new document</div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button
                          onClick={() => setSelectedStaffDetails(null)}
                          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Staff Requests */}
          {activeItem === "Staff Requests" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Staff Requests & Applications</h2>

                {/* Filter */}
                <div className="mb-4">
                  <label className="text-white text-sm mb-2 block">Filter by Status</label>
                  <CustomSelect
                    className="w-full md:w-64"
                    value={requestFilter}
                    onChange={(e) => setRequestFilter(e.target.value)}
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </CustomSelect>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Requests List */}
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Staff Requests ({filteredRequests.length})</h3>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {filteredRequests.length > 0 ? (
                        filteredRequests.map(request => (
                          <div
                            key={request.id}
                            onClick={() => {
                              setSelectedRequest(request);
                              setRequestResponse(request.hrResponse || "");
                              setRequestStatus(request.status);
                            }}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedRequest?.id === request.id
                              ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-blue-400/50"
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                              }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-semibold text-white">{request.staffName}</div>
                                <div className="text-xs text-gray-400 mt-1">ID: {request.staffId}</div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${request.status === "approved"
                                ? "bg-green-500/30 text-green-300"
                                : request.status === "rejected"
                                  ? "bg-red-500/30 text-red-300"
                                  : request.status === "in_progress"
                                    ? "bg-blue-500/30 text-blue-300"
                                    : "bg-yellow-500/30 text-yellow-300"
                                }`}>
                                {request.status === "approved" ? "Approved" : request.status === "rejected" ? "Rejected" : request.status === "in_progress" ? "In Progress" : "Pending"}
                              </span>
                            </div>
                            <div className="text-sm text-white font-medium mb-1">
                              {request.requestType === "leave" ? "📅 Leave Application" : "💬 Chat Request"}
                            </div>
                            <div className="text-xs text-gray-300 mb-1">
                              Subject: {request.subject}
                            </div>
                            {request.requestType === "leave" && (
                              <div className="text-xs text-gray-400 mt-1">
                                Leave: {request.leaveStartDate} to {request.leaveEndDate} ({request.leaveType})
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                              Submitted: {new Date(request.submittedDate).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-400">
                          No {requestFilter !== "all" ? requestFilter : ""} requests found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Request Details & Response */}
                  <div className="bg-white/10 p-4 rounded-lg">
                    {selectedRequest ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Request Details</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-gray-400 text-xs">Staff Member</label>
                              <div className="text-white font-medium">{selectedRequest.staffName} (ID: {selectedRequest.staffId})</div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">Request Type</label>
                              <div className="text-white">
                                {selectedRequest.requestType === "leave" ? "📅 Leave Application" : "💬 Chat Request"}
                              </div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">Subject</label>
                              <div className="text-white">{selectedRequest.subject}</div>
                            </div>
                            <div>
                              <label className="text-gray-400 text-xs">Message</label>
                              <div className="text-white bg-white/5 p-3 rounded border border-white/10">{selectedRequest.message}</div>
                            </div>
                            {selectedRequest.requestType === "leave" && (
                              <>
                                <div>
                                  <label className="text-gray-400 text-xs">Leave Type</label>
                                  <div className="text-white">{selectedRequest.leaveType}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-gray-400 text-xs">Start Date</label>
                                    <div className="text-white">{selectedRequest.leaveStartDate}</div>
                                  </div>
                                  <div>
                                    <label className="text-gray-400 text-xs">End Date</label>
                                    <div className="text-white">{selectedRequest.leaveEndDate}</div>
                                  </div>
                                </div>
                              </>
                            )}
                            <div>
                              <label className="text-gray-400 text-xs">Submitted</label>
                              <div className="text-white">{new Date(selectedRequest.submittedDate).toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                        </div>

                        {selectedRequest.hrResponse && (
                          <div>
                            <label className="text-gray-400 text-xs">Previous HR Response</label>
                            <div className="text-white bg-blue-500/20 p-3 rounded border border-blue-400/30">
                              {selectedRequest.hrResponse}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-white text-sm mb-2 block">HR Response</label>
                          <textarea
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400"
                            rows="4"
                            placeholder="Enter your response..."
                            value={requestResponse}
                            onChange={(e) => setRequestResponse(e.target.value)}
                          ></textarea>
                        </div>

                        <div>
                          <label className="text-white text-sm mb-2 block">Status</label>
                          <CustomSelect
                            className="w-full"
                            value={requestStatus}
                            onChange={(e) => setRequestStatus(e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </CustomSelect>
                        </div>

                        <button
                          onClick={handleRequestResponse}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Submit Response
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[400px] text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-4">📋</div>
                          <div className="text-lg">Select a request to view details and respond</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Request Summary */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Request Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-300">{staffRequests.filter(r => r.status === "pending").length}</div>
                    <div className="text-sm text-gray-300 mt-1">Pending</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-300">{staffRequests.filter(r => r.status === "in_progress").length}</div>
                    <div className="text-sm text-gray-300 mt-1">In Progress</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-300">{staffRequests.filter(r => r.status === "approved").length}</div>
                    <div className="text-sm text-gray-300 mt-1">Approved</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-300">{staffRequests.filter(r => r.status === "rejected").length}</div>
                    <div className="text-sm text-gray-300 mt-1">Rejected</div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Performance Reviews */}
          {activeItem === "Performance Reviews" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Performance Reviews</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Schedule Review</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Staff Member</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Sarah Johnson - Dealer</option>
                          <option>Mike Chen - Floor Manager</option>
                          <option>Emma Davis - Cashier</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Review Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Monthly Review</option>
                          <option>Quarterly Review</option>
                          <option>Annual Review</option>
                          <option>Probation Review</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Review Date</label>
                        <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Reviewer</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>HR Manager</option>
                          <option>Operations Manager</option>
                          <option>General Manager</option>
                        </select>
                      </div>
                      <button className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Schedule Review
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Upcoming Reviews</h3>
                    <div className="space-y-2">
                      <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                        <div className="font-semibold text-white">Sarah Johnson</div>
                        <div className="text-sm text-gray-300">Monthly Review - Due: 2024-01-25</div>
                        <div className="text-xs text-orange-300">Status: Scheduled</div>
                      </div>
                      <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                        <div className="font-semibold text-white">Mike Chen</div>
                        <div className="text-sm text-gray-300">Quarterly Review - Due: 2024-02-01</div>
                        <div className="text-xs text-orange-300">Status: Pending</div>
                      </div>
                      <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                        <div className="font-semibold text-white">Emma Davis</div>
                        <div className="text-sm text-gray-300">Probation Review - Due: 2024-02-15</div>
                        <div className="text-xs text-orange-300">Status: Scheduled</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          </div>
        </main>
      </div>
      {passwordResetModal}
    </div>
  );
}
