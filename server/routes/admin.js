const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const Product = require('../models/Product');
const Booking = require('../models/Booking');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  }
});

const upload = multer({ storage });

// Simple admin check middleware (optional, based on token payload)
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: false, message: 'Admin access required' });
  }
  next();
}

// GET /admin/products - list products
router.get('/products', auth, requireAdmin, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ status: false, message: 'Failed to fetch products' });
  }
});

// POST /admin/products - create product with optional image file
router.post('/products', auth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description = '', price, category = '' } = req.body;
    if (!name || !price) {
      return res.status(400).json({ status: false, message: 'Name and price are required' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const product = new Product({
      name,
      description,
      price: Number(price),
      category: (category || '').trim(),
      imageUrl
    });
    await product.save();

    res.status(201).json({ status: true, product, message: 'Product created successfully' });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ status: false, message: 'Failed to create product', error: err.message });
  }
});

// GET /admin/products/:id - fetch single product
router.get('/products/:id', auth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });
    res.json({ status: true, product });
  } catch (err) {
    console.error('Error fetching product by id:', err);
    res.status(500).json({ status: false, message: 'Failed to fetch product', error: err.message });
    res.status(500).json({ status: false, message: 'Failed to fetch product' });
  }
});

// PUT /admin/products/:id - update product (optionally replace image)
router.put('/products/:id', auth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });

    // Handle optional image replacement
    let imageUrl = product.imageUrl;
    if (req.file) {
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), imageUrl.replace('/uploads', 'uploads'));
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) { console.warn('Failed to delete old image:', e.message); }
        }
      }
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (typeof name !== 'undefined') product.name = name;
    if (typeof description !== 'undefined') product.description = description;
    if (typeof price !== 'undefined') product.price = Number(price);
    if (typeof category !== 'undefined') product.category = (category || '').trim();
    product.imageUrl = imageUrl;

    await product.save();
    res.json({ status: true, product, message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ status: false, message: 'Failed to update product' });
  }
});

// DELETE /admin/products/:id - delete product and its image
router.delete('/products/:id', auth, requireAdmin, async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ status: false, message: 'Product not found' });

    // Remove image file from disk if present
    if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      const imgPath = path.join(process.cwd(), product.imageUrl.replace('/uploads', 'uploads'));
      if (fs.existsSync(imgPath)) {
        try { fs.unlinkSync(imgPath); } catch (e) { console.warn('Failed to delete image:', e.message); }
      }
    }

    await ProductModel.deleteOne({ _id: product._id });
    res.json({ status: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ status: false, message: 'Failed to delete product' });
  }
});

// GET /admin/orders - return real bookings
router.get('/orders', auth, requireAdmin, async (req, res) => {
  try {
    const bookings = await BookingModel.find({}).sort({ createdAt: -1 });
    // Map to a shape the AdminDashboard can display
    const orders = bookings.map(b => ({
      _id: b._id,
      bookingId: b.bookingId || b._id?.toString(),
      user: { name: b.name, email: b.email, phone: b.phone },
      items: b.items || [],
      total: Number(b.totalAmount) || 0,
      status: b.status || 'confirmed',
      createdAt: b.createdAt
    }));
    res.json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ status: false, message: 'Failed to fetch orders' });
  }
});

export const AdminRouter = router;
