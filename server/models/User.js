import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Update lastActive timestamp before saving
UserSchema.pre('save', function(next) {
  if (this.isModified('lastActive') || this.isNew) {
    this.lastActive = new Date();
  }
  next();
});

// Static method to update lastActive timestamp
UserSchema.statics.updateLastActive = async function(userId) {
  return this.findByIdAndUpdate(
    userId,
    { $set: { lastActive: new Date() } },
    { new: true }
  );
};

export const UserModel = mongoose.model("User", UserSchema);