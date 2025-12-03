const express = require("express");
const router = express.Router();
const db = require("../models/db"); // mysql2 pool

// 🔐 Middleware auth basé sur ta session
const requireAuth = (req, res, next) => {
  console.log("🔐 Auth check - session:", req.session && req.session.user);
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// 🔎 petit helper interne
async function getApplicationById(appId) {
  const [rows] = await db.query(
    "SELECT * FROM job_applications WHERE id = ?",
    [appId]
  );
  return rows[0] || null;
}

// ------------------------------------
// POST /api/applications → créer une candidature (candidat)
// ------------------------------------
router.post("/", requireAuth, async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    const userId = req.session.user.id;

    console.log("📝 Creating application:", { userId, jobId });

    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    // éviter la double candidature
    const [existing] = await db.query(
      "SELECT id FROM job_applications WHERE job_id = ? AND user_id = ?",
      [jobId, userId]
    );
    if (existing.length) {
      return res
        .status(400)
        .json({ error: "You already applied to this job" });
    }

    const [result] = await db.query(
      "INSERT INTO job_applications (job_id, user_id, status, cover_letter) VALUES (?, ?, 'pending', ?)",
      [jobId, userId, coverLetter || null]
    );

    const [rows] = await db.query(
      "SELECT * FROM job_applications WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: rows[0],
    });
  } catch (err) {
    console.error("❌ Create application error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

// ------------------------------------
// GET /api/applications → candidatures du candidat connecté
// ------------------------------------
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    console.log("📋 Get applications for user:", userId);

    const [rows] = await db.query(
      `
      SELECT 
        ja.id,
        ja.job_id,
        ja.status,
        ja.cover_letter,
        ja.created_at AS application_date,
        ja.updated_at AS last_update,
        j.name AS position,
        j.company AS company_name,
        j.localisation AS location,
        j.contract_type,
        '' AS salary_range  -- tu peux ajouter une vraie colonne plus tard
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.user_id = ?
      ORDER BY ja.created_at DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Get applications error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

// ------------------------------------
// GET /api/applications/stats → stats candidatures du candidat
// ------------------------------------
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    console.log("📈 Get stats for user:", userId);

    const [rows] = await db.query(
      `
      SELECT status, COUNT(*) AS count
      FROM job_applications
      WHERE user_id = ?
      GROUP BY status
      `,
      [userId]
    );

    const stats = {
      total: 0,
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
    };

    for (const row of rows) {
      const st = (row.status || "").toLowerCase();
      if (stats[st] !== undefined) {
        stats[st] += row.count;
      }
      stats.total += row.count;
    }

    res.json(stats);
  } catch (err) {
    console.error("❌ Get application stats error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

// ------------------------------------
// GET /api/applications/job/:jobId → candidatures pour un job (recruteur)
// ------------------------------------
router.get("/job/:jobId", requireAuth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const currentUser = req.session.user;
    console.log("📋 Get applications for job:", jobId, "by user", currentUser);

    if (currentUser.account_type !== "recruiter") {
      return res.status(403).json({ error: "Only recruiters can view this" });
    }

    // Vérifier que le job appartient bien à ce recruteur
    const [jobRows] = await db.query(
      "SELECT id FROM jobs WHERE id = ? AND user_id = ?",
      [jobId, currentUser.id]
    );
    if (!jobRows.length) {
      return res
        .status(403)
        .json({ error: "You are not the owner of this job" });
    }

    const [rows] = await db.query(
      `
      SELECT 
        ja.id,
        ja.status,
        ja.created_at,
        ja.updated_at,
        ja.cover_letter,
        u.email,
        cp.first_name,
        cp.last_name
      FROM job_applications ja
      JOIN users u ON ja.user_id = u.id
      LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
      WHERE ja.job_id = ?
      ORDER BY ja.created_at DESC
      `,
      [jobId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Get applications by job error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

// ------------------------------------
// GET /api/applications/:id → une candidature spécifique (candidat)
// ------------------------------------
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.session.user.id;

    const application = await getApplicationById(applicationId);

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    if (application.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(application);
  } catch (err) {
    console.error("❌ Get application detail error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

// ------------------------------------
// PUT /api/applications/:id → changer le statut (si tu veux laisser au candidat)
// ------------------------------------
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;
    const userId = req.session.user.id;

    if (
      !status ||
      !["pending", "reviewed", "accepted", "rejected"].includes(status)
    ) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    const app = await getApplicationById(applicationId);
    if (!app || app.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await db.query(
      "UPDATE job_applications SET status = ? WHERE id = ?",
      [status, applicationId]
    );

    const updated = await getApplicationById(applicationId);

    res.json({
      success: true,
      application: updated,
    });
  } catch (err) {
    console.error("❌ Update application error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

// ------------------------------------
// DELETE /api/applications/:id → supprimer une candidature (candidat)
// ------------------------------------
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.session.user.id;

    const app = await getApplicationById(applicationId);
    if (!app || app.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await db.query("DELETE FROM job_applications WHERE id = ?", [
      applicationId,
    ]);

    res.json({
      success: true,
      message: "Application deleted",
    });
  } catch (err) {
    console.error("❌ Delete application error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

module.exports = router;
