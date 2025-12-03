
const express = require('express');
const router = express.Router();
const db = require('../models/db'); // pool MySQL

// ==============================
//  POST /api/recruiter-profile/save
// ==============================
router.post('/save', async (req, res) => {
  try {
    const {
      email,
      first_name,
      last_name,
      position,
      bio,
      phone,
      linkedin,
      work_email,
      profile_picture,
      company_name,
      company_website,
      industry,
      company_size,
      annual_revenue,
      company_description,
      company_location,
      founded_year,
    } = req.body;

    console.log('📨 /api/recruiter-profile/save for', email);

    // 1) récupérer l'user_id via l'email
    const [userRows] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (!userRows.length) {
      console.log('❌ user not found:', email);
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const userId = userRows[0].id;

    // 2) Vérifier si un profil existe déjà
    const [existing] = await db.query(
      'SELECT id FROM recruiter_profiles WHERE user_id = ?',
      [userId]
    );

    if (existing.length) {
      // --- UPDATE ---
      await db.query(
        `UPDATE recruiter_profiles
         SET first_name = ?, last_name = ?, position = ?, bio = ?, phone = ?,
             linkedin = ?, work_email = ?, profile_picture = ?,
             company_name = ?, company_website = ?, industry = ?, company_size = ?,
             annual_revenue = ?, company_description = ?, company_location = ?, founded_year = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          first_name || null,
          last_name || null,
          position || null,
          bio || null,
          phone || null,
          linkedin || null,
          work_email || null,
          profile_picture || null,
          company_name || null,
          company_website || null,
          industry || null,
          company_size || null,
          annual_revenue || null,
          company_description || null,
          company_location || null,
          founded_year || null,
          userId,
        ]
      );
      console.log('✅ recruiter profile updated for user_id', userId);
    } else {
      // --- INSERT ---
      await db.query(
        `INSERT INTO recruiter_profiles
         (user_id, first_name, last_name, position, bio, phone, linkedin, work_email, profile_picture,
          company_name, company_website, industry, company_size, annual_revenue,
          company_description, company_location, founded_year)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          first_name || null,
          last_name || null,
          position || null,
          bio || null,
          phone || null,
          linkedin || null,
          work_email || null,
          profile_picture || null,
          company_name || null,
          company_website || null,
          industry || null,
          company_size || null,
          annual_revenue || null,
          company_description || null,
          company_location || null,
          founded_year || null,
        ]
      );
      console.log('✅ recruiter profile created for user_id', userId);
    }

    res.json({ success: true, message: 'Recruiter profile saved successfully' });
  } catch (err) {
    console.error('❌ Error /api/recruiter-profile/save:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================
//  GET /api/recruiter-profile/:email
// ==============================
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('📨 /api/recruiter-profile/:email for', email);

    const [rows] = await db.query(
      `SELECT rp.*
       FROM recruiter_profiles rp
       JOIN users u ON rp.user_id = u.id
       WHERE u.email = ?`,
      [email]
    );

    if (!rows.length) {
      console.log('ℹ️ no recruiter profile for', email);
      return res.json({ success: true, profile: null });
    }

    res.json({ success: true, profile: rows[0] });
  } catch (err) {
    console.error('❌ Error /api/recruiter-profile/:email:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ⚠️ IMPORTANT : on exporte bien le ROUTER (et rien d'autre)
module.exports = router;
