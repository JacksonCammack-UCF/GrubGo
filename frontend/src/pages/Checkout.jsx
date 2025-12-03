import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import { motion, AnimatePresence } from "framer-motion";

export default function Checkout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated, authLoading } = useAuth();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Simple payment form state (front-end only)
  const [paymentForm, setPaymentForm] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------------------------------------
  // AUTH GUARD (no cart redirect here)
  // -------------------------------------------------
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

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
  // FORM VALIDATION (frontend only)
  // -------------------------------------------------
  const validatePaymentForm = () => {
    const { nameOnCard, cardNumber, expiry, cvv } = paymentForm;

    if (!nameOnCard.trim()) {
      return "Please enter the name on the card.";
    }

    const digitsOnlyCard = cardNumber.replace(/\s|-/g, "");
    if (!/^\d{12,19}$/.test(digitsOnlyCard)) {
      return "Please enter a valid card number.";
    }

    // Basic MM/YY or MM/YYYY check
    if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(expiry.trim())) {
      return "Please enter expiry as MM/YY or MM/YYYY.";
    }

    if (!/^\d{3,4}$/.test(cvv.trim())) {
      return "Please enter a valid CVV.";
    }

    return null;
  };

  // -------------------------------------------------
  // PLACE ORDER HANDLER
  // -------------------------------------------------
  const handlePlaceOrder = async () => {
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

    const validationError = validatePaymentForm();
    if (validationError) {
      setCheckoutError(validationError);
      return;
    }

    try {
      setIsPlacingOrder(true);
      setCheckoutError("");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${user.id}`,
        {
          method: "POST",
          // If you later want to send payment data, add body here.
        }
      );

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
      setIsPlacingOrder(false);
    }
  };

  // -------------------------------------------------
  // LOADING STATE
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

      <div className="pt-28 px-6 max-w-5xl mx-auto pb-20">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ORDER SUMMARY */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Order Summary
            </h2>

            {cart.length === 0 ? (
              <p className="text-gray-600">
                Your cart is empty.{" "}
                <button
                  onClick={() => navigate("/cart")}
                  className="text-yellow-600 hover:underline"
                >
                  Go back to cart
                </button>
              </p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <AnimatePresence mode="popLayout">
                    {cart.map((item) => {
                      if (!item || !item._id) return null;
                      const price = Number(item.price) || 0;
                      const qty = Number(item.qty) || 0;
                      const lineTotal = price * qty;

                      return (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex justify-between items-center border-b pb-3 last:border-b-0"
                        >
                          <div>
                            <p className="font-semibold text-gray-800">
                              {item.name || "Unnamed Item"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {qty} × ${price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ${lineTotal.toFixed(2)}
                          </p>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-xl font-semibold text-gray-900 pt-2 border-t">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* PAYMENT DETAILS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Payment Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Name on Card
                </label>
                <input
                  type="text"
                  name="nameOnCard"
                  value={paymentForm.nameOnCard}
                  onChange={handlePaymentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1 text-sm">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentForm.cardNumber}
                  onChange={handlePaymentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={paymentForm.expiry}
                    onChange={handlePaymentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                    placeholder="08/27"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-gray-700 font-medium mb-1 text-sm">
                    CVV
                  </label>
                  <input
                    type="password"
                    name="cvv"
                    value={paymentForm.cvv}
                    onChange={handlePaymentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                    placeholder="123"
                  />
                </div>
              </div>

              {checkoutError && (
                <p className="text-sm text-red-600 mt-1">{checkoutError}</p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || cart.length === 0}
                className="w-full py-3 bg-black text-white rounded-xl font-semibold
                  hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isPlacingOrder ? "Placing order..." : "Place Order"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="w-full text-sm text-gray-600 hover:text-black mt-2"
              >
                Back to Cart
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
