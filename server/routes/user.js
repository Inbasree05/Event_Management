import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserModel } from "../models/User.js";
import { PasswordResetModel } from "../models/PasswordReset.js";
import { generateOTP, sendOTPEmail } from "../utils/emailService.js";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const UserRouter = express.Router();


UserRouter.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const userExists = await UserModel.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ status: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });
    await newUser.save();

    res.json({ status: true, message: "✅ User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "❌ Signup failed",
      error: error.message,
    });
  }
});

// ======================= Login =======================
UserRouter.post("/login", async (req, res) => {
  console.log("=== Login Request ===");
  console.log("Headers:", req.headers);
  console.log("Request Body:", req.body);
  console.log("Cookies:", req.cookies);
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: false, message: "Invalid email or password" });
    }

    // Update lastActive timestamp using the model method
    const updatedUser = await UserModel.updateLastActive(user._id);
    if (!updatedUser) {
      console.error('Failed to update lastActive for user:', user.email);
    } else {
      console.log('Successfully updated lastActive for', user.email, 'to:', updatedUser.lastActive);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, { httpOnly: true }).json({
      status: true,
      message: `✅ ${user.role} login successful`,
      token,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "❌ Login failed",
      error: error.message,
    });
  }
});

// ======================= Google Login =======================
UserRouter.post("/google-login", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.json({ status: false, message: "No email provided" });
    }

    // check if user already exists
    let user = await UserModel.findOne({ email });
    const now = new Date();

    if (!user) {
      // if not → create new user with current timestamp
      user = new UserModel({
        username: name,
        email,
        password: "google-auth", 
        role: "user",
        lastActive: now,
        createdAt: now
      });
      await user.save();
      console.log(`Created new Google user: ${email} with lastActive: ${now}`);
    } else {
      // Update lastActive for existing user
      user.lastActive = now;
      await user.save();
      console.log(`Updated lastActive for Google user ${email} to: ${now}`);
    }

    // generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, { httpOnly: true }).json({
      status: true,
      message: "✅ Google login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("Google Login Error:", error.message);
    res
      .status(500)
      .json({ status: false, message: "❌ Google login failed", error: error.message });
  }
});

// ======================= Forgot Password =======================
UserRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    
    console.log(`Forgot password request for email: ${normalizedEmail}`);

    // Check if user exists (case-insensitive)
    const user = await UserModel.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });
    
    if (!user) {
      console.log(`User not found for email: ${normalizedEmail}`);
      return res.status(200).json({ 
        status: false, 
        message: "If your email exists in our system, you'll receive a password reset OTP." 
      });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    
    // Delete any existing reset tokens for this user
    await PasswordResetModel.deleteMany({ userId: user._id });

    // Create new password reset record
    const passwordReset = new PasswordResetModel({
      userId: user._id,
      email: user.email,
      otp: otp,
      expiresAt: new Date(Date.now() + 600000) // 10 minutes from now
    });

    await passwordReset.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);
    
    if (emailResult.success) {
      res.json({
        status: true,
        message: "OTP sent successfully to your email. Please check your inbox."
      });
    } else {
      // If email fails, delete the OTP record and return error
      await PasswordResetModel.deleteOne({ _id: passwordReset._id });
      res.status(500).json({
        status: false,
        message: "Failed to send OTP email. Please try again."
      });
    }

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to process password reset request",
      error: error.message
    });
  }
});

// ======================= Reset Password =======================
UserRouter.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        status: false,
        message: "Email, OTP, and new password are required"
      });
    }

    // Trim and normalize OTP
    const normalizedOTP = otp.toString().trim();
    
    console.log(`OTP Verification - Email: ${email}, OTP: ${normalizedOTP}`);
    
    // Find valid OTP (case-insensitive and trimmed)
    const passwordReset = await PasswordResetModel.findOne({
      email: email.trim().toLowerCase(),
      expiresAt: { $gt: new Date() }
    });

    console.log('Found reset record:', passwordReset ? 'yes' : 'no');
    
    if (!passwordReset) {
      console.log('No valid OTP found for email:', email);
      return res.status(400).json({
        status: false,
        message: "Invalid or expired OTP"
      });
    }
    
    // Compare OTPs
    if (passwordReset.otp.toString().trim() !== normalizedOTP) {
      console.log('OTP mismatch:', {
        provided: normalizedOTP,
        expected: passwordReset.otp.toString()
      });
      return res.status(400).json({
        status: false,
        message: "Invalid OTP. Please check the code and try again."
      });
    }

    // Find the user
    const user = await UserModel.findById(passwordReset.userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

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
    const users = await UserModel.find({}, { password: 0, __v: 0 }).sort({ createdAt: -1 });
    
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
