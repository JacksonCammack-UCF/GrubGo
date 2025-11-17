import React from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar({ isOpen, onClose }) {

  const { isAuthenticated, user } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/20 z-40 opacity-0 animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Sidebar itself */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white text-black transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 flex flex-col`}
      >

        {/* ⭐ SIGN UP / LOGIN (only when NOT logged in) */}
        {!isAuthenticated && (
          <ul className="p-4 space-y-3">
            <li>
              <Link
                to="/signup"
                onClick={onClose}
                className="block w-full text-center bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition"
              >
                Sign up
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                onClick={onClose}
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-black py-3 rounded-lg font-semibold transition"
              >
                Log in
              </Link>
            </li>
          </ul>
        )}

        {/* ⭐ Separator (only show if logged OUT) */}
        {!isAuthenticated && <hr className="border-gray-300 my-2 mx-4" />}

        {/* ⭐ SIDEBAR NAVIGATION */}
        <div className="p-4 flex flex-col space-y-1">

          {/* ⭐ When logged IN, show Home link */}
          {isAuthenticated && (
            <Link
              to="/"
              onClick={onClose}
              className="text-black text-left px-4 py-1 hover:bg-gray-100 rounded transition"
            >
              Home
            </Link>
          )}

          {/* Shared navigation items */}
          <Link
            to="/menu"
            onClick={onClose}
            className="text-black text-left px-4 py-1 hover:bg-gray-100 rounded transition"
          >
            View Menu
          </Link>

          <Link
            to="/about"
            onClick={onClose}
            className="text-black text-left px-4 py-1 hover:bg-gray-100 rounded transition"
          >
            About Us
          </Link>

          <Link
            to="/contact"
            onClick={onClose}
            className="text-black text-left px-4 py-1 hover:bg-gray-100 rounded transition"
          >
            Contact Us
          </Link>

          {/* ⭐ ADMIN-ONLY LINKS */}
          {isAuthenticated && user?.isAdmin && (
            <>
              <hr className="border-gray-300 my-2 mx-4" />

              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Admin
              </p>

              <Link
                to="/admin"
                onClick={onClose}
                className="text-black text-left px-4 py-1 hover:bg-gray-100 rounded transition font-semibold"
              >
                Admin Dashboard
              </Link>
            </>
          )}

        </div>
      </div>
    </>
  );
}

export default Sidebar;
