const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/auth");
const jobRoutes = require("./src/routes/jobs");
const recruiterProfile = require("./src/routes/RecruiterProfile")


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
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Middleware JSON
// Accepter des JSON + formulaires plus gros (images base64)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));


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
app.use("/api/recruiter-profile", recruiterProfile);


// === AJOUTEZ CE CODE POUR L'ENREGISTREMENT ===
try {
  console.log('🔄 Enregistrement des routes /api/profile...');
  const profileRoutes = require("./src/routes/profile");
  app.use("/api/profile", profileRoutes);
  console.log('✅ Routes /api/profile enregistrées avec succès');
} catch (error) {
  console.error('❌ ERREUR enregistrement routes profile:', error.message);
}
// === FIN DU CODE ===

const PORT = process.env.PORT || 8085;
// Middleware 404 pour voir les routes non trouvées
app.use((req, res) => {
  console.log('❌ 404 - Route non trouvée :', req.method, req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on http://localhost:" + PORT);
});