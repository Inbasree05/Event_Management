import express from 'express';
import { ProductModel } from '../models/Product.js';

export const ProductsRouter = express.Router();

// Public endpoint: list products (optionally by category)
ProductsRouter.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && typeof category === 'string') {
      const trimmed = category.trim();
      if (trimmed.length > 0) {
        // Case-insensitive exact match for category
        filter.category = { $regex: new RegExp(`^${trimmed}$`, 'i') };
      }
    }
    const products = await ProductModel.find(filter).sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    console.error('Error fetching public products:', err);
    res.status(500).json({ status: false, message: 'Failed to fetch products' });
  }
});
