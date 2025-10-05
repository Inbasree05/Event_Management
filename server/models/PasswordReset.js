import mongoose from "mongoose";

const PasswordResetSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  otp: { 
    type: String, 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    default: Date.now,
    expires: 600 // OTP expires in 10 minutes (600 seconds)
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const PasswordResetModel = mongoose.model("PasswordReset", PasswordResetSchema);
