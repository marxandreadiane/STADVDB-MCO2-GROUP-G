import React, { useState, useEffect } from 'react';
import { handleImageError } from '../utils/imageUtils';
import './Home.css';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Carousel images - reusing album images (try .webp first, fallback to .jpg)
  const slides = [
    { id: 1, image: '/images/albums/1.webp', alt: 'Album 1' },
    { id: 2, image: '/images/albums/2.webp', alt: 'Album 2' },
    { id: 3, image: '/images/albums/3.webp', alt: 'Album 3' },
    { id: 4, image: '/images/albums/4.webp', alt: 'Album 4' },
    { id: 5, image: '/images/albums/5.webp', alt: 'Album 5' },
  ];

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to HallYOU — Where the <span className="k-wave">K-Wave</span> Meets You</h1>
          <p className="subtitle">Your #1 destination for authentic K-Pop albums</p>
          
          <div className="carousel">
            <button className="carousel-btn prev" onClick={prevSlide}>❮</button>
            
            <div className="carousel-track">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                >
                  <img 
                    src={slide.image} 
                    alt={slide.alt}
                    onError={(e) => handleImageError(e, slide.id)}
                  />
                </div>
              ))}
            </div>
            
            <button className="carousel-btn next" onClick={nextSlide}>❯</button>
            
            <div className="carousel-indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Authentic</h3>
            <p>100% genuine K-Pop albums from SM, JYP, YG, and more</p>
          </div>
          <div className="feature-card">
            <h3>Fast Shipping</h3>
            <p>Quick delivery to your doorstep</p>
          </div>
          <div className="feature-card">
            <h3>Exclusive Merch</h3>
            <p>Limited edition albums and special photocards</p>
          </div>
          <div className="feature-card">
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
