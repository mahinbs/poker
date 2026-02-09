import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminAPI } from "../../lib/api";
import toast from "react-hot-toast";

const NOTIFICATION_TARGETS = {
  ALL_PLAYERS: 'all_players',
  NEW_SIGNUPS: 'new_signups',
  VIP_PLAYERS: 'vip_players',
  TABLES_PLAYERS: 'tables_players',
  WAITLIST_PLAYERS: 'waitlist_players',
  CUSTOM_GROUP: 'custom_group',
  ALL_STAFF: 'all_staff',
  STAFF_ADMIN: 'staff_admin',
  STAFF_MANAGER: 'staff_manager',
  STAFF_CASHIER: 'staff_cashier',
  STAFF_DEALER: 'staff_dealer',
  STAFF_HR: 'staff_hr',
  STAFF_FNB: 'staff_fnb',
  STAFF_GRE: 'staff_gre',
  STAFF_CUSTOM: 'staff_custom',
};

// Helper function to sanitize filename
const sanitizeFilename = (filename) => {
  if (!filename) return filename;
  
  // Get file extension
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
  const ext = lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  
  // Remove all special characters, spaces, and Unicode characters
  // Keep only alphanumeric, hyphens, and underscores
  const sanitizedName = name
    .normalize('NFD') // Normalize Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces, hyphens, underscores
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .toLowerCase(); // Convert to lowercase
  
  return sanitizedName + ext;
};

