import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function About() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      <div className="pt-28 px-6 max-w-4xl mx-auto pb-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          About GrubGo
        </h1>

        {/* Mission Section */}
        <div className="bg-white p-8 rounded-2xl shadow-md mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700 leading-relaxed">
            GrubGo was created to make ordering food fast, simple, and enjoyable.
            We partner with local restaurants to bring your favorite dishes right
            to your doorstep with speed and reliability. Whether you're craving a
            late-night snack or planning a family dinner, GrubGo connects you to
            great food in just a few taps.
          </p>
        </div>

        {/* What We Offer */}
        <div className="bg-white p-8 rounded-2xl shadow-md mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            What We Offer
          </h2>

          <ul className="space-y-3 text-gray-700">
            <li>• Fast and reliable delivery</li>
            <li>• Carefully curated selection of local restaurants</li>
            <li>• Secure and easy checkout process</li>
            <li>• Transparent pricing with no surprises</li>
            <li>• A rewards system to earn points on each order</li>
          </ul>
        </div>

        {/* Team Section (Placeholder) */}
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Team
          </h2>
          <p className="text-gray-700 leading-relaxed">
            GrubGo is built by a passionate team of students and developers who
            care about creating clean software, beautiful user experiences, and
            real-world solutions. More team details coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}
