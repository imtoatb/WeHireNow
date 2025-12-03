const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
<<<<<<< HEAD
=======

// ==== IMPORT DES ROUTES ====
const authRoutes = require("./src/routes/auth");
const jobRoutes = require("./src/routes/jobs");
const recruiterProfileRoutes = require("./src/routes/RecruiterProfile");
const profileRoutes = require("./src/routes/profile");

console.log("🔍 Début du chargement du serveur...");
>>>>>>> origin/AddJob

dotenv.config();

const authRoutes = require("./src/routes/auth");
const jobRoutes = require("./src/routes/jobs");
const jobApplicationsRoutes = require("./src/routes/jobApplications");

const app = express();

<<<<<<< HEAD
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
=======
// ==== CORS ====
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ==== BODY PARSERS (avec limite augmentée pour l'image base64) ====
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ==== SESSIONS ====
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

// ==== ROUTE DE TEST ====
app.get("/", (req, res) => {
  res.send("Backend is finally working with sessions!");
});


// ==== ROUTES API ====
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
console.log("ca ca passe ⚠️");
app.use("/api/recruiter-profile", recruiterProfileRoutes);
console.log("C EST ICI QUE CA CASSE  ⚠️");
app.use("/api/profile", profileRoutes);
console.log("✅ Routes /api/* enregistrées");
console.log("authRoutes typeof:", typeof authRoutes);
console.log("jobRoutes typeof:", typeof jobRoutes);
console.log("recruiterProfileRoutes typeof:", typeof recruiterProfileRoutes);
console.log("profileRoutes typeof:", typeof profileRoutes);
// ==== 404 LOGGER ====
app.use((req, res) => {
  console.log("❌ 404 - Route non trouvée :", req.method, req.originalUrl);
  res.status(404).json({ message: "Route not found" });
});

// ==== LANCEMENT SERVEUR ====
const PORT = process.env.PORT || 8085;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on http://localhost:" + PORT);
});
>>>>>>> origin/AddJob