export default function PushNotifications({ selectedClubId }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("player"); // 'player' or 'staff'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showCustomGroupModal, setShowCustomGroupModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    details: "",
    targetType: NOTIFICATION_TARGETS.ALL_PLAYERS,
    imageFile: null,
    imageUrl: "",
    videoFile: null,
    videoUrl: "",
    customPlayerIds: [],
    customStaffIds: [],
    scheduledAt: "",
    isActive: true,
  });

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["pushNotifications", selectedClubId, activeTab],
    queryFn: () => superAdminAPI.getPushNotifications(selectedClubId, activeTab),
    enabled: !!selectedClubId,
  });

  // Fetch all players for custom group selection
  const { data: allPlayers = [] } = useQuery({
    queryKey: ["allPlayersForGroup", selectedClubId],
    queryFn: async () => {
      if (!selectedClubId) return [];
      const allPlayers = [];
      let page = 1;
      const limit = 50;
      let hasMore = true;

      while (hasMore) {
        try {
          const response = await superAdminAPI.getPlayers(selectedClubId, { limit, page });
          const players = response.players || [];

          if (!players || players.length === 0) {
            hasMore = false;
            break;
          }

          const approvedPlayers = players.filter(p =>
            (p.kycStatus === 'approved' || p.kycStatus === 'verified') &&
            p.status === 'Active'
          );

          allPlayers.push(...approvedPlayers);

          if (players.length < limit) {
            hasMore = false;
          } else {
            page++;
            if (page > 20) hasMore = false;
          }
        } catch (error) {
          console.error(`Error fetching players page ${page}:`, error);
          hasMore = false;
        }
      }

      return allPlayers;
    },
    enabled: !!selectedClubId && notificationForm.targetType === NOTIFICATION_TARGETS.CUSTOM_GROUP,
  });

  // Fetch all staff for custom staff selection
  const { data: allStaff = [] } = useQuery({
    queryKey: ["allStaffForGroup", selectedClubId],
    queryFn: async () => {
      if (!selectedClubId) return [];
      const response = await superAdminAPI.getStaff(selectedClubId);
      // Exclude affiliates
      return (response || []).filter(s => s.status === 'Active' && s.role !== 'AFFILIATE');
    },
    enabled: !!selectedClubId && notificationForm.targetType === NOTIFICATION_TARGETS.STAFF_CUSTOM,
  });

  // Create notification mutation
  const createNotificationMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = data.imageUrl;
      let videoUrl = data.videoUrl;

      // Upload image if file provided
      if (data.imageFile) {
        try {
          const sanitizedFilename = sanitizeFilename(data.imageFile.name);
          const { signedUrl, publicUrl } = await superAdminAPI.createPushNotificationUploadUrl(
            selectedClubId,
            sanitizedFilename,
            false
          );
          await superAdminAPI.uploadToSignedUrl(signedUrl, data.imageFile);
          imageUrl = publicUrl;
        } catch (error) {
          console.error("Failed to upload image:", error);
          toast.error("Failed to upload image: " + (error.message || "Unknown error"));
          return; // Stop if image upload fails
        }
      }

      // Upload video if file provided
      if (data.videoFile) {
        try {
          const sanitizedFilename = sanitizeFilename(data.videoFile.name);
          const { signedUrl, publicUrl } = await superAdminAPI.createPushNotificationUploadUrl(
            selectedClubId,
            sanitizedFilename,
            true
          );
          await superAdminAPI.uploadToSignedUrl(signedUrl, data.videoFile);
          videoUrl = publicUrl;
        } catch (error) {
          console.error("Failed to upload video:", error);
          toast.error("Failed to upload video: " + (error.message || "Unknown error"));
          return; // Stop if video upload fails
        }
      }

      return await superAdminAPI.createPushNotification(selectedClubId, {
        title: data.title,
        details: data.details,
        imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || undefined,
        targetType: data.targetType,
        customPlayerIds: data.targetType === NOTIFICATION_TARGETS.CUSTOM_GROUP ? data.customPlayerIds : undefined,
        customStaffIds: data.targetType === NOTIFICATION_TARGETS.STAFF_CUSTOM ? data.customStaffIds : undefined,
        notificationType: activeTab,
        scheduledAt: data.scheduledAt || undefined,
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      toast.success("Push notification created successfully!");
      queryClient.invalidateQueries(["pushNotifications", selectedClubId]);
      setShowCreateModal(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create notification");
    },
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      return await superAdminAPI.sendPushNotification(selectedClubId, notificationId);
    },
    onSuccess: (data) => {
      toast.success(`Notification sent to ${data.recipientCount} recipient(s)!`);
      queryClient.invalidateQueries(["pushNotifications", selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send notification");
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId) => {
      return await superAdminAPI.deletePushNotification(selectedClubId, notificationId);
    },
    onSuccess: () => {
      toast.success("Notification deleted successfully!");
      queryClient.invalidateQueries(["pushNotifications", selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete notification");
    },
  });

  const resetForm = () => {
    setNotificationForm({
      title: "",
      details: "",
      targetType: activeTab === "player" ? NOTIFICATION_TARGETS.ALL_PLAYERS : NOTIFICATION_TARGETS.ALL_STAFF,
      imageFile: null,
      imageUrl: "",
      videoFile: null,
      videoUrl: "",
      customPlayerIds: [],
      customStaffIds: [],
      scheduledAt: "",
      isActive: true,
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!notificationForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (notificationForm.targetType === NOTIFICATION_TARGETS.CUSTOM_GROUP && notificationForm.customPlayerIds.length === 0) {
      toast.error("Please select at least one player for custom group");
      return;
    }
    if (notificationForm.targetType === NOTIFICATION_TARGETS.STAFF_CUSTOM && notificationForm.customStaffIds.length === 0) {
      toast.error("Please select at least one staff member for custom group");
      return;
    }
    createNotificationMutation.mutate(notificationForm);
  };

  const handleSend = (notificationId, title) => {
    if (window.confirm(`Are you sure you want to send "${title}" to all recipients?`)) {
      sendNotificationMutation.mutate(notificationId);
    }
  };

  const handleDelete = (notificationId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteNotificationMutation.mutate(notificationId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Push Notifications & Offers</h1>
          <p className="text-gray-400">Create and manage push notifications for players and staff</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg"
        >
          + Create Notification
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => {
            setActiveTab("player");
            resetForm();
          }}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "player"
              ? "text-white border-b-2 border-blue-500 bg-blue-500/10"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Player Notifications
        </button>
        <button
          onClick={() => {
            setActiveTab("staff");
            resetForm();
          }}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === "staff"
              ? "text-white border-b-2 border-purple-500 bg-purple-500/10"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Staff Notifications
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">No {activeTab} notifications yet</p>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Create Your First Notification
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{notification.title}</h3>
                  {notification.details && (
                    <p className="text-gray-300 mb-3">{notification.details}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded">
                      {notification.targetType === NOTIFICATION_TARGETS.ALL_PLAYERS && "All Players"}
                      {notification.targetType === NOTIFICATION_TARGETS.NEW_SIGNUPS && "New Signups"}
                      {notification.targetType === NOTIFICATION_TARGETS.VIP_PLAYERS && "VIP Players"}
                      {notification.targetType === NOTIFICATION_TARGETS.TABLES_PLAYERS && "Tables Players"}
                      {notification.targetType === NOTIFICATION_TARGETS.WAITLIST_PLAYERS && "Waitlist Players"}
                      {notification.targetType === NOTIFICATION_TARGETS.CUSTOM_GROUP && "Custom Group"}
                      {notification.targetType === NOTIFICATION_TARGETS.ALL_STAFF && "All Staff"}
                      {notification.targetType === NOTIFICATION_TARGETS.STAFF_ADMIN && "Admin Staff"}
                      {notification.targetType === NOTIFICATION_TARGETS.STAFF_MANAGER && "Manager Staff"}
                      {notification.targetType === NOTIFICATION_TARGETS.STAFF_CASHIER && "Cashier Staff"}
                      {notification.targetType === NOTIFICATION_TARGETS.STAFF_DEALER && "Dealer Staff"}
                      {notification.targetType === NOTIFICATION_TARGETS.STAFF_HR && "HR Staff"}
                      {notification.targetType === NOTIFICATION_TARGETS.STAFF_FNB && "F&B Staff"}
                      {notification.targetType === NOTIFICATION_TARGETS.STAFF_GRE && "GRE Staff"}
                      {notification.targetType === NOTIFICATION_TARGETS.STAFF_CUSTOM && "Custom Staff Group"}
                    </span>
                    <span className={`px-3 py-1 text-sm font-semibold rounded ${
                      notification.isActive
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 text-gray-300"
                    }`}>
                      {notification.isActive ? "Active" : "Inactive"}
                    </span>
                    {notification.sentAt && (
                      <span className="px-3 py-1 bg-purple-600 text-white text-sm font-semibold rounded">
                        Sent {new Date(notification.sentAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {(notification.imageUrl || notification.videoUrl) && (
                    <div className="mt-3">
                      {notification.imageUrl && (
                        <img
                          src={notification.imageUrl}
                          alt={notification.title}
                          className="max-w-xs rounded-lg"
                        />
                      )}
                      {notification.videoUrl && (
                        <video
                          src={notification.videoUrl}
                          controls
                          className="max-w-xs rounded-lg mt-2"
                        />
                      )}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  {!notification.sentAt && (
                    <button
                      onClick={() => handleSend(notification.id, notification.title)}
                      disabled={sendNotificationMutation.isPending}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <span>📤</span> Send
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id, notification.title)}
                    disabled={deleteNotificationMutation.isPending}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <NotificationModal
          title="Create Push Notification"
          form={notificationForm}
          setForm={setNotificationForm}
          onSubmit={handleCreateSubmit}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          isLoading={createNotificationMutation.isPending}
          activeTab={activeTab}
          allPlayers={allPlayers}
          allStaff={allStaff}
          showCustomGroupModal={showCustomGroupModal}
          setShowCustomGroupModal={setShowCustomGroupModal}
        />
      )}
    </div>
  );
}

// Notification Form Modal Component
function NotificationModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  isLoading,
  activeTab,
  allPlayers,
  allStaff,
  showCustomGroupModal,
  setShowCustomGroupModal,
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full my-8 border border-slate-700 max-h-[85vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Special Weekend Offer!"
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Details
            </label>
            <textarea
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="Enter notification details..."
              rows={4}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Target Audience <span className="text-red-400">*</span>
            </label>
            <select
              value={form.targetType}
              onChange={(e) => setForm({ ...form, targetType: e.target.value, customPlayerIds: [], customStaffIds: [] })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {activeTab === "player" ? (
                <>
                  <option value={NOTIFICATION_TARGETS.ALL_PLAYERS}>All Players</option>
                  <option value={NOTIFICATION_TARGETS.NEW_SIGNUPS}>New Sign-up Players</option>
                  <option value={NOTIFICATION_TARGETS.VIP_PLAYERS}>VIP Players</option>
                  <option value={NOTIFICATION_TARGETS.TABLES_PLAYERS}>Tables Players</option>
                  <option value={NOTIFICATION_TARGETS.WAITLIST_PLAYERS}>Waitlist Players</option>
                  <option value={NOTIFICATION_TARGETS.CUSTOM_GROUP}>Custom Group</option>
                </>
              ) : (
                <>
                  <option value={NOTIFICATION_TARGETS.ALL_STAFF}>All Staff</option>
                  <option value={NOTIFICATION_TARGETS.STAFF_ADMIN}>Admin Staff</option>
                  <option value={NOTIFICATION_TARGETS.STAFF_MANAGER}>Manager Staff</option>
                  <option value={NOTIFICATION_TARGETS.STAFF_CASHIER}>Cashier Staff</option>
                  <option value={NOTIFICATION_TARGETS.STAFF_DEALER}>Dealer Staff</option>
                  <option value={NOTIFICATION_TARGETS.STAFF_HR}>HR Staff</option>
                  <option value={NOTIFICATION_TARGETS.STAFF_FNB}>F&B Staff</option>
                  <option value={NOTIFICATION_TARGETS.STAFF_GRE}>GRE Staff</option>
                  <option value={NOTIFICATION_TARGETS.STAFF_CUSTOM}>Custom Staff Group</option>
                </>
              )}
            </select>
            {form.targetType === NOTIFICATION_TARGETS.CUSTOM_GROUP && (
              <button
                type="button"
                onClick={() => setShowCustomGroupModal(true)}
                className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                {form.customPlayerIds.length > 0
                  ? `Selected ${form.customPlayerIds.length} players`
                  : "Select Players"}
              </button>
            )}
            {form.targetType === NOTIFICATION_TARGETS.STAFF_CUSTOM && (
              <button
                type="button"
                onClick={() => setShowCustomGroupModal(true)}
                className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                {form.customStaffIds.length > 0
                  ? `Selected ${form.customStaffIds.length} staff members`
                  : "Select Staff Members"}
              </button>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Image (Optional)
            </label>
            <div className="flex gap-2">
              <label className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error("Image must be less than 10MB");
                        return;
                      }
                      setForm({ ...form, imageFile: file, imageUrl: "" });
                    }
                  }}
                />
                {form.imageFile ? "✓ File Selected" : "Choose Image"}
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value, imageFile: null })}
                placeholder="Or paste image URL"
                disabled={!!form.imageFile}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            {form.imageFile && (
              <p className="text-green-400 text-xs mt-1">
                📁 {form.imageFile.name} ({(form.imageFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Video (Optional)
            </label>
            <div className="flex gap-2">
              <label className="flex-shrink-0 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 100 * 1024 * 1024) {
                        toast.error("Video must be less than 100MB");
                        return;
                      }
                      setForm({ ...form, videoFile: file, videoUrl: "" });
                    }
                  }}
                />
                {form.videoFile ? "✓ File Selected" : "Choose Video"}
              </label>
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value, videoFile: null })}
                placeholder="Or paste video URL"
                disabled={!!form.videoFile}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            {form.videoFile && (
              <p className="text-green-400 text-xs mt-1">
                📁 {form.videoFile.name} ({(form.videoFile.size / (1024 * 1024)).toFixed(1)} MB)
              </p>
            )}
          </div>

          {/* Scheduled At */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Schedule (Optional)
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-500 text-xs mt-1">Leave empty to send immediately</p>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-slate-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-gray-300 font-semibold">
              Notification is Active
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Notification"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Custom Group Selection Modal */}
      {showCustomGroupModal && form.targetType === NOTIFICATION_TARGETS.CUSTOM_GROUP && (
        <CustomGroupModal
          allPlayers={allPlayers}
          selectedPlayerIds={form.customPlayerIds}
          onSelect={(playerIds) => {
            setForm({ ...form, customPlayerIds: playerIds });
            setShowCustomGroupModal(false);
          }}
          onClose={() => setShowCustomGroupModal(false)}
        />
      )}
      {showCustomGroupModal && form.targetType === NOTIFICATION_TARGETS.STAFF_CUSTOM && (
        <CustomStaffModal
          allStaff={allStaff}
          selectedStaffIds={form.customStaffIds}
          onSelect={(staffIds) => {
            setForm({ ...form, customStaffIds: staffIds });
            setShowCustomGroupModal(false);
          }}
          onClose={() => setShowCustomGroupModal(false)}
        />
      )}
    </div>
  );
}

// Custom Group Selection Modal
function CustomGroupModal({ allPlayers, selectedPlayerIds, onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set(selectedPlayerIds));

  const filteredPlayers = allPlayers.filter(p => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      p.email.toLowerCase().includes(searchLower) ||
      (p.phoneNumber && p.phoneNumber.includes(searchTerm)) ||
      (p.playerId && p.playerId.toLowerCase().includes(searchLower))
    );
  });

  const togglePlayer = (playerId) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(playerId)) {
      newSet.delete(playerId);
    } else {
      newSet.add(playerId);
    }
    setSelectedIds(newSet);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto border border-slate-700">
        <h3 className="text-2xl font-bold text-white mb-4">Select Players for Custom Group</h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or ID..."
          className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
              onClick={() => togglePlayer(player.id)}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(player.id)}
                onChange={() => togglePlayer(player.id)}
                className="w-5 h-5 text-purple-600"
              />
              <div className="flex-1">
                <div className="text-white font-semibold">{player.name}</div>
                <div className="text-gray-400 text-sm">{player.email}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onSelect(Array.from(selectedIds))}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Select {selectedIds.size} Players
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Custom Staff Selection Modal
function CustomStaffModal({ allStaff, selectedStaffIds, onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set(selectedStaffIds));

  const filteredStaff = allStaff.filter(s => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(searchLower) ||
      s.email.toLowerCase().includes(searchLower) ||
      (s.employeeId && s.employeeId.toLowerCase().includes(searchLower)) ||
      (s.role && s.role.toLowerCase().includes(searchLower))
    );
  });

  const toggleStaff = (staffId) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(staffId)) {
      newSet.delete(staffId);
    } else {
      newSet.add(staffId);
    }
    setSelectedIds(newSet);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto border border-slate-700">
        <h3 className="text-2xl font-bold text-white mb-4">Select Staff Members for Custom Group</h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, employee ID, or role..."
          className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
              onClick={() => toggleStaff(staff.id)}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(staff.id)}
                onChange={() => toggleStaff(staff.id)}
                className="w-5 h-5 text-purple-600"
              />
              <div className="flex-1">
                <div className="text-white font-semibold">{staff.name}</div>
                <div className="text-gray-400 text-sm">{staff.email} • {staff.role}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onSelect(Array.from(selectedIds))}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Select {selectedIds.size} Staff Members
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

