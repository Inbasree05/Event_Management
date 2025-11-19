const express = require("express");
const { BookingModel } = require("../models/Booking.js");
const { auth } = require("../middleware/auth.js");
const { sendBookingConfirmation, sendOrderConfirmation } = require("../utils/emailService.js");
const { v4: uuidv4 } = require('uuid');

const BookingRouter = express.Router();

// GET /booking/my - Get bookings for the authenticated user
BookingRouter.get("/my", auth, async (req, res) => {
  try {
    const email = (req.user?.email || "").toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "User email missing in token" });
    }
    const bookings = await BookingModel.find({
      email: { $regex: new RegExp(`^${email}$`, "i") }
    }).sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user bookings", error: err.message });
  }
});

// GET /bookings - Get bookings by email and phone
BookingRouter.get("/", async (req, res) => {
  try {
    const { email, phone } = req.query;
    
    if (!email || !phone) {
      return res.status(400).json({ 
        message: "Email and phone number are required" 
      });
    }

    const bookings = await BookingModel.find({ 
      email: email.toLowerCase(),
      phone: phone.trim()
    }).sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: "Error fetching bookings", 
      error: err.message 
    });
  }
});

// POST /booking
BookingRouter.post("/", async (req, res) => {
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