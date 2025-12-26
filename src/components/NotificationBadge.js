import React from "react";
import { useQuery } from "@tanstack/react-query";
import { superAdminAPI } from "../lib/api";

export default function NotificationBadge({ selectedClubId, recipientType = "staff", onClick }) {
  // Fetch unread count
  const { data: countData } = useQuery({
    queryKey: ["unreadNotificationCount", selectedClubId, recipientType],
    queryFn: () => superAdminAPI.getUnreadNotificationCount(selectedClubId, recipientType),
    enabled: !!selectedClubId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = countData?.unreadCount || 0;

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors"
      title="Notifications"
    >
      <svg
        className="w-6 h-6 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}

