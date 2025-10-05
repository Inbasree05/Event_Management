import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import dImg from '../assets/dec.jpeg';
import mImg from '../assets/mehndi.jpeg';
import cImg from '../assets/catering.jpeg';
import ImageCarousel from './ImageCarousel';
import photoImg from '../assets/vedio.jpeg';
import makeupImg from '../assets/makeup.jpeg';
import venueImg from '../assets/venues.jpeg';
import ReviewModal from './ReviewModal';

const vendorCategories = [
    {
      id: 'decoration',
      name: 'Stage Decoration',
      image: dImg,
      description: 'Beautiful stage designs for your dream wedding',
      path: '/decoration'
    },
    {
      id: 'mehndi',
      name: 'Mehndi',
      image: mImg,
      description: 'Traditional and modern mehndi designs',
      path: '/mehandi'
    },
    {
      id: 'catering',
      name: 'Catering',
      image: cImg,
      description: 'Delicious menu options for your big day',
      path: '/catering'
    },
    {
      id: 'photography',
      name: 'Photography & Videography',
      image: photoImg,
      description: 'Candid, traditional and cinematic wedding coverage',
      path: '/photo'
    },
    {
      id: 'makeup',
      name: 'Bridal Makeup & Hair',
      image: makeupImg,
      description: 'Professional bridal looks and party makeovers',
      className: 'bridal-img',
      path: '/makeup'
    },
    {
      id: 'venues',
      name: 'Venues',
      image: venueImg,
      description: 'Banquet halls, lawns and destination venues',
      path: '/venue'
    }
  ];

function Home() {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleReviewClick = (vendor) => {
    setSelectedVendor(vendor);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedVendor(null);
  };

  return (
    <>
      <div className="home-container">
        {vendorCategories.map((vendor) => (
          <div key={vendor.id} className="box">
            <img 
              src={vendor.image} 
              alt={vendor.name} 
              className={vendor.className || ''} 
            />
            <h3>{vendor.name}</h3>
            <p>{vendor.description}</p>
            <div className="box-actions">
              <Link to={vendor.path} className="see-more">See More</Link>
            </div>
          </div>
        ))}
      </div>
      <ImageCarousel />
      
      {selectedVendor && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={closeReviewModal}
          vendorId={selectedVendor.id}
          vendorName={selectedVendor.name}
        />
      )}
    </>
    );
}

export default Home;