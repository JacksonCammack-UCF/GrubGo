import React, { useState, useEffect } from "react";
import { Menu, ShoppingCart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext"; // ⭐ NEW

export default function Navbar({ onMenuClick }) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart(); // ⭐ NEW — access cart length

  const [cartBump, setCartBump] = useState(false); // ⭐ controls scale animation

  // ⭐ Trigger bump whenever cart changes
  useEffect(() => {
    if (cart.length === 0) return;
    setCartBump(true);

    const timer = setTimeout(() => setCartBump(false), 300);
    return () => clearTimeout(timer);
  }, [cart]);

  // Profile dropdown
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    const handleClick = (e) => {
      if (
        !e.target.closest("#profile-menu-btn") &&
        !e.target.closest("#profile-dropdown")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Scroll background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hideButtons =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/dashboard";

  const isHome = location.pathname === "/";

  const logoColor = isHome && !scrolled ? "text-white" : "text-black";
  const menuColor = isHome && !scrolled ? "text-white" : "text-black";

  return (
    <nav
      className={`fixed top-0 z-20 w-full px-6 py-3 flex justify-between items-center transition-all duration-500 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      {/* Left side */}
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

      {/* Right side */}
      <div className="flex items-center space-x-5 ml-auto">

        {/* ⭐ CART ICON (always visible when logged in) */}
        {isAuthenticated && (
          <button
            className={`relative transition-transform ${
              cartBump ? "scale-110" : "scale-100"
            }`}
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart
              size={28}
              className={isHome && !scrolled ? "text-white" : "text-black"}
            />

            {/* ⭐ Cart badge */}
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        )}

        {/* NOT LOGGED IN */}
        {!isAuthenticated && !hideButtons && (
          <>
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-lg font-semibold bg-black text-white hover:bg-gray-800 transition"
            >
              Sign Up
            </Link>

            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg font-semibold bg-gray-100 text-black hover:bg-gray-200 transition"
            >
              Log In
            </Link>
          </>
        )}

        {/* LOGGED IN → profile */}
        {isAuthenticated && (
          <div className="relative">
            <button
              id="profile-menu-btn"
              className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <span className="font-bold text-gray-700">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </button>

            {isMenuOpen && (
              <div
                id="profile-dropdown"
                className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-xl p-3 z-50 animate-fadeIn"
              >
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <Link
                  to="/cart"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cart
                </Link>

                <Link
                  to="/orders"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Orders
                </Link>

                <Link
                  to="/settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Settings
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                    navigate("/");
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg mt-1"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
