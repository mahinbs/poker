import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HrDashboard() {
  const [activeItem, setActiveItem] = useState("Staff Directory");
  const navigate = useNavigate();

  const menuItems = [
    "Staff Directory",
    "Performance Reviews",
  ];

  // Staff members data with documents
  const staffMembers = [
    { 
      id: "S001", 
      name: "Sarah Johnson", 
      position: "Dealer", 
      department: "Operations",
      email: "sarah.j@email.com",
      phone: "+91 98765 43210",
      startDate: "2024-01-15",
      status: "Active",
      documents: [
        { type: "PAN Card", status: "Verified", uploadedDate: "2024-01-10" },
        { type: "Aadhaar Card", status: "Verified", uploadedDate: "2024-01-10" },
        { type: "ID Card", status: "Verified", uploadedDate: "2024-01-15" },
        { type: "Medical Certificate", status: "Verified", uploadedDate: "2024-01-12" }
      ]
    },
    { 
      id: "S002", 
      name: "Mike Chen", 
      position: "Floor Manager", 
      department: "Operations",
      email: "mike.c@email.com",
      phone: "+91 98765 43211",
      startDate: "2023-11-20",
      status: "Active",
      documents: [
        { type: "PAN Card", status: "Verified", uploadedDate: "2023-11-15" },
        { type: "Passport", status: "Verified", uploadedDate: "2023-11-15" },
        { type: "Experience Certificate", status: "Pending Review", uploadedDate: "2024-01-20" },
        { type: "ID Card", status: "Verified", uploadedDate: "2023-11-20" }
      ]
    },
    { 
      id: "S003", 
      name: "Emma Davis", 
      position: "Cashier", 
      department: "Operations",
      email: "emma.d@email.com",
      phone: "+91 98765 43212",
      startDate: "2024-02-01",
      status: "On Leave",
      documents: [
        { type: "PAN Card", status: "Verified", uploadedDate: "2024-01-28" },
        { type: "Aadhaar Card", status: "Verified", uploadedDate: "2024-01-28" },
        { type: "Medical Certificate", status: "Verified", uploadedDate: "2024-02-01" },
        { type: "ID Card", status: "Verified", uploadedDate: "2024-02-01" }
      ]
    },
    { 
      id: "S004", 
      name: "John Smith", 
      position: "Security", 
      department: "Security",
      email: "john.s@email.com",
      phone: "+91 98765 43213",
      startDate: "2023-12-10",
      status: "Active",
      documents: [
        { type: "PAN Card", status: "Verified", uploadedDate: "2023-12-05" },
        { type: "Driving License", status: "Verified", uploadedDate: "2023-12-05" },
        { type: "ID Card", status: "Verified", uploadedDate: "2023-12-10" }
      ]
    },
    { 
      id: "S005", 
      name: "David Wilson", 
      position: "Dealer", 
      department: "Operations",
      email: "david.w@email.com",
      phone: "+91 98765 43214",
      startDate: "2024-01-20",
      status: "Active",
      documents: [
        { type: "PAN Card", status: "Verified", uploadedDate: "2024-01-18" },
        { type: "ID Card", status: "Verified", uploadedDate: "2024-01-20" }
      ]
    },
    { 
      id: "S006", 
      name: "Lisa Brown", 
      position: "Kitchen Staff", 
      department: "Kitchen",
      email: "lisa.b@email.com",
      phone: "+91 98765 43215",
      startDate: "2024-02-05",
      status: "Active",
      documents: [
        { type: "PAN Card", status: "Verified", uploadedDate: "2024-02-03" },
        { type: "Aadhaar Card", status: "Verified", uploadedDate: "2024-02-03" },
        { type: "ID Card", status: "Verified", uploadedDate: "2024-02-05" }
      ]
    },
  ];


  // State for Staff Directory
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);

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
              <p className="text-gray-200 mt-1">Staff directory and performance reviews (Read-only)</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow"
            >
              Sign Out
            </button>
          </header>

          {/* Dynamic Content Based on Active Item */}
          {/* Note: HR has read-only access. Only Admin and Super Admin can manage staff. */}

          {/* Staff Directory */}
          {activeItem === "Staff Directory" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Staff Directory</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staffMembers.map(staff => (
                    <div key={staff.id} className="bg-white/10 p-4 rounded-lg border border-blue-400/30">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-white">{staff.name}</h3>
                        <span className={`px-2 py-1 rounded text-sm ${
                          staff.status === "Active" 
                            ? "bg-green-500/30 text-green-300" 
                            : "bg-yellow-500/30 text-yellow-300"
                        }`}>
                          {staff.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-300">Position: {staff.position}</div>
                        <div className="text-sm text-gray-300">Department: {staff.department}</div>
                        <div className="text-sm text-gray-300">Email: {staff.email}</div>
                        <div className="text-sm text-gray-300">Phone: {staff.phone}</div>
                        <div className="text-sm text-gray-300">Start Date: {staff.startDate}</div>
                      </div>
                      <div className="mt-3">
                        <button 
                          onClick={() => setSelectedStaffDetails(staff)}
                          className="w-full bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Staff Details Modal */}
              {selectedStaffDetails && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-white/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">Staff Details</h2>
                          <p className="text-gray-400 text-sm">Complete information for {selectedStaffDetails.name}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedStaffDetails(null)} 
                          className="text-white/70 hover:text-white text-2xl font-bold"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-gray-400 text-sm">Staff ID</label>
                            <div className="text-white font-medium">{selectedStaffDetails.id}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Full Name</label>
                            <div className="text-white font-medium">{selectedStaffDetails.name}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Position</label>
                            <div className="text-white font-medium">{selectedStaffDetails.position}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Department</label>
                            <div className="text-white font-medium">{selectedStaffDetails.department}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Email</label>
                            <div className="text-white font-medium">{selectedStaffDetails.email}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Phone</label>
                            <div className="text-white font-medium">{selectedStaffDetails.phone}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Start Date</label>
                            <div className="text-white font-medium">{selectedStaffDetails.startDate}</div>
                          </div>
                          <div>
                            <label className="text-gray-400 text-sm">Status</label>
                            <div>
                              <span className={`px-3 py-1 rounded-full text-xs border font-medium ${
                                selectedStaffDetails.status === "Active" 
                                  ? "bg-green-500/30 text-green-300 border-green-400/50" 
                                  : "bg-yellow-500/30 text-yellow-300 border-yellow-400/50"
                              }`}>
                                {selectedStaffDetails.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Documents Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Documents</h3>
                        {selectedStaffDetails.documents && selectedStaffDetails.documents.length > 0 ? (
                          <div className="space-y-3">
                            {selectedStaffDetails.documents.map((doc, index) => (
                              <div 
                                key={index}
                                className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center justify-between"
                              >
                                <div className="flex-1">
                                  <div className="text-white font-medium">{doc.type}</div>
                                  <div className="text-sm text-gray-400 mt-1">
                                    Uploaded: {doc.uploadedDate}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-xs border font-medium ${
                                    doc.status === "Verified" 
                                      ? "bg-green-500/30 text-green-300 border-green-400/50" 
                                      : "bg-yellow-500/30 text-yellow-300 border-yellow-400/50"
                                  }`}>
                                    {doc.status}
                                  </span>
                                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                                    View
                                  </button>
                                  <button className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-sm">
                                    Download
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            No documents uploaded
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button 
                          onClick={() => setSelectedStaffDetails(null)}
                          className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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

        </main>
      </div>
    </div>
  );
}
