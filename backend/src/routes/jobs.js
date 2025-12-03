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

// GET /api/jobs/my → tous les jobs postés par un utilisateur (via email)
router.get("/my", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // retrouver user_id à partir de l'email - FIXED for PostgreSQL
    const userResult = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (!userResult.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].id;

    // récupérer tous les jobs avec ce user_id - FIXED for PostgreSQL
    const jobsResult = await db.query(
      "SELECT * FROM jobs WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    res.json(jobsResult.rows);
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
// POST /api/jobs → créer une nouvelle offre
router.post("/", async (req, res) => {
  try {
    const {
      email,            
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
      benefits,
      hiring_roles = [],
      skills = [],
      hiring_process = "",
      company_benefits = [],
      additional_benefits = ""
    } = req.body;

    console.log("POST /api/jobs body:", req.body);

    if (!email) {
      console.log("Missing email in body");
      return res.status(400).json({ error: "Email is required" });
    }

    if (!name || !company_name) {
      return res.status(400).json({ error: "Name and company are required" });
    }

    // 1) récupérer user_id depuis la table users
    const userResult = await db.query(
      "SELECT id, account_type FROM users WHERE email = $1",
      [email]
    );

    console.log("User rows for email", email, "=>", userResult.rows);

    if (!userResult.rows.length) {
      console.log("User not found for email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].id;
    console.log("Resolved userId:", userId);

    // Vérifier que c'est un recruteur
    if (String(userResult.rows[0].account_type).toLowerCase() !== "recruiter") {
      return res.status(403).json({ error: "Only recruiters can post jobs" });
    }

    // 2) Préparer les données pour PostgreSQL
    // Convertir les tableaux en format PostgreSQL array si besoin
    const hiringRolesArray = Array.isArray(hiring_roles) && hiring_roles.length > 0 ? hiring_roles : [];
    const skillsArray = Array.isArray(skills) && skills.length > 0 ? skills : [];
    const companyBenefitsArray = Array.isArray(company_benefits) && company_benefits.length > 0 ? company_benefits : [];

    // 3) INSERT avec user_id
    const insertResult = await db.query(
      `INSERT INTO jobs
       (user_id, name, position, company_name, location, description, 
        contract_type, level, time_type, work_mode, field, salary_range,
        requirements, benefits, hiring_roles, skills, hiring_process, 
        company_benefits, additional_benefits, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
               $15, $16, $17, $18, $19, NOW())
       RETURNING *`,
      [
        userId,
        name || "",
        position || name || "",
        company_name || "",
        location || "",
        description || "",
        contract_type || "",
        level || "",
        time_type || "",
        work_mode || "",
        field || "",
        salary_range || "",
        requirements || "",
        benefits || "",
        // Champs supplémentaires - utilisation des tableaux préparés
        hiringRolesArray,
        skillsArray,
        hiring_process || "",
        companyBenefitsArray,
        additional_benefits || ""
      ]
    );

    console.log("Job inserted with id:", insertResult.rows[0].id);

    res.status(201).json({
      success: true,
      job: insertResult.rows[0]
    });
    
  } catch (err) {
    console.error("Create job error:", err);
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error detail:", err.detail); // PostgreSQL specific
    console.error("Error code:", err.code); // PostgreSQL error code
    console.error("Full error:", err);
    
    res.status(500).json({ 
      success: false,
      error: "Internal server error", 
      message: err.message,
      details: err.detail || err.toString(),
      code: err.code
    });
  }
});

module.exports = router;