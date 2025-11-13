import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Link, useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Check if logged in (mock version for now)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Navbar & Sidebar */}
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      {/* Main Content */}
      <div className="pt-28 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back{user ? `, ${user.firstName}!` : "!"}
        </h1>
        <p className="text-gray-600 mb-8">
          Here’s your account overview and quick actions.
        </p>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* View Restaurants */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 text-center transition">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Explore Restaurants
            </h2>
            <p className="text-gray-500 mb-4 text-sm">
              Browse and order from your favorite local spots.
            </p>
            <Link
              to="/restaurants"
              className="inline-block px-5 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
            >
              View Restaurants
            </Link>
          </div>

          {/* Apply to be a Vendor */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 text-center transition">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Become a Vendor
            </h2>
            <p className="text-gray-500 mb-4 text-sm">
              Own a restaurant? Apply to sell on GrubGo.
            </p>
            <Link
              to="/apply-vendor"
              className="inline-block px-5 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Apply Now
            </Link>
          </div>

          {/* Edit Profile */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 text-center transition">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Profile Settings
            </h2>
            <p className="text-gray-500 mb-4 text-sm">
              Update your account details and preferences.
            </p>
            <Link
              to="/profile"
              className="inline-block px-5 py-2 bg-gray-200 text-black rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Logout */}
        <div className="text-center mt-10">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
