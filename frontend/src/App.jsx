import { useState } from 'react';
import './App.css';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFoodSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();

    if (trimmed.length === 0) return;

    // ⭐ Redirect to menu with search filter
    navigate(`/menu?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      {/* Hero Section */}
      <div className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90 transition-opacity duration-1000 ease-in"
          style={{ backgroundImage: "url('/img/hero-image.png')" }}
        ></div>

        <div className="absolute inset-0 bg-black/30"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to GrubGo!</h1>
          <p className="text-lg md:text-2xl mb-6">
            Find your next meal—fast and delicious.
          </p>

          {/* ⭐ FOOD SEARCH BAR */}
          <form
            onSubmit={handleFoodSearch}
            className="w-full max-w-md flex bg-white rounded-full overflow-hidden shadow-lg transition-all duration-300 focus-within:shadow-2xl"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search foods (e.g., pizza, burgers)..."
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

          {/* View Menu */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer">
            <img
              src="/img/driver.png"
              alt="View Menu"
              className="mx-auto h-32 w-32 object-contain mb-4"
            />
            <h3 className="text-xl font-bold mb-2">View Menu</h3>
            <p className="text-gray-600 mb-4">Explore food options available today.</p>
            <Link
              to="/menu"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Go to Menu
            </Link>
          </div>

          {/* About Us */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer">
            <img
              src="/img/vendor.png"
              alt="About Us"
              className="mx-auto h-32 w-32 object-contain mb-4"
            />
            <h3 className="text-xl font-bold mb-2">About Us</h3>
            <p className="text-gray-600 mb-4">Learn who we are and what we do.</p>
            <Link
              to="/about"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              About Us
            </Link>
          </div>

          {/* Contact */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer">
            <img
              src="/img/contact.png"
              alt="Contact Us"
              className="mx-auto h-32 w-32 object-contain mb-4"
            />
            <h3 className="text-xl font-bold mb-2">Contact</h3>
            <p className="text-gray-600 mb-4">Have questions? Reach our team.</p>
            <Link
              to="/contact"
              className="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Contact
            </Link>
          </div>

        </div>
      </div>

      {/* Footer Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800">Discover local foods</h2>
        <p className="mt-2 text-gray-600">
          Browse our menu and find something delicious today.
        </p>
      </div>
    </div>
  );
}
