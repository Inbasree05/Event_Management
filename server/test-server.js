import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({ 
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Test server is working!" });
});

// Test signup route without MongoDB
app.post("/auth/signup", (req, res) => {
  console.log("Signup request received:", req.body);
  const { username, email, password, role } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ 
      status: false, 
      message: "All fields are required" 
    });
  }
  
  // Simulate successful signup
  res.json({ 
    status: true, 
    message: "✅ Test signup successful (no database)" 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});
