import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),

  actions: {
    async register(email, password, account_type) {
      try {
        this.loading = true;
        const res = await api.post("/auth/register", { email, password, account_type });
        this.user = res.data;
      } catch (err) {
        this.error = err.response?.data?.error || "Registration failed";
      } finally {
        this.loading = false;
      }
    },

    async login(email, password) {
      try {
        this.loading = true;
        const res = await api.post("/auth/login", { email, password });
        this.user = res.data;
      } catch (err) {
        this.error = err.response?.data?.error || "Login failed";
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      await api.post("/auth/logout");
      this.user = null;
    },

    async getMe() {
      try {
        const res = await api.get("/auth/me");
        this.user = res.data.user;
      } catch {
        this.user = null;
      }
    },
  },
});
