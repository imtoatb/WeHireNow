const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./src/routes/auth");
const jobRoutes = require("./src/routes/jobs");
const jobApplicationsRoutes = require("./src/routes/jobApplications");

const app = express();

// Middleware CORS SIMPLIFIÉ
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
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
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Test route
app.get("/", (req, res) => res.send("Backend is working"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", jobApplicationsRoutes);

// Optional profile routes
try {
  const profileRoutes = require("./src/routes/profile");
  app.use("/api/profile", profileRoutes);
  console.log("Profile routes loaded");
} catch (err) {
  console.error("Profile routes not found:", err.message);
}

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// Start server
const PORT = process.env.PORT || 8085;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});