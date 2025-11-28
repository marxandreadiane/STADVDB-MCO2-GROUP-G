import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

function Checkout({ onBack, onSuccess }) {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'CREDIT_CARD'
  });

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const subtotal = getCartTotal();
      const shipping = 5.00;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;

      const orderData = {
        user: {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        },
        items: cartItems.map(item => ({
          album_id: item.album_id,
          quantity: item.quantity,
          price: item.price
        })),
        payment: {
          method: formData.paymentMethod,
          amount: total
        },
        total_amount: total
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      
      // Clear cart and show success
      clearCart();
      onSuccess(result);
      
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const shipping = 5.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="checkout">
      <div className="checkout-header">
        <button className="back-button" onClick={onBack}>← Back to Cart</button>
        <h1>Checkout</h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-form-section">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Customer Information</h2>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Shipping Address</h2>
              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Street address, city, state, ZIP code"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <label className={formData.paymentMethod === 'CREDIT_CARD' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CREDIT_CARD"
                    checked={formData.paymentMethod === 'CREDIT_CARD'}
                    onChange={handleChange}
                  />
                  <span>Credit Card</span>
                </label>
                <label className={formData.paymentMethod === 'DEBIT_CARD' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="DEBIT_CARD"
                    checked={formData.paymentMethod === 'DEBIT_CARD'}
                    onChange={handleChange}
                  />
                  <span>Debit Card</span>
                </label>
                <label className={formData.paymentMethod === 'PAYPAL' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYPAL"
                    checked={formData.paymentMethod === 'PAYPAL'}
                    onChange={handleChange}
                  />
                  <span>PayPal</span>
                </label>
                <label className={formData.paymentMethod === 'GCASH' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="GCASH"
                    checked={formData.paymentMethod === 'GCASH'}
                    onChange={handleChange}
                  />
                  <span>GCash</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" className="place-order-button" disabled={loading}>
              {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.album_id} className="summary-item">
                <div className="summary-item-info">
                  <span className="item-name">{item.album_name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                </div>
                <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>
          
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          
          <div className="summary-divider"></div>
          
          <div className="summary-row total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
