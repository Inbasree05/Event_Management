import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',');
app.use(cors({
  origin: function(origin, cb){
    if (!origin) return cb(null, true); // allow tools/curl
    return cb(null, ALLOWED_ORIGINS.includes(origin));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.options('*', cors());
app.use(express.json());
app.use(morgan('dev'));

// Static uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  }
});
const upload = multer({ storage });

// Simple auth middleware placeholder (expects Authorization: Bearer <token>)
// Replace with your real auth that sets req.user = { role: 'admin' }
function fakeAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    // In a real app, verify token and decode role
    req.user = { role: process.env.DEFAULT_ROLE || 'admin' };
  }
  next();
}
app.use(fakeAuth);

// Mongo connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventapp';
await mongoose.connect(MONGO_URI, { dbName: process.env.MONGO_DB || 'eventapp' });
console.log('MongoDB connected');

// Models
import Product from './models/Product.js';

// Admin guard
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Forbidden' });
}

// Minimal auth for development
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  // DEV ONLY: accept any credentials and issue a fake token
  return res.json({
    token: 'dev-token',
    user: { id: 'dev-user', email, role: email.includes('admin') ? 'admin' : 'user' }
  });
});

app.post('/auth/signup', (req, res) => {
  const { email, password, username } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  return res.status(201).json({ message: 'Signed up (dev)', user: { id: 'new-user', email, username, role: 'user' } });
});

app.get('/auth/me', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  return res.json({ user: { id: 'dev-user', email: 'dev@example.com', role: req.user.role } });
});

// Public products
app.get('/products', async (req, res) => {
  const { category } = req.query;
  const q = category ? { category } : {};
  const products = await Product.find(q).sort({ createdAt: -1 });
  res.json({ products });
});

// Admin products
app.get('/admin/products', requireAdmin, async (_req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  res.json({ products });
});

app.post('/admin/products', requireAdmin, upload.single('image'), async (req, res) => {
  const body = req.body || {};
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : (body.imageUrl || '');
  const product = await Product.create({
    name: body.name,
    category: body.category,
    price: body.price,
    description: body.description || '',
    imageUrl
  });
  res.status(201).json({ product });
});

app.put('/admin/products/:id', requireAdmin, upload.single('image'), async (req, res) => {
  const body = req.body || {};
  const update = {
    name: body.name,
    category: body.category,
    price: body.price,
    description: body.description || ''
  };
  if (req.file) update.imageUrl = `/uploads/${req.file.filename}`;
  else if (body.imageUrl !== undefined) update.imageUrl = body.imageUrl;
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json({ product });
});

app.delete('/admin/products/:id', requireAdmin, async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));


