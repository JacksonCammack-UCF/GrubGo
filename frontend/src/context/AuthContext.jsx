import { createContext, useContext, useState, useEffect } from "react";

// ⭐ Unified backend URL
import API_BASE_URL from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // --------------------------------------------------
  // RESTORE AUTH FROM LOCAL STORAGE (HYDRATION)
  // --------------------------------------------------
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedAuth = localStorage.getItem("isAuthenticated");

        if (!storedUser || storedAuth !== "true") {
          setAuthLoading(false);
          return;
        }

        const parsed = JSON.parse(storedUser);

        // Preload immediately → prevents "U" flash in navbar
        setUser(parsed);
        setIsAuthenticated(true);

        // 🔄 Refresh from backend
        const backendRes = await fetch(
          `${API_BASE_URL}/users/${parsed.id || parsed._id}`
        );
        const backendJson = await backendRes.json();

        if (backendJson.success && backendJson.data) {
          const fresh = backendJson.data;

          const normalized = {
            ...fresh,
            id: fresh._id,
            name: fresh.firstName,
            isAdmin: fresh.isAdmin ?? false,
          };

          setUser(normalized);
          localStorage.setItem("user", JSON.stringify(normalized));
        }
      } catch (err) {
        console.error("Auth restore error:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreAuth();
  }, []);

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------
  const login = (userData) => {
    const normalized = {
      ...userData,
      id: userData.id || userData._id,
      name: userData.firstName || userData.name,
      isAdmin: userData.isAdmin ?? false,
    };

    setIsAuthenticated(true);
    setUser(normalized);

    localStorage.setItem("user", JSON.stringify(normalized));
    localStorage.setItem("isAuthenticated", "true");
  };

  // --------------------------------------------------
  // UPDATE USER (Settings.jsx updates)
  // --------------------------------------------------
  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <AuthContext.Provider
      value={{
        authLoading,
        isAuthenticated,
        user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
