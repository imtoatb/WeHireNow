<template>
  <header class="navbar">
    <div class="logo">
      <img src="/src/assets/WHN.png" alt="WeHireNow Logo" class="logo-img" />
      <span>WeHireNow</span>
    </div>
    <nav class="nav-buttons">
      <RouterLink to="/mainpage" class="nav-link">Home</RouterLink>
      <RouterLink to="/jobsearch" class="nav-link">JobSearch</RouterLink>
      
      <!-- Links change based on authentication status -->
      <RouterLink v-if="auth.isAuthenticated" :to="profileRoute" class="nav-link">Profile</RouterLink>
      <RouterLink v-else to="/login" class="nav-link">Login</RouterLink>
      
      <RouterLink v-if="!auth.isAuthenticated" to="/register" class="nav-link">Register</RouterLink>
    </nav>
  </header>
</template>


<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const profileRoute = computed(() => {
  if (!auth.user) return '/login'

  switch (auth.user.account_type) {
    case 'recruiter':
      return '/profil-r'
    case 'candidate':
      return '/profil-c'
    case 'company':
      // à adapter si tu as une page profil entreprise
      return '/profil-r'
    default:
      return '/profil-c'
  }
})
</script>