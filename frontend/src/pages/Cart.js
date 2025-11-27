import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { getAlbumImageUrl, handleImageError } from '../utils/imageUtils';
import './Cart.css';

function Cart({ onCheckout }) {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { isAuthenticated, updateUserInfo } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      onCheckout();
    }
  };

  const handleAuthSuccess = (userData) => {
    updateUserInfo(userData);
    setShowAuthModal(false);
    onCheckout();
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
        </div>
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some albums to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.album_id} className="cart-item">
              <div className="cart-item-image">
                <img 
                  src={getAlbumImageUrl(item.image_url, item.album_id)}
                  alt={item.album_name}
                  onError={(e) => handleImageError(e, item.album_id)}
                />
              </div>
              <div className="cart-item-details">
                <h3>{item.album_name}</h3>
                <p className="artist">{item.artist_name}</p>
                <p className="company">{item.company_name}</p>
              </div>
              <div className="cart-item-price">
                <span>${item.price}</span>
              </div>
              <div className="cart-item-quantity">
                <button onClick={() => updateQuantity(item.album_id, item.quantity - 1)}>-</button>
                <input 
                  type="number" 
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.album_id, parseInt(e.target.value) || 0)}
                  min="0"
                />
                <button onClick={() => updateQuantity(item.album_id, item.quantity + 1)}>+</button>
              </div>
              <div className="cart-item-total">
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
              <button 
                className="cart-item-remove"
                onClick={() => removeFromCart(item.album_id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>$5.00</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%):</span>
            <span>${(getCartTotal() * 0.08).toFixed(2)}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${(getCartTotal() + 5 + getCartTotal() * 0.08).toFixed(2)}</span>
          </div>
          <button className="checkout-button" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        mode="login"
      />
    </div>
  );
}

export default Cart;
