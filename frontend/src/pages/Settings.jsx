import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ⭐ NEW: Sync user data from backend → ensures "points" always loads
  useEffect(() => {
    const loadFreshUser = async () => {
      if (!user) return;

      try {
        const res = await fetch(
          `http://localhost:5050/api/users/${user.id || user._id}`
        );
        const data = await res.json();

        if (res.ok && data.success) {
          updateUser(data.data); // ⭐ merge fresh user into local auth
        }
      } catch (err) {
        console.log("Could not refresh user profile:", err.message);
      }
    };

    loadFreshUser();
  }, []);

  const handleSave = async () => {
    if (!firstName.trim()) {
      setErrorMsg("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");
      setSaveMsg("");

      const res = await fetch(
        `http://localhost:5050/api/users/profile/${user.id || user._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstName }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile.");
      }

      // ⭐ Update local user with full data from backend
      updateUser({ ...user, firstName });

      setSaveMsg("Saved successfully!");
      setTimeout(() => setSaveMsg(""), 2000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="pt-28 px-6 max-w-3xl mx-auto pb-20">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Settings</h1>

        {/* ==============================
            ACCOUNT INFORMATION
        =============================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-md mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Account Information
          </h2>

          {/* First Name */}
          <label className="block mb-4">
            <p className="text-gray-600 mb-1">First Name</p>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>

          {/* Email (read only) */}
          <div className="mb-4">
            <p className="text-gray-600 mb-1">Email</p>
            <p className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700">
              {user?.email}
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:bg-gray-500"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {saveMsg && (
            <p className="text-green-600 text-center text-sm mt-2">{saveMsg}</p>
          )}
          {errorMsg && (
            <p className="text-red-600 text-center text-sm mt-2">{errorMsg}</p>
          )}
        </motion.div>

        {/* ==============================
            ACCOUNT DETAILS (READ ONLY)
        =============================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-md"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Account Details
          </h2>

          <p className="mb-2">
            <strong>Role:</strong> {user?.isAdmin ? "Admin" : "User"}
          </p>

          <p className="mb-2">
            <strong>Points:</strong> {user?.points ?? 0}
          </p>

          <p className="mb-2">
            <strong>User ID:</strong> {user?.id || user?._id}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
