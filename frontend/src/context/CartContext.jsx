import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ⭐ Add item to cart
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((f) => f._id === item._id);

      if (existing) {
        return prev.map((f) =>
          f._id === item._id ? { ...f, qty: f.qty + 1 } : f
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  };

  // ⭐ Remove an item
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  // ⭐ Update quantity
  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);

    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, qty } : item
      )
    );
  };

  // ⭐ Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
