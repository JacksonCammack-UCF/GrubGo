import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

// ⭐ Cart context
import { useCart } from "../context/CartContext";

// ⭐ Animations
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  // ⭐ SAFE total price calculation
  const totalPrice = cart.reduce((sum, item) => {
    const price = Number(item?.price) || 0;
    const qty = Number(item?.qty) || 0;
    return sum + price * qty;
  }, 0);

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="pt-28 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Your Cart</h1>

        {/* Empty Cart */}
        {cart.length === 0 && (
          <p className="text-gray-600 text-xl mt-10 text-center">
            Your cart is empty.
          </p>
        )}

        {/* Cart Items */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => {
              // ⭐ SAFETY CHECK — skip corrupted items
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
                  {/* Image */}
                  <img
                    src={item.imageUrl}
                    alt={item.name || "Food"}
                    className="w-28 h-28 object-cover rounded-xl"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {item.name || "Unnamed Item"}
                    </h3>
                    <p className="text-gray-500 text-sm">{item.category}</p>
                    <p className="font-bold text-lg text-gray-900 mt-1">
                      ${price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col justify-between items-end">
                    <motion.div
                      key={qty}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2"
                    >
                      <button
                        onClick={() => updateQuantity(item._id, qty - 1)}
                        className="text-lg px-2 text-gray-700 hover:text-black"
                      >
                        -
                      </button>

                      <span className="font-semibold text-gray-800">
                        {qty}
                      </span>

                      <button
                        onClick={() => updateQuantity(item._id, qty + 1)}
                        className="text-lg px-2 text-gray-700 hover:text-black"
                      >
                        +
                      </button>
                    </motion.div>

                    {/* Remove */}
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

        {/* Cart Summary */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 p-6 bg-white rounded-2xl shadow-md"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Order Summary
            </h2>

            <div className="flex justify-between text-lg font-medium text-gray-700 mb-6">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            <button className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
              Checkout
            </button>

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
