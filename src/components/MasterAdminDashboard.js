import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingHeader from './BrandingHeader';

export default function MasterAdminDashboard() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [clubs, setClubs] = useState([
    { id: 'club-01', name: 'Emerald Poker Mumbai', location: 'Mumbai, IN', rummyEnabled: false, subscription: 'active', terms: '', logoUrl: '', videoUrl: '' },
    { id: 'club-02', name: 'Teal Poker Bangalore', location: 'Bengaluru, IN', rummyEnabled: true, subscription: 'active', terms: '', logoUrl: '', videoUrl: '' },
    { id: 'club-03', name: 'Cyan Poker Delhi', location: 'Delhi, IN', rummyEnabled: false, subscription: 'paused', terms: '', logoUrl: '', videoUrl: '' },
  ]);
  const [selectedClubId, setSelectedClubId] = useState('club-01');
  const selectedClub = clubs.find(c => c.id === selectedClubId) || clubs[0];

  const [rummyTables, setRummyTables] = useState([
    { id: 'rt-1', clubId: 'club-02', name: 'Table A', variant: 'Points Rummy', maxPlayers: 6, running: true, rakeEntries: [200, 150], players: [
      { id: 'P001', name: 'John', balance: 2500, inSeat: true },
      { id: 'P002', name: 'Jane', balance: 1800, inSeat: true },
    ]},
  ]);
  const [vipProducts, setVipProducts] = useState([
    { id: 'vip-1', clubId: 'club-01', title: 'VIP Hoodie', points: 1500 },
    { id: 'vip-2', clubId: 'club-01', title: 'Free Dinner', points: 800 },
  ]);
  const navigate = useNavigate();

  const menuItems = [
    'Dashboard',
    'Clubs Management',
    'Rummy Settings',
    'VIP Store',
    'Terms & Conditions',
    'Subscriptions',
    'Branding & Media',
    'Clients Management',
    'White-label Settings',
    'Analytics',
    'FNB Portal',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white font-sans">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid grid-cols-12 gap-8">
        <aside className="col-span-12 lg:col-span-3 xl:col-span-3 rounded-2xl bg-gradient-to-b from-emerald-500/20 via-teal-600/30 to-cyan-700/30 p-5 shadow-lg border border-gray-800 min-w-0">
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

        <main className="col-span-12 lg:col-span-9 xl:col-span-9 space-y-8">
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
                    {clubs.map((club) => (
                      <div key={club.id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                        <div className="text-white">{club.name} <span className="text-xs text-white/60">• {club.subscription}</span></div>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedClubId(club.id)} className={`px-3 py-1 rounded text-sm ${selectedClubId===club.id?'bg-emerald-600':'bg-blue-600 hover:bg-blue-500'} text-white`}>{selectedClubId===club.id?'Selected':'Select'}</button>
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

          {activeItem === 'Rummy Settings' && (
            <section className="p-6 bg-gradient-to-r from-emerald-600/30 via-teal-500/20 to-cyan-700/30 rounded-xl shadow-md border border-emerald-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Rummy Mode & Tables</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Club Selection</h3>
                  <select value={selectedClubId} onChange={(e)=>setSelectedClubId(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="mt-4 flex items-center justify-between bg-white/5 p-3 rounded">
                    <span className="text-white">Enable Rummy for this club</span>
                    <button onClick={()=>setClubs(prev=>prev.map(c=>c.id===selectedClubId?{...c,rummyEnabled:!c.rummyEnabled}:c))} className={`${selectedClub?.rummyEnabled?'bg-emerald-600':'bg-gray-600'} hover:opacity-90 text-white px-3 py-1 rounded text-sm`}>
                      {selectedClub?.rummyEnabled?'Enabled':'Disabled'}
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-white/80">
                    When enabled, UI labels like “Poker Table” become “Rummy Table”, table shape switches to round, and variants are available.
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Create Rummy Table</h3>
                  <div className="space-y-3">
                    <input id="rt-name" type="text" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Custom Table Name (optional)" />
                    <select id="rt-variant" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                      {['Points Rummy','Pool Rummy','Deals Rummy','Gin Rummy','Indian Rummy - Jackpot','Indian Rummy - Stake','21-Card Rummy - Jackpot','21-Card Rummy - Stake','500 Rummy','Kalooki Rummy','Custom'].map(v => <option key={v}>{v}</option>)}
                    </select>
                    <input id="rt-max" type="number" min="2" max="8" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Players (2-8)" />
                    <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold" onClick={()=>{
                      const nameInput = document.getElementById('rt-name');
                      const variantSelect = document.getElementById('rt-variant');
                      const maxInput = document.getElementById('rt-max');
                      const name = nameInput && 'value' in nameInput ? nameInput.value : '';
                      const variant = variantSelect && 'value' in variantSelect ? variantSelect.value : 'Points Rummy';
                      const max = maxInput && 'value' in maxInput ? Math.max(2, Math.min(8, parseInt(maxInput.value || '6', 10))) : 6;
                      const id = `rt-${Date.now()}`;
                      setRummyTables(prev => [...prev, { id, clubId: selectedClubId, name: name || 'Rummy Table', variant, maxPlayers: max, running: true, rakeEntries: [], players: [] }]);
                    }}>Create Table</button>
                    <div className="text-xs text-white/70">
                      Standard group sizes: Gin Rummy 2 players; Indian/Pool/Deals typically 2–6; 500 Rummy 2–8 (3–5 common).
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Round Table Preview</h3>
                  <div className="relative w-full aspect-square bg-white/5 rounded-full border border-white/20 flex items-center justify-center">
                    <div className="text-white/80 text-sm">Rummy Table (Round)</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Running Tables (Rake & Balances)</h3>
                <div className="space-y-3">
                  {rummyTables.filter(t=>t.clubId===selectedClubId).map(t => {
                    const totalRake = t.rakeEntries.reduce((a,b)=>a+b,0);
                    return (
                      <div key={t.id} className="bg-white/5 p-3 rounded border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="text-white font-semibold">{t.name} • {t.variant} • {t.maxPlayers}P</div>
                          <div className="text-white/80 text-sm">Rake Total: ₹{totalRake.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-3">
                          <div className="bg-white/5 p-3 rounded">
                            <div className="text-white text-sm font-semibold mb-2">Add Rake Entry</div>
                            <div className="flex gap-2">
                              <input id={`rake-${t.id}`} type="number" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Amount" />
                              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded" onClick={()=>{
                                const el = document.getElementById(`rake-${t.id}`);
                                const amt = el && 'value' in el ? parseInt(el.value || '0', 10) : 0;
                                if (!isNaN(amt) && amt>0) setRummyTables(prev=>prev.map(x=>x.id===t.id?{...x, rakeEntries:[...x.rakeEntries, amt]}:x));
                              }}>Add</button>
                            </div>
                          </div>
                          <div className="bg-white/5 p-3 rounded">
                            <div className="text-white text-sm font-semibold mb-2">Players & Balances</div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {t.players.map(p => (
                                <div key={p.id} className="flex items-center justify-between">
                                  <div className="text-white text-sm">{p.name} • ₹{p.balance.toLocaleString('en-IN')} {p.inSeat? '' : '(Left)'}</div>
                                  <div className="flex gap-1">
                                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs" onClick={()=>setRummyTables(prev=>prev.map(x=>x.id===t.id?{...x, players:x.players.map(pp=>pp.id===p.id?{...pp, balance: pp.balance+100}:pp)}:x))}>+100</button>
                                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs" onClick={()=>setRummyTables(prev=>prev.map(x=>x.id===t.id?{...x, players:x.players.map(pp=>pp.id===p.id?{...pp, balance: pp.balance-100}:pp)}:x))}>-100</button>
                                    {p.inSeat && (
                                      <button className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs" onClick={()=>setRummyTables(prev=>prev.map(x=>x.id===t.id?{...x, players:x.players.map(pp=>pp.id===p.id?{...pp, inSeat:false}:pp)}:x))}>Leave</button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="bg-white/5 p-3 rounded">
                            <div className="text-white text-sm font-semibold mb-2">Close & Send Rake</div>
                            <div className="text-white/80 text-xs mb-2">On table end, verify total against entries and send to cashier.</div>
                            <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded text-sm">Send Final Rake</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {activeItem === 'VIP Store' && (
            <section className="p-6 bg-gradient-to-r from-purple-600/30 via-pink-500/20 to-red-700/30 rounded-xl shadow-md border border-purple-800/40">
              <h2 className="text-xl font-bold text-white mb-6">VIP Store</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Products (Club)</h3>
                  <div className="flex gap-2 mb-3">
                    <input id="vip-title" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Product name" />
                    <input id="vip-points" type="number" className="w-32 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Points" />
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded" onClick={()=>{
                      const t = document.getElementById('vip-title');
                      const p = document.getElementById('vip-points');
                      const title = t && 'value' in t ? t.value : '';
                      const pts = p && 'value' in p ? parseInt(p.value||'0',10) : 0;
                      if (title.trim() && pts>0) setVipProducts(prev=>[...prev,{ id:`vip-${Date.now()}`, clubId:selectedClubId, title, points: pts }]);
                    }}>Add</button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {vipProducts.filter(v=>v.clubId===selectedClubId).map(v => (
                      <div key={v.id} className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                        <div className="text-white text-sm">{v.title}</div>
                        <div className="text-white/80 text-xs">{v.points} pts</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Points Calculator</h3>
                  <div className="space-y-3">
                    <input id="calc-buyin" type="number" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Buy-in total" />
                    <input id="calc-hours" type="number" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Hours played" />
                    <input id="calc-visits" type="number" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Visit frequency" />
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold" onClick={()=>{
                      const b=document.getElementById('calc-buyin');
                      const h=document.getElementById('calc-hours');
                      const v=document.getElementById('calc-visits');
                      const buyin = b && 'value' in b ? parseFloat(b.value||'0') : 0;
                      const hours = h && 'value' in h ? parseFloat(h.value||'0') : 0;
                      const visits = v && 'value' in v ? parseFloat(v.value||'0') : 0;
                      const points = (buyin*0.5)+(hours*0.3)+(visits*0.2);
                      alert(`Estimated Points: ${Math.round(points)}`);
                    }}>Calculate (Default)</button>
                    <div className="text-xs text-white/70">Default formula: (Buy-in x 0.5) + (Hours x 0.3) + (Visits x 0.2)</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeItem === 'Terms & Conditions' && (
            <section className="p-6 bg-gradient-to-r from-gray-600/30 via-slate-500/20 to-gray-700/30 rounded-xl shadow-md border border-gray-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Terms & Conditions (Per Club)</h2>
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <select value={selectedClubId} onChange={(e)=>setSelectedClubId(e.target.value)} className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input id="tnc-link" type="url" className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Optional public URL" />
                  <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded">Upload / Save</button>
                </div>
                <textarea id="tnc-text" className="w-full mt-3 px-3 py-2 bg-white/10 border border-white/20 rounded text-white" rows="6" placeholder="Paste Terms & Conditions here..." onBlur={()=>{
                  const area=document.getElementById('tnc-text');
                  const value = area && 'value' in area ? area.value : '';
                  setClubs(prev=>prev.map(c=>c.id===selectedClubId?{...c, terms:value}:c));
                }}></textarea>
                <div className="text-xs text-white/60 mt-2">Only Master Admin can manage club T&C.</div>
              </div>
            </section>
          )}

          {activeItem === 'Subscriptions' && (
            <section className="p-6 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-orange-700/30 rounded-xl shadow-md border border-amber-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Subscriptions</h2>
              <div className="space-y-2">
                {clubs.map(c => (
                  <div key={c.id} className="bg-white/10 p-3 rounded flex items-center justify-between">
                    <div className="text-white text-sm">{c.name} • <span className="text-white/70">{c.subscription}</span></div>
                    <div className="flex gap-2">
                      <button className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm" onClick={()=>setClubs(prev=>prev.map(x=>x.id===c.id?{...x, subscription:'killed'}:x))}>Kill</button>
                      <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm" onClick={()=>setClubs(prev=>prev.map(x=>x.id===c.id?{...x, subscription:'active'}:x))}>Activate</button>
                      <button className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm" onClick={()=>setClubs(prev=>prev.map(x=>x.id===c.id?{...x, subscription:'paused'}:x))}>Pause</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeItem === 'Branding & Media' && (
            <section className="p-6 bg-gradient-to-r from-indigo-600/30 via-purple-500/20 to-pink-700/30 rounded-xl shadow-md border border-indigo-800/40">
              <h2 className="text-xl font-bold text-white mb-6">Branding & Media (Per Club)</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Media Settings</h3>
                  <div className="space-y-3">
                    <select value={selectedClubId} onChange={(e)=>setSelectedClubId(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white">
                      {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input id="club-logo" type="url" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Logo URL (png)" />
                    <input id="club-video" type="url" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white" placeholder="Promo Video URL (mp4)" />
                    <div className="flex gap-2">
                      <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold" onClick={()=>{
                        const logo=document.getElementById('club-logo');
                        const video=document.getElementById('club-video');
                        const logoUrl = logo && 'value' in logo ? logo.value : '';
                        const videoUrl = video && 'value' in video ? video.value : '';
                        setClubs(prev=>prev.map(c=>c.id===selectedClubId?{...c, logoUrl, videoUrl}:c));
                      }}>Save</button>
                      <button className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold" onClick={()=>{
                        if (!window.confirm('Reset all player-facing data for this club?')) return;
                        setClubs(prev=>prev.map(c=>c.id===selectedClubId?{...c, terms:'', logoUrl:'', videoUrl:''}:c));
                      }}>Data Reset</button>
                    </div>
                    <div className="text-xs text-white/70">Only Master Admin can change logo/video/skin.</div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                  <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-600 via-green-500 to-yellow-400 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-white/20 border border-white/30 flex items-center justify-center">{selectedClub?.logoUrl? 'IMG' : 'LOGO'}</div>
                      <div className="text-white font-bold text-xl">{selectedClub?.name}</div>
                    </div>
                    <p className="text-white/80 text-sm mt-3">{selectedClub?.videoUrl? 'Video attached' : 'No video set'}</p>
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


