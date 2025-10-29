import React from 'react';
import './OrderSuccess.css';

function OrderSuccess({ orderData, onContinueShopping }) {
  return (
    <div className="order-success">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1>Order Placed Successfully!</h1>
        <p className="order-number">Order ID: #{orderData.order_id}</p>
        
        <div className="success-message">
          <p>Thank you for your purchase! Your order has been confirmed and will be shipped soon.</p>
          <p>A confirmation email has been sent to <strong>{orderData.user?.email}</strong></p>
        </div>

        <div className="order-details">
          <h2>Order Details</h2>
          <div className="detail-row">
            <span>Order Total:</span>
            <span className="amount">${orderData.total_amount?.toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span>Payment Method:</span>
            <span>{orderData.payment?.method}</span>
          </div>
          <div className="detail-row">
            <span>Status:</span>
            <span className="status">{orderData.status || 'PENDING'}</span>
          </div>
        </div>

        <div className="action-buttons">
          <button className="continue-button" onClick={onContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
