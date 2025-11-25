// GET /api/jobs/:id  → single job by ID
router.get("/:id", async (req, res) => {
  console.log("🔥 DETAIL ROUTE HIT with id =", req.params.id);  // <= ICI

  try {
    const jobId = req.params.id;

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
