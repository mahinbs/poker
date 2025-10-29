import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SuperAdminPortal() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("Dashboard");

  const menuItems = useMemo(() => [
    "Dashboard",
    "Player Management",
    "Staff Management",
    "Credit Approvals",
    "Financial Overrides",
    "Waitlist & Seating Overrides",
    "Analytics & Reports",
    "Global Settings",
    "Logs & Audits",
    "System Control"
  ], []);

  const [players, setPlayers] = useState([
    { id: "P001", name: "John Doe", status: "Active" },
    { id: "P002", name: "Jane Smith", status: "Blocked" },
    { id: "P003", name: "Mike Johnson", status: "Active" }
  ]);

  const [staff, setStaff] = useState([
    { id: "S001", name: "Alice Brown", role: "GRE", status: "Active" },
    { id: "S002", name: "Bob Green", role: "Dealer", status: "Active" },
    { id: "S003", name: "Sara White", role: "Cashier", status: "Deactivated" }
  ]);

  const [creditRequests, setCreditRequests] = useState([
    { id: "CR-101", playerId: "P001", player: "John Doe", amount: 5000, status: "Pending", visibleToPlayer: false, limit: 0 },
    { id: "CR-102", playerId: "P003", player: "Mike Johnson", amount: 2500, status: "Pending", visibleToPlayer: false, limit: 0 }
  ]);

  const [transactions, setTransactions] = useState([
    { id: "TX-9001", type: "Deposit", player: "John Doe", amount: 3000, status: "Completed" },
    { id: "TX-9002", type: "Cashout", player: "Jane Smith", amount: 1800, status: "Pending" },
    { id: "TX-9003", type: "Bonus", player: "Mike Johnson", amount: 500, status: "Completed" }
  ]);

  const [waitlist, setWaitlist] = useState([
    { pos: 1, player: "Alex Johnson", game: "Hold'em" },
    { pos: 2, player: "Maria Garcia", game: "Omaha" }
  ]);

  const approveCredit = (id) => {
    setCreditRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "Approved", visibleToPlayer: true, limit: r.amount } : r));
  };

  const denyCredit = (id) => {
    setCreditRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "Denied", visibleToPlayer: false, limit: 0 } : r));
  };

  const togglePlayerStatus = (playerId, nextStatus) => {
    setPlayers((prev) => prev.map((p) => p.id === playerId ? { ...p, status: nextStatus } : p));
  };

  const addStaff = (name, role) => {
    const id = `S${(Math.random()*10000|0).toString().padStart(3,'0')}`;
    setStaff((prev) => [...prev, { id, name, role, status: "Active" }]);
  };

  const deactivateStaff = (id) => {
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, status: "Deactivated" } : s));
  };

  const factoryReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1600px] px-6 py-10 grid grid-cols-12 gap-8">
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-red-500/20 via-purple-600/30 to-indigo-700/30 p-5 shadow-lg border border-gray-800">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-300 to-indigo-400 drop-shadow-lg mb-6">
            Super Admin
          </div>
          <div className="bg-white/10 rounded-xl p-4 mb-6 text-white shadow-inner">
            <div className="text-lg font-semibold">Root Administrator</div>
            <div className="text-sm opacity-80">super@admin.com</div>
          </div>
          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md ${
                  activeItem === item
                    ? "bg-gradient-to-r from-red-400 to-purple-600 text-white font-bold shadow-lg scale-[1.02]"
                    : "bg-white/5 hover:bg-gradient-to-r hover:from-red-400/20 hover:to-purple-500/20 text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="col-span-12 lg:col-span-9 xl:col-span-9 space-y-8">
          <header className="bg-gradient-to-r from-red-600 via-purple-500 to-indigo-400 p-6 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Super Admin - {activeItem}</h1>
              <p className="text-gray-200 mt-1">Ultimate control: players, staff, credit, overrides and more</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/manager")} className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Manager</button>
              <button onClick={() => navigate("/master-admin")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Master Admin</button>
              <button onClick={() => navigate("/admin")} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Admin</button>
              <button onClick={() => navigate("/super-admin/signin")} className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Sign Out</button>
            </div>
          </header>

          {activeItem === "Dashboard" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: "Total Players", value: players.length.toString(), color: "from-blue-400 via-indigo-500 to-purple-500" },
                  { title: "Active Staff", value: staff.filter(s=>s.status==='Active').length.toString(), color: "from-green-400 via-emerald-500 to-teal-500" },
                  { title: "Pending Credit", value: creditRequests.filter(r=>r.status==='Pending').length.toString(), color: "from-yellow-400 via-orange-500 to-red-500" },
                  { title: "Open Overrides", value: transactions.filter(t=>t.status!=='Completed').length.toString(), color: "from-pink-400 via-red-500 to-rose-500" },
                ].map((card) => (
                  <div key={card.title} className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}>
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Updated just now</div>
                  </div>
                ))}
              </div>

              <section className="p-6 bg-gradient-to-r from-purple-400/30 via-indigo-500/20 to-blue-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-400 hover:to-purple-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">New Staff</button>
                  <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Approve All Credits</button>
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Export Report</button>
                  <button className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white px-5 py-3 rounded-xl font-semibold shadow transition" onClick={factoryReset}>Factory Reset</button>
                </div>
              </section>
            </>
          )}

          {activeItem === "Player Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-green-600/30 via-emerald-500/20 to-teal-700/30 rounded-xl shadow-md border border-green-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Full Player Management</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="flex gap-2 mb-4">
                    <input type="text" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Search by Player ID/Name" />
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">Search</button>
                  </div>
                  <div className="space-y-2">
                    {players.map((p) => (
                      <div key={p.id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                        <div className="text-white">
                          <div className="font-semibold">{p.name} <span className="text-white/60 text-sm">({p.id})</span></div>
                          <div className="text-sm text-white/80">Status: {p.status}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">History</button>
                          {p.status !== 'Blocked' && (
                            <button onClick={() => togglePlayerStatus(p.id, 'Blocked')} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">Block</button>
                          )}
                          {p.status !== 'Active' && (
                            <button onClick={() => togglePlayerStatus(p.id, 'Active')} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">Unblock</button>
                          )}
                          <button onClick={() => togglePlayerStatus(p.id, 'Reset')} className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">Reset Status</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Staff Management" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Staff Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Add / Edit Staff</h3>
                    <div className="space-y-3">
                      <input type="text" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Full Name" id="new-staff-name" />
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" id="new-staff-role">
                        <option>GRE</option>
                        <option>Dealer</option>
                        <option>Cashier</option>
                        <option>HR</option>
                        <option>Manager</option>
                      </select>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold" onClick={() => {
                          const nameInput = document.getElementById('new-staff-name');
                          const roleSelect = document.getElementById('new-staff-role');
                          const name = nameInput && 'value' in nameInput ? nameInput.value : '';
                          const role = roleSelect && 'value' in roleSelect ? roleSelect.value : 'GRE';
                          if (typeof name === 'string' && name.trim()) addStaff(name, String(role));
                        }}>Add Staff</button>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">Edit Selected</button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Current Staff</h3>
                    <div className="space-y-2">
                      {staff.map((s) => (
                        <div key={s.id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="text-white">
                            <div className="font-semibold">{s.name} • {s.role}</div>
                            <div className="text-sm text-white/80">{s.id} • {s.status}</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">Assign Role</button>
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">Contracts</button>
                            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-sm">Performance</button>
                            {s.status !== 'Deactivated' && (
                              <button onClick={() => deactivateStaff(s.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">Deactivate</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Credit Approvals" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-orange-700/30 rounded-xl shadow-md border border-amber-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Exclusive Player Credit System</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Pending Requests</h3>
                    <div className="space-y-2">
                      {creditRequests.map((r) => (
                        <div key={r.id} className="bg-white/5 p-3 rounded border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="text-white font-semibold">{r.player} • ₹{r.amount.toLocaleString('en-IN')}</div>
                            <span className={`text-xs px-2 py-1 rounded ${r.status==='Approved'?'bg-green-500/30 text-green-300':r.status==='Denied'?'bg-red-500/30 text-red-300':'bg-yellow-500/30 text-yellow-300'}`}>{r.status}</span>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm" onClick={() => approveCredit(r.id)}>Approve</button>
                            <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm" onClick={() => denyCredit(r.id)}>Deny</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Dynamic Visibility & Limits</h3>
                    <div className="space-y-3">
                      {creditRequests.map((r) => (
                        <div key={`${r.id}-ctl`} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="text-white text-sm">
                            <div className="font-semibold">{r.player}</div>
                            <div className="text-white/70">Visible: {r.visibleToPlayer ? 'Yes' : 'No'} • Limit: ₹{r.limit.toLocaleString('en-IN')}</div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm" onClick={() => setCreditRequests(prev => prev.map(x => x.id===r.id ? { ...x, visibleToPlayer: !x.visibleToPlayer } : x))}>{r.visibleToPlayer ? 'Hide' : 'Show'}</button>
                            <input type="number" className="w-28 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="Set limit" onChange={(e) => setCreditRequests(prev => prev.map(x => x.id===r.id ? { ...x, limit: Number(e.target.value)||0 } : x))} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Financial Overrides" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-cyan-600/30 via-blue-500/20 to-indigo-700/30 rounded-xl shadow-md border border-cyan-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Financial Overrides</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Edit / Cancel Transactions</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {transactions.map((t) => (
                        <div key={t.id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                          <div className="text-white">
                            <div className="font-semibold">{t.type} • {t.player}</div>
                            <div className="text-sm text-white/70">{t.id} • ₹{t.amount.toLocaleString('en-IN')} • {t.status}</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                            <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm" onClick={() => setTransactions(prev => prev.filter(x => x.id !== t.id))}>Cancel</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Cashouts & Bonuses</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input type="text" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Player ID" />
                        <input type="number" className="w-32 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Amount" />
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">Process Cashout</button>
                        <button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold">Approve Bonus</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Waitlist & Seating Overrides" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-green-500/20 to-teal-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Waitlist & Seating Overrides</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Move Between Tables/Sessions</h3>
                    <div className="space-y-3">
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                        <option>Player: {waitlist[0]?.player || '—'}</option>
                        {waitlist.slice(1).map((w) => (
                          <option key={w.pos}>Player: {w.player}</option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <select className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>From: Table 1</option>
                          <option>From: Table 2</option>
                        </select>
                        <select className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>To: Table 3</option>
                          <option>To: Table 4</option>
                        </select>
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">Move Player</button>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Assign Seat</h3>
                    <div className="space-y-3">
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                        {waitlist.map((w) => (
                          <option key={`seat-${w.pos}`}>{w.player}</option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <select className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          <option>Table 1</option>
                          <option>Table 2</option>
                          <option>Table 3</option>
                        </select>
                        <select className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                          {[1,2,3,4,5,6,7,8].map(n => <option key={`seat-${n}`}>Seat {n}</option>)}
                        </select>
                      </div>
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">Assign Seat</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Analytics & Reports" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl shadow-md border border-indigo-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Full Analytics, Reporting & Export</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">KPIs</h3>
                    <div className="space-y-2">
                      <div className="bg-white/5 p-3 rounded">Active Players: {players.filter(p=>p.status==='Active').length}</div>
                      <div className="bg-white/5 p-3 rounded">Pending Credits: {creditRequests.filter(r=>r.status==='Pending').length}</div>
                      <div className="bg-white/5 p-3 rounded">Open Overrides: {transactions.filter(t=>t.status!=='Completed').length}</div>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Report Builder</h3>
                    <div className="space-y-3">
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                        <option>Revenue Report</option>
                        <option>Player Activity</option>
                        <option>Staff Performance</option>
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                        <input type="date" className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white" />
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">Generate</button>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Export</h3>
                    <div className="space-y-2">
                      <button className="w-full bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded">Export CSV</button>
                      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded">Export PDF</button>
                      <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded">Export XLSX</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Global Settings" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-gray-600/30 via-slate-500/20 to-zinc-700/30 rounded-xl shadow-md border border-gray-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Global Settings</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">General</h3>
                    <div className="space-y-3">
                      <input type="text" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Club Name" />
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                        <option>INR (₹)</option>
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                      </select>
                      <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                        <option>Asia/Kolkata</option>
                        <option>America/New_York</option>
                        <option>Europe/London</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Two-Factor Authentication</span>
                        <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm">Enable</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Session Timeout</span>
                        <select className="bg-white/10 border border-white/20 rounded text-white px-2 py-1">
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Password Rotation (days)</span>
                        <input type="number" className="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm" placeholder="90" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "Logs & Audits" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
                <h2 className="text-xl font-bold text-white mb-6">Audit Logs & Backups</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Audit Log</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {[
                        'User admin edited player P001',
                        'Cashout override approved by super admin',
                        'Backup completed successfully',
                        'Login failed for user jsmith'
                      ].map((line, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded border border-white/10 text-white/90 text-sm">{line}</div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Backup & Error Logs</h3>
                    <div className="space-y-3">
                      <div className="bg-white/5 p-3 rounded border border-white/10 text-white/90 text-sm">backup-2025-10-23-0200.tar.gz</div>
                      <div className="bg-white/5 p-3 rounded border border-white/10 text-white/90 text-sm">errors-2025-10-23.log</div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">Download Backup</button>
                        <button className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">Download Errors</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeItem === "System Control" && (
            <div className="space-y-6">
              <section className="p-6 bg-gradient-to-r from-gray-700/30 via-zinc-600/20 to-slate-700/30 rounded-xl shadow-md border border-gray-700/40">
                <h2 className="text-xl font-bold text-white mb-6">System Control</h2>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="space-y-3">
                    <p className="text-white/80">Factory Reset clears local data and resets the UI. Use with caution.</p>
                    <button onClick={factoryReset} className="w-full bg-red-700 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold">Factory Reset</button>
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


