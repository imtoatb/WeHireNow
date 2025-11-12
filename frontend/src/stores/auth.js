import { defineStore } from 'pinia'
import api from '../services/api' // adapte si ton fichier est ailleurs

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    error: null,
  }),

  actions: {
    async login(email, password) {
      try {
        const res = await api.post('/auth/login', { email, password })
        this.user = res.data.user
        this.error = null
      } catch (err) {
        console.error(err)
        this.error = err.response?.data?.error || 'Login failed'
      }
    },

    async register(email, password, account_type) {
      try {
        const res = await api.post('/auth/register', { email, password, account_type })
        this.user = res.data.user
        this.error = null
      } catch (err) {
        console.error(err)
        this.error = err.response?.data?.error || 'Registration failed'
      }
    },

    async logout() {
      await api.post('/auth/logout')
      this.user = null
    },
  },
})
