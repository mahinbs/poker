import React, { useState, useEffect } from "react";

export default function AffiliatesTable({ 
  affiliates = [], 
  onAffiliateClick = null,
  viewingAffiliate: externalViewingAffiliate = null,
  userRole = "admin"
}) {
  const [internalViewingAffiliate, setInternalViewingAffiliate] = useState(null);

  // Use external viewingAffiliate if provided, otherwise use internal state
  const viewingAffiliate = externalViewingAffiliate !== null ? externalViewingAffiliate : internalViewingAffiliate;

  useEffect(() => {
    // Sync with external state if provided
    if (externalViewingAffiliate !== null) {
      setInternalViewingAffiliate(null);
    }
  }, [externalViewingAffiliate]);

  const handleAffiliateClick = (affiliate) => {
    if (onAffiliateClick) {
      onAffiliateClick(affiliate);
    } else {
      setInternalViewingAffiliate(affiliate);
    }
  };

  const closeModal = () => {
    setInternalViewingAffiliate(null);
    if (onAffiliateClick) {
      onAffiliateClick(null);
    }
  };

  const currentViewingAffiliate = viewingAffiliate;

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Affiliates Table</h2>
          <div className="text-sm text-gray-400">
            Total Affiliates: <span className="text-white font-semibold">{affiliates.length}</span>
          </div>
        </div>

        {/* Affiliates Table */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 overflow-hidden">
          {affiliates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-gray-400 border-b border-gray-700 text-sm uppercase">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">KYC Status</th>
                    <th className="py-3 px-4">Referrals</th>
                    <th className="py-3 px-4">Earnings</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {affiliates.map((aff) => (
                    <tr
                      key={aff.id}
                      className="hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => handleAffiliateClick(aff)}
                    >
                      <td className="py-4 px-4 font-medium text-white">{aff.name}</td>
                      <td className="py-4 px-4 text-gray-400">{aff.email}</td>
                      <td className="py-4 px-4 font-mono text-yellow-500">
                        {aff.referralCode}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            aff.kycStatus === "Verified"
                              ? "bg-green-900/50 text-green-400"
                              : aff.kycStatus === "Pending"
                              ? "bg-yellow-900/50 text-yellow-400"
                              : "bg-red-900/50 text-red-400"
                          }`}
                        >
                          {aff.kycStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-blue-400">
                        {aff.totalReferrals || 0}
                      </td>
                      <td className="py-4 px-4 text-green-400">
                        ₹{(aff.earnings || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`w-2 h-2 inline-block rounded-full mr-2 ${
                            aff.status === "Active"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        ></span>
                        <span className="text-white">{aff.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-lg mb-2">No affiliates found</div>
              <div className="text-sm">No affiliate records available at this time.</div>
            </div>
          )}
        </div>
      </div>

      {/* Affiliate Details Modal */}
      {currentViewingAffiliate && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto">
          <div className="min-h-screen p-8 max-w-5xl mx-auto">
            <button
              onClick={closeModal}
              className="mb-6 text-gray-400 hover:text-white flex items-center gap-2"
            >
              ← Back to List
            </button>

            <div className="bg-gray-900 border border-t-4 border-t-indigo-500 rounded-2xl p-8 mb-8 shadow-2xl bg-gradient-to-r from-gray-900 to-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {currentViewingAffiliate.name}
                  </h2>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>
                      Ref Code:{" "}
                      <span className="text-yellow-400 font-mono">
                        {currentViewingAffiliate.referralCode}
                      </span>
                    </span>
                    <span>•</span>
                    <span>{currentViewingAffiliate.email}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Total Earnings</div>
                  <div className="text-3xl font-bold text-green-400">
                    ₹{(currentViewingAffiliate.earnings || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
                  <div className="text-xs text-gray-500 uppercase">KYC Status</div>
                  <div
                    className={`text-lg font-bold ${
                      currentViewingAffiliate.kycStatus === "Verified"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {currentViewingAffiliate.kycStatus}
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
                  <div className="text-xs text-gray-500 uppercase">Total Referrals</div>
                  <div className="text-lg font-bold text-blue-400">
                    {currentViewingAffiliate.totalReferrals || 0}
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
                  <div className="text-xs text-gray-500 uppercase">Status</div>
                  <div
                    className={`text-lg font-bold ${
                      currentViewingAffiliate.status === "Active"
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {currentViewingAffiliate.status}
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
                  <div className="text-xs text-gray-500 uppercase">Affiliate ID</div>
                  <div className="text-lg font-bold text-white">
                    {currentViewingAffiliate.id}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Referral Details</h3>
              <div className="space-y-4">
                <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
                  <div className="text-sm text-gray-400 mb-2">Referral Code</div>
                  <div className="text-lg font-mono text-yellow-400">
                    {currentViewingAffiliate.referralCode}
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
                  <div className="text-sm text-gray-400 mb-2">Email</div>
                  <div className="text-lg text-white">
                    {currentViewingAffiliate.email}
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
                  <div className="text-sm text-gray-400 mb-2">Total Earnings</div>
                  <div className="text-2xl font-bold text-green-400">
                    ₹{(currentViewingAffiliate.earnings || 0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

