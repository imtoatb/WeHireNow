const express = require('express');
const router = express.Router();
const db = require('../models/db'); // connexion MySQL (comme dans jobs.js)

// Sauvegarder le profil (candidat OU recruteur)
router.post('/save', async (req, res) => {
  try {
    const {
      email,

      // Partie candidate / commune
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

      // Partie recruiter / company
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
    } = req.body;

    console.log('📨 /profile/save pour :', email);

    // 1) Récupérer l'user_id
    const [userRows] = await db.query(
      'SELECT id, account_type FROM users WHERE email = ?',
      [email]
    );

    if (!userRows.length) {
      console.log('❌ Utilisateur non trouvé :', email);
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const userId = userRows[0].id;
    console.log('✅ Utilisateur trouvé, ID =', userId);

    // 2) Vérifier si un profil existe déjà
    const [profileRows] = await db.query(
      'SELECT id FROM candidate_profiles WHERE user_id = ?',
      [userId]
    );

    // On convertit les tableaux en JSON
    const skillsJson       = JSON.stringify(skills || []);
    const experiencesJson  = JSON.stringify(experiences || []);
    const educationsJson   = JSON.stringify(educations || []);
    const activitiesJson   = JSON.stringify(activities || []);

    if (profileRows.length > 0) {
      // 3a) UPDATE
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
          skillsJson, experiencesJson, educationsJson, activitiesJson,
          position || null, work_email || null, company_name || null, company_website || null,
          industry || null, company_size || null, annual_revenue || null,
          company_description || null, company_location || null, founded_year || null,
          userId,
        ]
      );

      console.log('✅ Profil mis à jour pour user_id =', userId);
    } else {
      // 3b) INSERT
      await db.query(
        `INSERT INTO candidate_profiles (
           user_id,
           first_name, last_name, bio, phone,
           linkedin, github, profile_picture,
           skills, experiences, educations, activities,
           position, work_email, company_name, company_website,
           industry, company_size, annual_revenue,
           company_description, company_location, founded_year
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          userId,
          first_name, last_name, bio, phone,
          linkedin, github, profile_picture || null,
          skillsJson, experiencesJson, educationsJson, activitiesJson,
          position || null, work_email || null, company_name || null, company_website || null,
          industry || null, company_size || null, annual_revenue || null,
          company_description || null, company_location || null, founded_year || null,
        ]
      );

      console.log('✅ Nouveau profil créé pour user_id =', userId);
    }

    res.json({ success: true, message: 'Profil sauvegardé avec succès' });
  } catch (error) {
    console.error('❌ Erreur API /profile/save:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer le profil (candidat ou recruiter)
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('📨 /profile/:email pour :', email);

    const [rows] = await db.query(
      `SELECT cp.*
       FROM candidate_profiles cp
       JOIN users u ON cp.user_id = u.id
       WHERE u.email = ?`,
      [email]
    );

    if (!rows.length) {
      console.log('ℹ️ Aucun profil trouvé pour :', email);
      return res.json({ success: true, profile: null });
    }

    const profile = rows[0];

    // Si les colonnes JSON sont renvoyées en string, on parse
    const safeParse = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    };

    const formattedProfile = {
      ...profile,
      skills: safeParse(profile.skills),
      experiences: safeParse(profile.experiences),
      educations: safeParse(profile.educations),
      activities: safeParse(profile.activities),
    };

    console.log('✅ Profil trouvé pour :', email);
    res.json({ success: true, profile: formattedProfile });
  } catch (error) {
    console.error('❌ Erreur API /profile/:email:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

