

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async login(email, password) {
      try {
        const res = await api.post("/auth/login", { email, password });
        this.user = res.data;

        // Charger le bon profil selon le type
        await this.loadProfileFromDB();

        this.error = null;
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
      await api.post("/auth/logout");
      this.user = null;
      localStorage.removeItem("user");
    },

    // ---------------------------------------------
    //  🔥  SAUVEGARDE DU PROFIL (Candidat vs Recruteur)
    // ---------------------------------------------
   async setProfile(payload) {
  if (!this.user) throw new Error("No user connected");

  const isRecruiter = this.user.account_type === "recruiter";

  const endpoint = isRecruiter
    ? "/recruiter-profile/save"
    : "/profile/save";

  console.log("➡️ Sending profile to:", endpoint);
  console.log("Payload:", payload);

  try {
    const res = await api.post(endpoint, {
      email: this.user.email,
      ...payload,
    });

    if (!res.data.success) {
      throw new Error(res.data.message || "Error saving profile");
    }

    await this.loadProfileFromDB();
    return true;
  } catch (err) {
    console.error("❌ Error saving profile", err);

    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Response data:", err.response.data);
    }

    throw err;
  }
},


    // ---------------------------------------------
    //  🔥  CHARGEMENT DU PROFIL
    // ---------------------------------------------
    async loadProfileFromDB() {
      try {
        if (!this.user?.email) {
          console.warn("No user email, skipping profile load");
          return;
        }

        const isRecruiter = this.user.account_type === "recruiter";
        const endpoint = isRecruiter
          ? `/recruiter-profile/${encodeURIComponent(this.user.email)}`
          : `/profile/${encodeURIComponent(this.user.email)}`;

        console.log("➡️ Loading profile from:", endpoint);

        const res = await api.get(endpoint);
        this.user.profile = res.data.profile;

        console.log("✅ Profile loaded from DB:", this.user.profile);

        localStorage.setItem("user", JSON.stringify(this.user));
      } catch (err) {
        console.error("❌ Error loading profile:", err);
      }
    }


  },
});