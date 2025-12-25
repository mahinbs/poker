import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { FaExclamationTriangle, FaLock, FaTrashAlt } from 'react-icons/fa';

export default function SystemControl({ clubId }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const factoryResetMutation = useMutation({
    mutationFn: async ({ password, confirmationText }) => {
      return await apiRequest(`/clubs/${clubId}/system/factory-reset`, {
        method: 'POST',
        body: JSON.stringify({ password, confirmationText: confirmationText }),
      });
    },
    onSuccess: () => {
      alert('Factory reset completed successfully. All club data has been wiped. Please refresh the page.');
      window.location.reload();
    },
    onError: (error) => {
      setError(error.message || 'Failed to perform factory reset');
    },
  });

  const handleFactoryResetClick = () => {
    setError('');
    setPassword('');
    setConfirmText('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setShowPasswordModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (confirmText !== 'DELETE ALL DATA') {
      setError('Please type "DELETE ALL DATA" exactly to confirm');
      return;
    }
    
    factoryResetMutation.mutate({ password, confirmationText: confirmText });
    setShowConfirmModal(false);
  };

  const handleCancel = () => {
    setShowPasswordModal(false);
    setShowConfirmModal(false);
    setPassword('');
    setConfirmText('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">System Control</h1>
        <p className="text-gray-400">Dangerous operations that affect the entire club</p>
      </div>

      {/* Factory Reset Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-red-500/30">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-red-500/20 p-4 rounded-xl">
            <FaTrashAlt className="text-3xl text-red-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">Factory Reset</h2>
            <p className="text-gray-300 mb-4">
              Factory Reset clears local data and resets the UI. Use with caution.
            </p>
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-red-400 text-xl mt-0.5 flex-shrink-0" />
                <div className="text-red-200 text-sm">
                  <p className="font-semibold mb-2">⚠️ WARNING: This action is irreversible!</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>All players will be permanently deleted</li>
                    <li>All staff members will be removed</li>
                    <li>All financial records will be wiped</li>
                    <li>All transactions, bonuses, and credit data will be lost</li>
                    <li>All tables, waitlists, and tournaments will be deleted</li>
                    <li>All FNB orders, inventory, and suppliers will be removed</li>
                    <li>All chat history will be erased</li>
                    <li>The club will be reset to a completely blank state</li>
                  </ul>
                  <p className="mt-3 font-semibold">
                    This operation cannot be undone. All data will be permanently lost!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleFactoryResetClick}
          disabled={factoryResetMutation.isPending}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
        >
          {factoryResetMutation.isPending ? 'Processing...' : 'Factory Reset'}
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-500/20 p-3 rounded-xl">
                <FaLock className="text-2xl text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Verify Password</h3>
                <p className="text-gray-400 text-sm">Enter your password to continue</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {error && (
                <div className="mb-4 bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-red-500 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-500/20 p-3 rounded-xl">
                <FaExclamationTriangle className="text-2xl text-red-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Final Confirmation</h3>
                <p className="text-gray-400 text-sm">This action cannot be undone!</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
                <p className="text-red-200 text-sm font-semibold">
                  You are about to permanently delete ALL club data!
                </p>
              </div>
              <p className="text-white mb-4">
                To confirm, type <span className="font-bold text-red-400">DELETE ALL DATA</span> below:
              </p>
              <form onSubmit={handleConfirmSubmit}>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type: DELETE ALL DATA"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                  autoFocus
                />

                {error && (
                  <div className="mb-4 bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={factoryResetMutation.isPending || confirmText !== 'DELETE ALL DATA'}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
                  >
                    {factoryResetMutation.isPending ? 'Deleting...' : 'Delete Everything'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

