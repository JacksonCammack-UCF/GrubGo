import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

// ⭐ Cart + Auth contexts
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

// ⭐ Animations
import { motion, AnimatePresence } from "framer-motion";

// ⭐ CENTRALIZED API URL
import API_BASE_URL from "../utils/api";

export default function Cart() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated, authLoading } = useAuth();

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // -------------------------------------------------
  // HYDRATION + AUTH REDIRECT (safe)
  // -------------------------------------------------
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // -------------------------------------------------
  // CHECKOUT HANDLER
  // -------------------------------------------------
  const handleCheckout = async () => {
    if (authLoading) {
      setCheckoutError("Restoring your session… try again.");
      return;
    }

    if (!user?.id) {
      setCheckoutError("Invalid user. Please log in again.");
      return navigate("/login");
    }

    if (cart.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    try {
      setIsCheckoutLoading(true);
      setCheckoutError("");

      const res = await fetch(`${API_BASE_URL}/api/orders/${user.id}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Checkout failed.");
      }

      const orderId = data.order?._id;
      if (!orderId) {
        throw new Error("Order ID missing in response.");
      }

      clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutError(err.message || "Server error during checkout.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // -------------------------------------------------
  // CART TOTALS
  // -------------------------------------------------
  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item?.price) || 0;
    const qty = Number(item?.qty) || 0;
    return sum + price * qty;
  }, 0);

  const taxAmount = subtotal * 0.07;
  const total = subtotal + taxAmount;

  // -------------------------------------------------
  // RENDER BLOCKING STATES
  // -------------------------------------------------
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        Restoring your session…
      </div>
    );
  }

  // -------------------------------------------------
  // MAIN RENDER
  // -------------------------------------------------
  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="pt-28 px-6 max-w-4xl mx-auto pb-32">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Your Cart</h1>

        {/* EMPTY CART */}
        {cart.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-gray-600 text-xl mb-6">Your cart is empty.</p>

            <button
              onClick={() => navigate("/menu")}
              className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              View Menu
            </button>
          </div>
        )}

        {/* CART ITEMS */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => {
              if (!item || !item._id) return null;

              const price = Number(item.price) || 0;
              const qty = Number(item.qty) || 0;

              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition flex gap-4"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name || "Food"}
                    className="w-28 h-28 object-cover rounded-xl"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {item.name || "Unnamed Item"}
                    </h3>
                    <p className="text-gray-500 text-sm">{item.category}</p>
                    <p className="font-bold text-lg text-gray-900 mt-1">
                      ${price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    <motion.div
                      key={qty}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2"
                    >
                      <button
                        onClick={() => updateQuantity(item._id, qty - 1)}
                        className="text-lg px-2 text-gray-700 hover:text-black"
                      >
                        -
                      </button>

                      <span className="font-semibold text-gray-800">{qty}</span>

                      <button
                        onClick={() => updateQuantity(item._id, qty + 1)}
                        className="text-lg px-2 text-gray-700 hover:text-black"
                      >
                        +
                      </button>
                    </motion.div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700 text-sm mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ORDER SUMMARY */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 p-6 bg-white rounded-2xl shadow-md"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Order Summary
            </h2>

            <div className="space-y-2 text-gray-700 mb-6">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-lg">
                <span>Tax:</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xl font-semibold text-gray-900 pt-2 border-t">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckoutLoading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:bg-gray-500"
            >
              {isCheckoutLoading ? "Processing..." : "Checkout"}
            </button>

            {checkoutError && (
              <p className="text-red-600 text-center text-sm mt-2">
                {checkoutError}
              </p>
            )}

            <button
              onClick={clearCart}
              className="mt-4 w-full text-gray-700 hover:text-black text-sm"
            >
              Clear Cart
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
