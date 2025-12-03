const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./src/routes/auth");
const jobRoutes = require("./src/routes/jobs");
const jobApplicationsRoutes = require("./src/routes/jobApplications");

const app = express();

// Configuration CORS - le middleware cors gère automatiquement OPTIONS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || "wehirenow_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  },
  proxy: true,
  name: 'wehirenow.sid'
}));

// Middleware de débogage
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().split('T')[1].split('.')[0]}] ${req.method} ${req.path}`);
  console.log('  Session userId:', req.session.userId);
  next();
});

// Test routes
app.get("/", (req, res) => res.send("Backend is working"));

app.get("/api/session-check", (req, res) => {
  res.json({ 
    userId: req.session.userId,
    sessionId: req.sessionID
  });
});

app.get("/api/test-cookie", (req, res) => {
  res.cookie('test_cookie', 'test_value', {
    httpOnly: false,
    secure: false,
    sameSite: 'lax'
  });
  res.json({ message: "Cookie set" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", jobApplicationsRoutes);

try {
  const profileRoutes = require("./src/routes/profile");
  app.use("/api/profile", profileRoutes);
  console.log("Profile routes loaded");
} catch (err) {
  console.error("Profile routes not found:", err.message);
}

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});