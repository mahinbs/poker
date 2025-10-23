import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HrDashboard() {
  const [activeItem, setActiveItem] = useState("Staff Lifecycle");
  const navigate = useNavigate();

  const menuItems = [
    "Staff Lifecycle",
    "Attendance Management", 
    "Staff Directory",
    "Document Management",
    "Performance Reviews",
  ];

  const handleSignOut = () => {
    navigate("/hr/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-purple-500/20 via-pink-600/30 to-rose-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-rose-400 drop-shadow-lg mb-6">
            HR Portal
          </div>
          <div className="flex items-center mb-6 text-white min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-gray-900 font-bold text-sm">HR</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold truncate">HR Manager</div>
              <div className="text-sm opacity-80 truncate">hr@pokerroom.com</div>
            </div>
          </div>

          {/* Sidebar Menu */}
          <nav className="space-y-3">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md ${
                  activeItem === item
                    ? "bg-gradient-to-r from-purple-400 to-pink-600 text-gray-900 font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-purple-400/20 hover:to-pink-500/20 text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Section */}
        <main className="col-span-12 lg:col-span-9 xl:col-span-9 space-y-8">
          {/* Header */}
          <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">HR Portal - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Manage staff lifecycle, attendance, and performance</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
              Sign Out
            </button>
          </header>

          {/* Dynamic Content Based on Active Item */}
          {activeItem === "Staff Lifecycle" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Total Staff", value: "45", color: "from-purple-400 via-pink-500 to-rose-500" },
                  { title: "Active Staff", value: "42", color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "New Hires", value: "3", color: "from-blue-400 via-indigo-500 to-violet-500" },
                  { title: "Pending Reviews", value: "8", color: "from-yellow-400 via-orange-500 to-red-500" },
                ].map((card, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}
                  >
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Current status</div>
                  </div>
                ))}
              </div>

              {/* Staff Onboarding */}
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Staff Onboarding</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Add New Staff</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-white text-sm">First Name</label>
                          <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter first name" />
                        </div>
                        <div>
                          <label className="text-white text-sm">Last Name</label>
                          <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter last name" />
                        </div>
                      </div>
                      <div>
                        <label className="text-white text-sm">Email Address</label>
                        <input type="email" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter email" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Phone Number</label>
                        <input type="tel" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter phone number" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Position</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Dealer</option>
                          <option>Floor Manager</option>
                          <option>Cashier</option>
                          <option>Security</option>
                          <option>Maintenance</option>
                          <option>Kitchen Staff</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Department</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Operations</option>
                          <option>Security</option>
                          <option>Maintenance</option>
                          <option>Kitchen</option>
                          <option>Management</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Start Date</label>
                        <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                      </div>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Add Staff Member
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Additions</h3>
                    <div className="space-y-2">
                      <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-400/30">
                        <div className="font-semibold text-white">Sarah Johnson</div>
                        <div className="text-sm text-gray-300">Position: Dealer | Department: Operations</div>
                        <div className="text-xs text-purple-300">Added 2 days ago</div>
                      </div>
                      <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-400/30">
                        <div className="font-semibold text-white">Mike Chen</div>
                        <div className="text-sm text-gray-300">Position: Floor Manager | Department: Operations</div>
                        <div className="text-xs text-purple-300">Added 1 week ago</div>
                      </div>
                      <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-400/30">
                        <div className="font-semibold text-white">Emma Davis</div>
                        <div className="text-sm text-gray-300">Position: Cashier | Department: Operations</div>
                        <div className="text-xs text-purple-300">Added 2 weeks ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Document Upload */}
              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-blue-500/20 to-cyan-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Document Upload</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Upload Staff Documents</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Select Staff Member</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Sarah Johnson</option>
                          <option>Mike Chen</option>
                          <option>Emma Davis</option>
                          <option>John Smith</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Document Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>ID Card</option>
                          <option>PAN Card</option>
                          <option>Aadhaar Card</option>
                          <option>Passport</option>
                          <option>Driving License</option>
                          <option>Educational Certificate</option>
                          <option>Experience Certificate</option>
                          <option>Medical Certificate</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Upload Document</label>
                        <div className="mt-1 border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                          <div className="text-white mb-2">Click to upload or drag and drop</div>
                          <div className="text-gray-400 text-sm">PNG, JPG, PDF up to 10MB</div>
                          <input type="file" className="hidden" />
                        </div>
                      </div>
                      <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Upload Document
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Contract Assignment</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Staff Member</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Sarah Johnson</option>
                          <option>Mike Chen</option>
                          <option>Emma Davis</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Contract Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                          <option>Internship</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Role Assignment</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Dealer</option>
                          <option>Senior Dealer</option>
                          <option>Floor Manager</option>
                          <option>Assistant Manager</option>
                          <option>Manager</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Contract Start Date</label>
                        <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Contract End Date</label>
                        <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Assign Contract
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Attendance Management */}
          {activeItem === "Attendance Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Shift Logging & Attendance</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Log Shift</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Staff Member</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Sarah Johnson - Dealer</option>
                          <option>Mike Chen - Floor Manager</option>
                          <option>Emma Davis - Cashier</option>
                          <option>John Smith - Security</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Shift Date</label>
                        <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-white text-sm">Start Time</label>
                          <input type="time" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                        </div>
                        <div>
                          <label className="text-white text-sm">End Time</label>
                          <input type="time" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="text-white text-sm">Break Duration (minutes)</label>
                        <input type="number" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="30" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Notes</label>
                        <textarea className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="3" placeholder="Any additional notes..."></textarea>
                      </div>
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Log Shift
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Today's Shifts</h3>
                    <div className="space-y-2">
                      <div className="bg-green-500/20 p-3 rounded-lg border border-green-400/30">
                        <div className="font-semibold text-white">Sarah Johnson</div>
                        <div className="text-sm text-gray-300">Dealer | 9:00 AM - 5:00 PM</div>
                        <div className="text-xs text-green-300">Status: Active</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Mike Chen</div>
                        <div className="text-sm text-gray-300">Floor Manager | 2:00 PM - 10:00 PM</div>
                        <div className="text-xs text-blue-300">Status: Scheduled</div>
                      </div>
                      <div className="bg-yellow-500/20 p-3 rounded-lg border border-yellow-400/30">
                        <div className="font-semibold text-white">Emma Davis</div>
                        <div className="text-sm text-gray-300">Cashier | 6:00 PM - 2:00 AM</div>
                        <div className="text-xs text-yellow-300">Status: Break</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Attendance Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Weekly Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Hours</span>
                        <span className="text-white font-bold">168</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Present Days</span>
                        <span className="text-green-300 font-bold">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Absent Days</span>
                        <span className="text-red-300 font-bold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Late Arrivals</span>
                        <span className="text-yellow-300 font-bold">1</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Monthly Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Hours</span>
                        <span className="text-white font-bold">720</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Present Days</span>
                        <span className="text-green-300 font-bold">22</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Absent Days</span>
                        <span className="text-red-300 font-bold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Overtime Hours</span>
                        <span className="text-blue-300 font-bold">8</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Department Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Operations</span>
                        <span className="text-white font-bold">25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Security</span>
                        <span className="text-white font-bold">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Maintenance</span>
                        <span className="text-white font-bold">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Kitchen</span>
                        <span className="text-white font-bold">7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Staff Directory */}
          {activeItem === "Staff Directory" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Staff Directory</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg border border-blue-400/30">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Sarah Johnson</h3>
                      <span className="bg-green-500/30 text-green-300 px-2 py-1 rounded text-sm">Active</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-300">Position: Dealer</div>
                      <div className="text-sm text-gray-300">Department: Operations</div>
                      <div className="text-sm text-gray-300">Email: sarah.j@email.com</div>
                      <div className="text-sm text-gray-300">Phone: +91 98765 43210</div>
                      <div className="text-sm text-gray-300">Start Date: 2024-01-15</div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                        Edit
                      </button>
                      <button className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm">
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg border border-blue-400/30">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Mike Chen</h3>
                      <span className="bg-green-500/30 text-green-300 px-2 py-1 rounded text-sm">Active</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-300">Position: Floor Manager</div>
                      <div className="text-sm text-gray-300">Department: Operations</div>
                      <div className="text-sm text-gray-300">Email: mike.c@email.com</div>
                      <div className="text-sm text-gray-300">Phone: +91 98765 43211</div>
                      <div className="text-sm text-gray-300">Start Date: 2023-11-20</div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                        Edit
                      </button>
                      <button className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm">
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg border border-blue-400/30">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Emma Davis</h3>
                      <span className="bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded text-sm">On Leave</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-300">Position: Cashier</div>
                      <div className="text-sm text-gray-300">Department: Operations</div>
                      <div className="text-sm text-gray-300">Email: emma.d@email.com</div>
                      <div className="text-sm text-gray-300">Phone: +91 98765 43212</div>
                      <div className="text-sm text-gray-300">Start Date: 2024-02-01</div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                        Edit
                      </button>
                      <button className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Performance Reviews */}
          {activeItem === "Performance Reviews" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-orange-600/30 via-red-500/20 to-pink-700/30 rounded-xl shadow-md border border-orange-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Performance Reviews</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Schedule Review</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm">Staff Member</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Sarah Johnson - Dealer</option>
                          <option>Mike Chen - Floor Manager</option>
                          <option>Emma Davis - Cashier</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Review Type</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Monthly Review</option>
                          <option>Quarterly Review</option>
                          <option>Annual Review</option>
                          <option>Probation Review</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm">Review Date</label>
                        <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                      </div>
                      <div>
                        <label className="text-white text-sm">Reviewer</label>
                        <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>HR Manager</option>
                          <option>Operations Manager</option>
                          <option>General Manager</option>
                        </select>
                      </div>
                      <button className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Schedule Review
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Upcoming Reviews</h3>
                    <div className="space-y-2">
                      <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                        <div className="font-semibold text-white">Sarah Johnson</div>
                        <div className="text-sm text-gray-300">Monthly Review - Due: 2024-01-25</div>
                        <div className="text-xs text-orange-300">Status: Scheduled</div>
                      </div>
                      <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                        <div className="font-semibold text-white">Mike Chen</div>
                        <div className="text-sm text-gray-300">Quarterly Review - Due: 2024-02-01</div>
                        <div className="text-xs text-orange-300">Status: Pending</div>
                      </div>
                      <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-400/30">
                        <div className="font-semibold text-white">Emma Davis</div>
                        <div className="text-sm text-gray-300">Probation Review - Due: 2024-02-15</div>
                        <div className="text-xs text-orange-300">Status: Scheduled</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Document Management */}
          {activeItem === "Document Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-teal-600/30 via-cyan-500/20 to-blue-700/30 rounded-xl shadow-md border border-teal-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Document Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Document Categories</h3>
                    <div className="space-y-2">
                      <div className="bg-teal-500/20 p-3 rounded-lg border border-teal-400/30">
                        <div className="font-semibold text-white">ID Documents</div>
                        <div className="text-sm text-gray-300">45 files uploaded</div>
                      </div>
                      <div className="bg-teal-500/20 p-3 rounded-lg border border-teal-400/30">
                        <div className="font-semibold text-white">Educational Certificates</div>
                        <div className="text-sm text-gray-300">32 files uploaded</div>
                      </div>
                      <div className="bg-teal-500/20 p-3 rounded-lg border border-teal-400/30">
                        <div className="font-semibold text-white">Experience Certificates</div>
                        <div className="text-sm text-gray-300">28 files uploaded</div>
                      </div>
                      <div className="bg-teal-500/20 p-3 rounded-lg border border-teal-400/30">
                        <div className="font-semibold text-white">Medical Certificates</div>
                        <div className="text-sm text-gray-300">42 files uploaded</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Uploads</h3>
                    <div className="space-y-2">
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Sarah Johnson</div>
                        <div className="text-sm text-gray-300">PAN Card - Uploaded 2 hours ago</div>
                        <div className="text-xs text-blue-300">Status: Verified</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Mike Chen</div>
                        <div className="text-sm text-gray-300">Experience Certificate - Uploaded 1 day ago</div>
                        <div className="text-xs text-blue-300">Status: Pending Review</div>
                      </div>
                      <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-400/30">
                        <div className="font-semibold text-white">Emma Davis</div>
                        <div className="text-sm text-gray-300">Medical Certificate - Uploaded 2 days ago</div>
                        <div className="text-xs text-blue-300">Status: Verified</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
