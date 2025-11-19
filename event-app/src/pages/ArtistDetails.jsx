import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaArrowLeft, FaStar, FaStarHalfAlt, FaRegStar, FaHeart, FaPencilAlt } from 'react-icons/fa';
import './ArtistDetails.css';

const ArtistDetails = () => {
  const getRandomExperience = () => {
  const years = [2, 3, 5, 7, 10, 12, 15];
  return years[Math.floor(Math.random() * years.length)];
};
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const DEFAULT_PROFILE_IMAGE = 'data:image/jpeg;base64,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';
const [artist, setArtist] = useState(() => {
  const defaultData = {
    profileImage: DEFAULT_PROFILE_IMAGE,
    rating: 4.8,
    reviewCount: 128,
    experience: `${getRandomExperience()} years of professional experience`,
    location: 'Chennai, India',
    price: '₹8,000 - ₹12,000',
    category: 'Bridal Makeup Artist',
    name: 'Priya Sharma',
    about: `Professional makeup artist with over ${getRandomExperience()} years of experience in bridal makeup. Specializing in both traditional and contemporary styles, I bring out the best in every bride on their special day.`
  };
  
  // Only use location state if it exists
  return location.state?.artistData 
    ? { ...defaultData, ...location.state.artistData }
    : defaultData;
});
 
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(!location.state?.artistData);
  const [error, setError] = useState(null);

  // Get base URL for default images
  const getBaseUrl = () => {
    // Return a default image path or handle it differently
    return '';
  };

  // Function to get safe image URL with null checks
  const getSafeImageUrl = (url) => {
    try {
      if (!url) return 'https://via.placeholder.com/300x400?text=No+Image';
      const urlStr = String(url);
      // If it's already a full URL or absolute path, return as is
      if (urlStr.startsWith('http') || urlStr.startsWith('/') || urlStr.startsWith('data:')) {
        return urlStr;
      }
      // Otherwise, treat as a relative path
      return `/${urlStr.replace(/^\/+/, '')}`; // Remove leading slashes to avoid double slashes
    } catch (error) {
      console.error('Error processing image URL:', url, error);
      return 'https://via.placeholder.com/300x400?text=Error+Loading+Image';
    }
  };
// Add this near the top with other state declarations
const [imageSrc, setImageSrc] = useState(() => {
  return location.state?.artistData?.profileImage || DEFAULT_PROFILE_IMAGE;
});

// Update the image source when the artist data loads
useEffect(() => {
  if (location.state?.artistData?.profileImage) {
    setImageSrc(location.state.artistData.profileImage);
  }
}, [location.state]);

// In the JSX, update the image source to use imageSrc
<img 
  src={imageSrc}
  alt={artist.name}
  onError={(e) => {
    e.target.onerror = null;
    setImageSrc(DEFAULT_PROFILE_IMAGE);
  }}
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px'
  }}
