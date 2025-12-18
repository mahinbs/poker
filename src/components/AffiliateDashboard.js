import React, { useState } from 'react';

const AffiliateDashboard = () => {
    const [copied, setCopied] = useState(false);

    // Mock data
    const referralCode = "POKERKING2025";
    const referrals = [
        { id: 1, name: "Rahul Sharma", joinedAt: "2024-12-10", status: "Active" },
        { id: 2, name: "Anita Desai", joinedAt: "2024-12-12", status: "Playing" },
        { id: 3, name: "Vikram Singh", joinedAt: "2024-12-15", status: "Inactive" },
        { id: 4, name: "Priya Patel", joinedAt: "2024-12-18", status: "Active" },
        { id: 5, name: "Arjun Kumar", joinedAt: "2024-12-18", status: "Pending Deposit" },
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Affiliate Dashboard
                </h1>
                <div className="text-slate-400">Welcome, Partner</div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Referral Code Section */}
                <div className="col-span-1 md:col-span-2 bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <h2 className="text-xl text-slate-400 mb-4 z-10">Your Unique Referral Code</h2>
                    <div className="flex items-center gap-4 z-10">
                        <div className="text-5xl md:text-6xl font-black tracking-wider text-white drop-shadow-lg font-mono">
                            {referralCode}
                        </div>
                        <button
                            onClick={handleCopy}
                            className="p-3 rounded-full bg-slate-700 hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            title="Copy Code"
                        >
                            {copied ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 z-10">Share this code with new players to earn rewards.</p>
                </div>

                {/* Stats Section */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                    <h3 className="text-lg font-semibold text-slate-300 mb-4">Performance Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-700/50 p-4 rounded-xl">
                            <div className="text-sm text-slate-400">Total Referrals</div>
                            <div className="text-3xl font-bold text-white mt-1">{referrals.length}</div>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-xl">
                            <div className="text-sm text-slate-400">Active Players</div>
                            <div className="text-3xl font-bold text-green-400 mt-1">
                                {referrals.filter(r => r.status === 'Active' || r.status === 'Playing').length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity / List */}
                <div className="col-span-1 md:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">Referred Players</h3>
                        <span className="text-xs font-medium px-2 py-1 bg-blue-900/50 text-blue-300 rounded-md border border-blue-800">
                            Latest 5
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Player Name</th>
                                    <th className="px-6 py-4 font-medium">Joined Date</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {referrals.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 text-slate-200 font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                {user.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {new Date(user.joinedAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${user.status === 'Active' || user.status === 'Playing'
                                                    ? 'bg-green-900/30 text-green-400 border-green-800'
                                                    : user.status === 'Pending Deposit'
                                                        ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800'
                                                        : 'bg-slate-800 text-slate-400 border-slate-700'
                                                }
                      `}>
                                                {user.status === 'Active' || user.status === 'Playing' ? (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                                                ) : null}
                                                {user.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {referrals.length === 0 && (
                        <div className="p-12 text-center text-slate-500">
                            No referrals yet. Share your code to get started!
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AffiliateDashboard;
