import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from database when user logs in
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated && user?.user_id) {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:5000/api/cart/${user.user_id}`);
          if (response.ok) {
            const data = await response.json();
            setCartItems(data);
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Clear cart when logged out
        setCartItems([]);
      }
    };

    fetchCart();
  }, [user, isAuthenticated]);

  const addToCart = async (album) => {
    if (!isAuthenticated || !user?.user_id) {
      console.error('User must be logged in to add to cart');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.user_id,
          albumId: album.album_id,
          quantity: 1
        })
      });

      if (response.ok) {
        // Refresh cart from database
        const cartResponse = await fetch(`http://localhost:5000/api/cart/${user.user_id}`);
        if (cartResponse.ok) {
          const data = await cartResponse.json();
          setCartItems(data);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (albumId) => {
    if (!isAuthenticated || !user?.user_id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/cart/${user.user_id}/${albumId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCartItems(prevItems => prevItems.filter(item => item.album_id !== albumId));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (albumId, quantity) => {
    if (!isAuthenticated || !user?.user_id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/cart/${user.user_id}/${albumId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        if (quantity <= 0) {
          setCartItems(prevItems => prevItems.filter(item => item.album_id !== albumId));
        } else {
          setCartItems(prevItems =>
            prevItems.map(item =>
              item.album_id === albumId ? { ...item, quantity } : item
            )
          );
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !user?.user_id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/cart/${user.user_id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
