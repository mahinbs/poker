import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminAPI } from "../lib/api";
import toast from "react-hot-toast";
import { formatDateReadableIST, formatDateIST } from "../utils/dateUtils";

export default function NotificationsInbox({ selectedClubId, recipientType = "staff" }) {
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notificationInbox", selectedClubId, recipientType],
    queryFn: () => superAdminAPI.getNotificationInbox(selectedClubId, recipientType),
    enabled: !!selectedClubId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notifications = notificationsData?.notifications || [];
  const total = notificationsData?.total || 0;

  // Sort notifications: unread on top, then by date
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1; // Unread first
    }
    return new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt);
  });

  // Pagination
  const totalPages = Math.ceil(sortedNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = sortedNotifications.slice(startIndex, startIndex + itemsPerPage);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) =>
      superAdminAPI.markNotificationAsRead(selectedClubId, notificationId, recipientType),
    onSuccess: () => {
      queryClient.invalidateQueries(["notificationInbox", selectedClubId, recipientType]);
      queryClient.invalidateQueries(["unreadNotificationCount", selectedClubId, recipientType]);
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => superAdminAPI.markAllNotificationsAsRead(selectedClubId, recipientType),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries(["notificationInbox", selectedClubId, recipientType]);
      queryClient.invalidateQueries(["unreadNotificationCount", selectedClubId, recipientType]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark all as read");
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => superAdminAPI.deletePushNotification(selectedClubId, notificationId),
    onSuccess: () => {
      toast.success("Notification deleted");
      setSelectedNotification(null);
      queryClient.invalidateQueries(["notificationInbox", selectedClubId, recipientType]);
      queryClient.invalidateQueries(["unreadNotificationCount", selectedClubId, recipientType]);
      queryClient.invalidateQueries(["pushNotifications", selectedClubId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete notification");
    },
  });

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleDelete = (notification) => {
    if (notification.isRead && window.confirm(`Delete "${notification.title}"?`)) {
      deleteNotificationMutation.mutate(notification.id);
    } else if (!notification.isRead) {
      toast.error("Please read the notification before deleting");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">📬 Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread • ` : ""}
            {sortedNotifications.length} total
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Loading notifications...</div>
      ) : sortedNotifications.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-400 text-lg">No notifications yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                notification.isRead
                  ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                  : "bg-blue-900/20 border-blue-600 hover:border-blue-500"
              }`}
            >
              <div className="flex items-start gap-3">
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{notification.title}</h3>
                  {notification.details && (
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                      {notification.details}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>
                      {new Date(notification.sentAt || notification.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Kolkata",
                        }
                      )}
                    </span>
                    {notification.isRead && notification.readAt && (
                      <span className="text-green-400">
                        ✓ Read on{" "}
                        {formatDateReadableIST(notification.readAt)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notification);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    View
                  </button>
                  {notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification);
                      }}
                      disabled={deleteNotificationMutation.isPending}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedNotification.title}</h2>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {selectedNotification.details && (
              <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                {selectedNotification.details}
              </p>
            )}

            {selectedNotification.imageUrl && (
              <img
                src={selectedNotification.imageUrl}
                alt={selectedNotification.title}
                className="w-full rounded-lg mb-4"
              />
            )}

            {selectedNotification.videoUrl && (
              <video
                src={selectedNotification.videoUrl}
                controls
                className="w-full rounded-lg mb-4"
              />
            )}

            <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-slate-700">
              <span>
                Sent on{" "}
                {new Date(
                  selectedNotification.sentAt || selectedNotification.createdAt
                ).toLocaleDateString("en-IN", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                })}
              </span>
              {selectedNotification.isRead && selectedNotification.readAt && (
                <span className="text-green-400">
                  ✓ Read on{" "}
                  {formatDateIST(selectedNotification.readAt)}
                </span>
              )}
            </div>

            {/* Delete Button */}
            {selectedNotification.isRead && (
              <button
                onClick={() => handleDelete(selectedNotification)}
                disabled={deleteNotificationMutation.isPending}
                className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {deleteNotificationMutation.isPending ? "Deleting..." : "Delete Notification"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

