import { useState } from 'react';
import './App.css';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // TODO: connect this to your restaurant search API or data
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      {/* Hero Section */}
      <div className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90 transition-opacity duration-1000 ease-in"
          style={{ backgroundImage: "url('/img/hero-image.png')" }}
        ></div>

        {/* Overlay tint */}
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-1000 ease-in"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to GrubGo!</h1>
          <p className="text-lg md:text-2xl mb-6">
            Order food from local favorites and get it delivered fast.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-md flex bg-white rounded-full overflow-hidden shadow-lg transition-all duration-300 focus-within:shadow-2xl focus-within:scale-105"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants..."
              className="flex-1 px-4 py-3 text-gray-700 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-yellow-500 text-black font-semibold px-6 hover:bg-yellow-400 transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Option Buttons Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between gap-6">

          {/* View Restaurants */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer">
            <img
              src="/img/driver.png"
              alt="Become a Driver"
              className="mx-auto h-32 w-32 object-contain mb-4"
            />
            <h3 className="text-xl font-bold mb-2">View Restaurants</h3>
            <p className="text-gray-600 mb-4">Deliver food locally and earn money on your schedule.</p>
            <a
              href="/signup"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Sign Up
            </a>
          </div>

          {/* Become a Vendor */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer">
            <img
              src="/img/vendor.png"
              alt="Become a Vendor"
              className="mx-auto h-32 w-32 object-contain mb-4"
            />
            <h3 className="text-xl font-bold mb-2">Become a Vendor</h3>
            <p className="text-gray-600 mb-4">Start selling your food and grow your business.</p>
            <a
              href="/signup"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Sign Up
            </a>
          </div>

          {/* Contact */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer">
            <img
              src="/img/contact.png"
              alt="Contact Us"
              className="mx-auto h-32 w-32 object-contain mb-4"
            />
            <h3 className="text-xl font-bold mb-2">Contact</h3>
            <p className="text-gray-600 mb-4">Have questions? Get in touch with our team.</p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Contact
            </a>
          </div>

        </div>
      </div>

      {/* Page content below options */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800">Discover local restaurants</h2>
        <p className="mt-2 text-gray-600">
          Browse menus, explore deals, and find your next meal.
        </p>
      </div>
    </div>
  );
}
