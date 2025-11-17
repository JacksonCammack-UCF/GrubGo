import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Logged in but not admin → go to menu
  if (!user?.isAdmin) {
    return <Navigate to="/menu" />;
  }

  // Logged in AND admin → allow route
  return children;
}
