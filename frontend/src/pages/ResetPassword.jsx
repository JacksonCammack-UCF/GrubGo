import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { API_BASE_URL } from "../config/api";

export default function ResetPassword() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (newPassword.trim() !== confirmPassword.trim()) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1) Verify the OTP and get a password reset token
      const verifyRes = await fetch(
        `${API_BASE_URL}/auth/verify-password-reset-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // NOTE: This sends { email, otp }. Your current backend expects { userId, otp },
          // so until the backend is updated, this call will likely return an error.
          body: JSON.stringify({ email, otp }),
        }
      );

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setStatus({
          type: "error",
          message:
            verifyData.message ||
            "Error verifying reset code. Please double-check your code and try again.",
        });
        setIsSubmitting(false);
        return;
      }

      // Handle special RESEND status (expired / too many attempts)
      if (verifyData.status === "RESEND") {
        setStatus({
          type: "error",
          message:
            verifyData.message ||
            "Your reset code expired or had too many attempts. A new code has been sent to your email.",
        });
        setIsSubmitting(false);
        return;
      }

      // Extract token (matches the structure in your auth.route.js)
      const resetToken =
        verifyData?.data?.password_reset_token ||
        verifyData?.password_reset_token;

      if (!resetToken) {
        setStatus({
          type: "error",
          message:
            "No reset token was returned from the server. Please request a new reset code.",
        });
        setIsSubmitting(false);
        return;
      }

      // 2) Use the reset token to actually change the password
      const resetRes = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password_reset_token: resetToken,
          newPassword,
        }),
      });

      const resetData = await resetRes.json();

      if (!resetRes.ok || !resetData.success) {
        setStatus({
          type: "error",
          message:
            resetData.message ||
            "Error resetting password. Please try again or request a new code.",
        });
        setIsSubmitting(false);
        return;
      }

      setStatus({
        type: "success",
        message: resetData.message || "Password reset successfully!",
      });

      // Optional: redirect back to login shortly after success
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Reset password error:", err);
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
            Reset your password
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Enter the email you used for your account, the reset code we sent
            you, and your new password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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

            {/* OTP */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Reset Code (OTP)
              </label>
              <input
                type="text"
                placeholder="Enter the 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Create a new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isSubmitting ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have a reset code yet?{" "}
            <Link to="/forgot-password" className="text-yellow-600 hover:underline">
              Request one
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
