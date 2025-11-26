const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/auth");
const jobRoutes = require("./src/routes/jobs");

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const PORT = process.env.PORT || 8085;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on http://localhost:" + PORT);
});