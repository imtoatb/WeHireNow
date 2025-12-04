import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { jobApplications } from '../services/api'

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    error: null,
    applications: []
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    applicationStats: (state) => {
      if (!state.applications.length) return null;
      
      const stats = {
        pending: 0,
        reviewed: 0,
        accepted: 0,
        rejected: 0,
        total: 0
      };
      
      state.applications.forEach(app => {
        stats[app.status] = (stats[app.status] || 0) + 1;
        stats.total++;
      });
      
      return stats;
    }
  },

  actions: {
    async login(email, password) {
      try {
        const res = await api.post('/auth/login', { email, password })
        this.user = res.data
        
        // Load profile from PostgreSQL
        await this.loadProfileFromDB()
        
        // Load applications if user is candidate
        if (this.user.account_type === 'candidate') {
          await this.loadApplications();
        }
        
        this.error = null
      } catch (err) {
        console.error(err);
        this.error = err.response?.data?.error || "Login failed";
      }
    },

    async register(email, password, account_type) {
      try {
        const res = await api.post("/auth/register", {
          email,
          password,
          account_type,
        });
        this.user = res.data;
        this.error = null;
      } catch (err) {
        console.error(err);
        this.error = err.response?.data?.error || "Registration failed";
      }
    },

    async logout() {
      await api.post('/auth/logout')
      this.user = null
      this.applications = []
      localStorage.removeItem('user')
    },

    async setProfile(profile) {
      if (!this.user) {
        console.error('No user connected');
        throw new Error('No user connected');
      }
      
      try {
        console.log('Sending profile to API...', {
          hasImage: !!profile.profile_picture,
          imageSize: profile.profile_picture ? profile.profile_picture.length : 0,
          firstName: profile.first_name,
          lastName: profile.last_name,
          skillsCount: profile.skills?.length || 0,
          experiencesCount: profile.experiences?.length || 0,
          educationsCount: profile.educations?.length || 0,
          activitiesCount: profile.activities?.length || 0
        });

        // Prepare payload for candidate profile
        const payload = {
          email: this.user.email,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          bio: profile.bio || '',
          phone: profile.phone || '',
          linkedin: profile.linkedin || '',
          github: profile.github || '',
          profile_picture: profile.profile_picture || '',
          // Arrays - ensure they exist
          skills: Array.isArray(profile.skills) ? profile.skills : [],
          experiences: Array.isArray(profile.experiences) ? profile.experiences : [],
          educations: Array.isArray(profile.educations) ? profile.educations : [],
          activities: Array.isArray(profile.activities) ? profile.activities : []
        };

        console.log('Final payload to send:', {
          ...payload,
          skillsSample: payload.skills.slice(0, 3),
          experiencesSample: payload.experiences.length > 0 ? payload.experiences[0] : 'none',
          profile_picture_length: payload.profile_picture ? payload.profile_picture.length : 0
        });

        const response = await api.post('/profile/save', payload);
        
        if (response.data.success) {
          console.log('Profile saved in PostgreSQL:', response.data.message);
          
          // Update local store with the saved profile data
          this.user.profile = {
            ...this.user.profile,
            first_name: payload.first_name,
            last_name: payload.last_name,
            bio: payload.bio,
            phone: payload.phone,
            linkedin: payload.linkedin,
            github: payload.github,
            profile_picture: payload.profile_picture,
            skills: payload.skills,
            experiences: payload.experiences,
            educations: payload.educations,
            activities: payload.activities
          };
          
          localStorage.setItem('user', JSON.stringify(this.user));
          return response.data;
        } else {
          throw new Error(response.data.message || 'Unknown error');
        }
        
      } catch (error) {
        console.error('Error saving profile:', error);
        console.error('Error response:', error.response?.data);
        
        let errorMessage = 'Failed to save profile';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }
    },

    async loadProfileFromDB() {
      if (!this.user) return;
      
      try {
        const response = await api.get(`/profile/${this.user.email}`);
        if (response.data.success && response.data.profile) {
          // Merge profile data into user object
          this.user.profile = {
            ...this.user.profile,
            ...response.data.profile
          };
          
          localStorage.setItem('user', JSON.stringify(this.user));
          console.log('Profile loaded from database:', {
            firstName: this.user.profile.first_name,
            skillsCount: this.user.profile.skills?.length || 0,
            experiencesCount: this.user.profile.experiences?.length || 0
          });
        } else {
          console.log('No profile found in database');
        }
      } catch (error) {
        console.error('Error loading profile from DB:', error);
        this.loadProfileFromLocalStorage();
      }
    },

    loadProfileFromLocalStorage() {
      if (!this.user) return;
      
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser && savedUser.profile && savedUser.email === this.user.email) {
        console.log('Profile loaded from localStorage');
        this.user.profile = savedUser.profile;
      } else {
        console.log('No profile found in localStorage');
      }
    },

    async loadApplications() {
      if (!this.user || this.user.account_type !== 'candidate') return;
      
      try {
        const response = await jobApplications.getApplications();
        this.applications = response.data;
        console.log('Applications loaded:', this.applications.length);
      } catch (error) {
        console.error('Error loading applications:', error);
        this.applications = [];
      }
    },

    async createApplication(jobId, coverLetter = null) {
      if (!this.user || this.user.account_type !== 'candidate') {
        throw new Error('Only candidates can apply to jobs');
      }
      
      try {
        const response = await jobApplications.createApplication(jobId, coverLetter);
        await this.loadApplications();
        return response.data;
      } catch (error) {
        console.error('Error creating application:', error);
        throw error;
      }
    }
  },
});