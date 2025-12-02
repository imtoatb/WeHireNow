// backend/src/routes/profile.js
const express = require('express')
const router = express.Router()
const db = require('../models/db') // ta connexion MySQL (comme dans jobs.js)

// Sauvegarder le profil candidat
router.post('/save', async (req, res) => {
  try {//
    const {
      email,
      first_name,
      last_name,
      bio,
      phone,
      linkedin,
      github,
      profile_picture,
      skills,
      experiences,
      educations,
      activities,
    } = req.body

    console.log('📨 API /profile/save appelée pour:', email)

    // 1) Trouver l'user_id à partir de l'email
    const [userRows] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (userRows.length === 0) {
      console.log('❌ Utilisateur non trouvé:', email)
      return res
        .status(404)
        .json({ success: false, message: 'Utilisateur non trouvé' })
    }

    const userId = userRows[0].id
    console.log('✅ Utilisateur trouvé, ID:', userId)

    // 2) Vérifier si le profil existe déjà
    const [existingProfile] = await db.query(
      'SELECT id FROM candidate_profiles WHERE user_id = ?',
      [userId]
    )

    if (existingProfile.length > 0) {
      // UPDATE
      await db.query(
        `UPDATE candidate_profiles
         SET first_name = ?,
             last_name = ?,
             bio = ?,
             phone = ?,
             linkedin = ?,
             github = ?,
             profile_picture = ?,
             skills = ?,
             experiences = ?,
             educations = ?,
             activities = ?,
             updated_at = NOW()
         WHERE user_id = ?`,
        [
          first_name,
          last_name,
          bio,
          phone,
          linkedin,
          github,
          profile_picture,
          JSON.stringify(skills || []),
          JSON.stringify(experiences || []),
          JSON.stringify(educations || []),
          JSON.stringify(activities || []),
          userId,
        ]
      )
      console.log('✅ Profil mis à jour pour user_id:', userId)
    } else {
      // INSERT
      await db.query(
        `INSERT INTO candidate_profiles
         (user_id, first_name, last_name, bio, phone, linkedin, github,
          profile_picture, skills, experiences, educations, activities)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          first_name,
          last_name,
          bio,
          phone,
          linkedin,
          github,
          profile_picture,
          JSON.stringify(skills || []),
          JSON.stringify(experiences || []),
          JSON.stringify(educations || []),
          JSON.stringify(activities || []),
        ]
      )
      console.log('✅ Nouveau profil créé pour user_id:', userId)
    }

    res.json({ success: true, message: 'Profil sauvegardé avec succès' })
  } catch (error) {
    console.error('❌ Erreur API /profile/save:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// Récupérer le profil candidat
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params
    console.log('📨 API /profile/:email appelée pour:', email)

    const [rows] = await db.query(
      `SELECT cp.*
       FROM candidate_profiles cp
       JOIN users u ON cp.user_id = u.id
       WHERE u.email = ?`,
      [email]
    )

    if (rows.length === 0) {
      console.log('ℹ️ Aucun profil trouvé pour:', email)
      return res.json({ success: true, profile: null })
    }

    const profile = rows[0]

    const formattedProfile = {
      ...profile,
      skills: profile.skills ? JSON.parse(profile.skills) : [],
      experiences: profile.experiences ? JSON.parse(profile.experiences) : [],
      educations: profile.educations ? JSON.parse(profile.educations) : [],
      activities: profile.activities ? JSON.parse(profile.activities) : [],
    }

    console.log('✅ Profil trouvé pour:', email)
    res.json({ success: true, profile: formattedProfile })
  } catch (error) {
    console.error('❌ Erreur API /profile/:email:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
