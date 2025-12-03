const express = require('express');
const router = express.Router();
const db = require('../models/db');

// POST /api/profile/save
router.post('/save', async (req, res) => {
  try {
    const {
      email,
      // candidate fields
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
      // recruiter/company fields
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

    console.log('POST /profile/save for', email);

    // 1) get user_id - FIXED for PostgreSQL
    const userResult = await db.query(
      'SELECT id, account_type FROM users WHERE email = $1',
      [email]
    );

    if (!userResult.rows.length) {
      console.log('User not found:', email);
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const userId = userResult.rows[0].id;
    const accountType = userResult.rows[0].account_type;
    
    console.log('User found - id:', userId, 'account_type:', accountType);

    // 2) Save based on account type
    if (accountType === 'candidate') {
      // Check if candidate profile exists
      const existingProfile = await db.query(
        'SELECT id FROM candidate_profiles WHERE user_id = $1',
        [userId]
      );

      const skillsArray = Array.isArray(skills) ? skills : [];
      const experiencesArray = Array.isArray(experiences) ? experiences : [];
      const educationsArray = Array.isArray(educations) ? educations : [];
      const activitiesArray = Array.isArray(activities) ? activities : [];

      if (existingProfile.rows.length > 0) {
        // UPDATE candidate profile
        await db.query(
          `UPDATE candidate_profiles
           SET first_name = $1, last_name = $2, bio = $3, phone = $4,
               linkedin = $5, github = $6, profile_picture = $7,
               skills = $8, experiences = $9, educations = $10, activities = $11,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $12`,
          [
            first_name || null,
            last_name || null,
            bio || null,
            phone || null,
            linkedin || null,
            github || null,
            profile_picture || null,
            skillsArray,
            experiencesArray,
            educationsArray,
            activitiesArray,
            userId
          ]
        );
        console.log('Candidate profile updated for user_id', userId);
      } else {
        // INSERT candidate profile
        await db.query(
          `INSERT INTO candidate_profiles 
           (user_id, first_name, last_name, bio, phone, linkedin, github, 
            profile_picture, skills, experiences, educations, activities)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            userId,
            first_name || null,
            last_name || null,
            bio || null,
            phone || null,
            linkedin || null,
            github || null,
            profile_picture || null,
            skillsArray,
            experiencesArray,
            educationsArray,
            activitiesArray
          ]
        );
        console.log('New candidate profile created for user_id', userId);
      }
      
      res.json({ 
        success: true, 
        message: 'Candidate profile saved successfully' 
      });
      
    } else if (accountType === 'recruiter') {
      // Check if recruiter profile exists
      const existingProfile = await db.query(
        'SELECT id FROM recruiter_profiles WHERE user_id = $1',
        [userId]
      );

      if (existingProfile.rows.length > 0) {
        // UPDATE recruiter profile
        await db.query(
          `UPDATE recruiter_profiles
           SET first_name = $1, last_name = $2, position = $3, bio = $4, phone = $5,
               linkedin = $6, work_email = $7, profile_picture = $8,
               company_name = $9, company_website = $10, industry = $11, company_size = $12,
               annual_revenue = $13, company_description = $14, company_location = $15, 
               founded_year = $16, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $17`,
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
            userId
          ]
        );
        console.log('Recruiter profile updated for user_id', userId);
      } else {
        // INSERT recruiter profile
        await db.query(
          `INSERT INTO recruiter_profiles
           (user_id, first_name, last_name, position, bio, phone, linkedin, 
            work_email, profile_picture, company_name, company_website, industry, 
            company_size, annual_revenue, company_description, company_location, founded_year)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
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
            founded_year || null
          ]
        );
        console.log('New recruiter profile created for user_id', userId);
      }
      
      res.json({ 
        success: true, 
        message: 'Recruiter profile saved successfully' 
      });
      
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid account type' 
      });
    }

  } catch (error) {
    console.error('Error in /profile/save:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database error: ' + error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/profile/:email
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('GET /profile/:email for', email);

    // Get user info - FIXED for PostgreSQL
    const userResult = await db.query(
      'SELECT id, account_type FROM users WHERE email = $1',
      [email]
    );

    if (!userResult.rows.length) {
      console.log('No user found for email:', email);
      return res.json({ 
        success: true, 
        profile: null,
        account_type: null 
      });
    }

    const userId = userResult.rows[0].id;
    const accountType = userResult.rows[0].account_type;
    let profile = null;

    if (accountType === 'candidate') {
      const profileResult = await db.query(
        'SELECT * FROM candidate_profiles WHERE user_id = $1',
        [userId]
      );
      
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
        // Ensure arrays are properly formatted
        if (profile.skills && !Array.isArray(profile.skills)) {
          profile.skills = [];
        }
        if (profile.experiences && typeof profile.experiences === 'string') {
          try {
            profile.experiences = JSON.parse(profile.experiences);
          } catch {
            profile.experiences = [];
          }
        }
        if (profile.educations && typeof profile.educations === 'string') {
          try {
            profile.educations = JSON.parse(profile.educations);
          } catch {
            profile.educations = [];
          }
        }
        if (profile.activities && typeof profile.activities === 'string') {
          try {
            profile.activities = JSON.parse(profile.activities);
          } catch {
            profile.activities = [];
          }
        }
      }
      
    } else if (accountType === 'recruiter') {
      const profileResult = await db.query(
        'SELECT * FROM recruiter_profiles WHERE user_id = $1',
        [userId]
      );
      
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    }

    console.log('Profile loaded for', email, 'type:', accountType);
    
    res.json({ 
      success: true, 
      profile,
      account_type: accountType 
    });
    
  } catch (error) {
    console.error('Error in /profile/:email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database error: ' + error.message
    });
  }
});

module.exports = router;