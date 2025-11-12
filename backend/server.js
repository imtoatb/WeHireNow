const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/auth");

dotenv.config();

const app = express();

//Middleware CORS
app.use(cors({
  origin: "http://localhost:5173", // ton frontend (Vite/Vue)
  credentials: true,
}));

//Middleware JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "wehirenow_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // mettre à true si HTTPS
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

//Start server
const PORT = process.env.PORT || 8085;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on http://localhost:${PORT}");
});
