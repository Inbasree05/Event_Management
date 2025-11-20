const express = require("express");
const Booking = require("../models/Booking");
const { auth } = require("../middleware/auth");
const { sendBookingConfirmation, sendOrderConfirmation } = require("../utils/emailService");
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET /booking/my - Get bookings for the authenticated user
router.get("/my", auth, async (req, res) => {
  try {
    const email = (req.user?.email || "").toLowerCase();
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "User email missing in token"
      });
    }

    const bookings = await Booking.find({
      email: { $regex: new RegExp(`^${email}$`, "i") }
    }).sort({ createdAt: -1 });

    res.json({ 
      success: true,
      bookings 
    });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching user bookings", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /bookings - Get bookings by email and phone (public endpoint)
router.get("/", async (req, res) => {
  try {
    const { email, phone } = req.query;
    
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required"
      });
    }

    const query = {};
    if (email) query.email = { $regex: new RegExp(`^${email}$`, "i") };
    if (phone) query.phone = phone;

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      bookings
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// POST /booking - Create a new booking
router.post("/", auth, async (req, res) => {
  try {
    const { name, email, phone, date, items, totalAmount } = req.body;

    // Generate a unique booking ID
    const bookingId = `BK-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Save booking to MongoDB
    const newBooking = new BookingModel({
      bookingId,
      name,
      email: email.toLowerCase(),
      phone: phone.trim(),
      date,
      items,
      totalAmount,
      status: 'confirmed'
    });

    await newBooking.save();

    // Send a consolidated order confirmation email with all items
    try {
      await sendOrderConfirmation(email, {
        bookingId,
        name,
        phone,
        date,
        items,
        totalAmount
      });
    } catch (emailErr) {
      console.error('Failed to send consolidated order email:', emailErr);
      // Do not block booking response if email fails
    }

    res.status(201).json({ 
      success: true,
      bookingId,
      message: "Booking confirmed! A confirmation email has been sent to your email address." 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save booking", error: err.message });
  }
});

module.exports = BookingRouter;