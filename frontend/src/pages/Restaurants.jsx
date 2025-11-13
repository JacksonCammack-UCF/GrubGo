import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Restaurants() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [restaurants] = useState([
    {
      id: 1,
      name: "Mama’s Kitchen",
      description: "Homestyle meals made fresh daily.",
      image: "/img/restaurant1.jpg",
      rating: "4.8★",
      tag: "Fast Delivery",
    },
    {
      id: 2,
      name: "Sushi Street",
      description: "Delicious sushi and sashimi prepared to perfection.",
      image: "/img/restaurant2.jpg",
      rating: "4.7★",
      tag: "Japanese",
    },
    {
      id: 3,
      name: "Taco Palace",
      description: "Authentic tacos and burritos bursting with flavor.",
      image: "/img/restaurant3.jpg",
      rating: "4.9★",
      tag: "Mexican",
    },
  ]);

  return (
    <div className="relative min-h-screen bg-linear-to-b from-gray-50 to-gray-200">
      {/* Navbar & Sidebar */}
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      {/* Restaurants Section */}
      <div className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
            Restaurants Near You
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Restaurant Image */}
                <div className="relative h-48">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition"></div>
                </div>

                {/* Restaurant Info */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-500 mb-3 text-sm">
                      {restaurant.description}
                    </p>
                  </div>

                  {/* Bottom Section (tags + button) */}
                  <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-semibold rounded-full">
                        {restaurant.tag}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 text-xs font-semibold rounded-full">
                        {restaurant.rating}
                      </span>
                    </div>
                    <button className="w-full bg-yellow-500 text-black font-semibold px-6 py-2 rounded-full hover:bg-yellow-400 transition">
                      View Menu
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
