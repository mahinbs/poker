import React, { useState, useEffect, useRef } from 'react';
import { chatAPI, staffAPI, authAPI } from '../lib/api';
import { FaUser, FaComments, FaSearch, FaPaperPlane, FaCircle, FaTimes, FaPlus } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

/** India Standard Time (no DST) — deterministic clock from UTC ms; avoids Intl/browser-TZ flicker. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Naive `YYYY-MM-DD hh:mm:ss` / ISO without offset → UTC instant (matches DB UTC wall clock). */
function naiveUtcComponentsToMs(s) {
  const t = String(s).trim();
  if (/[zZ]/.test(t) || /[+-]\d{2}:?\d{2}$/.test(t)) return null;
  const re = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(\.\d+)?/;
  const m = t.match(re);
  if (!m) return null;
  const frac = m[7] ? parseFloat(m[7]) : 0;
  const msInSecond = Math.min(999, Math.round(frac * 1000));
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6], msInSecond);
}

/**
 * Parse any API/socket value to UTC epoch ms.
 * Prefer `createdAtUtcMs` on message rows when present.
 */
function parseChatInstantMs(value) {
  if (value == null || value === '') return Date.now();
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value < 1e12 ? value * 1000 : value;
  }
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isNaN(t) ? Date.now() : t;
  }
  let s = String(value).trim();
  const manual = naiveUtcComponentsToMs(s);
  if (manual != null) return manual;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s) && !/[zZ+]/.test(s) && !/-\d{2}:\d{2}$/.test(s)) {
    s = `${s}Z`;
  } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
    s = `${s.replace(' ', 'T')}Z`;
  }
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? Date.now() : ms;
}

function getChatUtcMs(row) {
  if (row && typeof row.createdAtUtcMs === 'number' && Number.isFinite(row.createdAtUtcMs)) {
    return row.createdAtUtcMs;
  }
  return parseChatInstantMs(row?.createdAt != null ? row.createdAt : row);
}

function toUtcMs(value) {
  return parseChatInstantMs(value);
}

/** Collapse duplicate player rows (same text, same sender type, ~same time) for staff player-chat view. */
function dedupeNearDuplicateChatRowsBySender(list, senderType) {
  const sorted = [...list].sort((a, b) => getChatUtcMs(a) - getChatUtcMs(b));
  const out = [];
  for (const m of sorted) {
    if (m.senderType !== senderType) {
      out.push(m);
      continue;
    }
    const t = getChatUtcMs(m);
    const idx = out.findIndex(
      (o) =>
        o.senderType === senderType &&
        (o.message || '').trim() === (m.message || '').trim() &&
        Math.abs(getChatUtcMs(o) - t) < 120000,
    );
    if (idx < 0) {
      out.push(m);
      continue;
    }
    const o = out[idx];
    const oTemp = String(o.id).startsWith('temp-');
    const mTemp = String(m.id).startsWith('temp-');
    out[idx] = oTemp && !mTemp ? m : mTemp && !oTemp ? o : t >= getChatUtcMs(o) ? m : o;
  }
  return out;
}

