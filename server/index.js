import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { UserRouter } from "./routes/user.js";
import { BookingRouter } from "./routes/booking.js";
import { router as ReviewRouter } from "./routes/review.js";
import path from "path";
import { AdminRouter } from "./routes/admin.js";
import { ProductsRouter } from "./routes/products.js";
dotenv.config();
const app = express();

app.use(express.json());
// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-auth-token'],
  exposedHeaders: ['Authorization', 'x-auth-token']
};

// Enable CORS with options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(cookieParser());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/auth", UserRouter);
app.use("/api/reviews", ReviewRouter); // Mount review routes under /api/reviews
app.use("/booking", BookingRouter);
app.use("/admin", AdminRouter);
app.use("/products", ProductsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database connection
console.log('Connecting to MongoDB...');
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err.message));