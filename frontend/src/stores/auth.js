import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user
  },

  actions: {
    async login(email, password) {
      try {
        const res = await api.post('/auth/login', { email, password })
        this.user = res.data
        
        // Load profile from PostgreSQL
        await this.loadProfileFromDB()
        
        this.error = null
      } catch (err) {
        console.error(err)
        this.error = err.response?.data?.error || 'Login failed'
      }
    },

    async register(email, password, account_type) {
      try {
        const res = await api.post('/auth/register', { email, password, account_type })
        this.user = res.data
        this.user = res.data
        this.error = null
      } catch (err) {
        console.error(err)
        this.error = err.response?.data?.error || 'Registration failed'
      }
    },

    async logout() {
      await api.post('/auth/logout')
      this.user = null
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
          totalSkills: profile.skills ? profile.skills.length : 0,
          totalExperiences: profile.experiences ? profile.experiences.length : 0
        });

        // Create payload without image if too large
        const payload = { ...profile };
        if (payload.profile_picture && payload.profile_picture.length > 300 * 1024) {
          console.warn('Image too large, sending without image');
          const imageSize = payload.profile_picture.length;
          delete payload.profile_picture;
          console.log(`Image removed (${imageSize} bytes)`);
        }

        const response = await api.post('/profile/save', {
          email: this.user.email,
          ...payload
        });
        
        if (response.data.success) {
          console.log('Profile saved in PostgreSQL');
          // Update local profile with the data that was actually saved
          this.user.profile = { ...this.user.profile, ...payload };
          localStorage.setItem('user', JSON.stringify(this.user));
          return response.data;
        } else {
          throw new Error(response.data.message || 'Unknown error');
        }
        
      } catch (error) {
        console.error('Error saving profile:', error);
        
        // Local storage fallback
        this.user.profile = { ...this.user.profile, ...profile };
        localStorage.setItem('user', JSON.stringify(this.user));
        
        if (error.response?.status === 413) {
          throw new Error('Request failed with status code 413 - Data too large. Please reduce image size or content.');
        } else if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        } else {
          throw new Error('Network error: ' + error.message);
        }
      }
    },

    async loadProfileFromDB() {
      if (!this.user) return
      
      try {
        const response = await api.get(`/profile/${this.user.email}`)
        if (response.data.success && response.data.profile) {
          this.user.profile = response.data.profile;
          localStorage.setItem('user', JSON.stringify(this.user));
          console.log('Profile loaded from database');
        } else {
          console.log('No profile found in database');
        }
      } catch (error) {
        console.error('Error loading profile from DB:', error);
        // On error, load from localStorage
        this.loadProfileFromLocalStorage();
      }
    },

    loadProfileFromLocalStorage() {
      if (!this.user) return
      
      const savedUser = JSON.parse(localStorage.getItem('user'))
      if (savedUser && savedUser.profile && savedUser.email === this.user.email) {
        console.log('Profile loaded from localStorage');
        this.user.profile = savedUser.profile;
      } else {
        console.log('No profile found in localStorage');
      }
    }
  },
})