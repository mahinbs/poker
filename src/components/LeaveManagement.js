import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveAPI } from "../lib/api";
import { getLeaveManagementPollIntervalMs } from "../lib/utils";
import toast from "react-hot-toast";
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { formatDateIST, formatTimeIST, formatDateTimeIST } from "../utils/dateUtils";

const STAFF_ROLES = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
  { value: "HR", label: "HR" },
  { value: "GRE", label: "GRE" },
  { value: "Cashier", label: "Cashier" },
  { value: "Dealer", label: "Dealer" },
  { value: "FNB", label: "FNB" },
  { value: "Staff", label: "Staff" },
];

const LEAVE_STATUS_COLORS = {
  Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  Approved: "bg-green-500/20 text-green-400 border-green-500/50",
  Rejected: "bg-red-500/20 text-red-400 border-red-500/50",
  Cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/50",
};

function getStaffRoleFromStorage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const superAdminUser = JSON.parse(localStorage.getItem('superadminuser') || '{}');
  const adminUser = JSON.parse(localStorage.getItem('adminuser') || '{}');
  return (
    user.role ||
    superAdminUser.role ||
    adminUser.role ||
    localStorage.getItem('userRole') ||
    ''
  );
}

function normalizeStaffRoleKey(role) {
  return String(role || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
}

function resolveLeaveApplicationId(app) {
  if (!app || typeof app !== 'object') return undefined;
  return (
    app.id ??
    app._id ??
    app.applicationId ??
    app.leaveApplicationId ??
    app.leaveId
  );
}

function normalizeLeaveApplicationForUi(app) {
  if (!app || typeof app !== 'object') return null;
  const id = resolveLeaveApplicationId(app);
  if (id == null || id === '') return null;
  const staffSrc = app.staff || app.user || app.employee || app.member;
  let staff;
  if (staffSrc && typeof staffSrc === 'object') {
    const name =
      staffSrc.name ||
      staffSrc.fullName ||
      [staffSrc.firstName, staffSrc.lastName].filter(Boolean).join(' ').trim() ||
      staffSrc.email ||
      'Unknown';
    staff = {
      name,
      role: staffSrc.role || staffSrc.staffRole || staffSrc.title || '',
      email: staffSrc.email,
    };
  } else {
    staff = {
      name:
        app.staffName ||
        app.employeeName ||
        app.userName ||
        app.memberName ||
        'Unknown',
      role: app.staffRole || app.employeeRole || app.role || '',
      email: app.staffEmail || app.email,
    };
  }
  const numberOfDays = app.numberOfDays ?? app.days ?? app.dayCount ?? app.totalDays;
  return {
    ...app,
    id,
    staff,
    numberOfDays: numberOfDays != null ? numberOfDays : '—',
    status: app.status || app.leaveStatus || 'Pending',
    startDate: app.startDate ?? app.start_date,
    endDate: app.endDate ?? app.end_date,
    reason: app.reason ?? app.notes ?? '',
    createdAt: app.createdAt ?? app.created_at,
    approvedAt: app.approvedAt ?? app.approved_at,
    rejectedAt: app.rejectedAt ?? app.rejected_at,
    rejectionReason: app.rejectionReason ?? app.rejection_reason,
  };
}

function clientFilterApproveList(rows, filters) {
  return rows.filter((app) => {
    const status = app.status || '';
    if (filters.status && status !== filters.status) return false;
    const role = (app.staff?.role || '').toString();
    if (filters.role && role !== filters.role) return false;
    if (filters.startDate && app.startDate && String(app.startDate).slice(0, 10) < filters.startDate) {
      return false;
    }
    if (filters.endDate && app.endDate && String(app.endDate).slice(0, 10) > filters.endDate) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      const name = (app.staff?.name || '').toLowerCase();
      const email = (app.staff?.email || '').toLowerCase();
      if (!name.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });
}

export default function LeaveManagement({ clubId }) {
  const queryClient = useQueryClient();
  const userRole = getStaffRoleFromStorage();
  const roleKey = normalizeStaffRoleKey(userRole);

  // Determine which tabs to show (Super Admin session uses superadminuser, not user)
  const isSuperAdmin =
    roleKey === 'SUPER_ADMIN' || roleKey === 'SUPERADMIN' || userRole === 'Super Admin';
  const isAdmin = roleKey === 'ADMIN' || userRole === 'Admin';
  const isHR = roleKey === 'HR';
  const canApprove = isSuperAdmin || isAdmin || isHR;
  const canManagePolicies = isSuperAdmin || isAdmin || isHR;
  const canApplyForLeaves = !isSuperAdmin; // Super Admin is not a club employee, so can't apply for leaves
  
  // Set initial tab based on role
  const getInitialTab = () => {
    if (canManagePolicies) return "policies";
    if (canApplyForLeaves) return "my-leaves";
    return "policies"; // Fallback
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  
  // Ensure Super Admin can't access "my-leaves" tab
  useEffect(() => {
    if (isSuperAdmin && activeTab === "my-leaves") {
      setActiveTab("policies");
    }
  }, [isSuperAdmin, activeTab]);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Form states
  const [policyForm, setPolicyForm] = useState({
    role: "",
    leavesPerYear: 0,
  });

  const [leaveForm, setLeaveForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Fetch leave policies
  const { data: policies = [], isLoading: policiesLoading, refetch: refetchPolicies } = useQuery({
    queryKey: ['leavePolicies', clubId],
    queryFn: () => leaveAPI.getLeavePolicies(clubId),
    enabled: !!clubId && canManagePolicies,
  });

  // Filters state for my leaves page
  const [myLeavesFilters, setMyLeavesFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });

  // Fetch my leave applications (only for club employees, not Super Admin)
  const { data: myLeavesData, isLoading: myLeavesLoading, refetch: refetchMyLeaves } = useQuery({
    queryKey: ['myLeaveApplications', clubId, myLeavesFilters],
    queryFn: () => leaveAPI.getMyLeaveApplications(clubId, myLeavesFilters),
    enabled: !!clubId && canApplyForLeaves,
  });

  const myLeaves = myLeavesData?.applications || [];
  const myLeavesTotalPages = myLeavesData?.totalPages || 0;
  const myLeavesCurrentPage = myLeavesData?.page || 1;
  const myLeavesTotal = myLeavesData?.total || 0;

  // Fetch leave balance (only for club employees, not Super Admin)
  const { data: leaveBalance, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ['leaveBalance', clubId],
    queryFn: () => leaveAPI.getLeaveBalance(clubId),
    enabled: !!clubId && canApplyForLeaves,
  });

  // Filters state for approve leaves page
  const [approveFilters, setApproveFilters] = useState({
    // Default Pending so the table uses the same /pending feed as the sidebar (instant, not stale paginated /for-approval).
    status: 'Pending',
    role: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 10
  });

  const approveStatusFilter = approveFilters.status || '';
  const serverOnlyApproveStatus = ['Approved', 'Rejected', 'Cancelled'].includes(approveStatusFilter);
  const needsApproveBulkAll = approveStatusFilter === '';

  // Server-paginated /for-approval for Approved / Rejected / Cancelled only
  const {
    data: approveLeavesData,
    isLoading: approveLeavesLoading,
    isError: approveLeavesError,
    error: approveLeavesErrorObj,
    refetch: refetchApproveLeaves,
  } = useQuery({
    queryKey: ['leaveApplicationsForApproval', clubId, approveFilters],
    queryFn: () => leaveAPI.getLeaveApplicationsForApproval(clubId, approveFilters),
    enabled: !!clubId && canApprove && activeTab === 'approve' && serverOnlyApproveStatus,
    refetchInterval:
      canApprove && activeTab === 'approve' && serverOnlyApproveStatus
        ? getLeaveManagementPollIntervalMs()
        : false,
  });

  // "All Status": fetch a large page and merge with live /pending so new rows match the sidebar immediately
  const {
    data: approveBulkData,
    isLoading: approveBulkLoading,
    isError: approveBulkError,
    error: approveBulkErrorObj,
  } = useQuery({
    queryKey: [
      'leaveApplicationsForApprovalBulk',
      clubId,
      approveFilters.role,
      approveFilters.search,
      approveFilters.startDate,
      approveFilters.endDate,
    ],
    queryFn: () =>
      leaveAPI.getLeaveApplicationsForApproval(clubId, {
        status: '',
        role: approveFilters.role,
        search: approveFilters.search,
        startDate: approveFilters.startDate,
        endDate: approveFilters.endDate,
        page: 1,
        limit: 500,
      }),
    enabled: !!clubId && canApprove && activeTab === 'approve' && needsApproveBulkAll,
    refetchInterval:
      canApprove && activeTab === 'approve' && needsApproveBulkAll
        ? getLeaveManagementPollIntervalMs()
        : false,
  });

  // Fetch pending leave applications (for badge count + approve list when status is Pending)
  const { data: pendingLeaves = [], isLoading: pendingLeavesLoading } = useQuery({
    queryKey: ['pendingLeaveApplications', clubId],
    queryFn: () => leaveAPI.getPendingLeaveApplications(clubId),
    enabled: !!clubId && canApprove,
    refetchInterval: canApprove ? getLeaveManagementPollIntervalMs() : false,
  });

  const applicationsFromForApproval = approveLeavesData?.applications;

  const {
    approveLeaves,
    totalPages,
    currentPage,
    total,
    approveListLoading,
    usingPendingFallback,
    approveTabError,
    approveTabErrorObj,
  } = useMemo(() => {
    const limit = approveFilters.limit || 10;
    const mapNorm = (arr) =>
      (Array.isArray(arr) ? arr : [])
        .map(normalizeLeaveApplicationForUi)
        .filter(Boolean);

    const fromApprovalRaw = applicationsFromForApproval ?? [];
    const pendingNorm = mapNorm(pendingLeaves || []);

    const buildClientPaged = (baseList, merged) => {
      const filtered = clientFilterApproveList(baseList, approveFilters);
      const totalF = filtered.length;
      const totalPagesF = Math.max(1, Math.ceil(totalF / limit) || 1);
      const safePage = Math.min(approveFilters.page || 1, totalPagesF);
      const start = (safePage - 1) * limit;
      const slice = filtered.slice(start, start + limit);
      return {
        approveLeaves: slice,
        totalPages: totalPagesF,
        currentPage: safePage,
        total: totalF,
        approveListLoading: false,
        usingPendingFallback: merged,
        approveTabError: false,
        approveTabErrorObj: null,
      };
    };

    const empty = (loading, err, errObj) => ({
      approveLeaves: [],
      totalPages: 0,
      currentPage: approveFilters.page || 1,
      total: 0,
      approveListLoading: loading,
      usingPendingFallback: false,
      approveTabError: err,
      approveTabErrorObj: errObj,
    });

    // Approved / Rejected / Cancelled — server pagination only
    if (serverOnlyApproveStatus) {
      if (approveLeavesLoading) {
        return empty(true, false, null);
      }
      if (approveLeavesError) {
        return empty(false, true, approveLeavesErrorObj || null);
      }
      const fromApi = mapNorm(fromApprovalRaw);
      if (fromApi.length === 0) {
        return empty(false, false, null);
      }
      return {
        approveLeaves: fromApi,
        totalPages: approveLeavesData?.totalPages || 1,
        currentPage: approveLeavesData?.page || approveFilters.page || 1,
        total: approveLeavesData?.total ?? fromApi.length,
        approveListLoading: false,
        usingPendingFallback: false,
        approveTabError: false,
        approveTabErrorObj: null,
      };
    }

    // Pending — same /pending API as sidebar count (no stale first page of /for-approval)
    if (approveStatusFilter === 'Pending') {
      if (pendingLeavesLoading && (!pendingLeaves || pendingLeaves.length === 0)) {
        return empty(true, false, null);
      }
      return { ...buildClientPaged(pendingNorm, true), approveTabError: false, approveTabErrorObj: null };
    }

    // All Status — merge bulk history with live pending (pending wins on id)
    const bulkNorm = mapNorm(approveBulkData?.applications ?? []);
    const pendingReadyWithRows =
      !pendingLeavesLoading &&
      Array.isArray(pendingLeaves) &&
      pendingLeaves.length > 0;
    const waitingForFirstBulk =
      approveBulkLoading &&
      approveBulkData == null &&
      !pendingReadyWithRows &&
      pendingNorm.length === 0;

    if (waitingForFirstBulk) {
      return empty(true, false, null);
    }

    if (approveBulkError && bulkNorm.length === 0 && pendingNorm.length === 0) {
      return empty(false, true, approveBulkErrorObj || null);
    }

    const byId = new Map();
    for (const row of bulkNorm) {
      byId.set(String(row.id), row);
    }
    for (const row of pendingNorm) {
      byId.set(String(row.id), row);
    }
    const baseList = Array.from(byId.values());
    baseList.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    return { ...buildClientPaged(baseList, true), approveTabError: false, approveTabErrorObj: null };
  }, [
    approveLeavesLoading,
    pendingLeavesLoading,
    applicationsFromForApproval,
    approveLeavesData,
    pendingLeaves,
    approveFilters,
    approveLeavesError,
    approveLeavesErrorObj,
    serverOnlyApproveStatus,
    approveStatusFilter,
    approveBulkData,
    approveBulkLoading,
    approveBulkError,
    approveBulkErrorObj,
  ]);

  const pendingIdsSig = useMemo(
    () =>
      (Array.isArray(pendingLeaves) ? pendingLeaves : [])
        .map((r) => String(resolveLeaveApplicationId(r) ?? ''))
        .filter(Boolean)
        .sort()
        .join('|'),
    [pendingLeaves]
  );

  const prevPendingIdsSigRef = useRef(null);
  useEffect(() => {
    prevPendingIdsSigRef.current = null;
  }, [clubId]);

  useEffect(() => {
    if (!clubId || !canApprove) return;
    if (pendingLeavesLoading) return;
    const prev = prevPendingIdsSigRef.current;
    prevPendingIdsSigRef.current = pendingIdsSig;
    if (prev !== null && prev !== pendingIdsSig) {
      queryClient.invalidateQueries({ queryKey: ['leaveApplicationsForApproval', clubId] });
      queryClient.invalidateQueries({ queryKey: ['leaveApplicationsForApprovalBulk', clubId] });
    }
  }, [clubId, canApprove, pendingIdsSig, pendingLeavesLoading, queryClient]);

  // Create leave policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: (data) => leaveAPI.createLeavePolicy(clubId, data),
    onSuccess: () => {
      toast.success('Leave policy created successfully');
      setShowPolicyModal(false);
      setPolicyForm({ role: "", leavesPerYear: 0 });
      queryClient.invalidateQueries(['leavePolicies', clubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create leave policy');
    },
  });

  // Update leave policy mutation
  const updatePolicyMutation = useMutation({
    mutationFn: ({ role, data }) => leaveAPI.updateLeavePolicy(clubId, role, data),
    onSuccess: () => {
      toast.success('Leave policy updated successfully');
      setShowPolicyModal(false);
      setSelectedPolicy(null);
      setPolicyForm({ role: "", leavesPerYear: 0 });
      queryClient.invalidateQueries(['leavePolicies', clubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update leave policy');
    },
  });

  // Delete leave policy mutation
  const deletePolicyMutation = useMutation({
    mutationFn: (role) => leaveAPI.deleteLeavePolicy(clubId, role),
    onSuccess: () => {
      toast.success('Leave policy deleted successfully');
      queryClient.invalidateQueries(['leavePolicies', clubId]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete leave policy');
    },
  });

  // Create leave application mutation
  const createLeaveMutation = useMutation({
    mutationFn: (data) => leaveAPI.createLeaveApplication(clubId, data),
    onSuccess: async () => {
      toast.success('Leave application submitted successfully');
      setShowLeaveModal(false);
      setLeaveForm({ startDate: "", endDate: "", reason: "" });
      // Immediately refetch all leave-related queries for instant UI update
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['myLeaveApplications', clubId] }),
        queryClient.refetchQueries({ queryKey: ['leaveBalance', clubId] }),
        queryClient.refetchQueries({ queryKey: ['pendingLeaveApplications', clubId] }),
        queryClient.refetchQueries({ queryKey: ['leaveApplicationsForApproval', clubId] }),
        queryClient.refetchQueries({ queryKey: ['leaveApplicationsForApprovalBulk', clubId] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit leave application');
    },
  });

  // Approve leave mutation
  const approveLeaveMutation = useMutation({
    mutationFn: (applicationId) => leaveAPI.approveLeaveApplication(clubId, applicationId),
    onSuccess: async () => {
      toast.success('Leave application approved');
      // Immediately refetch all leave-related queries for instant UI update
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['pendingLeaveApplications', clubId] }),
        queryClient.refetchQueries({ queryKey: ['leaveApplicationsForApproval', clubId] }),
        queryClient.refetchQueries({ queryKey: ['leaveApplicationsForApprovalBulk', clubId] }),
        queryClient.refetchQueries({ queryKey: ['myLeaveApplications', clubId] }),
        queryClient.refetchQueries({ queryKey: ['leaveBalance', clubId] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve leave');
    },
  });

  // Reject leave mutation
  const rejectLeaveMutation = useMutation({
    mutationFn: ({ applicationId, reason }) => leaveAPI.rejectLeaveApplication(clubId, applicationId, reason),
    onSuccess: async () => {
      toast.success('Leave application rejected');
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedApplication(null);
      // Immediately refetch all leave-related queries for instant UI update
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['pendingLeaveApplications', clubId] }),
        queryClient.refetchQueries({ queryKey: ['leaveApplicationsForApproval', clubId] }),
        queryClient.refetchQueries({ queryKey: ['leaveApplicationsForApprovalBulk', clubId] }),
        queryClient.refetchQueries({ queryKey: ['myLeaveApplications', clubId] }),
        queryClient.refetchQueries({ queryKey: ['leaveBalance', clubId] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject leave');
    },
  });

  // Cancel leave mutation
  const cancelLeaveMutation = useMutation({
    mutationFn: (applicationId) => leaveAPI.cancelLeaveApplication(clubId, applicationId),
    onSuccess: async () => {
      toast.success('Leave application cancelled successfully');
      // Immediately refetch all leave-related queries for instant UI update
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['myLeaveApplications', clubId] }),
        queryClient.refetchQueries({ queryKey: ['leaveBalance', clubId] }),
        queryClient.refetchQueries({ queryKey: ['pendingLeaveApplications', clubId] }),
        queryClient.refetchQueries({ queryKey: ['leaveApplicationsForApproval', clubId] }),
        queryClient.refetchQueries({ queryKey: ['leaveApplicationsForApprovalBulk', clubId] }),
      ]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel leave');
    },
  });

  const handleCreatePolicy = () => {
    setSelectedPolicy(null);
    setPolicyForm({ role: "", leavesPerYear: 0 });
    setShowPolicyModal(true);
  };

  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    setPolicyForm({
      role: policy.role,
      leavesPerYear: policy.leavesPerYear,
    });
    setShowPolicyModal(true);
  };

  const handleSubmitPolicy = (e) => {
    e.preventDefault();
    if (selectedPolicy) {
      updatePolicyMutation.mutate({
        role: selectedPolicy.role,
        data: { leavesPerYear: policyForm.leavesPerYear },
      });
    } else {
      createPolicyMutation.mutate(policyForm);
    }
  };

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    createLeaveMutation.mutate(leaveForm);
  };

  const handleRejectLeave = (application) => {
    setSelectedApplication(application);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleSubmitReject = (e) => {
    e.preventDefault();
    if (selectedApplication) {
      rejectLeaveMutation.mutate({
        applicationId: selectedApplication.id,
        reason: rejectionReason,
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return formatDateIST(dateString);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Leave Management</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-700">
          {canManagePolicies && (
            <button
              onClick={() => setActiveTab("policies")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "policies"
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Leave Policies
            </button>
          )}
          {canApprove && (
            <button
              onClick={() => setActiveTab("approve")}
              className={`px-6 py-3 font-semibold transition-colors inline-flex items-center gap-2 ${
                activeTab === "approve"
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>Approve Leaves</span>
              {pendingLeaves.length > 0 && (
                <span
                  className={`text-xs font-bold rounded-full min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center flex-shrink-0 ${
                    activeTab === "approve"
                      ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/50"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {pendingLeaves.length > 99 ? "99+" : pendingLeaves.length}
                </span>
              )}
            </button>
          )}
          {canApplyForLeaves && (
            <button
              onClick={() => setActiveTab("my-leaves")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "my-leaves"
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              My Leaves
            </button>
          )}
        </div>

        {/* Leave Policies Tab */}
        {activeTab === "policies" && canManagePolicies && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Leave Policies</h2>
              <button
                onClick={handleCreatePolicy}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaPlus /> Create Policy
              </button>
            </div>

            {policiesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading policies...</p>
              </div>
            ) : policies.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No leave policies configured yet.</p>
                <p className="text-sm mt-2">Click "Create Policy" to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {policies.map((policy) => (
                  <div
                    key={policy.id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-white">{policy.role}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPolicy(policy)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete leave policy for ${policy.role}?`)) {
                              deletePolicyMutation.mutate(policy.role);
                            }
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">{policy.leavesPerYear}</p>
                    <p className="text-sm text-gray-400">leaves per year</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Approve Leaves Tab */}
        {activeTab === "approve" && canApprove && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white">Leave Applications</h2>
              {pendingLeaves.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-amber-600/25 text-amber-300 border border-amber-500/40">
                  <FaClock className="text-amber-400" />
                  {pendingLeaves.length} pending approval
                </span>
              )}
            </div>

            {approveTabError && (
              <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-900/20 px-4 py-3 text-sm text-amber-200">
                Could not load leave applications ({approveTabErrorObj?.message || 'request failed'}).{' '}
                {pendingLeaves.length > 0
                  ? 'You may still see pending rows from the live queue below.'
                  : 'Try refreshing or check your connection.'}
              </div>
            )}
            {usingPendingFallback && (
              <p className="mb-4 text-sm text-slate-400">
                {approveStatusFilter === 'Pending'
                  ? 'Showing the live pending queue (same data as the sidebar count).'
                  : 'Showing all statuses: pending rows use the live queue merged with recent history (up to 500 records).'}
              </p>
            )}

            {/* Filters */}
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={approveFilters.status}
                    onChange={(e) => setApproveFilters({ ...approveFilters, status: e.target.value, page: 1 })}
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    value={approveFilters.role}
                    onChange={(e) => setApproveFilters({ ...approveFilters, role: e.target.value, page: 1 })}
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  >
                    <option value="">All Roles</option>
                    {STAFF_ROLES.filter(r => r.value !== "Affiliate").map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Search (Name/Email)</label>
                  <input
                    type="text"
                    value={approveFilters.search}
                    onChange={(e) => setApproveFilters({ ...approveFilters, search: e.target.value, page: 1 })}
                    placeholder="Search by name or email..."
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  />
                </div>

                {/* Start Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={approveFilters.startDate}
                    onChange={(e) => setApproveFilters({ ...approveFilters, startDate: e.target.value, page: 1 })}
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  />
                </div>

                {/* End Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={approveFilters.endDate}
                    onChange={(e) => setApproveFilters({ ...approveFilters, endDate: e.target.value, page: 1 })}
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                  />
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button
                    onClick={() => setApproveFilters({
                      status: 'Pending',
                      role: '',
                      startDate: '',
                      endDate: '',
                      search: '',
                      page: 1,
                      limit: 10
                    })}
                    className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-400">
              Showing {approveLeaves.length} of {total} leave application(s)
            </div>

            {approveListLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading applications...</p>
              </div>
            ) : approveLeaves.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FaCheckCircle className="text-5xl mx-auto mb-4 opacity-50" />
                <p>No leave applications found</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {approveLeaves.map((application) => (
                  <div
                    key={application.id}
                    className="bg-slate-700/50 rounded-lg p-6 border border-slate-600"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{application.staff.name}</h3>
                        <p className="text-sm text-gray-400">{application.staff.role}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${LEAVE_STATUS_COLORS[application.status]}`}>
                        {application.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Start Date</p>
                        <p className="text-white font-medium">{formatDate(application.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">End Date</p>
                        <p className="text-white font-medium">{formatDate(application.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Number of Days</p>
                        <p className="text-white font-medium">{application.numberOfDays} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Applied On</p>
                        <p className="text-white font-medium">{formatDate(application.createdAt)}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-1">Reason</p>
                      <p className="text-white bg-slate-800/50 rounded p-3">{application.reason}</p>
                    </div>
                    {application.status === 'Pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => approveLeaveMutation.mutate(application.id)}
                          disabled={approveLeaveMutation.isLoading || rejectLeaveMutation.isLoading}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {approveLeaveMutation.isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Approving...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle /> Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectLeave(application)}
                          disabled={approveLeaveMutation.isLoading || rejectLeaveMutation.isLoading}
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </div>
                    )}
                    {application.status === 'Approved' && application.approvedAt && (
                      <div className="text-sm text-gray-400">
                        Approved on {formatDate(application.approvedAt)}
                      </div>
                    )}
                    {application.status === 'Rejected' && application.rejectedAt && (
                      <div className="text-sm text-gray-400">
                        Rejected on {formatDate(application.rejectedAt)}
                        {application.rejectionReason && (
                          <div className="mt-2 text-red-400 bg-red-900/20 rounded p-2">
                            Reason: {application.rejectionReason}
                          </div>
                        )}
                      </div>
                    )}
                    {application.status === 'Cancelled' && (
                      <div className="text-sm text-gray-400">
                        Cancelled by employee
                      </div>
                    )}
                  </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
                    <div className="text-sm text-gray-400">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setApproveFilters({ ...approveFilters, page: currentPage - 1 })}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setApproveFilters({ ...approveFilters, page: currentPage + 1 })}
                        disabled={currentPage >= totalPages}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* My Leaves Tab - Only for club employees, not Super Admin */}
        {activeTab === "my-leaves" && canApplyForLeaves && (
          <div className="space-y-6">
            {/* Leave Balance Card */}
            {leaveBalance && (
              <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-xl p-6 border border-emerald-500/50">
                <h2 className="text-xl font-semibold text-white mb-4">Leave Balance</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Total Leaves</p>
                    <p className="text-3xl font-bold text-white">{leaveBalance.totalLeaves}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Used Leaves</p>
                    <p className="text-3xl font-bold text-yellow-400">{leaveBalance.usedLeaves}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Remaining Leaves</p>
                    <p className="text-3xl font-bold text-emerald-400">{leaveBalance.remainingLeaves}</p>
                  </div>
                </div>
              </div>
            )}

            {/* My Leave Applications */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">My Leave Applications</h2>
                <button
                  onClick={() => {
                    setLeaveForm({ startDate: "", endDate: "", reason: "" });
                    setShowLeaveModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaPlus /> Apply for Leave
                </button>
              </div>

              {/* Filters */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={myLeavesFilters.status}
                      onChange={(e) => setMyLeavesFilters({ ...myLeavesFilters, status: e.target.value, page: 1 })}
                      className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                    >
                      <option value="">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Start Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={myLeavesFilters.startDate}
                      onChange={(e) => setMyLeavesFilters({ ...myLeavesFilters, startDate: e.target.value, page: 1 })}
                      className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                    />
                  </div>

                  {/* End Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                    <input
                      type="date"
                      value={myLeavesFilters.endDate}
                      onChange={(e) => setMyLeavesFilters({ ...myLeavesFilters, endDate: e.target.value, page: 1 })}
                      className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
                    />
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex items-end">
                    <button
                      onClick={() => setMyLeavesFilters({
                        status: '',
                        startDate: '',
                        endDate: '',
                        page: 1,
                        limit: 10
                      })}
                      className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4 text-sm text-gray-400">
                Showing {myLeaves.length} of {myLeavesTotal} leave application(s)
              </div>

              {myLeavesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading your leaves...</p>
                </div>
              ) : myLeaves.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FaCalendarAlt className="text-5xl mx-auto mb-4 opacity-50" />
                  <p>No leave applications yet</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {myLeaves.map((application) => (
                    <div
                      key={application.id}
                      className="bg-slate-700/50 rounded-lg p-6 border border-slate-600"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${LEAVE_STATUS_COLORS[application.status]}`}>
                              {application.status}
                            </span>
                            <span className="text-white font-medium">{application.numberOfDays} days</span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {formatDate(application.startDate)} - {formatDate(application.endDate)}
                          </p>
                        </div>
                        {application.status === "Approved" && application.approvedAt && (
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Approved on</p>
                            <p className="text-sm text-white">{formatDate(application.approvedAt)}</p>
                          </div>
                        )}
                        {application.status === "Rejected" && application.rejectedAt && (
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Rejected on</p>
                            <p className="text-sm text-white">{formatDate(application.rejectedAt)}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Reason</p>
                        <p className="text-white bg-slate-800/50 rounded p-3">{application.reason}</p>
                      </div>
                      {application.rejectionReason && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-400 mb-1">Rejection Reason</p>
                          <p className="text-red-400 bg-red-900/20 rounded p-3">{application.rejectionReason}</p>
                        </div>
                      )}
                      {application.status !== "Cancelled" && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this leave application?')) {
                                cancelLeaveMutation.mutate(application.id);
                              }
                            }}
                            disabled={cancelLeaveMutation.isLoading}
                            className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                          >
                            <FaTimesCircle /> Cancel Leave
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  </div>

                  {/* Pagination */}
                  {myLeavesTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
                      <div className="text-sm text-gray-400">
                        Page {myLeavesCurrentPage} of {myLeavesTotalPages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMyLeavesFilters({ ...myLeavesFilters, page: myLeavesCurrentPage - 1 })}
                          disabled={myLeavesCurrentPage === 1}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setMyLeavesFilters({ ...myLeavesFilters, page: myLeavesCurrentPage + 1 })}
                          disabled={myLeavesCurrentPage >= myLeavesTotalPages}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
        )}

        {/* Create/Edit Policy Modal */}
        {showPolicyModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-slate-700 max-h-[85vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                {selectedPolicy ? "Edit Leave Policy" : "Create Leave Policy"}
              </h2>
              <form onSubmit={handleSubmitPolicy}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    value={policyForm.role}
                    onChange={(e) => setPolicyForm({ ...policyForm, role: e.target.value })}
                    disabled={!!selectedPolicy || createPolicyMutation.isLoading || updatePolicyMutation.isLoading}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                    required
                  >
                    <option value="">Select Role</option>
                    {STAFF_ROLES.filter(r => r.value !== "Affiliate").map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Leaves Per Year</label>
                  <input
                    type="number"
                    min="0"
                    value={policyForm.leavesPerYear}
                    onChange={(e) => setPolicyForm({ ...policyForm, leavesPerYear: parseInt(e.target.value) || 0 })}
                    disabled={createPolicyMutation.isLoading || updatePolicyMutation.isLoading}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white disabled:opacity-50"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  {!(createPolicyMutation.isLoading || updatePolicyMutation.isLoading) && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowPolicyModal(false);
                        setSelectedPolicy(null);
                        setPolicyForm({ role: "", leavesPerYear: 0 });
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={createPolicyMutation.isLoading || updatePolicyMutation.isLoading}
                    className={`flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 ${(createPolicyMutation.isLoading || updatePolicyMutation.isLoading) ? 'w-full' : ''}`}
                  >
                    {(createPolicyMutation.isLoading || updatePolicyMutation.isLoading) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {selectedPolicy ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      selectedPolicy ? "Update" : "Create"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Apply for Leave Modal */}
        {showLeaveModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-slate-700 max-h-[85vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Apply for Leave</h2>
              <form onSubmit={handleSubmitLeave}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                  <textarea
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Please provide a reason for your leave..."
                    required
                    minLength={10}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLeaveModal(false);
                      setLeaveForm({ startDate: "", endDate: "", reason: "" });
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLeaveMutation.isLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reject Leave Modal */}
        {showRejectModal && selectedApplication && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-slate-700 max-h-[85vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Reject Leave Application</h2>
              <p className="text-gray-400 mb-4">
                Rejecting leave application for <strong className="text-white">{selectedApplication.staff.name}</strong>
              </p>
              <form onSubmit={handleSubmitReject}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Reason (Optional)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Provide a reason for rejection..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedApplication(null);
                      setRejectionReason("");
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rejectLeaveMutation.isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {rejectLeaveMutation.isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Rejecting...
                      </>
                    ) : (
                      'Reject Leave'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

