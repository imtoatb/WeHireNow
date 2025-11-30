<template>
  <header class="navbar">
    <div class="logo">WeHireNow</div>
    <nav class="nav-buttons">
      <RouterLink to="/mainpage" class="nav-link">Home</RouterLink>
      <RouterLink to="/jobsearch" class="nav-link">JobSearch</RouterLink>
      
      <!-- Links change based on authentication status -->
      <RouterLink v-if="auth.isAuthenticated" to="profileRoute" class="nav-link">Profile</RouterLink>
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

  // adapte les valeurs aux valeurs que tu renvoies depuis le backend
  if (auth.user.account_type === 'recruiter') {
    return '/profil-r'
  }
  // par défaut : candidate
  return '/profil-c'
})
</script>