import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <h1>About WeddingVista</h1>
      <p>
        Welcome to <strong>WeddingVista</strong> – your one-stop destination for making weddings magical and memorable.
        We specialize in creating beautiful and unforgettable wedding moments with our premium services.
      </p>

      <div className="service-section">
        <h2>🎀 Stage Decoration</h2>
        <p>
          Our expert decorators transform your venue into a stunning and elegant setting using flowers, lights,
          and themed elements tailored to your preferences.
        </p>
      </div>

      <div className="service-section">
        <h2>🌿 Mehndi</h2>
        <p>
          We offer traditional and modern Mehndi designs by experienced artists who bring culture and beauty together
          in every intricate pattern.
        </p>
      </div>

      <div className="service-section">
        <h2>🍽️ Catering</h2>
        <p>
          Our catering service provides delicious multi-cuisine menus crafted with love, ensuring your guests
          enjoy every bite during your big day.
        </p>
      </div>

      <p className="thank-you">
        Thank you for choosing WeddingVista. Let us help you create memories that last forever.
      </p>
    </div>
  );
};

export default About;
