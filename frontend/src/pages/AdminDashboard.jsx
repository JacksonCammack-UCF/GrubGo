import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ⭐ Fetch foods WITH pagination
  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `http://localhost:5050/api/foods?page=${page}&limit=9`
        );
        const data = await res.json();

        if (data.success) {
          setFoods(data.data);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error("Error fetching foods:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [page]);

  // ⭐ Delete food item
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5050/api/foods/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Delete failed.");
        return;
      }

      // Remove locally
      setFoods((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error deleting food:", err);
      alert("Server error while deleting food.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

        <p className="text-xl text-gray-700 mb-8">
          Welcome, <span className="font-semibold">{user?.name}</span>.
        </p>

        {/* ⭐ Add Food Button */}
        <div className="mb-6">
          <Link
            to="/admin/add"
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            + Add New Food Item
          </Link>
        </div>

        {/* ⭐ Loading State */}
        {loading && <p className="text-gray-600">Loading foods...</p>}

        {/* ⭐ Food Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food) => (
            <div key={food._id} className="bg-white p-5 rounded-xl shadow-md flex flex-col">
              <img
                src={food.imageUrl}
                alt={food.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />

              <h3 className="text-xl font-semibold">{food.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{food.category}</p>
              <p className="font-medium text-gray-800 mb-4">${food.price}</p>

              <div className="mt-auto flex justify-between">
                <Link
                  to={`/admin/edit/${food._id}`}
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(food._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-400 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ⭐ Empty State */}
        {foods.length === 0 && !loading && (
          <p className="text-gray-600 text-center mt-8">No food items found. Add one above.</p>
        )}

        {/* ⭐ Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {/* Prev */}
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className={`px-4 py-2 rounded-lg border ${
                page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
              }`}
            >
              Prev
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  page === i + 1
                    ? "bg-black text-white"
                    : "bg-white border hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            {/* Next */}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`px-4 py-2 rounded-lg border ${
                page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
