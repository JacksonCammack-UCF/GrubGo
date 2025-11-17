import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Restore from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedAuth = localStorage.getItem("isAuthenticated");

      if (storedUser && storedAuth === "true") {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAuthenticated(true);

        // ⭐ Refresh user from backend (gets updated points, name, etc.)
        fetch(`http://localhost:5050/api/users/${parsed.id || parsed._id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setUser(data.data);
              localStorage.setItem("user", JSON.stringify(data.data));
            }
          })
          .catch((err) => console.error("Failed to refresh user:", err));
      }
    } catch (err) {
      console.error("Error restoring auth state:", err);
    }
  }, []);

  // Login
  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", "true");
  };

  // Update user locally (Settings page)
  const updateUser = (updates) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // Logout
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);

    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
