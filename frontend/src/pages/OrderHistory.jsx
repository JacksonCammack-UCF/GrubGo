import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// ⭐ Centralized API URL
import API_BASE_URL from "../utils/api";

export default function OrderHistory() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const { user, isAuthenticated, authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});
  const [itemCache, setItemCache] = useState({});

  // -------------------------------
  // AUTH REDIRECT
  // -------------------------------
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // -------------------------------
  // LOAD ORDER HISTORY
  // -------------------------------
  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.id) return;

    const loadOrders = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/orders/history/${user.id}`
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Could not load order history.");
        }

        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [authLoading, user]);

  // -------------------------------
  // LAZY LOAD ITEM DETAILS
  // -------------------------------
  const loadFoodDetails = async (foodId) => {
    if (itemCache[foodId]) return itemCache[foodId];

    try {
      const res = await fetch(`${API_BASE_URL}/api/foods/${foodId}`);
      const data = await res.json();

      if (!res.ok || !data.success) return null;

      const food = data.data;

      setItemCache((prev) => ({
        ...prev,
        [foodId]: food,
      }));

      return food;
    } catch {
      return null;
    }
  };

  const toggleExpand = async (orderId, items) => {
    if (!expanded[orderId]) {
      for (const item of items) {
        await loadFoodDetails(item.foodId);
      }
    }

    setExpanded((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // -------------------------------
  // LOADING / ERROR RENDERING
  // -------------------------------

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        Restoring your session…
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        Loading order history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <p className="text-red-600 text-xl mb-4">{error}</p>
        <button
          onClick={() => navigate("/menu")}
          className="px-6 py-3 bg-black text-white rounded-xl"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  // -------------------------------
  // MAIN RENDER
  // -------------------------------
  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="pt-28 px-6 max-w-4xl mx-auto pb-20">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          Order History
        </h1>

        {orders.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-gray-600 text-xl mb-6">
              You haven't placed any orders yet.
            </p>
            <button
              onClick={() => navigate("/menu")}
              className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Browse Menu
            </button>
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => {
            const computedTax = (order.total - order.subtotal).toFixed(2);

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(order._id, order.items)}
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      Order #{order._id.slice(-6)}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${order.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{order.status}</p>
                  </div>
                </div>

                <AnimatePresence>
                  {expanded[order._id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 border-t pt-4"
                    >
                      <h3 className="text-lg font-semibold mb-4">Items</h3>

                      <div className="space-y-3">
                        {order.items.map((item, idx) => {
                          const food = itemCache[item.foodId];
                          const qty = item.qty ?? item.quantity ?? 1;

                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex justify-between items-center bg-gray-100 p-3 rounded-xl"
                            >
                              <div>
                                <p className="font-medium text-gray-800">
                                  {food?.name || "Item"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Qty: {qty}
                                </p>
                              </div>

                              <p className="text-gray-900 font-semibold">
                                ${(food?.price || 0).toFixed(2)}
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="mt-6 p-4 bg-gray-100 rounded-xl space-y-1">
                        <p>
                          <strong>Subtotal:</strong>{" "}
                          ${order.subtotal.toFixed(2)}
                        </p>

                        <p>
                          <strong>Tax:</strong> ${computedTax}
                        </p>

                        <p className="text-lg font-semibold pt-1 border-t">
                          <strong>Total:</strong> ${order.total.toFixed(2)}
                        </p>

                        <p className="text-sm text-gray-700">
                          <strong>Points Earned:</strong>{" "}
                          {order.pointsEarned}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
