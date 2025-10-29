import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to KPop Store</h1>
          <p className="subtitle">Your #1 destination for authentic K-Pop albums</p>
          <div className="hero-image">
            {/* Upload your image to frontend/public/images/ folder and update src below */}
            <img 
              src="/images/images.jpg" 
              alt="KPop Store" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="placeholder-box" style={{ display: 'none' }}>
              <span>📀</span>
              <p>Upload your image to:<br/><code>frontend/public/images/images.jpg</code></p>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🎵</span>
            <h3>Authentic Albums</h3>
            <p>100% genuine K-Pop albums from SM, JYP, YG, and more</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🚚</span>
            <h3>Fast Shipping</h3>
            <p>Quick delivery to your doorstep</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💝</span>
            <h3>Exclusive Merch</h3>
            <p>Limited edition albums and special photocards</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🌟</span>
            <h3>Latest Releases</h3>
            <p>Stay updated with the newest K-Pop albums</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Explore Our Collection</h2>
        <p>Discover albums from your favorite K-Pop artists</p>
        <button className="cta-button">Browse Albums</button>
      </section>
    </div>
  );
}

export default Home;
