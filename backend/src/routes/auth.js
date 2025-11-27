const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../models/db');

// --- REGISTER ---
router.post('/register', async (req, res) => {
  const { email, password, account_type } = req.body;

  if (!email || !password || !account_type)
    return res.status(400).json({ error: 'Missing fields' });

  if (!["candidate", "recruiter"].includes(account_type))
    return res.status(400).json({ error: "Invalid account type" });

  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (email, password_hash, account_type)
       VALUES ($1, $2, $3)
       RETURNING id, email, account_type`,
      [email, hashed, account_type]
    );

    req.session.userId = result.rows[0].id;

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    // Email already exists (Postgres error code)
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already registered" });
    }

    res.status(500).json({ error: "Database error" });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const r = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (r.rows.length === 0)
      return res.status(400).json({ error: "Invalid credentials" });

    const user = r.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid)
      return res.status(400).json({ error: "Invalid credentials" });

    req.session.userId = user.id;

    res.json({
      id: user.id,
      email: user.email,
      account_type: user.account_type
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Database error" });
  }
});

// --- LOGOUT ---
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Logout failed" });

    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

module.exports = router;