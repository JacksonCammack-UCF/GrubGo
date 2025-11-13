import React from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {
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
        {/* Sign Up / Log In buttons */}
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

        {/* Separator line */}
        <hr className="border-gray-300 my-2 mx-4" />

        {/* Plain sidebar links */}
        <div className="p-4 flex flex-col space-y-1">
          <Link
            to="/restaurants"
            onClick={onClose}
            className="text-black text-left px-4 py-1 hover:bg-gray-100 rounded transition"
          >
            View Restaurants
          </Link>
          <Link
            to="/"
            onClick={onClose}
            className="text-black text-left px-4 py-1 hover:bg-gray-100 rounded transition"
          >
            Apply to be a Vendor
          </Link>
          <Link
            to="/contact"
            onClick={onClose}
            className="text-black text-left px-4 py-1 hover:bg-gray-100 rounded transition"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
