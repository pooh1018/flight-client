import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 className="hero-title">Book flights</h1>
          <p className="hero-subtitle">Find the best fares for your next trip</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
