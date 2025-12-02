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
      sql += ` AND (position ILIKE $${index} OR name ILIKE $${index} OR description ILIKE $${index + 1})`;
      params.push(`%${keywords}%`, `%${keywords}%`);
      index += 2;
    }

    sql += " ORDER BY created_at DESC";

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
    const { 
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

    if (!position || !company_name) {
      return res.status(400).json({ error: "Position and company_name are required" });
    }

    const result = await db.query(
      `INSERT INTO jobs
      (name, position, company_name, location, description, contract_type, level, 
       time_type, work_mode, field, salary_range, requirements, benefits)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        name || position,
        position, 
        company_name, 
        location || '', 
        description || '', 
        contract_type || '', 
        level || '', 
        time_type || '', 
        work_mode || '', 
        field || '', 
        salary_range || '',
        requirements || '',
        benefits || ''
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// ------------------------------------
// PUT /api/jobs/:id → update job
// ------------------------------------
router.put("/:id", async (req, res) => {
  try {
    const jobId = req.params.id;
    const { 
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

    // Vérifier si le job existe
    const checkJob = await db.query("SELECT id FROM jobs WHERE id = $1", [jobId]);
    if (!checkJob.rows.length) {
      return res.status(404).json({ error: "Job not found" });
    }

    const result = await db.query(
      `UPDATE jobs SET
        name = COALESCE($1, name),
        position = COALESCE($2, position),
        company_name = COALESCE($3, company_name),
        location = COALESCE($4, location),
        description = COALESCE($5, description),
        contract_type = COALESCE($6, contract_type),
        level = COALESCE($7, level),
        time_type = COALESCE($8, time_type),
        work_mode = COALESCE($9, work_mode),
        field = COALESCE($10, field),
        salary_range = COALESCE($11, salary_range),
        requirements = COALESCE($12, requirements),
        benefits = COALESCE($13, benefits),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *`,
      [
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
        jobId
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// ------------------------------------
// DELETE /api/jobs/:id → delete job
// ------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const jobId = req.params.id;

    // Vérifier si le job existe
    const checkJob = await db.query("SELECT id FROM jobs WHERE id = $1", [jobId]);
    if (!checkJob.rows.length) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Vérifier s'il y a des candidatures pour ce job
    const checkApplications = await db.query("SELECT id FROM job_applications WHERE job_id = $1", [jobId]);
    if (checkApplications.rows.length > 0) {
      return res.status(400).json({ 
        error: "Cannot delete job with applications", 
        count: checkApplications.rows.length 
      });
    }

    await db.query("DELETE FROM jobs WHERE id = $1", [jobId]);

    res.json({ 
      success: true, 
      message: "Job deleted successfully" 
    });
  } catch (err) {
    console.error("Delete job error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

module.exports = router;