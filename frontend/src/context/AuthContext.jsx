import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // ⭐ Restore user on refresh (LOCAL ONLY)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedAuth = localStorage.getItem("isAuthenticated");

      if (storedUser && storedAuth === "true") {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Error restoring auth state:", err);
    }
  }, []);

  // ⭐ Login (LOCAL ONLY)
  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", "true");
  };

  // ⭐ Logout (LOCAL ONLY)
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);

    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
