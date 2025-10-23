import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingHeader from './BrandingHeader';

export default function MasterAdminDashboard() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const navigate = useNavigate();

  const menuItems = [
    'Dashboard',
    'Clubs Management',
    'Clients Management',
    'White-label Settings',
    'Reports',
    'FNB Portal',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2 rounded-2xl bg-gradient-to-b from-emerald-500/20 via-teal-600/30 to-cyan-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-lg mb-6">
            Master Admin
          </div>
          <div className="flex items-center mb-6 text-white min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-gray-900 font-bold text-sm">MA</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold truncate">Client Super Admin</div>
              <div className="text-sm opacity-80 truncate">master@client.com</div>
            </div>
          </div>
          <nav className="space-y-3">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  if (item === 'FNB Portal') { navigate('/fnb/signin'); return; }
                  setActiveItem(item);
                }}
                className={`w-full text-left rounded-xl px-4 py-3 font-medium transition-all duration-300 shadow-md ${
                  activeItem === item
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-600 text-gray-900 font-bold shadow-lg scale-[1.02]'
                    : 'bg-white/5 hover:bg-gradient-to-r hover:from-emerald-400/20 hover:to-cyan-500/20 text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="col-span-12 lg:col-span-9 xl:col-span-10 space-y-8">
          <BrandingHeader title={`Master Admin - ${activeItem}`} subtitle="White-label control center" />

          {activeItem === 'Dashboard' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: 'Total Clubs', value: '12', color: 'from-emerald-400 via-teal-500 to-cyan-500' },
                  { title: 'Total Clients', value: '2,430', color: 'from-blue-400 via-indigo-500 to-purple-500' },
                  { title: 'Active Clubs', value: '9', color: 'from-green-400 via-emerald-500 to-teal-500' },
                  { title: 'Monthly Revenue', value: '₹3,42,120', color: 'from-yellow-400 via-orange-500 to-red-500' },
                ].map((card) => (
                  <div key={card.title} className={`p-6 rounded-xl bg-gradient-to-br ${card.color} text-gray-900 shadow-lg transition-transform transform hover:scale-105`}>
                    <div className="text-sm opacity-90 text-white/90">{card.title}</div>
                    <div className="text-3xl font-bold mt-2 text-white">{card.value}</div>
                    <div className="text-xs mt-1 text-white/70">Updated just now</div>
                  </div>
                ))}
              </div>

              <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-teal-500/20 to-cyan-700/30 rounded-xl shadow-md border border-emerald-800/40">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Create Club</button>
                  <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Invite Client</button>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Generate Report</button>
                  <button onClick={() => navigate('/fnb/signin')} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-5 py-3 rounded-xl font-semibold shadow transition">Open FNB Portal</button>
                </div>
              </section>
            </>
          )}

          {activeItem === 'Clubs Management' && (
            <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-teal-500/20 to-cyan-700/30 rounded-xl shadow-md border border-emerald-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Clubs Management</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Create New Club</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm">Club Name</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter club name" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Location</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="City, Country" />
                    </div>
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold shadow">Create Club</button>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Existing Clubs</h3>
                  <div className="space-y-2">
                    {['Emerald Poker Mumbai', 'Teal Poker Bangalore', 'Cyan Poker Delhi'].map((club) => (
                      <div key={club} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                        <div className="text-white">{club}</div>
                        <div className="flex gap-2">
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                          <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">Manage</button>
                          <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeItem === 'Clients Management' && (
            <section className="p-6 bg-gradient-to-r from-blue-600/30 via-indigo-500/20 to-purple-700/30 rounded-xl shadow-md border border-blue-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Clients Management</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Invite Client</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm">Client Email</label>
                      <input type="email" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="client@example.com" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Assign Club</label>
                      <select className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                        <option>Emerald Poker Mumbai</option>
                        <option>Teal Poker Bangalore</option>
                        <option>Cyan Poker Delhi</option>
                      </select>
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold shadow">Send Invite</button>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Client Directory</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'Rohit Sharma', club: 'Emerald Poker Mumbai' },
                      { name: 'Ananya Rao', club: 'Teal Poker Bangalore' },
                      { name: 'Aman Khan', club: 'Cyan Poker Delhi' },
                    ].map((client) => (
                      <div key={client.name} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                        <div className="text-white">
                          <div className="font-semibold">{client.name}</div>
                          <div className="text-xs text-gray-300">{client.club}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                          <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm">Reassign</button>
                          <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeItem === 'White-label Settings' && (
            <section className="p-6 bg-gradient-to-r from-gray-600/30 via-slate-500/20 to-gray-700/30 rounded-xl shadow-md border border-gray-800/40">
              <h2 className="text-xl font-bold text-white mb-6">White-label Settings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Brand Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm">Brand Name</label>
                      <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Enter brand name" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Primary Color</label>
                      <input type="color" className="w-full h-10 mt-1 bg-white/10 border border-white/20 rounded" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Secondary Color</label>
                      <input type="color" className="w-full h-10 mt-1 bg-white/10 border border-white/20 rounded" />
                    </div>
                    <div>
                      <label className="text-white text-sm">Logo URL (optional)</label>
                      <input type="url" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="https://example.com/logo.png" />
                    </div>
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold shadow">Save Settings</button>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Brand Preview</h3>
                  <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-600 via-green-500 to-yellow-400 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-white/20 border border-white/30 flex items-center justify-center">LOGO</div>
                      <div className="text-white font-bold text-xl">Brand Name</div>
                    </div>
                    <p className="text-white/80 text-sm mt-3">This is a live preview of your white-label header.</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeItem === 'Reports' && (
            <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Reports</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Club Activity</h3>
                  <div className="space-y-2">
                    <div className="bg-white/5 p-3 rounded">
                      <div className="text-sm text-gray-300">Active Clubs Today: 9</div>
                      <div className="text-sm text-gray-300">New Clients This Week: 42</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Revenue</h3>
                  <div className="space-y-2">
                    <div className="bg-white/5 p-3 rounded">
                      <div className="text-sm text-gray-300">Today: ₹14,520</div>
                      <div className="text-sm text-gray-300">This Week: ₹92,330</div>
                      <div className="text-sm text-gray-300">This Month: ₹3,42,120</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Exports</h3>
                  <div className="space-y-2">
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm">Export CSV</button>
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm">Export PDF</button>
                    <button className="w-full bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded text-sm">Generate Report</button>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="flex gap-3">
            <button onClick={() => navigate('/manager')} className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow">Manager Portal</button>
            <button onClick={() => navigate('/admin/signin')} className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow">System Admin</button>
          </div>
        </main>
      </div>
    </div>
  );
}


