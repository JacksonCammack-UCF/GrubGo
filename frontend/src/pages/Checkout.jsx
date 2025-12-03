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

  // ------------------------------
  // BILLING FORM (front-end only)
  // ------------------------------
  const [billingForm, setBillingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
  });

  // Prefill from user if available
  useEffect(() => {
    if (!user) return;

    setBillingForm((prev) => ({
      ...prev,
      fullName:
        prev.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(" "),
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingForm((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------------------
  // PAYMENT FORM (front-end only)
  // ------------------------------
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
    // Billing
    const {
      fullName,
      email,
      addressLine1,
      city,
      state,
      zip,
    } = billingForm;

    if (!fullName.trim()) {
      return "Please enter your full name for billing.";
    }

    if (!email.trim()) {
      return "Please enter your email address.";
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    if (!addressLine1.trim()) {
      return "Please enter your billing street address.";
    }

    if (!city.trim()) {
      return "Please enter your city.";
    }

    if (!state.trim()) {
      return "Please enter your state.";
    }

    if (!zip.trim()) {
      return "Please enter your ZIP/postal code.";
    }

    // Payment
    const { nameOnCard, cardNumber, expiry, cvv } = paymentForm;

    if (!nameOnCard.trim()) {
      return "Please enter the name on the card.";
    }

    const digitsOnlyCard = cardNumber.replace(/\s|-/g, "");
    if (!/^\d{12,19}$/.test(digitsOnlyCard)) {
      return "Please enter a valid card number.";
    }

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
          // If you later want to send billing/payment data, add body here.
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

      <div className="pt-28 px-6 max-w-3xl mx-auto pb-20">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Checkout</h1>

        <div className="space-y-8">
          {/* ORDER SUMMARY */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-6"
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

          {/* BILLING & PAYMENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Billing & Payment
            </h2>

            <div className="space-y-5">
              {/* BILLING INFO */}
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Billing Information
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-sm">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={billingForm.fullName}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1 text-sm">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={billingForm.email}
                        onChange={handleBillingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1 text-sm">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={billingForm.phone}
                        onChange={handleBillingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        placeholder="(555) 555-5555"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-sm">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={billingForm.addressLine1}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      placeholder="123 Main St"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-sm">
                      Address Line 2 (optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={billingForm.addressLine2}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                      placeholder="Apt, suite, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1 text-sm">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={billingForm.city}
                        onChange={handleBillingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        placeholder="Orlando"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1 text-sm">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={billingForm.state}
                        onChange={handleBillingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        placeholder="FL"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1 text-sm">
                        ZIP
                      </label>
                      <input
                        type="text"
                        name="zip"
                        value={billingForm.zip}
                        onChange={handleBillingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                        placeholder="32816"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PAYMENT DETAILS */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Payment Details
                </h3>

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
