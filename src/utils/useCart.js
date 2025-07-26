import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

export const useCart = () => {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart from database
  const fetchCart = async () => {
    if (status === "authenticated") {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("/api/cart");
        setCart(response.data);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setError("Failed to fetch cart");
        setCart({ items: [] });
      } finally {
        setLoading(false);
      }
    } else if (status === "unauthenticated") {
      setCart({ items: [] });
      setLoading(false);
    }
  };

  // Add product to cart
  const addToCart = async (productId, quantity = 1) => {
    if (status !== "authenticated") {
      throw new Error("Authentication required");
    }

    try {
      const response = await axios.post("/api/cart/add", { productId, quantity });
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  };

  // Update product quantity in cart
  const updateQuantity = async (productId, quantity) => {
    if (status !== "authenticated") {
      throw new Error("Authentication required");
    }

    try {
      const response = await axios.put(`/api/cart/update/${productId}`, { quantity });
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    if (status !== "authenticated") {
      throw new Error("Authentication required");
    }

    try {
      const response = await axios.delete(`/api/cart/remove/${productId}`);
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (status !== "authenticated") {
      throw new Error("Authentication required");
    }

    try {
      const response = await axios.delete("/api/cart/clear");
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  };

  // Calculate total items in cart
  const getItemCount = () => {
    return cart.items ? cart.items.reduce((total, item) => total + (item.quantity || 1), 0) : 0;
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cart.items ? cart.items.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0) : 0;
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cart.items ? cart.items.some(item => item.id === productId) : false;
  };

  // Get product quantity in cart
  const getProductQuantity = (productId) => {
    const item = cart.items ? cart.items.find(item => item.id === productId) : null;
    return item ? item.quantity : 0;
  };

  // Fetch cart when authentication status changes
  useEffect(() => {
    fetchCart();
  }, [status]);

  return {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemCount,
    getTotalPrice,
    isInCart,
    getProductQuantity,
    refreshCart: fetchCart,
  };
}; 