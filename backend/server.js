const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/auth");
const jobRoutes = require("./src/routes/jobs");


// === AJOUTEZ CE CODE DE DÉBOGAGE ===
console.log('🔍 Début du chargement du serveur...');

// Test 1: Vérifier si le fichier profile.js existe
try {
  console.log('🔄 Tentative de chargement des routes profile...');
  const profileRoutes = require("./src/routes/profile");
  console.log('✅ Routes profile chargées avec succès');
} catch (error) {
  console.error('❌ ERREUR chargement routes profile:', error.message);
  console.error('❌ Stack trace:', error.stack);
}
// === FIN DU CODE DE DÉBOGAGE ===

dotenv.config();

const app = express();

// Middleware CORS
// Middleware CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Middleware JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

// routes
app.get("/", (req, res) => {
  res.send("Backend is finally working with sessions!");
});

app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

// === AJOUTEZ CE CODE POUR L'ENREGISTREMENT ===
try {
  console.log('Routes saved /api/profile...');
  const profileRoutes = require("./src/routes/profile");
  app.use("/api/profile", profileRoutes);
  console.log('Routes /api/profile saved with success');
} catch (error) {
  console.error('Error route profile:', error.message);
}
// === FIN DU CODE ===

// Start server
const PORT = process.env.PORT || 8085;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});