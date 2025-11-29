const express = require("express");
const router = express.Router();
const db = require("../models/db");

// GET /api/jobs/search  → liste filtrée
router.get("/search", async (req, res) => {
  try {
    const {
      contractTypes,
      levels,
      timeTypes,
      workModes,
      fields,
      area,
      keywords,
    } = req.query;

    let sql = "SELECT * FROM jobs WHERE 1=1";
    const params = [];

    if (contractTypes) {
      const list = contractTypes.split(",");
      sql += ` AND contract_type IN (${list.map(() => "?").join(",")})`;
      params.push(...list);
    }

    if (levels) {
      const list = levels.split(",");
      sql += ` AND level IN (${list.map(() => "?").join(",")})`;
      params.push(...list);
    }

    if (timeTypes) {
      const list = timeTypes.split(",");
      sql += ` AND time_type IN (${list.map(() => "?").join(",")})`;
      params.push(...list);
    }

    if (workModes) {
      const list = workModes.split(",");
      sql += ` AND work_mode IN (${list.map(() => "?").join(",")})`;
      params.push(...list);
    }

    if (fields) {
      const list = fields.split(",");
      sql += ` AND field IN (${list.map(() => "?").join(",")})`;
      params.push(...list);
    }

    if (area) {
      sql += " AND localisation LIKE ?";
      params.push(`%${area}%`);
    }

    if (keywords) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${keywords}%`, `%${keywords}%`);
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Job search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/jobs/:id  → un seul job
router.get("/:id", async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log("➡️  DETAIL HIT /api/jobs/" + jobId);

    const [rows] = await db.query("SELECT * FROM jobs WHERE id = ?", [jobId]);

    if (!rows.length) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Job detail error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/jobs  → créer une nouvelle offre
router.post('/', async (req, res) => {
  try {
    const {
      name,
      company,
      localisation,
      description,
      contract_type,
      level,
      time_type,
      work_mode,
      field,
    } = req.body

    if (!name || !company) {
      return res.status(400).json({ error: 'Name and company are required' })
    }

    const [result] = await db.query(
      `INSERT INTO jobs
       (name, company, localisation, description, contract_type, level, time_type, work_mode, field)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        company,
        localisation || '',
        description || '',
        contract_type || '',
        level || '',
        time_type || '',
        work_mode || '',
        field || '',
      ]
    )

    // renvoyer le job créé avec son id
    const [rows] = await db.query('SELECT * FROM jobs WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Create job error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router;
