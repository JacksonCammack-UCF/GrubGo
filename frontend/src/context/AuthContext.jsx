import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authLoading, setAuthLoading] = useState(true);     // ⭐ NEW
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // -------------------------------------------
  // RESTORE AUTH FROM LOCAL STORAGE (SAFELY)
  // -------------------------------------------
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

        // PRELOAD user immediately (prevents navbar showing "U")
        setUser(parsed);
        setIsAuthenticated(true);

        // REFRESH FROM BACKEND
        const backendRes = await fetch(
          `http://localhost:5050/api/users/${parsed.id || parsed._id}`
        );
        const backendJson = await backendRes.json();

        if (backendJson.success && backendJson.data) {
          const fresh = backendJson.data;

          // ⭐ Normalize fields for consistent frontend use
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
        setAuthLoading(false); // ⭐ Only now the app may render protected pages
      }
    };

    restoreAuth();
  }, []);

  // -------------------------------------------
  // LOGIN
  // -------------------------------------------
  const login = (userData) => {
    // Normalize before saving
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

  // -------------------------------------------
  // UPDATE USER LOCALLY (Settings page)
  // -------------------------------------------
  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  // -------------------------------------------
  // LOGOUT
  // -------------------------------------------
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <AuthContext.Provider
      value={{
        authLoading,      // ⭐ NEW
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
