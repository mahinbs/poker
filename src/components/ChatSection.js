import React, { useState, useEffect } from "react";
import CustomSelect from "./common/CustomSelect";

export default function ChatSection({
  userRole = "manager", // "superadmin", "admin", "manager", "cashier", "gre", "hr", "fnb", "staff", "affiliate", "masteradmin"
  playerChats: propPlayerChats = null,
  setPlayerChats: propSetPlayerChats = null,
  staffChats: propStaffChats = null,
  setStaffChats: propSetStaffChats = null,
}) {
  // Role-based permissions
  const canAccessPlayerChat = ["superadmin", "admin", "manager", "cashier", "gre", "fnb"].includes(userRole);
  const canAccessStaffChat = ["superadmin", "admin", "manager", "cashier", "gre", "hr", "fnb", "staff"].includes(userRole);

  // Get role display name for sender name
  const getRoleDisplayName = () => {
    const roleMap = {
      superadmin: "Super Admin",
      admin: "Admin",
      manager: "Manager",
      cashier: "Cashier",
      gre: "GRE",
      hr: "HR",
      fnb: "FNB",
      staff: "Staff",
      affiliate: "Affiliate",
      masteradmin: "Master Admin",
    };
    return roleMap[userRole] || "Staff";
  };

  // Default player chats
  const defaultPlayerChats = [
    {
      id: "PC001",
      playerId: "P001",
      playerName: "Alex Johnson",
      status: "open",
      lastMessage: "Need assistance at Table 2",
      lastMessageTime: new Date(Date.now() - 180000).toISOString(),
      messages: [
        {
          id: "M1",
          sender: "player",
          senderName: "Alex Johnson",
          text: "Need assistance at Table 2",
          timestamp: new Date(Date.now() - 180000).toISOString(),
        },
        {
          id: "M2",
          sender: "staff",
          senderName: getRoleDisplayName(),
          text: "On my way!",
          timestamp: new Date(Date.now() - 120000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
  ];

  // Default staff chats
  const defaultStaffChats = [
    {
      id: "SC001",
      staffId: "ST001",
      staffName: "Sarah Johnson",
      staffRole: "Dealer",
      status: "open",
      lastMessage: "Player dispute at Table 3",
      lastMessageTime: new Date(Date.now() - 300000).toISOString(),
      messages: [
        {
          id: "M3",
          sender: "staff",
          senderName: "Sarah Johnson",
          text: "Player dispute at Table 3",
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: "M4",
          sender: "admin",
          senderName: getRoleDisplayName(),
          text: "I'll handle it.",
          timestamp: new Date(Date.now() - 240000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
  ];

  // Manage state
  const [internalPlayerChats, setInternalPlayerChats] = useState(defaultPlayerChats);
  const [internalStaffChats, setInternalStaffChats] = useState(defaultStaffChats);

  const playerChats = propPlayerChats !== null ? propPlayerChats : internalPlayerChats;
  const setPlayerChats = propSetPlayerChats || setInternalPlayerChats;
  const staffChats = propStaffChats !== null ? propStaffChats : internalStaffChats;
  const setStaffChats = propSetStaffChats || setInternalStaffChats;

  // Determine initial chat type based on permissions
  const getInitialChatType = () => {
    if (canAccessPlayerChat) return "player";
    if (canAccessStaffChat) return "staff";
    return "player"; // fallback
  };

  const [chatType, setChatType] = useState(getInitialChatType());
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredChats =
    chatType === "player"
      ? playerChats.filter(
          (chat) => statusFilter === "all" || chat.status === statusFilter
        )
      : staffChats.filter(
          (chat) => statusFilter === "all" || chat.status === statusFilter
        );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const roleDisplayName = getRoleDisplayName();
    const senderType = chatType === "player" ? "staff" : userRole === "staff" ? "staff" : "admin";

    const message = {
      id: `M${Date.now()}`,
      sender: senderType,
      senderName: roleDisplayName,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    if (chatType === "player") {
      setPlayerChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                messages: [...chat.messages, message],
                lastMessage: message.text,
                lastMessageTime: message.timestamp,
                status: chat.status === "closed" ? "in_progress" : chat.status,
              }
            : chat
        )
      );
    } else {
      setStaffChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                messages: [...chat.messages, message],
                lastMessage: message.text,
                lastMessageTime: message.timestamp,
                status: chat.status === "closed" ? "in_progress" : chat.status,
              }
            : chat
        )
      );
    }
    setNewMessage("");
  };

  const handleStatusChange = (chatId, newStatus) => {
    if (chatType === "player") {
      setPlayerChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, status: newStatus } : chat
        )
      );
      if (selectedChat && selectedChat.id === chatId) {
        const updatedChat = playerChats.find((c) => c.id === chatId);
        if (updatedChat) setSelectedChat({ ...updatedChat, status: newStatus });
      }
    } else {
      setStaffChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, status: newStatus } : chat
        )
      );
      if (selectedChat && selectedChat.id === chatId) {
        const updatedChat = staffChats.find((c) => c.id === chatId);
        if (updatedChat) setSelectedChat({ ...updatedChat, status: newStatus });
      }
    }
  };

  // Update selectedChat when chats change
  useEffect(() => {
    if (selectedChat) {
      const currentChats = chatType === "player" ? playerChats : staffChats;
      const updatedChat = currentChats.find((c) => c.id === selectedChat.id);
      if (updatedChat) {
        setSelectedChat(updatedChat);
      } else {
        setSelectedChat(null);
      }
    }
  }, [chatType, playerChats, staffChats]);

  // Reset chat type if current type is not accessible
  useEffect(() => {
    if (chatType === "player" && !canAccessPlayerChat && canAccessStaffChat) {
      setChatType("staff");
      setSelectedChat(null);
    } else if (chatType === "staff" && !canAccessStaffChat && canAccessPlayerChat) {
      setChatType("player");
      setSelectedChat(null);
    }
  }, [chatType, canAccessPlayerChat, canAccessStaffChat]);

  // If no chat access, show message
  if (!canAccessPlayerChat && !canAccessStaffChat) {
    return (
      <div className="space-y-6">
        <section className="p-6 bg-gradient-to-r from-yellow-600/30 via-orange-500/20 to-red-700/30 rounded-xl shadow-md border border-yellow-800/40">
          <div className="text-center py-12 text-gray-400">
            <div className="text-lg mb-2">No chat access</div>
            <div className="text-sm">You do not have permission to access chat</div>
          </div>
        </section>
      </div>
    );
  }

  // Get gradient classes based on chat type
  const getPlayerChatGradient = () => {
    if (userRole === "manager") return "from-yellow-400 to-orange-600";
    if (userRole === "cashier") return "from-blue-400 to-cyan-600";
    return "from-purple-400 to-pink-600";
  };

  const getStaffChatGradient = () => {
    if (userRole === "manager") return "from-green-500 to-emerald-600";
    if (userRole === "hr") return "from-purple-500 to-pink-600";
    return "from-blue-500 to-cyan-600";
  };

  return (
    <div className="space-y-6">
      <section className="p-6 bg-gradient-to-r from-yellow-600/30 via-orange-500/20 to-red-700/30 rounded-xl shadow-md border border-yellow-800/40">
        <h2 className="text-xl font-bold text-white mb-6">
          Player & Staff Support Chat
        </h2>

        {/* Chat Type Tabs */}
        <div className="flex gap-2 mb-6">
          {canAccessPlayerChat && (
            <button
              onClick={() => {
                setChatType("player");
                setSelectedChat(null);
                setStatusFilter("all");
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                chatType === "player"
                  ? `bg-gradient-to-r ${getPlayerChatGradient()} text-white shadow-lg`
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              📱 Player Chat
            </button>
          )}
          {canAccessStaffChat && (
            <button
              onClick={() => {
                setChatType("staff");
                setSelectedChat(null);
                setStatusFilter("all");
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                chatType === "staff"
                  ? `bg-gradient-to-r ${getStaffChatGradient()} text-white shadow-lg`
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              👥 Staff Chat
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List Sidebar */}
          <div className="lg:col-span-1 bg-white/10 p-4 rounded-lg">
            <div className="mb-4">
              <label className="text-white text-sm mb-2 block">
                Filter by Status
              </label>
              <CustomSelect
                className="w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </CustomSelect>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedChat?.id === chat.id
                        ? chatType === "player"
                          ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400/50"
                          : "bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-400/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-semibold text-white text-sm">
                        {chatType === "player"
                          ? chat.playerName
                          : chat.staffName}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          chat.status === "open"
                            ? "bg-yellow-500/30 text-yellow-300"
                            : chat.status === "in_progress"
                            ? "bg-blue-500/30 text-blue-300"
                            : "bg-gray-500/30 text-gray-300"
                        }`}
                      >
                        {chat.status === "open"
                          ? "Open"
                          : chat.status === "in_progress"
                          ? "In Progress"
                          : "Closed"}
                      </span>
                    </div>
                    {chatType === "staff" && (
                      <div className="text-xs text-gray-400 mb-1">
                        {chat.staffRole}
                      </div>
                    )}
                    <div className="text-xs text-gray-300 truncate">
                      {chat.lastMessage}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(
                        chat.lastMessageTime
                      ).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No {statusFilter !== "all" ? statusFilter : ""} chats found
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-white/10 p-4 rounded-lg">
            {selectedChat ? (
              <div className="flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {chatType === "player"
                        ? selectedChat.playerName
                        : selectedChat.staffName}
                    </div>
                    {chatType === "staff" && (
                      <div className="text-sm text-gray-400">
                        {selectedChat.staffRole}
                      </div>
                    )}
                    {chatType === "player" && (
                      <div className="text-sm text-gray-400">
                        ID: {selectedChat.playerId}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <CustomSelect
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                      value={selectedChat.status}
                      onChange={(e) =>
                        handleStatusChange(
                          selectedChat.id,
                          e.target.value
                        )
                      }
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </CustomSelect>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {selectedChat.messages.map((message) => {
                    const isSender = message.sender === "staff" || 
                                   message.sender === "manager" || 
                                   message.sender === "admin" ||
                                   (message.sender === userRole) ||
                                   (userRole === "staff" && message.sender === "admin");
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isSender ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isSender
                              ? chatType === "player"
                                ? `bg-gradient-to-r ${getPlayerChatGradient()} text-white`
                                : `bg-gradient-to-r ${getStaffChatGradient()} text-white`
                              : "bg-white/20 text-white"
                          }`}
                        >
                          <div className="text-xs font-semibold mb-1 opacity-90">
                            {message.senderName}
                          </div>
                          <div className="text-sm">{message.text}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(
                              message.timestamp
                            ).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSendMessage()
                    }
                    disabled={selectedChat.status === "closed"}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={
                      selectedChat.status === "closed" ||
                      !newMessage.trim()
                    }
                    className={`bg-gradient-to-r ${
                      chatType === "player"
                        ? getPlayerChatGradient()
                        : getStaffChatGradient()
                    } hover:opacity-90 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Send
                  </button>
                </div>
                {selectedChat.status === "closed" && (
                  <div className="text-xs text-gray-400 mt-2 text-center">
                    This chat is closed. Change status to reopen.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[600px] text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <div className="text-lg">
                    Select a{" "}
                    {chatType === "player" ? "player" : "staff"} chat to start
                    messaging
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

