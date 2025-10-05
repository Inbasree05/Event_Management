import React, { useState, useEffect } from 'react';
import './ImageCarousel.css';
import dImg from '../assets/dimage.jpeg';
import mImg from '../assets/image1.jpeg';
import cImg from '../assets/buffey.jpeg';

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  
  const images = [
    dImg,
    mImg, 
    cImg
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); 

    return () => clearInterval(timer);
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="carousel-container">
      <div className="carousel">
        <button className="carousel-button prev" onClick={goToPrevious}>
          &#8249;
        </button>
        
        <div className="carousel-slide">
          <img 
            src={images[currentIndex]} 
            alt={`Slide ${currentIndex + 1}`}
            className="carousel-image"
          />
        </div>
        
        <button className="carousel-button next" onClick={goToNext}>
          &#8250;
        </button>
      </div>
      
      <div className="carousel-dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
