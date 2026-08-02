import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });

  const refreshCart = useCallback(async () => {
    if (!user || user.role === 'farmer') return;
    try {
      const res = await api.get('/cart');
      setCart(res.data.cart);
    } catch (err) {
      // silently ignore - user might not be logged in yet
    }
  }, [user]);

  const addToCart = async (productId, quantity) => {
    const res = await api.post('/cart', { productId, quantity });
    setCart(res.data.cart);
  };

  const removeFromCart = async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    setCart(res.data.cart);
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCart({ items: [] });
  };

  const cartCount = cart.items?.length || 0;
  const cartTotal = (cart.items || []).reduce(
    (sum, item) => sum + item.quantity * (item.product?.pricePerUnit ?? item.priceAtAdd),
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, refreshCart, addToCart, removeFromCart, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
