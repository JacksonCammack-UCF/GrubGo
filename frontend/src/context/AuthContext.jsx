import { createContext, useContext, useState, useEffect } from "react";

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the provider component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // ⭐ STEP 4: Restore auth state when the app loads
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

  // ⭐ Called when the user logs in
  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);

    // ⭐ STEP 5: Save login state to localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", "true");
  };

  // ⭐ Called when the user logs out
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);

    // ⭐ STEP 6: Clear saved login data
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  };

  // Expose state & actions to the app
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}
