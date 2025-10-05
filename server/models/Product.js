import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    category: { type: String, default: '' },
    imageUrl: { type: String, default: '' }, // will store /uploads/<filename>
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model('Product', ProductSchema);
