import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message sent:", formData);
    // TODO: Connect this to backend or email service
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Navbar & Sidebar */}
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      {/* Contact Form Section */}
      <div className="flex items-center justify-center pt-32 px-4">
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Contact Us
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Have questions or feedback? We'd love to hear from you!
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-gray-700 font-medium mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-gray-700 font-medium mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              ></textarea>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