/>
  const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="star filled" />);
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="star half" />);
  }

  // Add empty stars
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="star" />);
  }

  return stars;
};
  const fetchReviews = async (artistId) => {
    try {
      // Mock reviews data
      const mockReviews = {
        'john-doe': [
          {
            id: 1,
            userName: 'Rahul Sharma',
            rating: 5,
            date: '2023-10-15',
            comment: 'Amazing work! John did a fantastic job on my wedding makeup. Highly recommended!',
            userImage: 'https://randomuser.me/api/portraits/men/32.jpg'
          },
          // ... other reviews
        ],
        'priya-sharma': [
          {
            id: 1,
            userName: 'Amit Singh',
            rating: 5,
            date: '2023-11-05',
            comment: 'Priya is a true professional! Her attention to detail is incredible.',
            userImage: 'https://randomuser.me/api/portraits/men/22.jpg'
          }
        ]
      };
      
      setReviews(mockReviews[artistId] || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    }
  };

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        setError(null);
        // If we already have artist data from the link, use it
        if (location.state?.artistData) {
          setArtist(location.state.artistData);
          // Still fetch reviews
          await fetchReviews(location.state.artistData.id);
          return;
        }

        // Otherwise, fetch artist data
        const mockArtists = {
          'john-doe': {
            id: 'john-doe',
            name: 'John Doe',
            rating: 4.8,
            reviewCount: 128,
            location: 'Chennai, India',
            experience: '8 years experience',
            price: '₹8,000 - ₹12,000',
            category: 'Bridal Makeup Artist',
            phone: '+91 98765 43210',
            email: 'john.doe@example.com',
            about: 'Professional makeup artist with over 8 years of experience in bridal makeup. Specializing in both traditional and contemporary styles, I bring out the best in every bride on their special day.',
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            portfolioImages: [
              'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            ],
            socialMedia: {
              instagram: 'johndoemakeup',
              facebook: 'johndoemakeup',
              website: 'johndoemakeup.com'
            }
          },
          'priya-sharma': {
            id: 'priya-sharma',
            name: 'Priya Sharma',
            rating: 4.9,
            reviewCount: 215,
            location: 'Mumbai, India',
            experience: '5+ years experience',
            price: '₹12,000 - ₹20,000',
            category: 'Celebrity Makeup Artist',
            phone: '+91 98765 12345',
            email: 'priya.sharma@example.com',
            about: 'Award-winning makeup artist with expertise in celebrity and editorial makeup. Known for creating stunning looks that enhance natural beauty and bring out the best features of every client.',
            profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            portfolioImages: [
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            ],
            socialMedia: {
              instagram: 'priyasharmamakeup',
              facebook: 'priyasharmamakeup',
              website: 'priyasharmamakeup.com'
            }
          }
        };

        const mockReviews = {
          'john-doe': [
            {
              id: 1,
              userName: 'Rahul Sharma',
              rating: 5,
              date: '2023-10-15',
              comment: 'Amazing work! John did a fantastic job on my wedding makeup. Highly recommended!',
              userImage: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            {
              id: 2,
              userName: 'Priya Patel',
              rating: 4.5,
              date: '2023-09-28',
              comment: 'Great experience overall. The makeup lasted all day and looked beautiful in photos.',
              userImage: 'https://randomuser.me/api/portraits/women/44.jpg'
            }
          ],
          'priya-sharma': [
            {
              id: 1,
              userName: 'Amit Singh',
              rating: 5,
              date: '2023-11-05',
              comment: 'Priya is a true professional! Her attention to detail is incredible.',
              userImage: 'https://randomuser.me/api/portraits/men/22.jpg'
            }
          ]
        };
        
        setReviews(mockReviews[id] || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchArtistDetails();
  }, [id, location.state]);

  if (loading) {
    return <div className="loading">Loading artist details...</div>;
  }

  return (
    <div className="artist-details">
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Results
        </button>
      </div>
      
      <div className="artist-card">
        <div className="artist-header">
  <div className="artist-image-container" style={{
    width: '100%',
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    backgroundImage: `url(${artist.profileImage || 'https://via.placeholder.com/400x300?text=No+Image'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}>
    <div style={{
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
      padding: '20px',
      color: 'white',
      textAlign: 'left'
    }}>
      <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '600' }}>{artist?.name || 'Artist Name'}</h1>
      <div className="artist-category" style={{ color: '#f0f0f0', fontSize: '1.1rem' }}>{artist?.category || 'Makeup Artist'}</div>
    </div>
  </div>
          <div className="artist-info">
            
            
            <div className="rating">
  {renderStars(artist.rating || 0)}
  <span className="rating-text">
    {(artist.rating || 0).toFixed(1)} ({artist.reviewCount || 0} reviews)
  </span>
</div>

<div className="info-grid">
  <div className="info-item">
    <FaMapMarkerAlt className="info-icon" />
    <span>{artist.location}</span>
  </div>
  <div className="info-item">
    <span>Experience:</span>
    <span>{artist.experience}</span>
  </div>
  <div className="info-item">
    <span>Starting Price:</span>
    <span className="price">{artist.price}</span>
  </div>
</div>
            
            <div className="contact-buttons">
              <a href={`tel:${artist.phone}`} className="btn btn-primary">
                <FaPhone /> Call Now
              </a>
              <a href={`mailto:${artist.email}`} className="btn btn-outline">
                <FaEnvelope /> Message
              </a>
            </div>

            <div className="action-buttons">
              <button className="action-btn shortlist">
                <FaHeart className="action-icon" />
                <span>Shortlist</span>
              </button>
              <button className="action-btn write-review">
                <FaPencilAlt className="action-icon" />
                <span>Write a Review</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="artist-content">
          <div className="about-section">
            <h2>About {artist.name}</h2>
            <p>{artist.about || 'Professional makeup artist specializing in bridal and special occasion makeup.'}</p>
          </div>
          
          <div className="services-section">
            <h2>Services Offered</h2>
            <ul className="services-list">
              {artist.services ? (
                artist.services.map((service, index) => (
                  <li key={index}>
                    <span className="service-name">{service.name}:</span>
                    <span className="service-description">{service.description}</span>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <span className="service-name">Bridal Makeup:</span>
                    <span className="service-description">Complete bridal makeup with long-lasting products</span>
                  </li>
                  <li>
                    <span className="service-name">Engagement Makeup:</span>
                    <span className="service-description">Glamorous makeup for engagement ceremonies</span>
                  </li>
                  <li>
                    <span className="service-name">Party Makeup:</span>
                    <span className="service-description">Evening and party makeup looks</span>
                  </li>
                  <li>
                    <span className="service-name">Hair Styling:</span>
                    <span className="service-description">Professional hairstyling for all occasions</span>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          <div className="portfolio-section">
            <h2>Portfolio</h2>
            <div className="portfolio-grid">
              {(artist.portfolioImages || Array(9).fill('https://via.placeholder.com/300x400?text=Portfolio+Image')).map((image, index) => (
                <div key={index} className="portfolio-item">
                  <img 
                    src={getSafeImageUrl(image)} 
                    alt={`Portfolio ${index + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x400?text=Portfolio+Image';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in ArtistDetails:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong loading this artist's profile.</h2>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const WrappedArtistDetails = () => (
  <ErrorBoundary>
    <ArtistDetails />
  </ErrorBoundary>
);

export default WrappedArtistDetails;
