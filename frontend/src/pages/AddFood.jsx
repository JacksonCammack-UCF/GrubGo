import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AddFood() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ⭐ get admin ID

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    inStock: true,
    imageUrl: ""
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      const adminId = user?.id || user?._id;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/foods`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-id": adminId,   // ⭐ REQUIRED BY BACKEND
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to add food item.");
        return;
      }

      setSuccessMsg("Food item added successfully!");

      setTimeout(() => navigate("/admin"), 1000);

    } catch (error) {
      console.error("Error adding food:", error);
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="pt-28 max-w-2xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Add New Food Item</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-md space-y-4"
        >
          <div>
            <label className="font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">Image URL</label>
            <input
              type="text"
              name="imageUrl"
              required
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
            />
            <label className="font-medium text-gray-700">In Stock</label>
          </div>

          {error && <p className="text-red-600">{error}</p>}
          {successMsg && <p className="text-green-600 font-semibold">{successMsg}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Add Food Item
          </button>
        </form>
      </div>
    </div>
  );
}
