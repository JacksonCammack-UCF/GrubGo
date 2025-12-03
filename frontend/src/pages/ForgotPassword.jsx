import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { API_BASE_URL } from "../config/api";

export default function ForgotPassword() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/auth/request-password-reset-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus({
          type: "error",
          message:
            data.message ||
            "Something went wrong while requesting a reset code.",
        });
      } else {
        setStatus({
          type: "success",
          message:
            data.message ||
            "If an account with that email exists, we sent a reset code.",
        });
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="flex items-center justify-center pt-32 px-4 pb-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className="text-3xl font-bold mb-2 text-center text-gray-900">
            Forgot your password?
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Enter your email and we’ll send you a one-time code to reset your
            password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
              />
            </div>

            {/* Status message */}
            {status.message && (
              <div
                className={`text-sm rounded-md px-3 py-2 ${
                  status.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {status.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-black text-white rounded-lg font-semibold
                hover:bg-gray-800 transition shadow-sm hover:shadow-md text-sm
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send reset code"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have your code?{" "}
            <Link to="/reset-password" className="text-yellow-600 hover:underline">
              Reset your password
            </Link>
          </p>

          <p className="mt-2 text-center text-sm text-gray-600">
            Remembered it?{" "}
            <Link to="/login" className="text-yellow-600 hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
