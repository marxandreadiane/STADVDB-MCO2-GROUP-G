import { useState } from 'react';
import './App.css';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Albums from './pages/Albums';
import Reports from './pages/Reports';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [orderData, setOrderData] = useState(null);

  const handleCheckout = () => {
    setCurrentPage('checkout');
  };

  const handleCheckoutSuccess = (data) => {
    setOrderData(data);
    setCurrentPage('order-success');
  };

  const handleBackToCart = () => {
    setCurrentPage('cart');
  };

  const handleContinueShopping = () => {
    setCurrentPage('albums');
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <Home />;
      case 'albums':
        return <Albums />;
      case 'reports':
        return <Reports />;
      case 'cart':
        return <Cart onCheckout={handleCheckout} />;
      case 'orders':
        return <Orders />;
      case 'admin':
        return <Admin />;
      case 'checkout':
        return <Checkout onBack={handleBackToCart} onSuccess={handleCheckoutSuccess} />;
      case 'order-success':
        return <OrderSuccess orderData={orderData} onContinueShopping={handleContinueShopping} />;
      case 'about':
        return (
          <div className="about-page">
            <h1>About KPop Store</h1>
            <p>Your trusted destination for authentic K-Pop albums and merchandise.</p>
            <p>We partner with SM Entertainment, JYP Entertainment, YG Entertainment, and more!</p>
          </div>
        );
      default:
        return <Home />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <main className="main-content">
            {renderPage()}
          </main>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
