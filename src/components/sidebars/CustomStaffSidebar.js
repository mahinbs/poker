import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { clubsAPI, superAdminAPI, chatAPI, leaveAPI } from "../../lib/api";
import toast from "react-hot-toast";

export default function CustomStaffSidebar({
  activeItem,
  setActiveItem,
  menuItems = [],
  onSignOut = null,
  customRoleName = "Staff"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Track previous notification count for sound alert
  const prevNotificationCount = useRef(null);
  // Track previous approved leave count for sound alert
  const prevApprovedLeaveCount = useRef(null);
  // Track previous chat counts for sound alerts
  const prevStaffChatCount = useRef(null);
  const prevPlayerChatCount = useRef(null);

  // Get clubId and fetch unread notification count
  const clubId = localStorage.getItem('clubId');
  const { data: unreadData } = useQuery({
    queryKey: ["unreadNotificationCount", clubId, "staff"],
    queryFn: () => superAdminAPI.getUnreadNotificationCount(clubId, "staff"),
    enabled: !!clubId,
    refetchInterval: 30000,
  });

  // Fetch my approved leave applications (to detect when a leave gets approved)
  const { data: approvedLeavesData } = useQuery({
    queryKey: ["myApprovedLeaves", clubId],
    queryFn: () => leaveAPI.getMyLeaveApplications(clubId, { status: 'Approved' }),
    enabled: !!clubId,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
  const approvedLeaveCount = approvedLeavesData?.total || 0;

  // Fetch unread chat counts
  const { data: unreadChatData } = useQuery({
    queryKey: ["unreadChatCounts", clubId],
    queryFn: () => chatAPI.getUnreadCounts(clubId),
    enabled: !!clubId,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  const totalUnreadChats = (unreadChatData?.staffChats || 0) + (unreadChatData?.playerChats || 0);

  // Play notification sound when new notification arrives
  useEffect(() => {
    const currentCount = unreadData?.unreadCount || 0;

    // Only play sound if count increased (new notification)
    if (prevNotificationCount.current !== null && currentCount > prevNotificationCount.current) {
      const audio = new Audio('/audio/popup-alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }

    // Update previous count
    prevNotificationCount.current = currentCount;
  }, [unreadData?.unreadCount]);

  // Play sound when a leave request gets approved
  useEffect(() => {
    if (prevApprovedLeaveCount.current !== null && approvedLeaveCount > prevApprovedLeaveCount.current) {
      const audio = new Audio('/audio/popup-alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
      toast.success('🎉 Your leave request has been approved!', { duration: 5000 });
    }
    prevApprovedLeaveCount.current = approvedLeaveCount;
  }, [approvedLeaveCount]);

  // Play sound when a new staff chat message arrives
  useEffect(() => {
    const staffChats = unreadChatData?.staffChats || 0;
    if (prevStaffChatCount.current !== null && staffChats > prevStaffChatCount.current) {
      const audio = new Audio('/audio/popup-alert.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }
    prevStaffChatCount.current = staffChats;
  }, [unreadChatData?.staffChats]);

  // Play different sound when a new player chat message arrives
  useEffect(() => {
    const playerChats = unreadChatData?.playerChats || 0;
    if (prevPlayerChatCount.current !== null && playerChats > prevPlayerChatCount.current) {
      const audio = new Audio('/audio/notification-alert-2.wav');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }
    prevPlayerChatCount.current = playerChats;
  }, [unreadChatData?.playerChats]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && isMobile) {
      const handleClickOutside = (e) => {
        if (!e.target.closest(".sidebar-container") && !e.target.closest(".sidebar-toggle")) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, isMobile]);

  // Fetch club info to get club code
  const { data: club } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => clubsAPI.getClub(clubId),
    enabled: !!clubId,
  });

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user.email || '';
  const displayName = user.displayName || 'Staff Member';

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800 p-2 rounded-lg text-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar-container fixed h-screen overflow-y-auto lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              {customRoleName}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Staff Portal</p>
          </div>

          {/* User Info - Clickable */}
          <div className="p-4 border-b border-slate-700">
            <div className="bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-700 transition-colors">
              <p className="text-white font-semibold truncate">{displayName}</p>
              <p className="text-gray-400 text-sm truncate">{userEmail}</p>
            </div>

            {/* Club Code */}
            {club && (
              <div className="mt-4 bg-green-900/30 border border-green-500/50 rounded-lg p-3">
                <p className="text-green-400 text-xs font-semibold mb-1">Club Code</p>
                <p className="text-green-300 text-lg font-bold">{club.code || 'N/A'}</p>
                <p className="text-green-400/70 text-xs mt-1">Players use this to sign up</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item}>
                  <button
                    onClick={() => {
                      setActiveItem(item);
                      if (isMobile) setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeItem === item
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-slate-700"
                      }`}
                  >
                    <span className="flex items-center justify-between w-full">
                      <span>{item}</span>
                      {item === "Notifications" && unreadData?.unreadCount > 0 && (
                        <span className="ml-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse flex-shrink-0">
                          {unreadData.unreadCount > 9 ? "9+" : unreadData.unreadCount}
                        </span>
                      )}
                      {item === "Chat" && totalUnreadChats > 0 && (
                        <span className="ml-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse flex-shrink-0">
                          {totalUnreadChats > 9 ? "9+" : totalUnreadChats}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sign Out Button */}
          {onSignOut && (
            <div className="p-4 border-t border-slate-700">
              <button
                onClick={onSignOut}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}


