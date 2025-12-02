const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");

// ==== IMPORT DES ROUTES ====
const authRoutes = require("./src/routes/auth");
const jobRoutes = require("./src/routes/jobs");
const recruiterProfileRoutes = require("./src/routes/RecruiterProfile");
const profileRoutes = require("./src/routes/profile");

console.log("🔍 Début du chargement du serveur...");

dotenv.config();

const app = express();

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
app.use("/api/recruiter-profile", recruiterProfileRoutes);
app.use("/api/profile", profileRoutes);
console.log("✅ Routes /api/* enregistrées");

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
