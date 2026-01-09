import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffAPI } from "../lib/api";
import toast from "react-hot-toast";
import { storageService } from "../lib/storage";
import RosterManagement from "./RosterManagement";
import LeaveManagement from "./LeaveManagement";

const STAFF_ROLES = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
  { value: "HR", label: "HR" },
  { value: "GRE", label: "GRE (Guest Relations Executive)" },
  { value: "Cashier", label: "Cashier" },
  { value: "Affiliate", label: "Affiliate" },
  { value: "Dealer", label: "Dealer" },
  { value: "FNB", label: "FNB" },
  { value: "Staff", label: "Staff (Custom Role)" },
];

export default function StaffManagement({ selectedClubId }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("staff"); // 'staff', 'roster', or 'leave'
  
  // Check if current user is HR
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isHR = user.role === 'HR';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  // Form state
  const [staffForm, setStaffForm] = useState({
    name: "",
    role: "Super Admin",
    email: "",
    phone: "",
    employeeId: "",
    customRoleName: "",
    aadharDocumentUrl: "",
    panDocumentUrl: "",
  });

  const [suspendForm, setSuspendForm] = useState({ reason: "" });
  const [uploadingAadhar, setUploadingAadhar] = useState(false);
  const [uploadingPan, setUploadingPan] = useState(false);

  // Fetch staff
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ["staff-management", selectedClubId, filters],
    queryFn: () => staffAPI.getAllStaffMembers(selectedClubId, filters),
    enabled: !!selectedClubId,
  });

  // Create staff mutation
  const createMutation = useMutation({
    mutationFn: (data) => staffAPI.createStaffMember(selectedClubId, data),
    onSuccess: (response) => {
      toast.success("Staff member created successfully!");
      if (response.staff.tempPasswordPlainText) {
        setTempPassword({
          password: response.staff.tempPasswordPlainText,
          name: response.staff.name,
          email: response.staff.email,
          role: response.staff.role,
          affiliateCode: response.staff.affiliateCode,
          isReset: false,
        });
        setShowPasswordModal(true);
      }
      queryClient.invalidateQueries(["staff-management", selectedClubId]);
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create staff member");
    },
  });

  // Update staff mutation
  const updateMutation = useMutation({
    mutationFn: ({ staffId, data }) => staffAPI.updateStaffMember(selectedClubId, staffId, data),
    onSuccess: () => {
      toast.success("Staff member updated successfully!");
      queryClient.invalidateQueries(["staff-management", selectedClubId]);
      setShowEditModal(false);
      setSelectedStaff(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update staff member");
    },
  });

  // Suspend staff mutation
  const suspendMutation = useMutation({
    mutationFn: ({ staffId, reason }) => staffAPI.suspendStaffMember(selectedClubId, staffId, reason),
    onSuccess: () => {
      toast.success("Staff member suspended successfully!");
      queryClient.invalidateQueries(["staff-management", selectedClubId]);
      setShowSuspendModal(false);
      setSelectedStaff(null);
      setSuspendForm({ reason: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to suspend staff member");
    },
  });

  // Reactivate staff mutation
  const reactivateMutation = useMutation({
    mutationFn: (staffId) => staffAPI.reactivateStaffMember(selectedClubId, staffId),
    onSuccess: () => {
      toast.success("Staff member reactivated successfully!");
      queryClient.invalidateQueries(["staff-management", selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reactivate staff member");
    },
  });

  // Delete staff mutation
  const deleteMutation = useMutation({
    mutationFn: (staffId) => staffAPI.deleteStaffMember(selectedClubId, staffId),
    onSuccess: () => {
      toast.success("Staff member deleted successfully!");
      queryClient.invalidateQueries(["staff-management", selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete staff member");
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (staffId) => {
      const response = await staffAPI.resetStaffPassword(selectedClubId, staffId);
      // Get staff details for the modal
      const staff = staffData?.staff.find((s) => s.id === staffId);
      return { ...response, staff };
    },
    onSuccess: (response) => {
      toast.success("Password reset successfully!");
      setTempPassword({
        password: response.tempPassword,
        name: response.staff?.name,
        email: response.staff?.email,
        role: response.staff?.role,
        affiliateCode: response.staff?.affiliateCode,
        isReset: true,
      });
      setShowPasswordModal(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });

  const handleFileUpload = async (file, type) => {
    if (type === "aadhar") setUploadingAadhar(true);
    else setUploadingPan(true);

    try {
      const url = await storageService.uploadDocument(file, selectedClubId, "staff-kyc");
      if (type === "aadhar") {
        setStaffForm({ ...staffForm, aadharDocumentUrl: url });
      } else {
        setStaffForm({ ...staffForm, panDocumentUrl: url });
      }
      toast.success(`${type === "aadhar" ? "Aadhar" : "PAN"} card uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${type === "aadhar" ? "Aadhar" : "PAN"} card`);
    } finally {
      if (type === "aadhar") setUploadingAadhar(false);
      else setUploadingPan(false);
    }
  };

  const resetForm = () => {
    setStaffForm({
      name: "",
      role: "Super Admin",
        email: "",
        phone: "",
      employeeId: "",
      customRoleName: "",
      aadharDocumentUrl: "",
      panDocumentUrl: "",
    });
  };

  const handleCreateStaff = () => {
    if (!staffForm.name || !staffForm.email || !staffForm.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (staffForm.role === "Staff" && !staffForm.customRoleName) {
      toast.error("Please enter a custom role name");
            return;
        }

    createMutation.mutate(staffForm);
  };

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setStaffForm({
      name: staff.name,
      role: staff.role,
      email: staff.email,
      phone: staff.phone,
      employeeId: staff.employeeId || "",
      customRoleName: staff.customRoleName || "",
      aadharDocumentUrl: staff.aadharDocumentUrl || "",
      panDocumentUrl: staff.panDocumentUrl || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateStaff = () => {
    if (!staffForm.name || !staffForm.email || !staffForm.phone) {
      toast.error("Please fill in all required fields");
            return;
        }

    updateMutation.mutate({ staffId: selectedStaff.id, data: staffForm });
  };

  const handleSuspend = (staff) => {
    setSelectedStaff(staff);
    setShowSuspendModal(true);
  };

  const handleSuspendConfirm = () => {
    if (!suspendForm.reason || suspendForm.reason.length < 5) {
      toast.error("Please provide a reason (minimum 5 characters)");
      return;
    }

    suspendMutation.mutate({ staffId: selectedStaff.id, reason: suspendForm.reason });
  };

  const handleReactivate = (staff) => {
    if (window.confirm(`Reactivate ${staff.name}?`)) {
      reactivateMutation.mutate(staff.id);
    }
  };

  const handleDelete = (staff) => {
    if (window.confirm(`Are you sure you want to delete ${staff.name}? This action cannot be undone.`)) {
      deleteMutation.mutate(staff.id);
    }
  };

  const handleResetPassword = (staff) => {
    if (window.confirm(`Reset password for ${staff.name}?`)) {
      resetPasswordMutation.mutate(staff.id);
    }
  };

  const handleViewStaff = (staff) => {
    setSelectedStaff(staff);
    setShowViewModal(true);
  };

  const staff = staffData?.staff || [];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-300 border-green-500";
      case "Suspended":
        return "bg-red-500/20 text-red-300 border-red-500";
      case "On Break":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500";
        }
    };

    return (
        <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Staff Management</h1>
        {activeTab === "staff" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
          >
            ➕ Create Staff
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "staff"
              ? "text-white border-b-2 border-purple-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Staff Members
        </button>
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "roster"
              ? "text-white border-b-2 border-purple-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Roster Management
        </button>
        <button
          onClick={() => setActiveTab("leave")}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "leave"
              ? "text-white border-b-2 border-purple-500"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Leave Management
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "roster" && (
        <RosterManagement selectedClubId={selectedClubId} />
      )}

      {activeTab === "leave" && selectedClubId && (
        <LeaveManagement clubId={selectedClubId} />
      )}

      {activeTab === "staff" && (
        <>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-white text-sm mb-1 block">Role</label>
            <select
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="">All Roles</option>
              {STAFF_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white text-sm mb-1 block">Status</label>
            <select
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="On Break">On Break</option>
            </select>
          </div>

          <div>
            <label className="text-white text-sm mb-1 block">Sort By</label>
            <select
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
              <option value="role">Role</option>
            </select>
          </div>

          <div>
            <label className="text-white text-sm mb-1 block">Search</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Name, email, phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Staff List */}
      {staffLoading ? (
        <div className="text-white text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading staff...</p>
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Staff Members Yet</h3>
          <p className="text-gray-400">Create your first staff member to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-600 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                        member.status
                      )}`}
                    >
                      {member.status}
                    </span>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-300 border border-purple-500">
                      {member.role === "Staff" && member.customRoleName
                        ? member.customRoleName
                        : member.role}
                    </span>
                    {member.affiliateCode && (
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-mono font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500">
                        {member.affiliateCode}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white font-semibold">{member.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white font-semibold">{member.phone}</p>
                    </div>
                    {member.employeeId && (
                      <div>
                        <p className="text-sm text-gray-400">Employee ID</p>
                        <p className="text-white font-mono font-semibold">{member.employeeId}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400">Created</p>
                      <p className="text-white font-semibold">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {member.status === "Suspended" && member.suspendedReason && (
                    <div className="mt-3 bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                      <p className="text-sm text-red-300">
                        <strong>Suspension Reason:</strong> {member.suspendedReason}
                      </p>
                    </div>
                  )}
            </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleViewStaff(member)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    View
                  </button>

                  {!isHR && (
                    <>
                      <button
                        onClick={() => handleEditStaff(member)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Edit
                      </button>

                      {member.status === "Active" && (
                        <button
                          onClick={() => handleSuspend(member)}
                          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Suspend
                        </button>
                      )}

                      {member.status === "Suspended" && (
                        <button
                          onClick={() => handleReactivate(member)}
                          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Reactivate
                        </button>
                      )}

                      <button
                        onClick={() => handleResetPassword(member)}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Reset Password
                      </button>

                      <button
                        onClick={() => handleDelete(member)}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-purple-600 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Staff Member</h2>

                                <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                                        <div>
                  <label className="text-white text-sm mb-1 block">Full Name *</label>
                                            <input
                                                type="text"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="John Doe"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                                            />
                                        </div>

                <div>
                  <label className="text-white text-sm mb-1 block">Role *</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  >
                    {STAFF_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {staffForm.role === "Staff" && (
                                        <div>
                  <label className="text-white text-sm mb-1 block">Custom Role Name *</label>
                                            <input
                                                type="text"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Security, Maintenance, etc."
                    value={staffForm.customRoleName}
                    onChange={(e) => setStaffForm({ ...staffForm, customRoleName: e.target.value })}
                                            />
                                        </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                                    <div>
                  <label className="text-white text-sm mb-1 block">Email *</label>
                                        <input
                                            type="email"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="john@example.com"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                                        />
                                    </div>

                                    <div>
                  <label className="text-white text-sm mb-1 block">Phone *</label>
                                        <input
                                            type="tel"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="+91 1234567890"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                                        />
                                    </div>
                                    </div>

                                        <div>
                <label className="text-white text-sm mb-1 block">Employee ID (Optional)</label>
                                            <input
                                                type="text"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="EMP001"
                  value={staffForm.employeeId}
                  onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
                />
                                        </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm mb-1 block">Aadhar Card</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "aadhar")}
                    disabled={uploadingAadhar}
                  />
                  {uploadingAadhar && <p className="text-sm text-gray-400 mt-1">Uploading...</p>}
                  {staffForm.aadharDocumentUrl && (
                    <p className="text-sm text-green-400 mt-1">✓ Uploaded</p>
                  )}
                                    </div>

                                    <div>
                  <label className="text-white text-sm mb-1 block">PAN Card</label>
                                        <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "pan")}
                    disabled={uploadingPan}
                  />
                  {uploadingPan && <p className="text-sm text-gray-400 mt-1">Uploading...</p>}
                  {staffForm.panDocumentUrl && <p className="text-sm text-green-400 mt-1">✓ Uploaded</p>}
                                    </div>
                                </div>
                            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateStaff}
                disabled={createMutation.isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {createMutation.isLoading ? "Creating..." : "Create Staff Member"}
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

      {/* Edit Staff Modal - Similar structure to Create */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-blue-600 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Staff Member</h2>

                            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                                <div>
                  <label className="text-white text-sm mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  />
                                </div>

                                <div>
                  <label className="text-white text-sm mb-1 block">Email *</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  />
                            </div>
                        </div>

              <div className="grid grid-cols-2 gap-4">
                                <div>
                  <label className="text-white text-sm mb-1 block">Phone *</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  />
                                </div>

                                <div>
                  <label className="text-white text-sm mb-1 block">Employee ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    value={staffForm.employeeId}
                    onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
                  />
                                </div>
                                </div>

              {staffForm.role === "Staff" && (
                                <div>
                  <label className="text-white text-sm mb-1 block">Custom Role Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    value={staffForm.customRoleName}
                    onChange={(e) => setStaffForm({ ...staffForm, customRoleName: e.target.value })}
                  />
                                </div>
              )}
                                </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateStaff}
                disabled={updateMutation.isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {updateMutation.isLoading ? "Updating..." : "Update Staff Member"}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStaff(null);
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

      {/* Suspend Modal */}
      {showSuspendModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-orange-600">
            <h2 className="text-2xl font-bold text-white mb-4">Suspend Staff Member</h2>
            <p className="text-gray-300 mb-4">
              You are about to suspend <strong>{selectedStaff.name}</strong>. Please provide a reason:
            </p>

            <textarea
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 h-32"
              placeholder="Enter suspension reason (minimum 5 characters)"
              value={suspendForm.reason}
              onChange={(e) => setSuspendForm({ reason: e.target.value })}
            />

            <div className="flex gap-3 mt-6">
                                    <button
                onClick={handleSuspendConfirm}
                disabled={suspendMutation.isLoading}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                                    >
                {suspendMutation.isLoading ? "Suspending..." : "Suspend"}
                                    </button>
                                    <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSelectedStaff(null);
                  setSuspendForm({ reason: "" });
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
      )}

      {/* Temporary Password Modal */}
      {showPasswordModal && tempPassword && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-green-600">
            <h2 className="text-2xl font-bold text-white mb-4">
              {tempPassword.isReset ? "Password Reset Successfully!" : "Staff Member Created Successfully!"}
            </h2>
            
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-4">
              <p className="text-white mb-2">
                <strong>Name:</strong> {tempPassword.name}
              </p>
              <p className="text-white mb-2">
                <strong>Role:</strong> {tempPassword.role}
              </p>
              <p className="text-white mb-2">
                <strong>Email:</strong> {tempPassword.email}
              </p>
              {tempPassword.affiliateCode && (
                <p className="text-yellow-300 mb-2 font-mono">
                  <strong>Affiliate Code:</strong> {tempPassword.affiliateCode}
                </p>
              )}
              <p className="text-white mb-2">
                <strong>Temporary Password:</strong>
              </p>
              <div className="bg-slate-700 rounded p-3 font-mono text-lg text-center text-green-300 select-all">
                {tempPassword.password}
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              ⚠️ Please save this password and share it with the staff member.{" "}
              {tempPassword.isReset
                ? "They will be required to reset it on next login."
                : "They will be required to reset it on first login. This password will not be shown again."}
            </p>

                            <button
              onClick={() => {
                setShowPasswordModal(false);
                setTempPassword(null);
              }}
              className="w-full bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              I've Saved the Password
                            </button>
                        </div>
                    </div>
      )}

      {/* View Staff Details Modal */}
      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-6 max-w-4xl w-full border border-purple-600 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Staff Member Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStaff(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-600 pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Full Name</p>
                    <p className="text-white font-semibold text-lg">{selectedStaff.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Role</p>
                    <p className="text-white font-semibold">
                      {selectedStaff.role === "Staff" && selectedStaff.customRoleName
                        ? selectedStaff.customRoleName
                        : selectedStaff.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <p className="text-white">{selectedStaff.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Phone</p>
                    <p className="text-white">{selectedStaff.phone}</p>
                  </div>
                  {selectedStaff.employeeId && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Employee ID</p>
                      <p className="text-white font-mono">{selectedStaff.employeeId}</p>
                    </div>
                  )}
                  {selectedStaff.affiliateCode && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Affiliate Code</p>
                      <p className="text-yellow-300 font-mono font-bold text-lg">
                        {selectedStaff.affiliateCode}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                        selectedStaff.status
                      )}`}
                    >
                      {selectedStaff.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Created At</p>
                    <p className="text-white">
                      {new Date(selectedStaff.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedStaff.status === "Suspended" && selectedStaff.suspendedReason && (
                  <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                    <p className="text-sm text-red-300">
                      <strong>Suspension Reason:</strong> {selectedStaff.suspendedReason}
                    </p>
                    {selectedStaff.suspendedAt && (
                      <p className="text-sm text-red-300 mt-2">
                        <strong>Suspended At:</strong>{" "}
                        {new Date(selectedStaff.suspendedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* KYC Documents */}
              <div className="bg-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-600 pb-2">
                  KYC Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aadhar Card */}
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Aadhar Card</p>
                    {selectedStaff.aadharDocumentUrl ? (
                      <div className="space-y-2">
                        <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">🆔</span>
                              <span className="text-white">Aadhar Card</span>
                            </div>
                            <span className="text-green-400 text-sm">✓ Uploaded</span>
                          </div>
                        </div>
                        <a
                          href={selectedStaff.aadharDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-center"
                        >
                          View Document
                        </a>
                        <a
                          href={selectedStaff.aadharDocumentUrl}
                          download
                          className="block w-full bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-center"
                        >
                          Download Document
                        </a>
                      </div>
                    ) : (
                      <div className="bg-slate-600 rounded-lg p-4 border border-slate-500 border-dashed">
                        <p className="text-gray-400 text-center">No Aadhar card uploaded</p>
                      </div>
                    )}
                  </div>

                  {/* PAN Card */}
                  <div>
                    <p className="text-sm text-gray-400 mb-2">PAN Card</p>
                    {selectedStaff.panDocumentUrl ? (
                      <div className="space-y-2">
                        <div className="bg-slate-600 rounded-lg p-4 border border-slate-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">📄</span>
                              <span className="text-white">PAN Card</span>
                            </div>
                            <span className="text-green-400 text-sm">✓ Uploaded</span>
                          </div>
                        </div>
                        <a
                          href={selectedStaff.panDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-center"
                        >
                          View Document
                        </a>
                        <a
                          href={selectedStaff.panDocumentUrl}
                          download
                          className="block w-full bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-center"
                        >
                          Download Document
                        </a>
                      </div>
                    ) : (
                      <div className="bg-slate-600 rounded-lg p-4 border border-slate-500 border-dashed">
                        <p className="text-gray-400 text-center">No PAN card uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Preview Section */}
              {(selectedStaff.aadharDocumentUrl || selectedStaff.panDocumentUrl) && (
                <div className="bg-slate-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 border-b border-slate-600 pb-2">
                    Document Preview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedStaff.aadharDocumentUrl && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Aadhar Card Preview</p>
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                          {selectedStaff.aadharDocumentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={selectedStaff.aadharDocumentUrl}
                              alt="Aadhar Card"
                              className="w-full h-auto rounded-lg max-h-64 object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "block";
                              }}
                            />
                          ) : null}
                          <div
                            style={{ display: "none" }}
                            className="text-center text-gray-400 py-8"
                          >
                            <p className="text-lg mb-2">📄</p>
                            <p>PDF Document - Click "View Document" to open</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedStaff.panDocumentUrl && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">PAN Card Preview</p>
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                          {selectedStaff.panDocumentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={selectedStaff.panDocumentUrl}
                              alt="PAN Card"
                              className="w-full h-auto rounded-lg max-h-64 object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "block";
                              }}
                            />
                          ) : null}
                          <div
                            style={{ display: "none" }}
                            className="text-center text-gray-400 py-8"
                          >
                            <p className="text-lg mb-2">📄</p>
                            <p>PDF Document - Click "View Document" to open</p>
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                </div>
            )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedStaff(null);
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
                </div>
    );
}
