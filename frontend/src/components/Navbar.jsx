import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide buttons on login/signup pages
  const hideButtons =
    location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/dashboard";

  // Detect if on home page
  const isHome = location.pathname === "/";

  // Dynamic color logic
  const logoColor = isHome && !scrolled ? "text-white" : "text-black";
  const menuColor = isHome && !scrolled ? "text-white" : "text-black";

  return (
    <nav
      className={`fixed top-0 z-20 w-full px-6 py-3 flex justify-between items-center transition-all duration-500 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      {/* Left side: menu button + logo */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className={`p-2 rounded transition hover:bg-gray-200 ${menuColor}`}
        >
          <Menu size={28} />
        </button>

        <Link to="/" className="flex items-center space-x-2">
          <span
            className={`font-extrabold text-3xl tracking-tight transition-colors duration-500 ${logoColor}`}
          >
            GrubGo
          </span>
        </Link>
      </div>

      {/* Right side: only show buttons on certain pages */}
      {!hideButtons && (
        <div className="flex items-center space-x-4 ml-auto">
          <Link
            to="/signup"
            className={`px-5 py-2.5 rounded-lg font-semibold transition ${
              scrolled
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className={`px-5 py-2.5 rounded-lg font-semibold transition ${
              scrolled
                ? "bg-gray-100 text-black hover:bg-gray-200"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Log In
          </Link>
        </div>
      )}
    </nav>
  );
}
