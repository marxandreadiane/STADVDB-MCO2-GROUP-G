import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './Navbar.css';

function Navbar({ currentPage, setCurrentPage }) {
  const { getCartCount } = useCart();
  const { user, isAuthenticated, logout, updateUserInfo } = useAuth();
  const cartCount = getCartCount();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  const handleAuthSuccess = (userData) => {
    console.log('User logged in:', userData);
    updateUserInfo(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
    setShowClientDropdown(false);
    setShowAdminDropdown(false);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setShowClientDropdown(false);
    setShowAdminDropdown(false);
  };

  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 Navbar Debug:', {
      isAuthenticated,
      user,
      userRole: user?.role,
      isAdmin
    });
  }, [isAuthenticated, user, isAdmin]);

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigateTo('home')} style={{cursor: 'pointer'}}>
        <h1>🎵 KPop Store</h1>
      </div>
      
      {isAuthenticated ? (
        <ul className="navbar-menu">
          {/* NORMAL NAVIGATION FOR REGULAR USERS */}
          {!isAdmin ? (
            <>
              <li className={currentPage === 'home' ? 'active' : ''}>
                <button onClick={() => navigateTo('home')}>🏠 Home</button>
              </li>
              <li className={currentPage === 'albums' ? 'active' : ''}>
                <button onClick={() => navigateTo('albums')}>💿 Albums</button>
              </li>
              <li className={currentPage === 'cart' ? 'active cart-nav' : 'cart-nav'}>
                <button onClick={() => navigateTo('cart')}>
                  🛒 Cart
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </button>
              </li>
              <li className={currentPage === 'orders' ? 'active' : ''}>
                <button onClick={() => navigateTo('orders')}>📦 Orders</button>
              </li>
              <li className={currentPage === 'reports' ? 'active' : ''}>
                <button onClick={() => navigateTo('reports')}>📊 Reports</button>
              </li>
            </>
          ) : (
            <>
              {/* DROPDOWN NAVIGATION FOR ADMINS (CLIENT-SIDE) */}
              <li 
                className={`dropdown ${showClientDropdown ? 'active' : ''}`}
                onMouseEnter={() => setShowClientDropdown(true)}
                onMouseLeave={() => setShowClientDropdown(false)}
              >
                <button className="dropdown-btn">
                  Client-Side ▼
                </button>
                {showClientDropdown && (
                  <div className="dropdown-menu">
                    <button onClick={() => navigateTo('home')}>🏠 Home</button>
                    <button onClick={() => navigateTo('albums')}>💿 Albums</button>
                    <button onClick={() => navigateTo('cart')}>
                      🛒 Cart {cartCount > 0 && <span className="cart-badge-inline">{cartCount}</span>}
                    </button>
                    <button onClick={() => navigateTo('orders')}>📦 Orders</button>
                    <button onClick={() => navigateTo('reports')}>📊 Reports</button>
                  </div>
                )}
              </li>

              {/* ADMIN-SIDE BUTTON */}
              <li className={currentPage === 'admin' ? 'active' : ''}>
                <button onClick={() => navigateTo('admin')}>🛡️ Admin-Side</button>
              </li>
            </>
          )}

          <li className="user-info-item">
            <span>👤 {user.username}</span>
          </li>

          <li>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </li>
        </ul>
      ) : (
        <ul className="navbar-menu">
          <li>
            <button onClick={() => navigateTo('home')}>Home</button>
          </li>
          <li>
            <button onClick={() => navigateTo('albums')}>Albums</button>
          </li>
          <li>
            <button onClick={() => navigateTo('reports')}>Reports</button>
          </li>
          <li>
            <button onClick={() => setShowAuthModal(true)} className="login-btn">Login</button>
          </li>
        </ul>
      )}

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        mode="login"
      />
    </nav>
  );
}

export default Navbar;
