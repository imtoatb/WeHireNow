const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// Save profile (candidate OR recruiter)
router.post('/save', async (req, res) => {
  try {
    const { 
      email, 
      // Common fields
      first_name, last_name, bio, phone, linkedin, profile_picture,
      // Candidate fields
      github, skills, experiences, educations, activities,
      // Recruiter fields  
      position, work_email, company_name, company_website, industry,
      company_size, annual_revenue, company_description, company_location, founded_year
    } = req.body;

    console.log('API /profile/save called for:', email);

    // Find user_id and account type
    const userResult = await pool.query(
      'SELECT id, account_type FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log('User not found:', email);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userId = userResult.rows[0].id;
    const userAccountType = userResult.rows[0].account_type;
    console.log('User found, ID:', userId, 'Type:', userAccountType);

    // Save based on account type
    if (userAccountType === 'candidate') {
      await saveCandidateProfile();
    } else if (userAccountType === 'recruiter') {
      await saveRecruiterProfile();
    } else {
      return res.status(400).json({ success: false, message: 'Invalid account type: ' + userAccountType });
    }

    async function saveCandidateProfile() {
      const existingProfile = await pool.query(
        'SELECT id FROM candidate_profiles WHERE user_id = $1',
        [userId]
      );

      if (existingProfile.rows.length > 0) {
        // Update existing profile
        await pool.query(
          `UPDATE candidate_profiles 
           SET first_name = $1, last_name = $2, bio = $3, phone = $4, 
               linkedin = $5, github = $6, profile_picture = $7, skills = $8, 
               experiences = $9, educations = $10, activities = $11, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $12`,
          [first_name, last_name, bio, phone, linkedin, github, profile_picture, 
           JSON.stringify(skills || []), JSON.stringify(experiences || []), 
           JSON.stringify(educations || []), JSON.stringify(activities || []), userId]
        );
        console.log('CANDIDATE profile updated for user_id:', userId);
      } else {
        // Create new profile
        await pool.query(
          `INSERT INTO candidate_profiles 
           (user_id, first_name, last_name, bio, phone, linkedin, github, profile_picture, skills, experiences, educations, activities)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [userId, first_name, last_name, bio, phone, linkedin, github, profile_picture, 
           JSON.stringify(skills || []), JSON.stringify(experiences || []), 
           JSON.stringify(educations || []), JSON.stringify(activities || [])]
        );
        console.log('New CANDIDATE profile created for user_id:', userId);
      }
    }

    async function saveRecruiterProfile() {
      const existingProfile = await pool.query(
        'SELECT id FROM recruiter_profiles WHERE user_id = $1',
        [userId]
      );

      if (existingProfile.rows.length > 0) {
        // Update existing profile
        await pool.query(
          `UPDATE recruiter_profiles 
           SET first_name = $1, last_name = $2, position = $3, bio = $4, phone = $5, 
               linkedin = $6, work_email = $7, profile_picture = $8, company_name = $9,
               company_website = $10, industry = $11, company_size = $12, annual_revenue = $13,
               company_description = $14, company_location = $15, founded_year = $16, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $17`,
          [first_name, last_name, position, bio, phone, linkedin, work_email, profile_picture,
           company_name, company_website, industry, company_size, annual_revenue,
           company_description, company_location, founded_year, userId]
        );
        console.log('RECRUITER profile updated for user_id:', userId);
      } else {
        // Create new profile
        await pool.query(
          `INSERT INTO recruiter_profiles 
           (user_id, first_name, last_name, position, bio, phone, linkedin, work_email, profile_picture,
            company_name, company_website, industry, company_size, annual_revenue,
            company_description, company_location, founded_year)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [userId, first_name, last_name, position, bio, phone, linkedin, work_email, profile_picture,
           company_name, company_website, industry, company_size, annual_revenue,
           company_description, company_location, founded_year]
        );
        console.log('New RECRUITER profile created for user_id:', userId);
      }
    }

    res.json({ success: true, message: 'Profile saved successfully' });
    
  } catch (error) {
    console.error('Error in API /profile/save:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get profile (candidate OR recruiter)
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('API /profile/:email called for:', email);

    // Get user account type
    const userResult = await pool.query(
      'SELECT id, account_type FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log('No user found for:', email);
      return res.json({ success: true, profile: null });
    }

    const userId = userResult.rows[0].id;
    const accountType = userResult.rows[0].account_type;

    let profile = null;

    if (accountType === 'candidate') {
      const result = await pool.query(
        `SELECT cp.* 
         FROM candidate_profiles cp
         WHERE cp.user_id = $1`,
        [userId]
      );

      if (result.rows.length > 0) {
        profile = {
          ...result.rows[0],
          skills: result.rows[0].skills || [],
          experiences: result.rows[0].experiences || [],
          educations: result.rows[0].educations || [],
          activities: result.rows[0].activities || []
        };
        console.log('CANDIDATE profile found for:', email);
      }
    } else if (accountType === 'recruiter') {
      const result = await pool.query(
        `SELECT rp.* 
         FROM recruiter_profiles rp
         WHERE rp.user_id = $1`,
        [userId]
      );

      if (result.rows.length > 0) {
        profile = result.rows[0];
        console.log('RECRUITER profile found for:', email);
      }
    }

    if (profile) {
      res.json({ success: true, profile: profile });
    } else {
      console.log('No', accountType, 'profile found for:', email);
      res.json({ success: true, profile: null });
    }

  } catch (error) {
    console.error('Error in API /profile/:email:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;