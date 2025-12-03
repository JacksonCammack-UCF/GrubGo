import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// ⭐ NEW: bring in auth context (we will use it in Login2FA)
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  // ⭐ NEW: bring login() into this file,
  // but DO NOT CALL it yet. It's used in Login2FA after OTP validation.
  const { login } = useAuth();

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
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: formData.identifier,
            password: formData.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Login failed.");
        return;
      }

      // ⭐ SUCCESS → OTP email sent → move to 2FA (do NOT set login state yet)
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

      <div className="flex items-center justify-center pt-32 px-4 pb-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-3xl font-bold mb-2 text-center text-gray-900">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Log in to continue ordering with GrubGo.
          </p>

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
                  focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400
                  text-sm"
                placeholder="Enter your email or username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <div
                className="flex items-center border border-gray-300 rounded-lg
                  focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400"
              >
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-l-lg focus:outline-none text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 text-xs font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* ⭐ Subtle forgot-password link, right-aligned */}
              <div className="mt-2 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs text-gray-500 hover:text-yellow-600 hover:underline transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-600 text-center text-sm bg-red-50 border border-red-100 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-lg font-semibold
                hover:bg-gray-800 transition shadow-sm hover:shadow-md text-sm"
            >
              Log In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-yellow-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
