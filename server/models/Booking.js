import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String },
    price: { type: Number },
    image: { type: String },
    location: { type: String },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    items: [ItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'confirmed' },
  },
  { timestamps: true }
);

export const BookingModel = mongoose.model("Booking", BookingSchema);