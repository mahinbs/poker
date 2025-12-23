import React, { useState } from 'react';

const CustomSelect = ({ children, className, ...props }) => {
    return (
        <div className={`relative ${className}`}>
            <select
                {...props}
                className="appearance-none w-full bg-white/10 text-white border border-white/20 rounded px-4 py-2 pr-8 focus:outline-none focus:border-purple-500"
            >
                {children}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-white/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    )
}

const StaffManagement = ({ 
    userRole = "",
    affiliates = null, 
    setAffiliates = null, 
    createdCredentials = null, 
    setCreatedCredentials = null,
    registeredPlayers = []
}) => {
    const [selectedStaffRole, setSelectedStaffRole] = useState("GRE");
    const [customStaffRole, setCustomStaffRole] = useState("");
    const [activeTab, setActiveTab] = useState("onboarding"); // 'onboarding' or 'documents'
    const [staffList, setStaffList] = useState([
        { id: "S001", name: "Sarah Johnson", role: "Dealer", status: "Active", department: "Operations" },
        { id: "S002", name: "Mike Chen", role: "Floor Manager", status: "Active", department: "Operations" },
        { id: "S003", name: "Emma Davis", role: "Cashier", status: "On Leave", department: "Operations" }
    ]);

    const [newStaff, setNewStaff] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "Dealer",
        department: "Operations",
        startDate: "",
        referralCode: ""
    });

    const handleAddStaff = () => {
        const name = `${newStaff.firstName} ${newStaff.lastName}`.trim();
        if (!newStaff.firstName || !newStaff.email) {
            alert("Please fill in required fields");
            return;
        }

        const isAffiliate = newStaff.position === "Affiliate";
        
        // Validate referral code if affiliate
        if (isAffiliate && (!newStaff.referralCode || newStaff.referralCode.trim() === "")) {
            alert("Please enter a referral code for the affiliate");
            return;
        }

        const newStaffMember = {
            id: `S00${staffList.length + 1}`,
            name,
            role: newStaff.position,
            status: "Active",
            department: newStaff.department,
            email: newStaff.email
        };

        setStaffList([...staffList, newStaffMember]);

        const staffEmail = newStaff.email;

        // If position is "Affiliate", create affiliate entry
        if (isAffiliate && setAffiliates) {
            // Use manually entered referral code
            const referralCode = newStaff.referralCode.trim().toUpperCase();
            // Generate password
            const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();

            const newAffiliate = {
                id: `AFF${Date.now()}`,
                name: name,
                email: staffEmail,
                referralCode: referralCode,
                status: "Active",
                kycStatus: "Pending",
                totalReferrals: 0,
                earnings: 0
            };

            setAffiliates(prev => [...(prev || []), newAffiliate]);

            // Show credentials popup
            if (setCreatedCredentials) {
                setCreatedCredentials({
                    name: name,
                    referralCode: referralCode,
                    password: tempPassword
                });
            }
        }

        setNewStaff({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            position: "Dealer",
            department: "Operations",
            startDate: "",
            referralCode: ""
        });

        if (isAffiliate) {
            alert("Affiliate Staff Member Added Successfully! Credentials will be shown below.");
        } else {
            alert("Staff Member Added Successfully");
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                    { title: "Total Staff", value: staffList.length.toString(), color: "from-purple-400 via-pink-500 to-rose-500" },
                    { title: "Active Staff", value: staffList.filter(s => s.status === 'Active').length.toString(), color: "from-green-400 via-emerald-500 to-teal-500" },
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



            {/* Tab Navigation */}
            <div className="flex space-x-4 border-b border-gray-700 pb-2">
                <button
                    onClick={() => setActiveTab("onboarding")}
                    className={`px-4 py-2 font-semibold rounded-lg transition-colors ${activeTab === "onboarding" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                    Staff Onboarding
                </button>
                <button
                    onClick={() => setActiveTab("documents")}
                    className={`px-4 py-2 font-semibold rounded-lg transition-colors ${activeTab === "documents" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                    Document Uploads & Contracts
                </button>
            </div>

            {/* Staff Onboarding */}
            {
                activeTab === "onboarding" && (
                    <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-rose-700/30 rounded-xl shadow-md border border-purple-800/40">
                        <h2 className="text-xl font-bold text-white mb-6">Staff Onboarding & Management</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white/10 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-4">Add New Staff</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-white text-sm">First Name</label>
                                            <input
                                                type="text"
                                                value={newStaff.firstName}
                                                onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                                                className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-white text-sm">Last Name</label>
                                            <input
                                                type="text"
                                                value={newStaff.lastName}
                                                onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
                                                className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-white text-sm">Email Address</label>
                                        <input
                                            type="email"
                                            value={newStaff.email}
                                            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                                            placeholder="Enter email"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-white text-sm">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={newStaff.phone}
                                            onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-white text-sm">Position</label>
                                        <CustomSelect
                                            className="w-full mt-1"
                                            value={newStaff.position}
                                            onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value, referralCode: e.target.value === "Affiliate" ? newStaff.referralCode : "" })}
                                        >
                                            <option>Dealer</option>
                                            <option>Floor Manager</option>
                                            <option>Cashier</option>
                                            <option>Security</option>
                                            <option>Maintenance</option>
                                            <option>Kitchen Staff</option>
                                            <option>GRE</option>
                                            <option>HR</option>
                                            <option>Manager</option>
                                            {(userRole === "superadmin" || userRole === "admin") && <option>Affiliate</option>}
                                        </CustomSelect>
                                    </div>
                                    {newStaff.position === "Affiliate" && (
                                        <div>
                                            <label className="text-white text-sm">Referral Code *</label>
                                            <input
                                                type="text"
                                                value={newStaff.referralCode}
                                                onChange={(e) => setNewStaff({ ...newStaff, referralCode: e.target.value.toUpperCase() })}
                                                className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white font-mono"
                                                placeholder="Enter referral code (e.g., AGENT-123)"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">This code will be used for player referrals</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-white text-sm">Department</label>
                                        <CustomSelect
                                            className="w-full mt-1"
                                            value={newStaff.department}
                                            onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                                        >
                                            <option>Operations</option>
                                            <option>Security</option>
                                            <option>Maintenance</option>
                                            <option>Kitchen</option>
                                            <option>Management</option>
                                        </CustomSelect>
                                    </div>
                                    <div>
                                        <label className="text-white text-sm">Start Date</label>
                                        <input
                                            type="date"
                                            value={newStaff.startDate}
                                            onChange={(e) => setNewStaff({ ...newStaff, startDate: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddStaff}
                                        className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                                    >
                                        Add Staff Member
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/10 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-4">Current Staff Directory</h3>
                                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                                    {staffList.map((staff, idx) => (
                                        <div key={idx} className="bg-purple-500/20 p-3 rounded-lg border border-purple-400/30 flex justify-between items-center group hover:bg-purple-500/30 transition-colors">
                                            <div>
                                                <div className="font-semibold text-white">{staff.name}</div>
                                                <div className="text-sm text-gray-300">{staff.role} | {staff.department}</div>
                                                <div className="text-xs text-purple-300 capitalize">{staff.status}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="text-blue-400 hover:text-blue-300 text-xs bg-black/30 p-1.5 rounded">Edit</button>
                                                <button className="text-red-400 hover:text-red-300 text-xs bg-black/30 p-1.5 rounded">Remove</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

            {/* Document Upload */}
            {activeTab === "documents" && (
                <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-blue-500/20 to-cyan-700/30 rounded-xl shadow-md border border-indigo-800/40">
                    <h2 className="text-xl font-bold text-white mb-6">Document Upload & Assignment</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white/10 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-4">Upload Staff Documents</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-white text-sm">Select Staff Member</label>
                                    <CustomSelect className="w-full mt-1 text-white">
                                        {staffList.map(s => <option key={s.id}>{s.name}</option>)}
                                    </CustomSelect>
                                </div>
                                <div>
                                    <label className="text-white text-sm">Document Type</label>
                                    <CustomSelect className="w-full mt-1 text-white">
                                        <option>ID Card</option>
                                        <option>PAN Card</option>
                                        <option>Aadhaar Card</option>
                                        <option>Passport</option>
                                        <option>Driving License</option>
                                        <option>Educational Certificate</option>
                                        <option>Experience Certificate</option>
                                        <option>Medical Certificate</option>
                                    </CustomSelect>
                                </div>
                                <div>
                                    <label className="text-white text-sm">Upload Document</label>
                                    <div className="mt-1 border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:bg-white/5 transition-colors cursor-pointer">
                                        <div className="text-white mb-2">Click to upload or drag and drop</div>
                                        <div className="text-gray-400 text-sm">PNG, JPG, PDF up to 10MB</div>
                                        <input type="file" className="hidden" />
                                    </div>
                                </div>
                                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                    Upload Document
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/10 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-4">Contract Assignment</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-white text-sm">Staff Member</label>
                                    <CustomSelect className="w-full mt-1 text-white">
                                        {staffList.map(s => <option key={s.id}>{s.name}</option>)}
                                    </CustomSelect>
                                </div>
                                <div>
                                    <label className="text-white text-sm">Contract Type</label>
                                    <CustomSelect className="w-full mt-1 text-white">
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                    </CustomSelect>
                                </div>
                                <div>
                                    <label className="text-white text-sm">Role Assignment</label>
                                    <CustomSelect className="w-full mt-1 text-white">
                                        <option>Dealer</option>
                                        <option>Senior Dealer</option>
                                        <option>Floor Manager</option>
                                        <option>Assistant Manager</option>
                                        <option>Manager</option>
                                    </CustomSelect>
                                </div>
                                <div>
                                    <label className="text-white text-sm">Contract Start Date</label>
                                    <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                                </div>
                                <div>
                                    <label className="text-white text-sm">Contract End Date</label>
                                    <input type="date" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                                </div>
                                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                    Assign Contract
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )
            }

            {/* Affiliate Credentials Modal */}
            {createdCredentials && setCreatedCredentials && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-green-500/50 rounded-2xl p-8 w-full max-w-md relative shadow-2xl bg-gradient-to-b from-gray-900 to-gray-800">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                                <span className="text-3xl">✅</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">Affiliate Created!</h3>
                            <p className="text-gray-400 mt-2">Share these credentials with {createdCredentials.name}</p>
                        </div>

                        <div className="space-y-4 bg-black/40 p-6 rounded-xl border border-gray-700">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Referral Code</label>
                                <div className="flex justify-between items-center mt-1">
                                    <div className="font-mono text-xl text-yellow-400 font-bold tracking-wider">{createdCredentials.referralCode}</div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(createdCredentials.referralCode)}
                                        className="text-gray-400 hover:text-white text-sm"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-gray-700/50 pt-4">
                                <label className="text-xs text-gray-500 uppercase font-semibold">Temporary Password</label>
                                <div className="flex justify-between items-center mt-1">
                                    <div className="font-mono text-xl text-green-400 font-bold tracking-wider">{createdCredentials.password}</div>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(createdCredentials.password)}
                                        className="text-gray-400 hover:text-white text-sm"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => setCreatedCredentials(null)}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default StaffManagement;
