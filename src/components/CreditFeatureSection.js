import React, { useState } from "react";

export default function CreditFeatureSection({
  userRole = "superadmin", // "superadmin" or "cashier"
  creditRequests = [],
  setCreditRequests,
  creditFeatureRequests = [],
  setCreditFeatureRequests,
  creditDisbursements = [],
  setCreditDisbursements,
  approveCredit,
  denyCredit,
  forcedTab = null, // If set, force this tab to be active and hide others
}) {
  const [activeCreditTab, setActiveCreditTab] = useState(
    forcedTab || "limit-approval"
  );

  // If forcedTab is set, always use it and don't allow switching
  const effectiveTab = forcedTab || activeCreditTab;
  const showTabs = !forcedTab; // Hide tab navigation if forcedTab is set

  return (
    <div className="space-y-6">
      <section className="p-6 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-orange-700/30 rounded-xl shadow-md border border-amber-800/40">
        <h2 className="text-xl font-bold text-white mb-6">
          Credit Feature Management
        </h2>

        {/* Tab Navigation - Only show if not forced */}
        {showTabs && (
          <div className="flex gap-2 mb-6 border-b border-white/20">
            {userRole === "superadmin" && (
              <>
                <button
                  onClick={() => setActiveCreditTab("limit-approval")}
                  className={`px-6 py-3 font-semibold transition-all ${
                    effectiveTab === "limit-approval"
                      ? "bg-amber-500/30 text-white border-b-2 border-amber-400"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Credit Limit Approval
                </button>
                <button
                  onClick={() => setActiveCreditTab("feature-approval")}
                  className={`px-6 py-3 font-semibold transition-all ${
                    effectiveTab === "feature-approval"
                      ? "bg-amber-500/30 text-white border-b-2 border-amber-400"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Credit Feature Approval (1st Time)
                </button>
              </>
            )}
            <button
              onClick={() => setActiveCreditTab("disbursement")}
              className={`px-6 py-3 font-semibold transition-all ${
                effectiveTab === "disbursement"
                  ? "bg-amber-500/30 text-white border-b-2 border-amber-400"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              Credit Disbursement in Chips
            </button>
          </div>
        )}

        {/* Tab Content */}
        {effectiveTab === "limit-approval" && userRole === "superadmin" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Pending Credit Limit Requests
                </h3>
                <div className="space-y-2">
                  {creditRequests.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white/5 p-3 rounded border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold">
                          {r.player} • ₹{r.amount.toLocaleString("en-IN")}
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            r.status === "Approved"
                              ? "bg-green-500/30 text-green-300"
                              : r.status === "Denied"
                              ? "bg-red-500/30 text-red-300"
                              : "bg-yellow-500/30 text-yellow-300"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
                          onClick={() => approveCredit && approveCredit(r.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                          onClick={() => denyCredit && denyCredit(r.id)}
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Dynamic Visibility & Limits
                </h3>
                <div className="space-y-3">
                  {creditRequests.map((r) => (
                    <div
                      key={`${r.id}-ctl`}
                      className="bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between"
                    >
                      <div className="text-white text-sm">
                        <div className="font-semibold">{r.player}</div>
                        <div className="text-white/70">
                          Visible: {r.visibleToPlayer ? "Yes" : "No"} • Limit: ₹
                          {r.limit.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                          onClick={() =>
                            setCreditRequests &&
                            setCreditRequests((prev) =>
                              prev.map((x) =>
                                x.id === r.id
                                  ? {
                                      ...x,
                                      visibleToPlayer: !x.visibleToPlayer,
                                    }
                                  : x
                              )
                            )
                          }
                        >
                          {r.visibleToPlayer ? "Hide" : "Show"}
                        </button>
                        <input
                          type="number"
                          className="w-28 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                          placeholder="Set limit"
                          onChange={(e) =>
                            setCreditRequests &&
                            setCreditRequests((prev) =>
                              prev.map((x) =>
                                x.id === r.id
                                  ? {
                                      ...x,
                                      limit: Number(e.target.value) || 0,
                                    }
                                  : x
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {effectiveTab === "feature-approval" && userRole === "superadmin" && (
          <div className="space-y-6">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">
                First Time Credit Feature Approval Requests
              </h3>
              <div className="space-y-3">
                {creditFeatureRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white/5 p-4 rounded-lg border border-white/10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-white font-semibold text-lg mb-2">
                          {request.player}
                        </div>
                        <div className="space-y-1 text-sm text-gray-300">
                          <div>ID: {request.playerId}</div>
                          <div>Email: {request.email}</div>
                          <div>Phone: {request.phone}</div>
                          <div>
                            Requested:{" "}
                            {new Date(
                              request.requestedDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              request.kycStatus === "Approved"
                                ? "bg-green-500/30 text-green-300"
                                : "bg-yellow-500/30 text-yellow-300"
                            }`}
                          >
                            KYC: {request.kycStatus}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              request.accountStatus === "Active"
                                ? "bg-blue-500/30 text-blue-300"
                                : "bg-gray-500/30 text-gray-300"
                            }`}
                          >
                            Account: {request.accountStatus}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              request.status === "Pending"
                                ? "bg-yellow-500/30 text-yellow-300"
                                : request.status === "Approved"
                                ? "bg-green-500/30 text-green-300"
                                : "bg-red-500/30 text-red-300"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                        {request.status === "Pending" && (
                          <div className="flex gap-2 mt-2">
                            <button
                              className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm font-semibold"
                              onClick={() => {
                                if (setCreditFeatureRequests) {
                                  setCreditFeatureRequests((prev) =>
                                    prev.map((r) =>
                                      r.id === request.id
                                        ? { ...r, status: "Approved" }
                                        : r
                                    )
                                  );
                                  alert(
                                    `Credit feature approved for ${request.player}`
                                  );
                                }
                              }}
                            >
                              Approve Credit Feature
                            </button>
                            <button
                              className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded text-sm font-semibold"
                              onClick={() => {
                                const reason = prompt("Enter rejection reason:");
                                if (reason !== null && setCreditFeatureRequests) {
                                  setCreditFeatureRequests((prev) =>
                                    prev.map((r) =>
                                      r.id === request.id
                                        ? {
                                            ...r,
                                            status: "Rejected",
                                            rejectionReason: reason,
                                          }
                                        : r
                                    )
                                  );
                                  alert(
                                    `Credit feature rejected for ${request.player}`
                                  );
                                }
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {effectiveTab === "disbursement" && (
          <div className="space-y-6">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">
                Credit Disbursement in Chips
              </h3>
              <div className="space-y-3">
                {creditDisbursements.map((disbursement) => (
                  <div
                    key={disbursement.id}
                    className="bg-white/5 p-4 rounded-lg border border-white/10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-white font-semibold text-lg mb-2">
                          {disbursement.player}
                        </div>
                        <div className="space-y-1 text-sm text-gray-300">
                          <div>ID: {disbursement.playerId}</div>
                          <div>
                            Requested:{" "}
                            {new Date(
                              disbursement.requestedDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-400">Approved Limit:</span>{" "}
                          <span className="text-white font-semibold">
                            ₹
                            {disbursement.approvedLimit.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">Current Balance:</span>{" "}
                          <span className="text-white font-semibold">
                            ₹
                            {disbursement.currentBalance.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">
                            Requested Amount:
                          </span>{" "}
                          <span className="text-yellow-300 font-semibold">
                            ₹
                            {disbursement.requestedAmount.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">
                            Available Credit:
                          </span>{" "}
                          <span className="text-green-300 font-semibold">
                            ₹
                            {(
                              disbursement.approvedLimit -
                              disbursement.currentBalance
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs text-center ${
                            disbursement.status === "Pending"
                              ? "bg-yellow-500/30 text-yellow-300"
                              : disbursement.status === "Approved"
                              ? "bg-green-500/30 text-green-300"
                              : "bg-red-500/30 text-red-300"
                          }`}
                        >
                          {disbursement.status}
                        </span>
                        {disbursement.status === "Pending" && (
                          <>
                            <button
                              className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm font-semibold"
                              onClick={() => {
                                if (setCreditDisbursements) {
                                  const available =
                                    disbursement.approvedLimit -
                                    disbursement.currentBalance;
                                  if (
                                    disbursement.requestedAmount > available
                                  ) {
                                    alert(
                                      `Insufficient credit limit. Available: ₹${available.toLocaleString(
                                        "en-IN"
                                      )}`
                                    );
                                    return;
                                  }
                                  setCreditDisbursements((prev) =>
                                    prev.map((d) =>
                                      d.id === disbursement.id
                                        ? {
                                            ...d,
                                            status: "Approved",
                                            currentBalance:
                                              d.currentBalance +
                                              d.requestedAmount,
                                          }
                                        : d
                                    )
                                  );
                                  alert(
                                    `Credit disbursed: ₹${disbursement.requestedAmount.toLocaleString(
                                      "en-IN"
                                    )} in chips for ${disbursement.player}`
                                  );
                                }
                              }}
                            >
                              Approve & Disburse
                            </button>
                            <button
                              className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded text-sm font-semibold"
                              onClick={() => {
                                const reason = prompt("Enter rejection reason:");
                                if (
                                  reason !== null &&
                                  setCreditDisbursements
                                ) {
                                  setCreditDisbursements((prev) =>
                                    prev.map((d) =>
                                      d.id === disbursement.id
                                        ? {
                                            ...d,
                                            status: "Rejected",
                                            notes: reason,
                                          }
                                        : d
                                    )
                                  );
                                  alert(
                                    `Disbursement rejected for ${disbursement.player}`
                                  );
                                }
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

