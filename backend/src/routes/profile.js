const express = require('express')
const router = express.Router()
const db = require('../models/db') // pool mysql2

// POST /api/profile/save
router.post('/save', async (req, res) => {
  try {
    const {
      email,
      // candidat
      first_name,
      last_name,
      bio,
      phone,
      linkedin,
      github,
      profile_picture,
      skills = [],
      experiences = [],
      educations = [],
      activities = [],
      // recruteur / company
      position,
      work_email,
      company_name,
      company_website,
      industry,
      company_size,
      annual_revenue,
      company_description,
      company_location,
      founded_year,
    } = req.body

    console.log('📨 /profile/save pour', email)

    // 1) récupérer user_id
    const [userRows] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (!userRows.length) {
      console.log('❌ Utilisateur non trouvé:', email)
      return res
        .status(404)
        .json({ success: false, message: 'Utilisateur non trouvé' })
    }

    const userId = userRows[0].id
    console.log('✅ user_id =', userId)

    // 2) vérifier si profil existe déjà
    const [profileRows] = await db.query(
      'SELECT id FROM candidate_profiles WHERE user_id = ?',
      [userId]
    )

    const skillsJson = JSON.stringify(skills || [])
    const expJson = JSON.stringify(experiences || [])
    const eduJson = JSON.stringify(educations || [])
    const actJson = JSON.stringify(activities || [])

    if (profileRows.length) {
      // --- UPDATE ---
      await db.query(
        `UPDATE candidate_profiles
         SET first_name = ?, last_name = ?, bio = ?, phone = ?,
             linkedin = ?, github = ?, profile_picture = ?,
             skills = ?, experiences = ?, educations = ?, activities = ?,
             position = ?, work_email = ?, company_name = ?, company_website = ?,
             industry = ?, company_size = ?, annual_revenue = ?,
             company_description = ?, company_location = ?, founded_year = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          first_name, last_name, bio, phone,
          linkedin, github, profile_picture || null,
          skillsJson, expJson, eduJson, actJson,
          position, work_email, company_name, company_website,
          industry, company_size, annual_revenue,
          company_description, company_location, founded_year || null,
          userId,
        ]
      )
      console.log('✅ Profil mis à jour pour user_id', userId)
    } else {
      // --- INSERT ---
      await db.query(
        `INSERT INTO candidate_profiles (
            user_id,
            first_name, last_name, bio, phone,
            linkedin, github, profile_picture,
            skills, experiences, educations, activities,
            position, work_email, company_name, company_website,
            industry, company_size, annual_revenue,
            company_description, company_location, founded_year
         )
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId,
          first_name, last_name, bio, phone,
          linkedin, github, profile_picture || null,
          skillsJson, expJson, eduJson, actJson,
          position, work_email, company_name, company_website,
          industry, company_size, annual_revenue,
          company_description, company_location, founded_year || null,
        ]
      )
      console.log('✅ Nouveau profil créé pour user_id', userId)
    }

    res.json({ success: true, message: 'Profil sauvegardé avec succès' })
  } catch (error) {
    console.error('❌ Erreur /profile/save:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/profile/:email
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params
    console.log('📨 /profile/:email pour', email)

    const [rows] = await db.query(
      `SELECT cp.*
       FROM candidate_profiles cp
       JOIN users u ON cp.user_id = u.id
       WHERE u.email = ?`,
      [email]
    )

    if (!rows.length) {
      console.log('ℹ️ Aucun profil pour', email)
      return res.json({ success: true, profile: null })
    }

    const p = rows[0]

    const profile = {
      ...p,
      skills: p.skills ? JSON.parse(p.skills) : [],
      experiences: p.experiences ? JSON.parse(p.experiences) : [],
      educations: p.educations ? JSON.parse(p.educations) : [],
      activities: p.activities ? JSON.parse(p.activities) : [],
    }

    console.log('✅ Profil chargé pour', email)
    res.json({ success: true, profile })
  } catch (error) {
    console.error('❌ Erreur /profile/:email:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router

