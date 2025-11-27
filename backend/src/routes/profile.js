const express = require('express');
const router = express.Router();
const pool = require('../models/db'); // Votre connexion PostgreSQL

// Sauvegarder le profil candidat
router.post('/save', async (req, res) => {
  try {
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
      activities 
    } = req.body;

    console.log('📨 API /profile/save appelée pour:', email);

    // Trouver l'user_id à partir de l'email
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Utilisateur non trouvé:', email);
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const userId = userResult.rows[0].id;
    console.log('✅ Utilisateur trouvé, ID:', userId);

    // Vérifier si le profil existe déjà
    const existingProfile = await pool.query(
      'SELECT id FROM candidate_profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfile.rows.length > 0) {
      // Mettre à jour le profil existant
      await pool.query(
        `UPDATE candidate_profiles 
         SET first_name = $1, last_name = $2, bio = $3, phone = $4, 
             linkedin = $5, github = $6, profile_picture = $7, skills = $8, 
             experiences = $9, educations = $10, activities = $11, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $12`,
        [first_name, last_name, bio, phone, linkedin, github, profile_picture, 
         JSON.stringify(skills), JSON.stringify(experiences), JSON.stringify(educations), 
         JSON.stringify(activities), userId]
      );
      console.log('✅ Profil mis à jour pour user_id:', userId);
    } else {
      // Créer un nouveau profil
      await pool.query(
        `INSERT INTO candidate_profiles 
         (user_id, first_name, last_name, bio, phone, linkedin, github, profile_picture, skills, experiences, educations, activities)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [userId, first_name, last_name, bio, phone, linkedin, github, profile_picture, 
         JSON.stringify(skills), JSON.stringify(experiences), JSON.stringify(educations), 
         JSON.stringify(activities)]
      );
      console.log('✅ Nouveau profil créé pour user_id:', userId);
    }

    res.json({ success: true, message: 'Profil sauvegardé avec succès' });
    
  } catch (error) {
    console.error('❌ Erreur API /profile/save:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Récupérer le profil candidat
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('📨 API /profile/:email appelée pour:', email);

    const result = await pool.query(
      `SELECT cp.* 
       FROM candidate_profiles cp
       JOIN users u ON cp.user_id = u.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      console.log('ℹ️ Aucun profil trouvé pour:', email);
      return res.json({ success: true, profile: null });
    }

    const profile = result.rows[0];
    
    // Convertir les données JSONB en objets JavaScript
    const formattedProfile = {
      ...profile,
      skills: profile.skills || [],
      experiences: profile.experiences || [],
      educations: profile.educations || [],
      activities: profile.activities || []
    };

    console.log('✅ Profil trouvé pour:', email);
    res.json({ success: true, profile: formattedProfile });
  } catch (error) {
    console.error('❌ Erreur API /profile/:email:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;