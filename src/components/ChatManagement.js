import React, { useState, useEffect, useRef } from 'react';
import { chatAPI, superAdminAPI } from '../lib/api';
import { FaUser, FaComments, FaSearch, FaPaperPlane, FaCircle, FaTimes, FaPlus } from 'react-icons/fa';

export default function ChatManagement({ clubId, hidePlayerChat = false }) {
  const [activeTab, setActiveTab] = useState('staff');

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
        {activeTab === 'staff' && <StaffChatTab clubId={clubId} />}
        {!hidePlayerChat && activeTab === 'player' && <PlayerChatTab clubId={clubId} />}
      </div>
    </div>
  );
}

// ==================== STAFF CHAT TAB ====================

function StaffChatTab({ clubId }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 5000); // Refresh every 5 seconds for real-time
    return () => clearInterval(interval);
  }, [clubId, currentPage, search, role]);

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
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading && sessions.length === 0 ? (
            <div className="text-white/60 text-center py-8">Loading chats...</div>
          ) : sessions.length === 0 ? (
            <div className="text-white/60 text-center py-8">No conversations yet</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
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
      <div className="lg:col-span-2">
        {selectedSession ? (
          <ChatWindow
            clubId={clubId}
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
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
          onClose={() => setShowNewChatModal(false)}
          onSuccess={(session) => {
            setShowNewChatModal(false);
            setSelectedSession(session);
            loadSessions();
          }}
        />
      )}
    </div>
  );
}

// ==================== PLAYER CHAT TAB ====================

function PlayerChatTab({ clubId }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 5000); // Refresh every 5 seconds for real-time
    return () => clearInterval(interval);
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
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading && sessions.length === 0 ? (
            <div className="text-white/60 text-center py-8">Loading tickets...</div>
          ) : sessions.length === 0 ? (
            <div className="text-white/60 text-center py-8">No support tickets yet</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
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
      <div className="lg:col-span-2">
        {selectedSession ? (
          <ChatWindow
            clubId={clubId}
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            isPlayerChat
            onStatusChange={(newStatus) => handleStatusChange(selectedSession.id, newStatus)}
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

function ChatWindow({ clubId, session, onClose, isPlayerChat, onStatusChange }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Refresh every 3 seconds for real-time
    return () => clearInterval(interval);
  }, [session.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const result = await chatAPI.getSessionMessages(clubId, session.id);
      setMessages(result.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await chatAPI.sendMessage(clubId, session.id, newMessage.trim());
      setNewMessage('');
      loadMessages();
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getDisplayName = () => {
    if (isPlayerChat) {
      return session.player?.name || 'Player';
    } else {
      return session.otherStaff?.name || 'Staff Member';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
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
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="text-white/60 text-center py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-white/60 text-center py-8">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderType === 'staff';
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'bg-blue-600' : 'bg-slate-700'} rounded-lg p-3`}>
                  <div className="text-white/80 text-xs mb-1">{message.senderName}</div>
                  <div className="text-white">{message.message}</div>
                  <div className="text-white/50 text-xs mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
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

function NewStaffChatModal({ clubId, onClose, onSuccess }) {
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadStaffMembers();
  }, []);

  const loadStaffMembers = async () => {
    try {
      setLoading(true);
      const result = await superAdminAPI.getAllStaff(clubId, 1, 1000);
      setStaffMembers(result.staff);
    } catch (error) {
      alert('Failed to load staff members');
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
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg"
            >
              <option value="">Choose staff member...</option>
              {staffMembers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} - {staff.role}
                </option>
              ))}
            </select>
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

