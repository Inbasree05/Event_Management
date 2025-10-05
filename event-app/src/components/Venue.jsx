import React, { useState, useEffect, useContext } from "react";
import { useCart } from "../contexts/CartContext";
import "./Venue.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Import your makeup images
import gobi1 from "../assets/p-1.jpeg";
import gobi2 from "../assets/p-2.jpeg";
import gobi3 from "../assets/p-3.jpeg";

import erode1 from "../assets/p-4.jpeg";
import erode2 from "../assets/p-5.jpeg";

import chennai1 from "../assets/p-6.jpeg";
import chennai2 from "../assets/p-7.jpeg";

import salem1 from "../assets/p-8.jpeg";
import salem2 from "../assets/p-9.jpeg";

import tirupur1 from "../assets/p-10.jpeg";
import tirupur2 from "../assets/p-11.jpeg";

import defaultImg from "../assets/makeup.jpeg";

const locations = [
  { name: "All", key: "all", img: defaultImg },
  { name: "Gobi", key: "gobi", img: gobi1 },
  { name: "Erode", key: "erode", img: erode1 },
  { name: "Chennai", key: "chennai", img: chennai1 },
  { name: "Salem", key: "salem", img: salem1 },
  { name: "Tirupur", key: "tirupur", img: tirupur1 },
];

const venues = [
  { 
    id: 1, 
    name: "Grand Palace",
    location: "gobi", 
    address: "123 Main St, Gobi",
    capacity: 500,
    price: 50000,
    img: gobi1,
    amenities: ["AC", "Parking", "Stage", "Lighting"],
    description: "Elegant venue perfect for weddings and large gatherings"
  },
  { 
    id: 2, 
    name: "Royal Gardens",
    location: "erode", 
    address: "456 Park Ave, Erode",
    capacity: 300,
    price: 35000,
    img: erode1,
    amenities: ["Garden", "Parking", "Catering"],
    description: "Beautiful outdoor venue with garden setup"
  },
  { 
    id: 3, 
    name: "Chennai Grand",
    location: "chennai", 
    address: "789 Beach Rd, Chennai",
    capacity: 1000,
    price: 75000,
    img: chennai1,
    amenities: ["AC", "Valet Parking", "Luxury Seating", "DJ Booth"],
    description: "Luxury venue with beach view"
  },
  { 
    id: 4, 
    name: "Salem Convention",
    location: "salem", 
    address: "101 Center St, Salem",
    capacity: 800,
    price: 45000,
    img: salem1,
    amenities: ["AC", "Parking", "Projector", "Stage"],
    description: "Modern convention center for all events"
  },
  { 
    id: 5, 
    name: "Tirupur Plaza",
    location: "tirupur", 
    address: "202 Market St, Tirupur",
    capacity: 400,
    price: 30000,
    img: tirupur1,
    amenities: ["AC", "Parking", "Catering"],
    description: "Versatile space for corporate and social events"
  }
];

const Venue = () => {
  const { addToCart } = useCart();
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [successMsg, setSuccessMsg] = useState("");
  const [bookedDates, setBookedDates] = useState({});
  
  // This would normally come from your backend
  // For demo, we'll simulate some booked dates
  useEffect(() => {
    // Simulate fetching booked dates from API
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Mock some booked dates for demo
    const mockBookedDates = {
      1: [today.toISOString().split('T')[0]], // Venue 1 is booked today
      3: [tomorrow.toISOString().split('T')[0]] // Venue 3 is booked tomorrow
    };
    
    setBookedDates(mockBookedDates);
  }, []);
  
  // Check if a venue is available on the selected date
  const isVenueAvailable = (venueId, dateToCheck = null) => {
    const dateStr = dateToCheck || selectedDate.toISOString().split('T')[0];
    return !(bookedDates[venueId] && bookedDates[venueId].includes(dateStr));
  };

  // Filter by location
  const filteredVenues = selectedLocation === "all"
    ? venues
    : venues.filter((venue) => venue.location === selectedLocation);

  // Check if the selected date is in the future
  const isDateValid = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  // Handle booking
  const handleBookNow = (venue) => {
    // Check if the selected date is valid
    if (!isDateValid(selectedDate)) {
      setSuccessMsg("❌ Please select a future date for booking");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }

    // Format the selected date for comparison
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    // Check venue availability
    if (!isVenueAvailable(venue.id, selectedDateStr)) {
      setSuccessMsg(`❌ ${venue.name} is already booked on ${selectedDateStr}`);
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }
    
    const booking = {
      _id: `venue-${venue.id}-${Date.now()}`,
      name: venue.name,
      type: 'venue',
      price: venue.price,
      image: venue.img,
      date: selectedDateStr,
      venueId: venue.id,
      location: venue.location,
      capacity: venue.capacity,
      eventDate: selectedDateStr // Make sure event date matches booking date
    };
    
    addToCart(booking);
    setSuccessMsg(`✅ ${venue.name} booked for ${selectedDateStr} added to cart!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };


  return (
    <div className="venue-page">
      <h1>Venue Booking</h1>
      
      <div className="date-picker-container">
        <h3>Select Event Date:</h3>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          minDate={new Date()}
          dateFormat="MMMM d, yyyy"
          className="date-picker"
        />
      </div>

      <h2>Choose Location</h2>
      <div className="location-container">
        {locations.map((loc) => (
          <div
            key={loc.key}
            className={`location ${selectedLocation === loc.key ? "active" : ""}`}
            onClick={() => setSelectedLocation(loc.key)}
          >
            <img src={loc.img} alt={loc.name} />
            <p>{loc.name}</p>
          </div>
        ))}
      </div>

      {successMsg && <div className="success-message">{successMsg}</div>}

      <div className="venue-container">
        {filteredVenues.map((venue) => {
          const isAvailable = isVenueAvailable(venue.id);
          return (
            <div key={venue.id} className={`venue-card ${!isAvailable ? 'unavailable' : ''}`}>
              <div className="venue-image">
                <img src={venue.img} alt={venue.name} />
                {!isAvailable && <div className="booked-badge">Booked</div>}
              </div>
              <div className="venue-details">
                <h3>{venue.name}</h3>
                <p className="location">{venue.address}</p>
                <p className="capacity">Capacity: {venue.capacity} people</p>
                <p className="price">₹{venue.price.toLocaleString()}</p>
                <div className="amenities">
                  {venue.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-tag">{amenity}</span>
                  ))}
                </div>
                <p className="description">{venue.description}</p>
                <button 
                  onClick={() => handleBookNow(venue)}
                  disabled={!isAvailable}
                  className={!isAvailable ? 'disabled' : ''}
                >
                  {isAvailable ? 'Book Now' : 'Not Available'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Venue;

