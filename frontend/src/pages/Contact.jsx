import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Contact() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message submitted (functionality coming soon)");
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="pt-28 px-6 max-w-4xl mx-auto pb-20">

        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Contact Us
        </h1>

        {/* Contact Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            We're Here to Help
          </h2>
          <p className="text-gray-700 mb-6">
            Have a question, suggestion, or issue? Send us a message and our team
            will get back to you as soon as possible.
          </p>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-600 mb-1 block">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="text-gray-600 mb-1 block">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="text-gray-600 mb-1 block">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Additional Contact Info */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Other Ways to Reach Us
          </h2>

          <p className="text-gray-700 mb-2">
            <strong>Email:</strong> support@grubgo.com
          </p>

          <p className="text-gray-700 mb-2">
            <strong>Phone:</strong> (555) 123-4567
          </p>

          <p className="text-gray-700">
            <strong>Hours:</strong> Mon-Fri, 9 AM – 6 PM
          </p>
        </div>
      </div>
    </div>
  );
}
