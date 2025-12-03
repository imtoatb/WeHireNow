const express = require("express");
const router = express.Router();
const db = require("../models/db");

// ------------------------------------
// GET /api/jobs → all jobs
// ------------------------------------
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM jobs ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// ------------------------------------
// GET /api/jobs/search → filtered jobs
// ------------------------------------
router.get("/search", async (req, res) => {
  try {
    const { contractTypes, levels, timeTypes, workModes, fields, area, keywords, showExpired } = req.query;

    let sql = "SELECT * FROM jobs WHERE 1=1";
    const params = [];
    let index = 1;

    const addInClause = (field, list) => {
      const placeholders = list.map(() => `$${index++}`).join(",");
      sql += ` AND ${field} IN (${placeholders})`;
      params.push(...list);
    };

    if (contractTypes) addInClause("contract_type", contractTypes.split(","));
    if (levels) addInClause("level", levels.split(","));
    if (timeTypes) addInClause("time_type", timeTypes.split(","));
    if (workModes) addInClause("work_mode", workModes.split(","));
    if (fields) addInClause("field", fields.split(","));

    if (area) {
      sql += ` AND location ILIKE $${index++}`;
      params.push(`%${area}%`);
    }

    if (keywords) {
      sql += ` AND (position ILIKE $${index} OR name ILIKE $${index} OR description ILIKE $${index + 1})`;
      params.push(`%${keywords}%`, `%${keywords}%`);
      index += 2;
    }

    // Si showExpired n'est pas true, filtrer les jobs de plus de 3 mois
    if (showExpired !== 'true') {
      sql += ` AND created_at > CURRENT_TIMESTAMP - INTERVAL '3 months'`;
    }

    sql += " ORDER BY created_at DESC";

    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Job search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /api/jobs/my  → tous les jobs postés par un utilisateur (via email)
router.get("/my", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // retrouver user_id à partir de l'email
    const [userRows] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (!userRows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRows[0].id;

    // récupérer tous les jobs avec ce user_id
    const [jobs] = await db.query(
      "SELECT * FROM jobs WHERE user_id = ? ORDER BY id DESC",
      [userId]
    );

    res.json(jobs);
  } catch (err) {
    console.error("Get my jobs error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ------------------------------------
// GET /api/jobs/:id → single job
// ------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const jobId = req.params.id;
    const result = await db.query("SELECT * FROM jobs WHERE id = $1", [jobId]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Job detail error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// POST /api/jobs  → créer une nouvelle offre
router.post("/", async (req, res) => {
  try {
    const {
      email,            // 🔴 ON LIT L'EMAIL DU RECRUTEUR
      name,
      position, 
      company_name, 
      location, 
      description, 
      contract_type, 
      level, 
      time_type, 
      work_mode, 
      field, 
      salary_range,
      requirements,
      benefits 
    } = req.body;
      company,
      localisation,
      description,
      contract_type,
      level,
      time_type,
      work_mode,
      field,
    } = req.body;

    console.log("📥 POST /api/jobs body:", req.body);

    if (!email) {
      console.log("❌ Missing email in body");
      return res.status(400).json({ error: "Email is required" });
    }

    if (!name || !company) {
      return res.status(400).json({ error: "Name and company are required" });
    }

    // 1) récupérer user_id depuis la table users (comme pour les profils)
    const [userRows] = await db.query(
      "SELECT id, account_type FROM users WHERE email = ?",
      [email]
    );

    console.log("🔎 userRows for email", email, "=>", userRows);

    if (!userRows.length) {
      console.log("❌ User not found for email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRows[0].id;
    console.log("✅ Resolved userId:", userId);

    // (optionnel) vérifier que c'est bien un recruteur
    // if (String(userRows[0].account_type).toLowerCase() !== "recruiter") {
    //   return res.status(403).json({ error: "Only recruiters can post jobs" });
    // }


    // 2) INSERT avec user_id
    const [result] = await db.query(
      `INSERT INTO jobs
       (user_id, name, company, localisation, description, contract_type, level, time_type, work_mode, field)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        company,
        localisation || "",
        description || "",
        contract_type || "",
        level || "",
        time_type || "",
        work_mode || "",
        field || "",
      ]
    );

    console.log("🧾 Job inserted with id:", result.insertId);

    // 3) renvoyer le job créé avec son id
    const [rows] = await db.query("SELECT * FROM jobs WHERE id = ?", [
      result.insertId,
    ]);

    console.log("📤 Returning job:", rows[0]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;