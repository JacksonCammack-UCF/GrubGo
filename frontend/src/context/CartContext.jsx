import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// ⭐ unified backend URL
import API_BASE_URL from "../utils/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // ------------------------------------------------------------------------------------
  // LOCAL CART STATE (loads from localStorage)
  // ------------------------------------------------------------------------------------
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Always sync cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ------------------------------------------------------------------------------------
  // SYNC SINGLE ITEM TO BACKEND
  // ------------------------------------------------------------------------------------
  const syncItemToBackend = async (foodId, quantity) => {
    if (!isAuthenticated || !user?.id) return;

    try {
      await fetch(`${API_BASE_URL}/users/cart/${user.id}`, {
        method: "POST", // backend expects POST for cart update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId, quantity }),
      });
    } catch (err) {
      console.error("Cart sync failed:", err);
    }
  };

  // ------------------------------------------------------------------------------------
  // ADD TO CART
  // ------------------------------------------------------------------------------------
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((f) => f._id === item._id);

      // If item already exists → increment qty
      if (existing) {
        return prev.map((f) =>
          f._id === item._id ? { ...f, qty: f.qty + 1 } : f
        );
      }

      // New item
      return [...prev, { ...item, qty: 1 }];
    });

    syncItemToBackend(item._id, 1);
  };

  // ------------------------------------------------------------------------------------
  // UPDATE QUANTITY
  // ------------------------------------------------------------------------------------
  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);

    setCart((prev) => {
      const updated = prev.map((item) =>
        item._id === id ? { ...item, qty } : item
      );

      syncItemToBackend(id, qty);

      return updated;
    });
  };

  // ------------------------------------------------------------------------------------
  // REMOVE ITEM
  // ------------------------------------------------------------------------------------
  const removeFromCart = (id) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item._id !== id);
      syncItemToBackend(id, 0); // qty=0 means delete on backend
      return updated;
    });
  };

  // ------------------------------------------------------------------------------------
  // CLEAR CART
  // ------------------------------------------------------------------------------------
  const clearCart = () => {
    if (isAuthenticated && user?.id) {
      cart.forEach((item) => syncItemToBackend(item._id, 0));
    }
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CCartContext);
