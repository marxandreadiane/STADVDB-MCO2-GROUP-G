import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './Navbar.css';

// Icon Components
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const LogOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

function Navbar({ currentPage, setCurrentPage }) {
  const { getCartCount } = useCart();
  const { user, isAuthenticated, logout, updateUserInfo } = useAuth();
  const cartCount = getCartCount();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showClientDropdown && !event.target.closest('.dropdown')) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showClientDropdown]);

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
    console.log('Navbar Debug:', {
      isAuthenticated,
      user,
      userRole: user?.role,
      isAdmin
    });
  }, [isAuthenticated, user, isAdmin]);

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigateTo('home')} style={{cursor: 'pointer'}}>
        <h1>Hallyu Mart</h1>
      </div>
      
      {/* CENTER NAVIGATION MENU */}
      <ul className="navbar-menu">
        {isAuthenticated ? (
          <>
            {/* NORMAL NAVIGATION FOR REGULAR USERS */}
            {!isAdmin ? (
              <>
                <li className={currentPage === 'home' ? 'active' : ''}>
                  <button onClick={() => navigateTo('home')}>Home</button>
                </li>
                <li className={currentPage === 'albums' ? 'active' : ''}>
                  <button onClick={() => navigateTo('albums')}>Albums</button>
                </li>
                <li className={currentPage === 'orders' ? 'active' : ''}>
                  <button onClick={() => navigateTo('orders')}>Orders</button>
                </li>
                <li className={currentPage === 'reports' ? 'active' : ''}>
                  <button onClick={() => navigateTo('reports')}>Reports</button>
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
                  <button 
                    className="dropdown-btn"
                    onClick={() => setShowClientDropdown(!showClientDropdown)}
                  >
                    Client-Side ▼
                  </button>
                  {showClientDropdown && (
                    <div className="dropdown-menu">
                      <button onClick={() => navigateTo('home')}>Home</button>
                      <button onClick={() => navigateTo('albums')}>Albums</button>
                      <button onClick={() => navigateTo('orders')}>Orders</button>
                    </div>
                  )}
                </li>

                {/* ADMIN-SIDE BUTTON */}
                <li className={currentPage === 'admin' ? 'active' : ''}>
                  <button onClick={() => navigateTo('admin')}>Management</button>
                </li>
                <li className={currentPage === 'reports' ? 'active' : ''}>
                  <button onClick={() => navigateTo('reports')}>Reports</button>
                </li>
              </>
            )}
          </>
        ) : (
          <>
            <li className={currentPage === 'home' ? 'active' : ''}>
              <button onClick={() => navigateTo('home')}>Home</button>
            </li>
            <li className={currentPage === 'albums' ? 'active' : ''}>
              <button onClick={() => navigateTo('albums')}>Albums</button>
            </li>
            <li className={currentPage === 'reports' ? 'active' : ''}>
              <button onClick={() => navigateTo('reports')}>Reports</button>
            </li>
          </>
        )}
      </ul>

      {/* RIGHT SIDE ACTIONS */}
      <div className="navbar-actions">
        {isAuthenticated && (
          <>
            <button 
              className={`icon-btn cart-btn ${currentPage === 'cart' ? 'active' : ''}`}
              onClick={() => navigateTo('cart')}
              title="Cart"
            >
              <CartIcon />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            
            <div className="user-info">
              <UserIcon />
              <span>{user.username}</span>
            </div>

            <button onClick={handleLogout} className="icon-btn logout-btn" title="Logout">
              <LogOutIcon />
            </button>
          </>
        )}
        
        {!isAuthenticated && (
          <button onClick={() => setShowAuthModal(true)} className="login-btn">
            <UserIcon />
            <span>Login</span>
          </button>
        )}
      </div>

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