/** Calendar date YYYY-MM-DD in IST for the given instant */
function istCalendarKey(ms) {
  const d = new Date(ms + IST_OFFSET_MS);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

/** Whole-day difference in IST between two instants (0 = same IST day). */
function istCalendarDiffDays(msMsg, msNow) {
  const km = istCalendarKey(msMsg);
  const kn = istCalendarKey(msNow);
  if (km === kn) return 0;
  const [ym, mm, dm] = km.split('-').map(Number);
  const [yn, mn, dn] = kn.split('-').map(Number);
  const tm = Date.UTC(ym, mm - 1, dm);
  const tn = Date.UTC(yn, mn - 1, dn);
  return Math.round((tn - tm) / 86400000);
}

/** HH:mm always in IST (fixed offset, no Intl clock). */
function formatIstHm(ms) {
  const d = new Date(ms + IST_OFFSET_MS);
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatIstDateLong(ms) {
  const d = new Date(ms + IST_OFFSET_MS);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = months[d.getUTCMonth()];
  const y = d.getUTCFullYear();
  return `${day} ${mon} ${y}`;
}

/** Always store ISO UTC string */
function coerceCreatedAtToIso(value) {
  try {
    return new Date(parseChatInstantMs(value)).toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

function formatChatListTime(dateValue) {
  if (!dateValue) return '';
  const ms = parseChatInstantMs(dateValue);
  const now = Date.now();
  const diffDays = istCalendarDiffDays(ms, now);

  if (diffDays <= 0) {
    return formatIstHm(ms);
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatIstDateLong(ms);
}

export default function ChatManagement({ clubId, hidePlayerChat = false }) {
  const [activeTab, setActiveTab] = useState('staff');
  const [notification, setNotification] = useState(null);

  // Show notification bubble
  const showNotification = (message, senderName) => {
    setNotification({ message, senderName });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5 seconds
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaComments className="text-4xl" />
            {hidePlayerChat ? 'Staff Chat' : 'Player & Staff Support Chat'}
          </h1>
          <p className="text-white/80 mt-2">
            {hidePlayerChat 
              ? 'Communicate with staff members in real-time'
              : 'Communicate with staff members and respond to player queries in real-time'
            }
          </p>
        </div>

        {/* Tabs */}
        {!hidePlayerChat && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'staff'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                  : 'bg-slate-700 text-white/70 hover:bg-slate-600'
              }`}
            >
              <FaUser />
              Staff Chat
            </button>
            <button
              onClick={() => setActiveTab('player')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'player'
                  ? 'bg-gradient-to-r from-orange-600 to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-slate-700 text-white/70 hover:bg-slate-600'
              }`}
            >
              <FaComments />
              Player Chat
            </button>
          </div>
        )}

        {/* Content */}
        {activeTab === 'staff' && <StaffChatTab clubId={clubId} showNotification={showNotification} />}
        {!hidePlayerChat && activeTab === 'player' && <PlayerChatTab clubId={clubId} />}

        {/* Notification Bubble */}
        {notification && (
          <div className="fixed top-20 right-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-in-right max-w-md">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FaComments className="text-xl" />
              </div>
              <div className="flex-1">
                <div className="font-semibold mb-1">{notification.senderName}</div>
                <div className="text-sm text-white/90 line-clamp-2">{notification.message}</div>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-white/60 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== STAFF CHAT TAB ====================

function StaffChatTab({ clubId, showNotification }) {
  const queryClient = useQueryClient();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const socketRef = useRef(null);

  console.log('StaffChatTab rendered - clubId:', clubId, 'showNewChatModal:', showNewChatModal);

  useEffect(() => {
    loadSessions();
    
    // Set up WebSocket for real-time session updates
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || localStorage.getItem('token') || sessionStorage.getItem('token');
    if (clubId && userId) {
      const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:3333';
      console.log('🔌 Connecting to WebSocket:', `${WEBSOCKET_URL}/realtime`, 'userId:', userId, 'clubId:', clubId);
      const socket = io(`${WEBSOCKET_URL}/realtime`, {
        auth: { clubId, userId, token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: Infinity,
      });

      socket.on('connect', () => {
        console.log('✅ WebSocket connected for staff chat');
        socket.emit('subscribe:club', { clubId, userId });
        socket.emit('subscribe:staff', { staffId: userId, clubId });
      });

      socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
      });

      socket.on('disconnect', (reason) => {
        console.warn('⚠️ WebSocket disconnected:', reason);
      });

      socket.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
      });

      // Listen for new messages to update unread counts and last message
      socket.on('chat:new-message', (data) => {
        // Update the session in the list
        setSessions(prev => prev.map(session => {
          if (session.id === data.sessionId) {
            return {
              ...session,
              lastMessageAt: data.message.createdAt,
              unreadCount: (session.unreadCount || 0) + (selectedSession?.id !== session.id ? 1 : 0)
            };
          }
          return session;
        }));
      });

      // Listen for direct messages (notification bubble)
      socket.on('chat:new-message-direct', (data) => {
        const currentUserId = localStorage.getItem('userId');
        console.log('📨 Received chat:new-message-direct:', {
          recipientStaffUserId: data.recipientStaffUserId,
          currentUserId,
          sessionId: data.sessionId,
          senderName: data.message?.senderName
        });
        // Only show notification if this message is for the current user
        if (data.recipientStaffUserId === currentUserId) {
          console.log('✅ Notification matches current user, showing bubble');
          // Show notification if not currently viewing this chat
          if (!selectedSession || selectedSession.id !== data.sessionId) {
            // Show notification bubble
            if (showNotification) {
              showNotification(data.message.message, data.message.senderName);
            }
          } else {
            console.log('ℹ️ User is viewing this chat, skipping notification');
          }
          // Reload sessions to update unread count
          loadSessions();
        } else {
          console.log('❌ Notification not for current user, ignoring');
        }
      });

      // Listen for new session creation
      socket.on('chat:session-updated', (data) => {
        // Reload sessions to show new chat
        loadSessions();
      });

      socketRef.current = socket;

      return () => {
        if (socket) {
          socket.emit('unsubscribe:club', { clubId });
          socket.disconnect();
        }
      };
    }
  }, [clubId, currentPage, search, role, selectedSession]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const result = await chatAPI.getStaffChatSessions(clubId, {
        page: currentPage,
        limit: 10,
        search,
        role
      });
      setSessions(result.sessions);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading staff chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
      {/* Sessions List */}
      <div className="lg:col-span-1 bg-slate-800 rounded-lg p-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Conversations</h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <FaPlus /> New Chat
          </button>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg"
            />
          </div>

          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="HR">HR</option>
            <option value="GRE">GRE</option>
            <option value="CASHIER">Cashier</option>
            <option value="AFFILIATE">Affiliate</option>
            <option value="FNB">FNB</option>
          </select>
        </div>

        {/* Sessions List */}
        <div 
          className="flex-1 overflow-y-auto space-y-2 min-h-0" 
          style={{ 
            maxHeight: 'calc(100vh - 450px)',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'thin',
            scrollbarColor: '#475569 #1e293b'
          }}
        >
          {loading && sessions.length === 0 ? (
            <div className="text-white/60 text-center py-8">Loading chats...</div>
          ) : sessions.length === 0 ? (
            <div className="text-white/60 text-center py-8">No conversations yet</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setSelectedSession(session);
                  // Clear local unread badge immediately, then sync sidebar unread count.
                  setSessions((prev) =>
                    prev.map((s) => (s.id === session.id ? { ...s, unreadCount: 0 } : s))
                  );
                  queryClient.invalidateQueries({ queryKey: ['unreadChatCounts', clubId] });
                }}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedSession?.id === session.id
                    ? 'bg-blue-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {session.otherStaff?.name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{session.otherStaff?.name}</div>
                      <div className="text-white/60 text-sm">{session.otherStaff?.role}</div>
                    </div>
                  </div>
                  {session.unreadCount > 0 && (
                    <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      {session.unreadCount}
                    </div>
                  )}
                </div>
                {session.subject && (
                  <div className="text-white/70 text-sm mt-1 truncate">{session.subject}</div>
                )}
                <div className="text-white/50 text-xs mt-1">
                  {formatChatListTime(session.lastMessageAt)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-white px-3 py-1 bg-slate-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-white text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-white px-3 py-1 bg-slate-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="lg:col-span-2 flex flex-col min-h-0">
        {selectedSession ? (
          <ChatWindow
            clubId={clubId}
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            onDelete={() => {
              setSelectedSession(null);
              loadSessions();
            }}
            onSessionUpdate={(updatedSession) => {
              // Update the session in the list if it was refreshed
              setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
              setSelectedSession(updatedSession);
            }}
          />
        ) : (
          <div className="bg-slate-800 rounded-lg p-8 h-full flex items-center justify-center">
            <div className="text-center text-white/60">
              <FaComments className="text-6xl mx-auto mb-4 opacity-50" />
              <p className="text-xl">Select a staff chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewStaffChatModal
          clubId={clubId}
          existingSessions={sessions}
          onClose={() => setShowNewChatModal(false)}
          onSuccess={async (session) => {
            setShowNewChatModal(false);
            // Reload sessions to get properly formatted session with otherStaff
            await loadSessions();
            // Wait a bit for state to update, then find and select the session
            setTimeout(() => {
              // Use a callback to access the latest sessions state
              setSessions(currentSessions => {
                const foundSession = currentSessions.find(s => s.id === session?.id);
                if (foundSession) {
                  setSelectedSession(foundSession);
                } else {
                  // Fallback: use the session as-is, but try to populate otherStaff
                  const currentUser = authAPI.getCurrentUser();
                  const currentUserEmail = currentUser?.email?.toLowerCase();
                  let otherStaff = null;
                  
                  if (session.staffInitiator && session.staffRecipient) {
                    const initiatorEmail = session.staffInitiator.email?.toLowerCase();
                    if (currentUserEmail === initiatorEmail) {
                      otherStaff = session.staffRecipient;
                    } else {
                      otherStaff = session.staffInitiator;
                    }
                  }
                  
                  setSelectedSession({
                    ...session,
                    otherStaff: otherStaff || session.staffRecipient || session.staffInitiator
                  });
                }
                return currentSessions;
              });
            }, 200);
          }}
        />
      )}
    </div>
  );
}

// ==================== PLAYER CHAT TAB ====================

function PlayerChatTab({ clubId }) {
  const queryClient = useQueryClient();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadSessions();

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!clubId || !userId) return;

    const WEBSOCKET_URL =
      process.env.REACT_APP_WEBSOCKET_URL ||
      process.env.REACT_APP_API_BASE_URL?.replace('/api', '') ||
      'http://localhost:3333';

    const socket = io(`${WEBSOCKET_URL}/realtime`, {
      auth: { clubId, userId, token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      socket.emit('subscribe:club', { clubId, userId });
      socket.emit('subscribe:staff', { staffId: userId, clubId });
    });

    socket.on('chat:new-message', () => {
      loadSessions();
      queryClient.invalidateQueries({ queryKey: ['unreadChatCounts', clubId] });
    });

    socket.on('chat:session-updated', () => {
      loadSessions();
      queryClient.invalidateQueries({ queryKey: ['unreadChatCounts', clubId] });
    });

    return () => {
      socket.emit('unsubscribe:club', { clubId });
      socket.disconnect();
    };
  }, [clubId, currentPage, search, status]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const result = await chatAPI.getPlayerChatSessions(clubId, {
        page: currentPage,
        limit: 10,
        search,
        status
      });
      setSessions(result.sessions);
      setTotalPages(result.totalPages);
      setSelectedSession((prev) => {
        if (!prev) return prev;
        const match = result.sessions.find((s) => s.id === prev.id);
        return match ? { ...prev, ...match } : prev;
      });
    } catch (error) {
      console.error('Error loading player chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (sessionId, newStatus) => {
    try {
      await chatAPI.updateChatSession(clubId, sessionId, { status: newStatus });
      loadSessions();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
      {/* Sessions List */}
      <div className="lg:col-span-1 bg-slate-800 rounded-lg p-4 overflow-hidden flex flex-col">
        <h2 className="text-xl font-semibold text-white mb-4">Player Support Tickets</h2>

        {/* Search & Filter */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Sessions List */}
        <div 
          className="flex-1 overflow-y-auto space-y-2 min-h-0" 
          style={{ 
            maxHeight: 'calc(100vh - 450px)',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'thin',
            scrollbarColor: '#475569 #1e293b'
          }}
        >
          {loading && sessions.length === 0 ? (
            <div className="text-white/60 text-center py-8">Loading tickets...</div>
          ) : sessions.length === 0 ? (
            <div className="text-white/60 text-center py-8">No support tickets yet</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setSelectedSession(session);
                  setSessions((prev) =>
                    prev.map((s) => (s.id === session.id ? { ...s, unreadCount: 0 } : s))
                  );
                  queryClient.invalidateQueries({ queryKey: ['unreadChatCounts', clubId] });
                }}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedSession?.id === session.id
                    ? 'bg-orange-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {session.player?.name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{session.player?.name}</div>
                      <div className="text-white/60 text-sm flex items-center gap-2">
                        <StatusBadge status={session.status} />
                      </div>
                    </div>
                  </div>
                  {session.unreadCount > 0 && (
                    <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      {session.unreadCount}
                    </div>
                  )}
                </div>
                <div className="text-white/80 text-sm mt-1 font-medium">{session.subject}</div>
                {session.lastMessage && (
                  <div className="text-white/60 text-xs mt-1 truncate">{session.lastMessage}</div>
                )}
                <div className="text-white/50 text-xs mt-1">
                  {formatChatListTime(session.lastMessageAt)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-white px-3 py-1 bg-slate-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-white text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-white px-3 py-1 bg-slate-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="lg:col-span-2 flex flex-col min-h-0">
        {selectedSession ? (
          <ChatWindow
            clubId={clubId}
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            isPlayerChat
            onStatusChange={(newStatus) => handleStatusChange(selectedSession.id, newStatus)}
            onSessionUpdate={(updatedSession) => {
              setSessions((prev) =>
                prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)),
              );
              setSelectedSession(updatedSession);
            }}
          />
        ) : (
          <div className="bg-slate-800 rounded-lg p-8 h-full flex items-center justify-center">
            <div className="text-center text-white/60">
              <FaComments className="text-6xl mx-auto mb-4 opacity-50" />
              <p className="text-xl">Select a player chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== CHAT WINDOW ====================

function ChatWindow({ clubId, session, onClose, isPlayerChat, onStatusChange, onDelete, onSessionUpdate }) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const getCurrentUserInfo = () => {
    const currentUser = authAPI.getCurrentUser();
    return {
      id: localStorage.getItem('userId') || currentUser?.id || '',
      email: currentUser?.email?.toLowerCase?.() || '',
      name:
        currentUser?.name ||
        currentUser?.displayName ||
        (currentUser?.email ? currentUser.email.split('@')[0] : 'You'),
    };
  };

  const refreshSession = async () => {
    if (!session?.id) return;
    if (isPlayerChat) {
      try {
        const result = await chatAPI.getPlayerChatSessions(clubId, {
          page: 1,
          limit: 100,
          search: '',
          status: '',
        });
        const updatedSession = result.sessions?.find((s) => s.id === session.id);
        if (updatedSession && onSessionUpdate) {
          onSessionUpdate(updatedSession);
        }
      } catch (error) {
        console.error('Error refreshing player chat session:', error);
      }
      return;
    }
    try {
      const result = await chatAPI.getStaffChatSessions(clubId, { page: 1, limit: 100 });
      const updatedSession = result.sessions?.find(s => s.id === session.id);
      if (updatedSession && updatedSession.otherStaff && onSessionUpdate) {
        onSessionUpdate(updatedSession);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  useEffect(() => {
    loadMessages();
    // Refresh session data to ensure otherStaff is populated
    if (!isPlayerChat && session && (!session.otherStaff || !session.otherStaff.name)) {
      refreshSession();
    }
    // Set up WebSocket for real-time updates
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || localStorage.getItem('token') || sessionStorage.getItem('token');
    if (clubId && userId) {
      const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:3333';
      const socket = io(`${WEBSOCKET_URL}/realtime`, {
        auth: { clubId, userId, token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: Infinity,
      });

      socket.on('connect', () => {
        socket.emit('subscribe:club', { clubId, userId });
        // Subscribe to staff-specific events for direct notifications
        socket.emit('subscribe:staff', { staffId: userId, clubId });
      });

      let profileStaffId = null;
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        profileStaffId = u.staffId || null;
      } catch (e) {
        profileStaffId = null;
      }

      const isOwnStaffSocketEcho = (raw) => {
        if (!raw || raw.senderType !== 'staff') return false;
        const senderUid = raw.senderStaffUserId || raw.senderStaff?.userId;
        const senderSid = raw.senderStaffId || raw.senderStaff?.id;
        if (userId && senderUid && String(senderUid) === String(userId)) return true;
        if (profileStaffId && senderSid && String(senderSid) === String(profileStaffId)) return true;
        return false;
      };

      // Listen for new chat messages (general updates)
      socket.on('chat:new-message', (data) => {
        if (data.sessionId === session.id) {
          if (isOwnStaffSocketEcho(data.message)) {
            return;
          }
          setMessages((prev) => {
            const normalized = normalizeIncomingMessage(data.message);
            const exists = prev.some((m) => m.id === normalized.id);
            if (exists) return prev;
            const next = [...prev, normalized].sort((a, b) => getChatUtcMs(a) - getChatUtcMs(b));
            return isPlayerChat ? dedupeNearDuplicateChatRowsBySender(next, 'player') : next;
          });
        }
      });

      // Listen for direct messages (targeted to this specific staff member)
      socket.on('chat:new-message-direct', (data) => {
        if (data.sessionId === session.id) {
          if (isOwnStaffSocketEcho(data.message)) {
            return;
          }
          setMessages((prev) => {
            const normalized = normalizeIncomingMessage(data.message);
            const exists = prev.some((m) => m.id === normalized.id);
            if (exists) return prev;
            const next = [...prev, normalized].sort((a, b) => getChatUtcMs(a) - getChatUtcMs(b));
            return isPlayerChat ? dedupeNearDuplicateChatRowsBySender(next, 'player') : next;
          });
        }
      });

      // Listen for session updates
      socket.on('chat:session-updated', (data) => {
        if (data.session?.id === session.id) {
          // Refresh session data
          refreshSession();
        }
      });

      socketRef.current = socket;

      return () => {
        if (socket) {
          socket.emit('unsubscribe:club', { clubId });
          socket.disconnect();
        }
      };
    }
  }, [session.id, clubId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const result = await chatAPI.getSessionMessages(clubId, session.id);
      const serverMessages = (result.messages || []).map((m) => normalizeIncomingMessage(m));
      // Keep unsent optimistic messages so they don't blink/disappear during polling.
      setMessages((prev) => {
        const optimistic = prev.filter((m) => String(m.id).startsWith('temp-'));
        const merged = [...serverMessages];
        optimistic.forEach((tempMsg) => {
          const matched = serverMessages.some(
            (m) =>
              m.message === tempMsg.message &&
              m.senderName === tempMsg.senderName &&
              m.senderType === tempMsg.senderType &&
              Math.abs(getChatUtcMs(m) - getChatUtcMs(tempMsg)) < 20000
          );
          if (!matched) merged.push(tempMsg);
        });
        merged.sort((a, b) => getChatUtcMs(a) - getChatUtcMs(b));
        const seen = new Set();
        let next = merged.filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        if (isPlayerChat) {
          next = dedupeNearDuplicateChatRowsBySender(next, 'player');
        }
        return next;
      });
      // Opening a session marks messages read on backend; force sidebar unread badge refresh immediately.
      queryClient.invalidateQueries({ queryKey: ['unreadChatCounts', clubId] });
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMessageTime = (messageOrDate) => {
    const ms =
      messageOrDate &&
      typeof messageOrDate === 'object' &&
      !Array.isArray(messageOrDate) &&
      'createdAt' in messageOrDate
        ? getChatUtcMs(messageOrDate)
        : parseChatInstantMs(messageOrDate);
    const now = Date.now();
    const diffDays = istCalendarDiffDays(ms, now);

    if (diffDays <= 0) {
      return formatIstHm(ms);
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatIstDateLong(ms);
  };

  const normalizeIncomingMessage = (incoming, fallbackText = '', fallbackCreatedAt) => {
    const currentUser = getCurrentUserInfo();
    const createdAt = coerceCreatedAtToIso(
      incoming?.createdAt ?? fallbackCreatedAt ?? new Date(),
    );
    const createdAtUtcMs =
      typeof incoming?.createdAtUtcMs === 'number' && Number.isFinite(incoming.createdAtUtcMs)
        ? incoming.createdAtUtcMs
        : parseChatInstantMs(createdAt);
    return {
      ...incoming,
      id: incoming?.id || `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      message: incoming?.message ?? fallbackText,
      senderType: incoming?.senderType || 'staff',
      senderName: incoming?.senderName || currentUser.name,
      createdAt,
      createdAtUtcMs,
      senderStaff: incoming?.senderStaff || {
        id: incoming?.senderStaffId,
        userId: incoming?.senderStaffUserId || currentUser.id,
        email: incoming?.senderStaffEmail || currentUser.email,
        name: incoming?.senderName || currentUser.name,
      },
      senderStaffId: incoming?.senderStaffId || incoming?.senderStaff?.id,
      isRead: typeof incoming?.isRead === 'boolean' ? incoming.isRead : true,
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    const text = newMessage.trim();
    const now = new Date().toISOString();
    const currentUser = getCurrentUserInfo();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      setSending(true);
      setNewMessage('');

      // Optimistic append for instant WhatsApp-like UX.
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          message: text,
          senderType: 'staff',
          senderName: currentUser.name,
          senderStaff: { userId: currentUser.id, email: currentUser.email, name: currentUser.name },
          createdAt: now,
          createdAtUtcMs: Date.parse(now),
          isRead: true,
          _optimistic: true,
        },
      ]);

      const response = await chatAPI.sendMessage(clubId, session.id, text);
      const serverMessage = normalizeIncomingMessage(response?.message || response, text, now);

      setMessages((prev) => {
        const alreadyHasServer = prev.some((m) => m.id === serverMessage.id);
        let next;
        if (alreadyHasServer) {
          next = prev.filter((m) => m.id !== tempId);
        } else {
          next = prev.map((m) => (m.id === tempId ? serverMessage : m));
        }
        const seen = new Set();
        return next.filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
      });
    } catch (error) {
      // Remove optimistic message if send fails.
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(text);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this chat? It will only be removed from your side.')) {
      return;
    }

    try {
      setDeleting(true);
      await chatAPI.archiveChatSession(clubId, session.id);
      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (error) {
      alert('Failed to delete chat: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  const getDisplayName = () => {
    if (isPlayerChat) {
      return session.player?.name || 'Player';
    } else {
      // Try otherStaff first
      if (session.otherStaff?.name) {
        return session.otherStaff.name;
      }
      
      // Fallback: determine which staff is the "other" one based on current user
      const currentUser = authAPI.getCurrentUser();
      const currentUserId = currentUser?.id;
      const currentUserEmail = currentUser?.email?.toLowerCase();
      
      if (session.staffInitiator && session.staffRecipient) {
        // Try to match by ID first (more reliable)
        const initiatorId = session.staffInitiator.id;
        const recipientId = session.staffRecipient.id;
        
        if (currentUserId === initiatorId) {
          return session.staffRecipient.name || session.staffRecipient.email?.split('@')[0] || 'Staff Member';
        } else if (currentUserId === recipientId) {
          return session.staffInitiator.name || session.staffInitiator.email?.split('@')[0] || 'Staff Member';
        }
        
        // Fallback to email matching
        const initiatorEmail = session.staffInitiator.email?.toLowerCase();
        const recipientEmail = session.staffRecipient.email?.toLowerCase();
        
        if (currentUserEmail && initiatorEmail === currentUserEmail) {
          return session.staffRecipient.name || session.staffRecipient.email?.split('@')[0] || 'Staff Member';
        } else if (currentUserEmail && recipientEmail === currentUserEmail) {
          return session.staffInitiator.name || session.staffInitiator.email?.split('@')[0] || 'Staff Member';
        }
        
        // If we can't determine, show the recipient (most common case)
        return session.staffRecipient.name || session.staffRecipient.email?.split('@')[0] || 
               session.staffInitiator.name || session.staffInitiator.email?.split('@')[0] || 'Staff Member';
      }
      
      // Last resort fallbacks
      if (session.staffRecipient?.name) return session.staffRecipient.name;
      if (session.staffInitiator?.name) return session.staffInitiator.name;
      if (session.staffRecipient?.email) return session.staffRecipient.email.split('@')[0];
      if (session.staffInitiator?.email) return session.staffInitiator.email.split('@')[0];
      
      return 'Staff Member';
    }
  };

  const playerChatLocked =
    isPlayerChat && (session.status === 'closed' || session.status === 'resolved');

  return (
    <div className="bg-slate-800 rounded-lg flex flex-col h-full min-h-0 max-h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${
              isPlayerChat ? 'from-orange-500 to-pink-500' : 'from-blue-500 to-purple-500'
            } rounded-full flex items-center justify-center text-white font-bold`}>
              {getDisplayName()[0]}
            </div>
            <div>
              <div className="text-white font-semibold">{getDisplayName()}</div>
              {isPlayerChat && session.subject && (
                <div className="text-white/60 text-sm">{session.subject}</div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isPlayerChat && (
            <select
              value={session.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3 py-1 bg-slate-700 text-white rounded-lg text-sm"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          )}
          {!isPlayerChat && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm disabled:opacity-50"
              title="Delete chat (only from your side)"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 flex-shrink" 
        style={{ 
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: '#475569 #1e293b'
        }}
      >
        {loading && messages.length === 0 ? (
          <div className="text-white/60 text-center py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-white/60 text-center py-8">No messages yet. Start the conversation!</div>
        ) : (
          (() => {
            // Calculate current user info ONCE outside the map to avoid re-renders causing position changes
            const currentUser = authAPI.getCurrentUser();
            const currentUserEmail = currentUser?.email?.toLowerCase();
            const currentUserId = localStorage.getItem('userId');
            const currentUserName = currentUser?.name?.toLowerCase?.() || currentUser?.displayName?.toLowerCase?.();
            const otherStaffId = session?.otherStaff?.id;
            const initiator = session?.staffInitiator;
            const recipient = session?.staffRecipient;
            const currentStaffId =
              (initiator && ((initiator.userId && initiator.userId === currentUserId) || (initiator.email && initiator.email.toLowerCase() === currentUserEmail)) && initiator.id) ||
              (recipient && ((recipient.userId && recipient.userId === currentUserId) || (recipient.email && recipient.email.toLowerCase() === currentUserEmail)) && recipient.id) ||
              null;
            
            return messages.map((message) => {
            // For player chat: player messages on left (green), staff messages on right (blue)
            // For staff chat: own messages on right (blue), other's on left (green)
            let isOwn = false;
            
            if (isPlayerChat) {
              // Player chat: staff messages are "own" (right side, blue)
              isOwn = message.senderType === 'staff';
            } else {
              // Staff chat: check if message is from current user.
              // Handle both full payloads (senderStaff object) and realtime compact payloads (senderStaffId only).
              const messageSenderStaffId = message.senderStaff?.id || message.senderStaffId;
              const messageSenderUserId = message.senderStaff?.userId;
              const senderEmail = message.senderStaff?.email?.toLowerCase();
              const senderName = message.senderName?.toLowerCase?.();
                
                isOwn = (currentUserId && messageSenderUserId === currentUserId) || 
                        (currentUserEmail && senderEmail === currentUserEmail) ||
                        // Strong match by staff ID if we can resolve current user's staff row in this session.
                        (currentStaffId && messageSenderStaffId && messageSenderStaffId === currentStaffId) ||
                        // For compact realtime payload, infer ownership by comparing sender staff ID with the "other staff" in this session.
                        // In a 1:1 staff chat, if sender is NOT other staff, it must be current user.
                        (messageSenderStaffId && otherStaffId && messageSenderStaffId !== otherStaffId) ||
                        // Last-resort fallback to sender name for immediate paint stability.
                        (!!currentUserName && !!senderName && senderName === currentUserName);
            }
            
            return (
              <div key={message.id} className="flex w-full min-w-0">
                <div
                  className={`flex min-w-0 max-w-[min(100%,22rem)] shrink-0 flex-col gap-1 ${
                    isOwn ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`text-white/80 text-xs px-0.5 ${isOwn ? 'text-right' : 'text-left'}`}
                  >
                    {message.senderName}
                    {isPlayerChat && message.senderType === 'staff' && message.senderStaff?.role && (
                      <span className="text-white/60 ml-1">({message.senderStaff.role})</span>
                    )}
                  </div>
                  <div
                    className={`w-full min-w-0 overflow-visible rounded-lg px-3 pt-2.5 pb-2 ${
                      isOwn ? 'bg-blue-600' : 'bg-green-600'
                    }`}
                  >
                    <div className="text-white whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                      {message.message}
                    </div>
                    <div className="text-white/50 text-xs mt-1.5 pb-0.5 tabular-nums leading-normal">
                      {formatMessageTime(message)}
                    </div>
                  </div>
                </div>
              </div>
            );
            });
          })()
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700 flex-shrink-0">
        {playerChatLocked && (
          <p className="mb-2 text-xs text-amber-200/90">
            This ticket is {session.status === 'closed' ? 'closed' : 'resolved'} reopen the status above to send messages.
          </p>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              playerChatLocked
                ? 'Change status to send messages…'
                : 'Type your message...'
            }
            className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg"
            disabled={sending || playerChatLocked}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || playerChatLocked}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            <FaPaperPlane />
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ==================== NEW STAFF CHAT MODAL ====================

function NewStaffChatModal({ clubId, existingSessions = [], onClose, onSuccess }) {
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (clubId) {
      loadStaffMembers();
    }
  }, [clubId]);

  const loadStaffMembers = async () => {
    try {
      setLoading(true);
      
      // Use the unified chatable users endpoint with excludeExisting=true
      // This will filter out staff members who already have active (non-archived) chats
      const result = await chatAPI.getChatableUsers(clubId, true); // true = excludeExisting
      const usersList = result?.users || result || [];
      
      // Filter to only show active users
      const activeUsers = Array.isArray(usersList)
        ? usersList.filter(u => u.status === 'Active' || !u.status || u.status === 'active')
        : [];
      
      // Remove duplicates by email (since same user might appear as staff and user)
      const uniqueUsers = [];
      const seenEmails = new Set();
      
      activeUsers.forEach(user => {
        const email = user.email?.toLowerCase();
        if (email && !seenEmails.has(email)) {
            seenEmails.add(email);
            
            // Get actual role name (not "Super Admin/Admin" label)
            let roleDisplay = user.role || user.customRoleName || 'Staff';
            // If it's a role enum value, convert to readable format
            if (roleDisplay === 'SUPER_ADMIN') roleDisplay = 'Super Admin';
            else if (roleDisplay === 'ADMIN') roleDisplay = 'Admin';
            else if (roleDisplay === 'MANAGER') roleDisplay = 'Manager';
            else if (roleDisplay === 'HR') roleDisplay = 'HR';
            else if (roleDisplay === 'GRE') roleDisplay = 'GRE';
            else if (roleDisplay === 'CASHIER') roleDisplay = 'Cashier';
            else if (roleDisplay === 'FNB') roleDisplay = 'FNB';
            else if (roleDisplay === 'STAFF') roleDisplay = 'Staff';
            else if (roleDisplay === 'DEALER') roleDisplay = 'Dealer';
            else if (roleDisplay === 'AFFILIATE') roleDisplay = 'Affiliate';
            
            uniqueUsers.push({
              ...user,
            chatId: user.chatId || user.id,
              name: user.name || user.displayName || user.email,
              role: roleDisplay
            });
        }
      });
      
      setStaffMembers(uniqueUsers);
    } catch (error) {
      console.error('Error loading staff members:', error);
      alert('Failed to load staff members: ' + (error.message || 'Unknown error'));
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      alert('Please select a staff member');
      return;
    }

    try {
      setCreating(true);
      const result = await chatAPI.createStaffChatSession(clubId, selectedStaff, subject || undefined);
      onSuccess(result.session);
    } catch (error) {
      alert('Failed to create chat session');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">Start New Chat</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Select Staff Member *</label>
            {loading ? (
              <div className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg text-center">
                Loading staff members...
              </div>
            ) : (
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
                disabled={loading || staffMembers.length === 0}
              >
              <option value="">
                {staffMembers.length === 0 ? 'No staff members available' : 'Choose staff member...'}
              </option>
              {staffMembers.map((member) => (
                <option key={member.chatId || member.id} value={member.chatId || member.id}>
                  {member.name || member.displayName} - {member.role}
                </option>
              ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-white mb-2">Subject (Optional)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is this chat about?"
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating || !selectedStaff}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Start Chat'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function StatusBadge({ status }) {
  const colors = {
    open: 'bg-yellow-600',
    in_progress: 'bg-blue-600',
    resolved: 'bg-green-600',
    closed: 'bg-gray-600'
  };

  const labels = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed'
  };

  return (
    <span className={`${colors[status] || 'bg-gray-600'} text-white text-xs px-2 py-1 rounded-full`}>
      {labels[status] || status}
    </span>
  );
}

