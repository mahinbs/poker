import React, { useState, useEffect } from "react";

export default function StaffSidebar({ 
  activeItem, 
  setActiveItem, 
  menuItems = [],
  onSignOut = null 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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

  return (
    <>
      {isMobile && (
        <button
          className="sidebar-toggle fixed top-4 left-4 z-50 bg-gradient-to-r from-purple-500 to-blue-600 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      )}

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`sidebar-container fixed lg:sticky top-0 left-0 h-screen z-40 w-80 max-w-[90vw] bg-gradient-to-b from-purple-500/20 via-blue-600/30 to-indigo-700/30 border-r border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto overflow-x-hidden hide-scrollbar ${
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="p-3 sm:p-4 md:p-5 h-full flex flex-col min-w-0">
          <div className="mb-4 sm:mb-6">
            <div className="pt-11 lg:pt-0 text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-300 to-indigo-400 drop-shadow-lg mb-4 sm:mb-6 break-words">
              Staff Portal
            </div>
            <div className="bg-white/10 rounded-lg md:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-white shadow-inner">
              <div className="text-base sm:text-lg font-semibold truncate">Staff Member</div>
              <div className="text-xs sm:text-sm opacity-80 truncate">staff@example.com</div>
            </div>
          </div>

          <nav className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar min-w-0">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveItem(item);
                  if (isMobile) setIsOpen(false);
                }}
                className={`w-full text-left rounded-lg md:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-300 shadow-md overflow-hidden ${
                  activeItem === item
                    ? "bg-gradient-to-r from-purple-400 to-blue-600 text-white font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-purple-400/20 hover:to-blue-500/20 text-white"
                }`}
              >
                <span className="truncate block">{item}</span>
              </button>
            ))}
          </nav>

          {onSignOut && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
              <button
                onClick={onSignOut}
                className="w-full bg-red-600 hover:bg-red-500 text-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold shadow transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

