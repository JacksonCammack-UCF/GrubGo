import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function EditFood() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [food, setFood] = useState({
    name: "",
    price: "",
    category: "",
    inStock: true,
    imageUrl: ""
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // ⭐ Load food by ID
  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/foods/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Failed to load food.");
          return;
        }

        setFood({
          name: data.data.name,
          price: data.data.price,
          category: data.data.category,
          inStock: data.data.inStock,
          imageUrl: data.data.imageUrl
        });

        setLoading(false);
      } catch (err) {
        setError("Server error loading food.");
      }
    };

    fetchFood();
  }, [id]);

  // ⭐ Handle form updates
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for boolean inStock
    if (name === "inStock") {
      setFood({ ...food, inStock: value === "true" });
      return;
    }

    setFood({ ...food, [name]: value });
  };

  // ⭐ Submit updated food
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`http://localhost:5050/api/foods/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(food)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Update failed.");
        setSaving(false);
        return;
      }

      // Redirect back to Admin Dashboard
      navigate("/admin");
    } catch (err) {
      setError("Server error updating food.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading food...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="flex justify-center pt-32 px-4">
        <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Edit Food Item
          </h2>

          {error && (
            <p className="text-red-600 text-center mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={food.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* PRICE */}
            <div>
              <label className="block font-medium mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={food.price}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block font-medium mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={food.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* IN STOCK */}
            <div>
              <label className="block font-medium mb-1">In Stock</label>
              <select
                name="inStock"
                value={food.inStock}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
              >
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </select>
            </div>

            {/* IMAGE URL */}
            <div>
              <label className="block font-medium mb-1">Image URL</label>
              <input
                type="text"
                name="imageUrl"
                value={food.imageUrl}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
