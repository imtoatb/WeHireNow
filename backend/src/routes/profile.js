const express = require('express');
const router = express.Router();
const db = require('../models/db');

// POST /api/profile/save
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
      skills = [],
      experiences = [],
      educations = [],
      activities = [],
      // For recruiter profiles
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
    console.log('Profile data received:', {
      firstName: first_name,
      lastName: last_name,
      hasImage: !!profile_picture,
      skillsCount: Array.isArray(skills) ? skills.length : 0,
      experiencesCount: Array.isArray(experiences) ? experiences.length : 0,
      educationsCount: Array.isArray(educations) ? educations.length : 0,
      activitiesCount: Array.isArray(activities) ? activities.length : 0
    });

    // 1) Get user_id from email
    const userResult = await db.query(
      'SELECT id, account_type FROM users WHERE email = $1',
      [email]
    );

    if (!userResult.rows.length) {
      console.log('User not found:', email);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userId = userResult.rows[0].id;
    const accountType = userResult.rows[0].account_type;
    
    console.log('User found - id:', userId, 'account_type:', accountType);

    // 2) Save based on account type
    if (accountType === 'candidate') {
      // Ensure all arrays are properly formatted
      const skillsArray = ensureArray(skills);
      const experiencesArray = ensureArray(experiences);
      const educationsArray = ensureArray(educations);
      const activitiesArray = ensureArray(activities);

      console.log('Formatted arrays for candidate:', {
        skills: skillsArray.slice(0, 3),
        experiences: experiencesArray.length,
        educations: educationsArray.length,
        activities: activitiesArray.length
      });

      // Check if candidate profile exists
      const existingProfile = await db.query(
        'SELECT id FROM candidate_profiles WHERE user_id = $1',
        [userId]
      );

      let result;
      if (existingProfile.rows.length > 0) {
        // UPDATE existing profile
        console.log('Updating existing candidate profile for user_id', userId);
        
        const query = `
          UPDATE candidate_profiles
          SET 
            first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            bio = COALESCE($3, bio),
            phone = COALESCE($4, phone),
            linkedin = COALESCE($5, linkedin),
            github = COALESCE($6, github),
            profile_picture = COALESCE($7, profile_picture),
            skills = $8::text[],
            experiences = $9::jsonb,
            educations = $10::jsonb,
            activities = $11::jsonb,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $12
          RETURNING *
        `;

        const params = [
          first_name || '',
          last_name || '',
          bio || '',
          phone || '',
          linkedin || '',
          github || '',
          profile_picture || '',
          skillsArray,
          JSON.stringify(experiencesArray),
          JSON.stringify(educationsArray),
          JSON.stringify(activitiesArray),
          userId
        ];

        result = await db.query(query, params);
        console.log('Candidate profile updated');
        
      } else {
        // INSERT new profile
        console.log('Creating new candidate profile for user_id', userId);
        
        const query = `
          INSERT INTO candidate_profiles 
          (user_id, first_name, last_name, bio, phone, linkedin, github, 
           profile_picture, skills, experiences, educations, activities)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12::jsonb)
          RETURNING *
        `;

        const params = [
          userId,
          first_name || '',
          last_name || '',
          bio || '',
          phone || '',
          linkedin || '',
          github || '',
          profile_picture || '',
          skillsArray,
          JSON.stringify(experiencesArray),
          JSON.stringify(educationsArray),
          JSON.stringify(activitiesArray)
        ];

        result = await db.query(query, params);
        console.log('Candidate profile created');
      }
      
      res.json({ 
        success: true, 
        message: 'Candidate profile saved successfully',
        profile: result.rows[0]
      });
      
    } else if (accountType === 'recruiter') {
      // Check if recruiter profile exists
      const existingProfile = await db.query(
        'SELECT id FROM recruiter_profiles WHERE user_id = $1',
        [userId]
      );

      let result;
      if (existingProfile.rows.length > 0) {
        // UPDATE existing recruiter profile
        console.log('Updating existing recruiter profile for user_id', userId);
        
        const query = `
          UPDATE recruiter_profiles
          SET 
            first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            position = COALESCE($3, position),
            bio = COALESCE($4, bio),
            phone = COALESCE($5, phone),
            linkedin = COALESCE($6, linkedin),
            work_email = COALESCE($7, work_email),
            profile_picture = COALESCE($8, profile_picture),
            company_name = COALESCE($9, company_name),
            company_website = COALESCE($10, company_website),
            industry = COALESCE($11, industry),
            company_size = COALESCE($12, company_size),
            annual_revenue = COALESCE($13, annual_revenue),
            company_description = COALESCE($14, company_description),
            company_location = COALESCE($15, company_location),
            founded_year = COALESCE($16, founded_year),
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $17
          RETURNING *
        `;

        const params = [
          first_name || '',
          last_name || '',
          position || '',
          bio || '',
          phone || '',
          linkedin || '',
          work_email || '',
          profile_picture || '',
          company_name || '',
          company_website || '',
          industry || '',
          company_size || '',
          annual_revenue || '',
          company_description || '',
          company_location || '',
          founded_year || null,
          userId
        ];

        result = await db.query(query, params);
        console.log('Recruiter profile updated');
        
      } else {
        // INSERT new recruiter profile
        console.log('Creating new recruiter profile for user_id', userId);
        
        const query = `
          INSERT INTO recruiter_profiles
          (user_id, first_name, last_name, position, bio, phone, linkedin, 
           work_email, profile_picture, company_name, company_website, industry, 
           company_size, annual_revenue, company_description, company_location, founded_year)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          RETURNING *
        `;

        const params = [
          userId,
          first_name || '',
          last_name || '',
          position || '',
          bio || '',
          phone || '',
          linkedin || '',
          work_email || '',
          profile_picture || '',
          company_name || '',
          company_website || '',
          industry || '',
          company_size || '',
          annual_revenue || '',
          company_description || '',
          company_location || '',
          founded_year || null
        ];

        result = await db.query(query, params);
        console.log('Recruiter profile created');
      }
      
      res.json({ 
        success: true, 
        message: 'Recruiter profile saved successfully',
        profile: result.rows[0]
      });
      
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid account type' 
      });
    }

  } catch (error) {
    console.error('Error in /profile/save:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    let errorMessage = 'Database error: ' + error.message;
    
    if (error.message.includes('json') || error.message.includes('JSON')) {
      errorMessage = 'Invalid data format. Please ensure arrays are properly formatted.';
    } else if (error.message.includes('invalid input syntax')) {
      errorMessage = 'Invalid data sent to database. Please check your profile data.';
    } else if (error.message.includes('value too long')) {
      errorMessage = 'One of the fields contains too much data. Please shorten your input.';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/profile/:email
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('GET /profile/:email for', email);

    // Get user info
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
        
        // Parse JSON fields to objects
        try {
          if (profile.experiences && typeof profile.experiences === 'string') {
            profile.experiences = JSON.parse(profile.experiences);
          } else if (!Array.isArray(profile.experiences)) {
            profile.experiences = [];
          }
        } catch (e) {
          console.warn('Failed to parse experiences:', e.message);
          profile.experiences = [];
        }
        
        try {
          if (profile.educations && typeof profile.educations === 'string') {
            profile.educations = JSON.parse(profile.educations);
          } else if (!Array.isArray(profile.educations)) {
            profile.educations = [];
          }
        } catch (e) {
          console.warn('Failed to parse educations:', e.message);
          profile.educations = [];
        }
        
        try {
          if (profile.activities && typeof profile.activities === 'string') {
            profile.activities = JSON.parse(profile.activities);
          } else if (!Array.isArray(profile.activities)) {
            profile.activities = [];
          }
        } catch (e) {
          console.warn('Failed to parse activities:', e.message);
          profile.activities = [];
        }
        
        // Ensure skills is always an array
        if (!Array.isArray(profile.skills)) {
          profile.skills = [];
        }
        
        console.log('Loaded candidate profile with:', {
          skills: profile.skills.length,
          experiences: profile.experiences.length,
          educations: profile.educations.length,
          activities: profile.activities.length
        });
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

    console.log('Profile loaded for', email, 'type:', accountType, 'hasProfile:', !!profile);
    
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

// DELETE /api/profile/:email
router.delete('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('DELETE /profile/:email for', email);

    const userResult = await db.query(
      'SELECT id, account_type FROM users WHERE email = $1',
      [email]
    );

    if (!userResult.rows.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userId = userResult.rows[0].id;
    const accountType = userResult.rows[0].account_type;

    if (accountType === 'candidate') {
      await db.query(
        'DELETE FROM candidate_profiles WHERE user_id = $1',
        [userId]
      );
      console.log('Candidate profile deleted for user_id', userId);
    } else if (accountType === 'recruiter') {
      await db.query(
        'DELETE FROM recruiter_profiles WHERE user_id = $1',
        [userId]
      );
      console.log('Recruiter profile deleted for user_id', userId);
    }

    res.json({ 
      success: true, 
      message: 'Profile deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error in DELETE /profile/:email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database error: ' + error.message
    });
  }
});

// Helper function to ensure value is an array
function ensureArray(value) {
  if (Array.isArray(value)) {
    return value.filter(item => item !== null && item !== undefined);
  }
  
  if (value === undefined || value === null) {
    return [];
  }
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // If it's not valid JSON, return as single item array
      return value.trim() ? [value] : [];
    }
  }
  
  if (typeof value === 'object') {
    return [value];
  }
  
  return [String(value)];
}

module.exports = router;