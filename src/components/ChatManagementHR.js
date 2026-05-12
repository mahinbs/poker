import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../lib/api';
import { io } from 'socket.io-client';
import { FaUser, FaSearch, FaPaperPlane, FaCircle, FaTimes, FaPlus } from 'react-icons/fa';

// HR-restricted Chat - Staff Chat Only
function StaffChatTab({ clubId }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!clubId) return;
    loadSessions();

    // WebSocket for real-time session + message updates
    const wsBase = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3333/api').replace(/\/api$/, '');
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || localStorage.getItem('token') || sessionStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const socket = io(`${wsBase}/realtime`, {
      auth: { clubId, userId, token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('subscribe:club', { clubId, userId });
      socket.emit('subscribe:staff', { staffId: userId, clubId });
    });
    socket.on('chat:new-message', (data) => {
      // Refresh session list (unread counts) regardless of which session
      loadSessions();
      // If the message belongs to the open session, reload messages
      setSelectedSession((current) => {
        if (current && data?.sessionId === current.id) {
          loadMessagesForSession(current);
        }
        return current;
      });
    });
    socket.on('chat:new-message-direct', (data) => {
      const currentUserId = localStorage.getItem('userId');
      if (data?.recipientStaffUserId === currentUserId) {
        loadSessions();
        setSelectedSession((current) => {
          if (current && data?.sessionId === current.id) {
            loadMessagesForSession(current);
          }
          return current;
        });
      }
    });
    socket.on('chat:session-updated', () => loadSessions());
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [clubId]);

  useEffect(() => {
    if (selectedSession) {
      loadMessagesForSession(selectedSession);
    }
  }, [selectedSession?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getStaffChatSessions(clubId, { page: 1, limit: 100 });
      setSessions(response.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessagesForSession = async (session) => {
    if (!session) return;
    try {
      const response = await chatAPI.getSessionMessages(clubId, session.id, { page: 1, limit: 100 });
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;
    const text = newMessage.trim();
    setNewMessage('');
    try {
      await chatAPI.sendMessage(clubId, selectedSession.id, text);
      loadMessagesForSession(selectedSession);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(text);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredSessions = sessions.filter(session => {
    const searchLower = searchTerm.toLowerCase();
    const staffName = session.otherStaff?.name || session.staffRecipient?.name || session.staffInitiator?.name || '';
    const staffEmail = session.otherStaff?.email || session.staffRecipient?.email || session.staffInitiator?.email || '';
    return (
      session.subject?.toLowerCase().includes(searchLower) ||
      staffName.toLowerCase().includes(searchLower) ||
      staffEmail.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
      {/* Sessions List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading sessions...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No chat sessions found</div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors ${
                  selectedSession?.id === session.id ? 'bg-slate-700' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{session.subject || session.otherStaff?.name || 'No Subject'}</h3>
                  {session.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {session.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {session.otherStaff?.name || session.staffRecipient?.name || session.staffInitiator?.name || 'Unknown Staff'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {session.lastMessageAt ? new Date(session.lastMessageAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
        {selectedSession ? (
          <>
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">
                {selectedSession.otherStaff?.name || selectedSession.staffRecipient?.name || selectedSession.staffInitiator?.name || 'Staff Member'}
              </h2>
              <p className="text-sm text-gray-400">
                {selectedSession.subject ? `Subject: ${selectedSession.subject}` : 'Chat Conversation'}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderRole === 'HR' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderRole === 'HR'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-700 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                <FaPaperPlane />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FaUser className="text-6xl mx-auto mb-4 opacity-50" />
              <p>Select a chat session to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatManagementHR({ clubId }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaUser className="text-4xl" />
            Staff Chat
          </h1>
          <p className="text-white/80 mt-2">Communicate with staff members in real-time</p>
        </div>

        {/* Staff Chat Only */}
        <StaffChatTab clubId={clubId} />
      </div>
    </div>
  );
}





