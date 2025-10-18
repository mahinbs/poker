import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HrSignIn() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple authentication check
    if (credentials.email === "hr@pokerroom.com" && credentials.password === "hr123") {
      navigate("/hr");
    } else {
      setError("Invalid credentials. Use hr@pokerroom.com / hr123");
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-rose-400 drop-shadow-lg mb-4">
            HR Portal
          </div>
          <p className="text-gray-300">Human Resources Management System</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-8 shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Sign In to HR Portal
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <p className="text-purple-300 text-sm text-center">
              <strong>Demo Credentials:</strong><br />
              Email: hr@pokerroom.com<br />
              Password: hr123
            </p>
          </div>

          {/* Navigation Links */}
          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => navigate("/manager")}
              className="text-purple-400 hover:text-purple-300 text-sm underline block"
            >
              ← Back to Manager Portal
            </button>
            <button
              onClick={() => navigate("/gre/signin")}
              className="text-blue-400 hover:text-blue-300 text-sm underline block"
            >
              ← GRE Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
