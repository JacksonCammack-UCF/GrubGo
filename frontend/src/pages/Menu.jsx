import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Menu() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // ⭐ Backend data
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ⭐ Fetch food items from backend
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

  return (
    <div className="relative min-h-screen bg-linear-to-b from-gray-50 to-gray-200">
      {/* Navbar & Sidebar */}
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      {/* Food Items */}
      <div className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
            Popular Items Near You
          </h2>

          {/* ⭐ Loading */}
          {loading && (
            <p className="text-center text-gray-600 text-lg">Loading...</p>
          )}

          {/* ⭐ Food Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {!loading &&
              foods.map((food) => (
                <div
                  key={food._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Food Image */}
                  <div className="relative h-48">
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition"></div>
                  </div>

                  {/* Food Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {food.name}
                    </h3>

                    {/* Using category as description since backend has no description */}
                    <p className="text-gray-500 mb-3 text-sm">
                      {food.category}
                    </p>

                    <div className="flex items-center justify-between mt-auto mb-4">
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 text-xs font-semibold rounded-full">
                        {food.category}
                      </span>

                      <span className="font-bold text-lg text-gray-900">
                        ${food.price.toFixed(2)}
                      </span>
                    </div>

                    <button className="w-full bg-yellow-500 text-black font-semibold px-6 py-2 rounded-full hover:bg-yellow-400 transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* ⭐ Empty state */}
          {!loading && foods.length === 0 && (
            <p className="text-center text-gray-600 text-lg mt-10">
              No items found.
            </p>
          )}

          {/* ⭐ Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              {/* Prev */}
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

              {/* Page Buttons */}
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
    </div>
  );
}
