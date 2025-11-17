import React, { createContext, useState, useContext } from 'react';

// Cart item shape (cart-specific):
// {
//   id: string;           // cart line id (includes addons)
//   menuId?: string;      // original menu document id
//   name: string;
//   description?: string;
//   imageUrl?: string;
//   basePrice: number;    // base item price without addons
//   price: number;        // final unit price including addons
//   quantity: number;
//   addons?: Array<{ type: string; label: string; priceDiff: number }>;
// }
const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItemToCart = (item) => {
    // `item.id` here is the cart line identifier (may include addons).
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prevItems, { ...item, quantity: item.quantity ?? 1 }];
    });
  };

  const removeItemFromCart = (itemId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const adjustQuantity = (itemId, delta) => {
    setItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const value = {
    items,
    addItemToCart,
    removeItemFromCart,
    adjustQuantity,
    clearCart,
    totalPrice,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};
