import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-9xl font-bold text-red-500 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-6">
          The page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
}

