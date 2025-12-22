import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatSection from "./ChatSection";

export default function StaffDashboard() {
  const [activeItem, setActiveItem] = useState("Chat");
  const navigate = useNavigate();

  const menuItems = [
    "Chat",
  ];

  // Default player chats (staff can access staff chat only based on permissions)
  // Staff role doesn't have player chat access, so passing null

  // Default staff chats
  const [staffChats, setStaffChats] = useState([
    {
      id: "SC001",
      staffId: "ST001",
      staffName: "Sarah Johnson",
      staffRole: "Dealer",
      status: "open",
      lastMessage: "Need assistance with player dispute",
      lastMessageTime: new Date(Date.now() - 300000).toISOString(),
      messages: [
        {
          id: "M3",
          sender: "staff",
          senderName: "Sarah Johnson",
          text: "Need assistance with player dispute",
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
  ]);

  const handleSignOut = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1600px] px-6 py-10 grid grid-cols-12 gap-8">
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-purple-500/20 via-blue-600/30 to-indigo-700/30 p-5 shadow-lg border border-gray-800">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-300 to-indigo-400 drop-shadow-lg mb-6">
            Staff Portal
          </div>
          <div className="bg-white/10 rounded-xl p-4 mb-6 text-white shadow-inner">
            <div className="text-lg font-semibold">Staff Member</div>
            <div className="text-sm opacity-80">staff@example.com</div>
          </div>

          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md ${
                  activeItem === item
                    ? "bg-gradient-to-r from-purple-400 to-blue-600 text-white font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-purple-400/20 hover:to-blue-500/20 text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-6">
            <button
              onClick={handleSignOut}
              className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-lg font-semibold shadow transition"
            >
              Sign Out
            </button>
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-9 xl:col-span-9 space-y-8">
          <header className="bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Staff - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Staff communication and support</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/")} className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow">
                Sign Out
              </button>
            </div>
          </header>

          {activeItem === "Chat" && (
            <ChatSection
              userRole="staff"
              playerChats={null}
              setPlayerChats={null}
              staffChats={staffChats}
              setStaffChats={setStaffChats}
            />
          )}
        </main>
      </div>
    </div>
  );
}

