const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/auth");

console.log('Starting server...');

try {
  console.log('Loading profile routes...');
  const profileRoutes = require("./src/routes/profile");
  console.log('Profile routes loaded successfully');
} catch (error) {
  console.error('ERROR loading profile routes:', error.message);
  console.error('Stack trace:', error.stack);
}

dotenv.config();

const app = express();

// Middleware CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Increase payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "wehirenow_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is working with sessions!");
});

// Import routes
app.use("/api/auth", authRoutes);

try {
  console.log('Registering /api/profile routes...');
  const profileRoutes = require("./src/routes/profile");
  app.use("/api/profile", profileRoutes);
  console.log('/api/profile routes registered successfully');
} catch (error) {
  console.error('ERROR registering profile routes:', error.message);
}

// Start server
const PORT = process.env.PORT || 8085;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});