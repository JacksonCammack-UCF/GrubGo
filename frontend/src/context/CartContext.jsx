import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // ⭐ Local cart state (works offline or logged out)
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // ⭐ ALWAYS keep localStorage up to date
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ====================================================================================
  // ⭐ Helper: Sync a SINGLE cart item to backend
  // ====================================================================================
  const syncItemToBackend = async (foodId, quantity) => {
  if (!isAuthenticated || !user?.id) return;

  try {
    await fetch(`http://localhost:5050/api/users/cart/${user.id}`, {
      method: "POST",     // ⭐ your backend requires POST, not PATCH
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodId, quantity }),
    });
  } catch (err) {
    console.error("Cart sync failed:", err);
  }
};


  // ====================================================================================
  // ⭐ addToCart — fully persistent
  // ====================================================================================
  const addToCart = (item) => {
  setCart((prev) => {
    const existing = prev.find((f) => f._id === item._id);

    if (existing) {
      return prev.map((f) =>
        f._id === item._id ? { ...f, qty: f.qty + 1 } : f
      );
    }

    // add new item
    return [...prev, { ...item, qty: 1 }];
  });

  // ⭐ sync AFTER state update, not inside setCart()
  syncItemToBackend(item._id, 1);
};


  // ====================================================================================
  // ⭐ updateQuantity — fully persistent
  // ====================================================================================
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

  // ====================================================================================
  // ⭐ removeFromCart — fully persistent
  // ====================================================================================
  const removeFromCart = (id) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item._id !== id);
      syncItemToBackend(id, 0); // backend interprets qty=0 as delete
      return updated;
    });
  };

  // ====================================================================================
  // ⭐ clearCart — fully persistent
  // ====================================================================================
  const clearCart = () => {
    if (isAuthenticated && user?.id) {
      // Clear each on backend
      cart.forEach((item) => syncItemToBackend(item._id, 0));
    }
    setCart([]);
  };

  // ====================================================================================
  // ⭐ When user logs in: Load backend cart → convert → store in cart
  //    (Login2FA already passes formatted cart to setCart)
  // ====================================================================================

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

export const useCart = () => useContext(CartContext);
