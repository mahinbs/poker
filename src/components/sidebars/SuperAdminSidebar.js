import React, { useState, useEffect } from "react";

export default function SuperAdminSidebar({ 
  activeItem, 
  setActiveItem, 
  menuItems = [],
  onSignOut = null,
  clubs = [],
  selectedClubId = null,
  setSelectedClubId = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isClubDropdownOpen, setIsClubDropdownOpen] = useState(false);

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

  const selectedClub = clubs.find((c) => c.id === selectedClubId) || clubs[0];

  return (
    <>
      {isMobile && (
        <button
          className="sidebar-toggle fixed top-4 left-4 z-50 bg-gradient-to-r from-red-500 to-purple-600 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 lg:hidden"
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
        className={`sidebar-container fixed lg:sticky top-0 left-0 h-screen z-40 w-80 max-w-[90vw] bg-gradient-to-b from-red-500/20 via-purple-600/30 to-indigo-700/30 border-r border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto overflow-x-hidden hide-scrollbar ${
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="p-5 h-full flex flex-col min-w-0">
          <div className="mb-6">
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-300 to-indigo-400 drop-shadow-lg mb-6">
              Super Admin
            </div>
            <div className="bg-white/10 rounded-xl p-4 mb-6 text-white shadow-inner">
              <div className="text-lg font-semibold">Root Administrator</div>
              <div className="text-sm opacity-80">super@admin.com</div>
            </div>

            {/* Club Selection Dropdown */}
            {clubs.length > 0 && setSelectedClubId && (
              <div className="mb-6 relative min-w-0">
                <label className="text-white text-sm mb-2 block">Select Club</label>
                <div className="relative min-w-0">
                  <button
                    type="button"
                    onClick={() => setIsClubDropdownOpen(!isClubDropdownOpen)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-left flex items-center justify-between hover:bg-white/15 transition-colors overflow-hidden min-w-0"
                  >
                    <span className="truncate min-w-0 flex-1">
                      {selectedClub?.name || "Select Club"}
                    </span>
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform ${
                        isClubDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isClubDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsClubDropdownOpen(false)}
                      ></div>
                      <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-48 overflow-y-auto overflow-x-hidden hide-scrollbar">
                        {clubs.map((club) => (
                          <button
                            key={club.id}
                            type="button"
                            onClick={() => {
                              setSelectedClubId(club.id);
                              setIsClubDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-colors overflow-hidden ${
                              selectedClubId === club.id ? "bg-blue-600/30" : ""
                            }`}
                          >
                            <span className="block truncate">{club.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Managing: {selectedClub?.name}
                </p>
              </div>
            )}
          </div>

          <nav className="space-y-3 flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar min-w-0">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setActiveItem(item);
                  if (isMobile) setIsOpen(false);
                }}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md overflow-hidden ${
                  activeItem === item
                    ? "bg-gradient-to-r from-red-400 to-purple-600 text-white font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-red-400/20 hover:to-purple-500/20 text-white"
                }`}
              >
                <span className="block truncate">{item}</span>
              </button>
            ))}
          </nav>

          {onSignOut && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={onSignOut}
                className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-lg font-semibold shadow transition"
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

