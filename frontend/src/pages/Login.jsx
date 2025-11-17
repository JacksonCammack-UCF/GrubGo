import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// ⭐ unified backend base URL
import API_BASE_URL from "../utils/api";

// ⭐ We still import login(), but do NOT call it here
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // keep imported, unused here (used in 2FA)

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState("");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleChange = (e) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.identifier,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Login failed.");
        return;
      }

      // ⭐ Backend sent OTP → go to 2FA
      if (data.status === "PENDING") {
        navigate("/login-2fa", {
          state: {
            userId: data.data.userId,
            email: data.data.email,
          },
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="flex items-center justify-center pt-32 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
          
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Log In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Identifier */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email or Username
              </label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Required"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg 
                focus-within:ring-2 focus-within:ring-yellow-400">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-l-lg focus:outline-none"
                  placeholder="Required"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-600 text-center text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-lg font-semibold 
              hover:bg-gray-800 transition"
            >
              Log In
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Don’t have an account?{" "}
            <a href="/signup" className="text-yellow-600 hover:underline">
              Sign Up
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}
