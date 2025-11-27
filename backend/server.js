const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/auth");

console.log('🔍 Début du chargement du serveur...');

try {
  console.log('Tentative de chargement des routes profile...');
  const profileRoutes = require("./src/routes/profile");
  console.log('Routes profile chargées avec succès');
} catch (error) {
  console.error('ERREUR chargement routes profile:', error.message);
  console.error('Stack trace:', error.stack);
}

dotenv.config();

const app = express();

// Middleware CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// === AUGMENTEZ LA LIMITE DE TAILLE POUR LES REQUÊTES ===
app.use(express.json({ limit: '10mb' })); // Augmentez de 1mb à 10mb
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
  res.send("Backend is finally working with sessions!");
});

// Import routes
app.use("/api/auth", authRoutes);

try {
  console.log('Enregistrement des routes /api/profile...');
  const profileRoutes = require("./src/routes/profile");
  app.use("/api/profile", profileRoutes);
  console.log('Routes /api/profile enregistrées avec succès');
} catch (error) {
  console.error('ERREUR enregistrement routes profile:', error.message);
}

// Start server
const PORT = process.env.PORT || 8085;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});