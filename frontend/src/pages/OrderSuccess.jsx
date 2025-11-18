import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------
  // LOAD ORDER FROM BACKEND
  // ----------------------------------------------------
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/orders/order/${orderId}`
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Unable to load order.");
        }

        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  // ----------------------------------------------------
  // LOADING VIEW
  // ----------------------------------------------------
  if (loading) {
    return (
      <div className="relative min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-600 text-xl">Loading order...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // ERROR VIEW
  // ----------------------------------------------------
  if (error || !order) {
    return (
      <div className="relative min-h-screen bg-gray-50 flex justify-center items-center flex-col">
        <p className="text-red-600 text-xl mb-4">{error || "Order not found."}</p>
        <button
          onClick={() => navigate("/menu")}
          className="px-6 py-3 bg-black text-white rounded-xl"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  // ----------------------------------------------------
  // CLEAN TAX CALCULATION
  // ----------------------------------------------------
  const taxAmount = order.total - order.subtotal;

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="pt-28 px-6 max-w-3xl mx-auto pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-8 rounded-2xl shadow-md text-center"
        >
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            Order Confirmed!
          </h1>

          <p className="text-gray-700 text-lg mb-6">
            Your order has been successfully placed.
          </p>

          {/* Order Summary */}
          <div className="bg-gray-100 p-4 rounded-xl mb-6 text-left">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Subtotal:</strong> ${order.subtotal.toFixed(2)}</p>
            <p><strong>Tax:</strong> ${taxAmount.toFixed(2)}</p>
            <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
            <p><strong>Points Earned:</strong> {order.pointsEarned}</p>
          </div>

          {/* Items */}
          <h2 className="text-2xl font-semibold mt-6 mb-4">Items Ordered</h2>

          <div className="space-y-4">
            {order.items.map((item, idx) => {
              const qty = item.qty ?? item.quantity ?? 1;
              const price = item.price ?? item.foodPrice ?? 0;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-lg">
                      {item.name || item.foodName || "Item"}
                    </p>
                    <p className="text-gray-600 text-sm">Qty: {qty}</p>
                  </div>

                  <p className="text-gray-800 font-bold">
                    ${Number(price).toFixed(2)}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-4">
            <button
              onClick={() => navigate("/orders")}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              View Order History
            </button>

            <button
              onClick={() => navigate("/menu")}
              className="w-full text-gray-700 hover:text-black font-semibold"
            >
              Back to Menu
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
