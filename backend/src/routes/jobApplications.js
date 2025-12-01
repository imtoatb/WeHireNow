const express = require("express");
const router = express.Router();
const db = require("../models/db");

// Middleware pour vérifier l'authentification
const requireAuth = (req, res, next) => {
  console.log("🔐 Auth check - Session userId:", req.session.userId);
  if (!req.session.userId) {
    console.log("❌ No userId in session");
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// ------------------------------------
// POST /api/applications → créer une candidature
// ------------------------------------
router.post("/", requireAuth, async (req, res) => {
  console.log("📝 Creating application request:", req.body);
  console.log("👤 User from session:", req.session.userId);
  
  try {
    const { jobId, coverLetter } = req.body;
    const userId = req.session.userId;

    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    console.log(`🎯 Attempting to create application: User ${userId}, Job ${jobId}`);
    
    const application = await db.createApplication(userId, jobId, coverLetter);
    
    console.log("✅ Application created successfully:", application.id);
    
    res.status(201).json({ 
      success: true, 
      message: "Application submitted successfully",
      application 
    });
  } catch (err) {
    console.error("❌ Create application error:", err.message);
    console.error("Stack:", err.stack);
    
    if (err.message.includes('already applied')) {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ 
      error: "Internal server error", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// ------------------------------------
// GET /api/applications → toutes les candidatures de l'utilisateur
// ------------------------------------
router.get("/", requireAuth, async (req, res) => {
  console.log("📋 Getting applications for user:", req.session.userId);
  
  try {
    const userId = req.session.userId;
    const applications = await db.getApplicationsByUser(userId);
    
    console.log(`📊 Found ${applications.length} applications`);
    
    res.json(applications);
  } catch (err) {
    console.error("❌ Get applications error:", err.message);
    console.error("Stack:", err.stack);
    
    res.status(500).json({ 
      error: "Internal server error", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// ------------------------------------
// GET /api/applications/stats → statistiques des candidatures
// ------------------------------------
router.get("/stats", requireAuth, async (req, res) => {
  console.log("📈 Getting stats for user:", req.session.userId);
  
  try {
    const userId = req.session.userId;
    const stats = await db.getApplicationStats(userId);
    
    console.log("📊 Stats:", stats);
    
    res.json(stats);
  } catch (err) {
    console.error("❌ Get application stats error:", err.message);
    
    res.status(500).json({ 
      error: "Internal server error", 
      details: err.message
    });
  }
});


// ------------------------------------
// GET /api/applications/:id → une candidature spécifique
// ------------------------------------
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.session.userId;

    const application = await db.getApplicationById(applicationId);
    
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (application.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(application);
  } catch (err) {
    console.error("Get application detail error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// ------------------------------------
// PUT /api/applications/:id → mettre à jour une candidature
// ------------------------------------
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;
    const userId = req.session.userId;

    if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    // Vérifier que l'utilisateur est propriétaire
    const checkApp = await db.getApplicationById(applicationId);
    if (!checkApp || checkApp.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updated = await db.updateApplicationStatus(applicationId, status);
    res.json({ 
      success: true, 
      application: updated 
    });
  } catch (err) {
    console.error("Update application error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// ------------------------------------
// DELETE /api/applications/:id → supprimer une candidature
// ------------------------------------
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.session.userId;

    // Vérifier que l'utilisateur est propriétaire
    const checkApp = await db.getApplicationById(applicationId);
    if (!checkApp || checkApp.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const deleted = await db.deleteApplication(applicationId);
    res.json({ 
      success: true, 
      message: "Application deleted" 
    });
  } catch (err) {
    console.error("Delete application error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

module.exports = router;