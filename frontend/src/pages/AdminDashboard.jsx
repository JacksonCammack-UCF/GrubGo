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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/foods?page=${page}&limit=9`
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

  // ⭐ Image URL normalizer (matches behavior in Menu/Cart)
  const getImageSrc = (food) => {
    const raw = food?.imageUrl;

    if (!raw) return "/img/default-food.jpg";

    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }

    if (raw.startsWith("/img/")) {
      return raw;
    }

    // treat as filename like "cole_slaw.jpg"
    return `/img/${raw.replace(/^\/+/, "")}`;
  };

  // ⭐ Delete with correct header
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    try {
      const adminId = user?.id || user?._id;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/foods/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-id": adminId,
        },
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Delete failed.");
        return;
      }

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
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h1>

        <p className="text-xl text-gray-700 mb-8">
          Welcome, <span className="font-semibold">{user?.name}</span>.
        </p>

        <div className="mb-6">
          <Link
            to="/admin/add"
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            + Add New Food Item
          </Link>
        </div>

        {loading && <p className="text-gray-600">Loading foods...</p>}

        {/* Food Grid – styled like Menu cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {foods.map((food) => (
            <div
              key={food._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image section (same style as Menu) */}
              <div className="relative h-48">
                <img
                  src={getImageSrc(food)}
                  alt={food.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/img/default-food.jpg";
                  }}
                />
              </div>

              {/* Content section (mirrors Menu with admin controls) */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {food.name}
                </h3>

                <p className="text-gray-500 mb-3 text-sm">{food.category}</p>

                <div className="flex items-center justify-between mt-auto mb-4">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 text-xs font-semibold rounded-full">
                    {food.category}
                  </span>

                  <span className="font-bold text-lg text-gray-900">
                    ${Number(food.price).toFixed(2)}
                  </span>
                </div>

                {/* Admin controls instead of Add to Cart */}
                <div className="flex gap-3">
                  <Link
                    to={`/admin/edit/${food._id}`}
                    className="flex-1 text-center bg-yellow-500 text-black font-semibold px-4 py-2 rounded-full hover:bg-yellow-400 transition"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(food._id)}
                    className="flex-1 bg-red-500 text-white font-semibold px-4 py-2 rounded-full hover:bg-red-400 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {foods.length === 0 && !loading && (
          <p className="text-gray-600 text-center mt-8">No food items found.</p>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className={`px-4 py-2 rounded-lg border ${
                page === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
            >
              Prev
            </button>

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

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`px-4 py-2 rounded-lg border ${
                page === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-200"
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
