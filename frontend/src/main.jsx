import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Menu from "./pages/Menu.jsx";
import Contact from "./pages/Contact.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Login2FA from "./pages/Login2FA.jsx";

// ⭐ Correct path for AdminRoute
import AdminRoute from "./components/AdminRoute.jsx";

// ⭐ Admin pages
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AddFood from "./pages/AddFood.jsx";
import EditFood from "./pages/EditFood.jsx";   // ⭐ NEW IMPORT

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login-2fa" element={<Login2FA />} />

          {/* ⭐ Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* ⭐ Add Food Page */}
          <Route
            path="/admin/add"
            element={
              <AdminRoute>
                <AddFood />
              </AdminRoute>
            }
          />

          {/* ⭐ Edit Food Page */}
          <Route
            path="/admin/edit/:id"
            element={
              <AdminRoute>
                <EditFood />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
