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
    const { contractTypes, levels, timeTypes, workModes, fields, area, keywords } = req.query;

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
      sql += ` AND (position ILIKE $${index} OR description ILIKE $${index + 1})`;
      params.push(`%${keywords}%`, `%${keywords}%`);
      index += 2;
    }

    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Job search error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
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

// ------------------------------------
// POST /api/jobs → create job
// ------------------------------------
router.post("/", async (req, res) => {
  try {
    const { position, company_name, location, description, contract_type, level, time_type, work_mode, field, salary_range } = req.body;

    if (!position || !company_name) {
      return res.status(400).json({ error: "Position and company_name are required" });
    }

    const result = await db.query(
      `INSERT INTO jobs
      (position, company_name, location, description, contract_type, level, time_type, work_mode, field, salary_range)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [position, company_name, location || '', description || '', contract_type || '', level || '', time_type || '', work_mode || '', field || '', salary_range || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

module.exports = router;
