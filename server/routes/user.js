const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { PasswordResetModel } = require("../models/PasswordReset.js");
const { generateOTP, sendOTPEmail } = require("../utils/emailService.js");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const UserRouter = express.Router();


UserRouter.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)


    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await UserModel.findByIdAndUpdate(user._id, {
      password: hashedPassword
    });

    // Delete the used OTP
    await PasswordResetModel.deleteOne({ _id: passwordReset._id });

    console.log(`✅ Password successfully reset for user: ${user.email}`);

    res.json({
      status: true,
      message: "Password reset successful. You can now login with your new password."
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to reset password",
      error: error.message
    });
  }
});

// ======================= Get All Users (Admin) =======================
UserRouter.get("/all-users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, __v: 0 }).sort({ createdAt: -1 });
    
    // Log detailed user activity information
    console.log('\n=== User Activity Report ===');
    const now = new Date();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    
    // Log raw data for debugging
    console.log('\n=== Raw User Data ===');
    users.forEach(user => {
      console.log(`\n👤 ${user.email}:`);
      console.log('   Raw lastActive:', user.lastActive);
      console.log('   Raw createdAt:', user.createdAt);
      
      // Check if dates are valid
      const lastActive = user.lastActive ? new Date(user.lastActive) : null;
      const createdAt = new Date(user.createdAt);
      
      console.log('   Parsed lastActive:', lastActive ? lastActive.toISOString() : 'null');
      console.log('   Parsed createdAt:', createdAt.toISOString());
      
      if (lastActive) {
        const timeDiff = now - lastActive;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        console.log('   Time since last active (days):', daysDiff.toFixed(2));
      }
    });
    
    // Prepare response data
    const usersWithFormattedDates = users.map(user => ({
      ...user.toObject(),
      // Ensure dates are properly serialized
      lastActive: user.lastActive ? new Date(user.lastActive).toISOString() : null,
      createdAt: new Date(user.createdAt).toISOString()
    }));
    
    console.log('\n=== End of User Activity Report ===\n');
    
    res.json({ 
      status: true, 
      users: usersWithFormattedDates,
      serverTime: now.toISOString()
    });
  } catch (error) {
    console.error('Error in /all-users:', error);
    res.status(500).json({ 
      status: false, 
      message: error.message,
      error: error.stack 
    });
  }
});

module.exports = UserRouter;
