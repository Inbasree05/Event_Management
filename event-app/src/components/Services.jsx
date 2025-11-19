import React from 'react';
import List from './List';
import './Services.css';

const Services = () => {
  return (
    <div className="services-page">
      <div className="services-hero">
        <div className="hero-content">
          <h1>Our Services</h1>
          <p>Comprehensive event management solutions tailored to your needs</p>
        </div>
      </div>
      <List />
    </div>
  );
};

export default Services;










