// src/pages/VerifyEmail.jsx
import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API_BASE_URL from "../utils/api";   // ⭐ NEW: safe unified base URL

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputRefs = useRef([]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const userId = location.state?.userId;
  const email = location.state?.email;

  // -----------------------------------------
  // HANDLE INPUT CHANGES
  // -----------------------------------------
  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // -----------------------------------------
  // HANDLE SUBMIT
  // -----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!userId) {
      setError("Missing user information. Please sign up again.");
      return;
    }

    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid or expired code.");
        setLoading(false);
        return;
      }

      if (data.status === "RESEND") {
        setMessage(data.message || "A new OTP has been sent to your email.");
        setLoading(false);
        return;
      }

      setMessage("Email verified successfully! Redirecting to login...");
      setLoading(false);

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Verify email error:", err);
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="flex items-center justify-center pt-32 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
            Verify Your Email
          </h2>

          <p className="text-center text-gray-600 mb-6">
            {email
              ? `Enter the 6-digit code sent to ${email}`
              : "Enter the 6-digit code sent to your email."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP FIELDS */}
            <div className="flex justify-between gap-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl border border-gray-300 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
            {message && (
              <p className="text-green-600 text-sm text-center">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-lg font-semibold
                         hover:bg-gray-800 transition disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
