import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// ⭐ import auth context
import { useAuth } from "../context/AuthContext";
// ⭐ import cart context
import { useCart } from "../context/CartContext";

export default function Login2FA() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();
  const { setCart } = useCart();   // ⭐ NEW

  const userId = location.state?.userId;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  // Redirect if no userId
  useEffect(() => {
    if (!userId) navigate("/login");
  }, [userId, navigate]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullOtp = otp.join("");

    if (fullOtp.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5050/api/auth/verify-2fa-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp: fullOtp }),
      });

      const data = await res.json();

      if (data.status === "RESEND") {
        setError("OTP expired. A new one has been sent.");
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid OTP.");
        return;
      }

      // ⭐ RAW backend user
      const backendUser = data.data;

      // ⭐ Format auth user
      const formattedUser = {
        id: backendUser._id,
        name: backendUser.firstName,
        email: backendUser.email,
        role: backendUser.isAdmin ? "admin" : "user",
        isAdmin: backendUser.isAdmin,
      };

      // ⭐ Save login
      login(formattedUser);

      // ⭐ Load their cart from backend
      setCart(backendUser.cart || []);

      // ⭐ Redirect
      navigate(backendUser.isAdmin ? "/admin" : "/menu");

    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="flex items-center justify-center pt-32 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Enter 2FA Code
          </h2>

          <p className="text-center text-gray-600 mb-6">
            We sent a 6-digit verification code to your email.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleBackspace(e, index)}
                  className="w-12 h-12 text-center text-xl font-semibold border rounded-lg 
                  focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              ))}
            </div>

            {error && <p className="text-red-600 text-center text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Verify
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Didn’t get the code?{" "}
            <button
              onClick={() => alert("Resend coming soon")}
              className="text-yellow-600 hover:underline"
            >
              Resend Code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
