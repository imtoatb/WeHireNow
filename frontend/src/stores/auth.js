import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    error: null,
  }),

  actions: {
    async login(email, password) {
      try {
        const res = await api.post('/auth/login', { email, password })
        this.user = res.data
        
        // Charger le profil depuis PostgreSQL
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

    // SAUVEGARDE CORRIGÉE - Appelle l'API
    async setProfile(profile) {
      if (!this.user) {
        console.error('No user connected');
        return;
      }
      
      try {
        console.log('Send the profile to the API...', profile);
        
        // APPEL API CRITIQUE - Sauvegarde dans PostgreSQL
        const response = await api.post('/profile/save', {
          email: this.user.email,
          ...profile
        });
        
        if (response.data.success) {
          console.log('Profile saved in PostgreSQL');
          this.user.profile = profile;
          localStorage.setItem('user', JSON.stringify(this.user));
        } else {
          throw new Error(response.data.message || 'Unknow error');
        }
        
      } catch (error) {
        console.error('Error save profile:', error);
        // Fallback: sauvegarde locale seulement
        this.user.profile = profile;
        localStorage.setItem('user', JSON.stringify(this.user));
        alert('Careful : profile saved locally but nor in the database. Error : ' + error.message);
      }
    },

    // Charger le profil depuis PostgreSQL
async loadProfileFromDB() {
  if (!this.user) return
  
  try {
    const response = await api.get(`/profile/${this.user.email}`)
    if (response.data.success && response.data.profile) {
      this.user.profile = response.data.profile;
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  } catch (error) {
    console.error('Error loading profile from DB:', error);
  }
},

    // Fallback: charger depuis localStorage
    loadProfileFromLocalStorage() {
      if (!this.user) return
      
      const savedUser = JSON.parse(localStorage.getItem('user'))
      if (savedUser && savedUser.profile && savedUser.email === this.user.email) {
        console.log('Profile charged from localStorage');
        this.user.profile = savedUser.profile;
      }
    }
  },
})