import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

function Orders() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/user/${user.user_id}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#ffa502',
      'PAID': '#26de81',
      'SHIPPED': '#4b7bec',
      'DELIVERED': '#20bf6b',
      'CANCELLED': '#fc5c65'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'PENDING': '⏳',
      'PAID': '✅',
      'SHIPPED': '📦',
      'DELIVERED': '🎉',
      'CANCELLED': '❌'
    };
    return icons[status] || '📋';
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="empty-orders">
          <h2>🔒 Please Log In</h2>
          <p>You need to be logged in to view your order history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-orders">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-header">
          <h1>📦 Order History</h1>
          <p>Track your purchases and order status</p>
        </div>
        <div className="empty-orders">
          <h2>📭 No Orders Yet</h2>
          <p>You haven't placed any orders yet. Start shopping to see your order history here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>📦 Order History</h1>
        <p>You have {orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="orders-list">
        {orders.map(order => (
          <div key={order.order_id} className="order-card">
            <div className="order-summary" onClick={() => toggleOrderDetails(order.order_id)}>
              <div className="order-main-info">
                <div className="order-id-section">
                  <span className="order-label">Order #</span>
                  <span className="order-id">{order.order_id}</span>
                </div>
                <div className="order-date">
                  <span className="date-icon">📅</span>
                  {formatDate(order.order_date)}
                </div>
              </div>

              <div className="order-meta">
                <div className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>
                  <span className="status-icon">{getStatusIcon(order.status)}</span>
                  {order.status}
                </div>
                <div className="order-total">
                  <span className="total-label">Total:</span>
                  <span className="total-amount">${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
                <button className="expand-btn">
                  {expandedOrder === order.order_id ? '▼' : '▶'}
                </button>
              </div>
            </div>

            {expandedOrder === order.order_id && (
              <div className="order-details">
                <div className="details-section">
                  <h3>📍 Shipping Information</h3>
                  <p><strong>Address:</strong> {order.shipping_address}</p>
                  <p><strong>Phone:</strong> {order.phone}</p>
                </div>

                <div className="details-section">
                  <h3>🎵 Order Items</h3>
                  <div className="order-items">
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-info">
                          <span className="item-name">{item.album_name}</span>
                          <span className="item-artist">{item.artist_name}</span>
                        </div>
                        <div className="item-quantity">
                          Qty: {item.quantity}
                        </div>
                        <div className="item-price">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.payment_method && (
                  <div className="details-section">
                    <h3>💳 Payment Information</h3>
                    <p><strong>Method:</strong> {order.payment_method.replace('_', ' ')}</p>
                    <p><strong>Status:</strong> {order.payment_status || 'COMPLETED'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
