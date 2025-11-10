<template>
  <div class="login">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>

    <p v-if="auth.error" style="color:red">{{ auth.error }}</p>
    <p v-if="auth.user">Welcome, {{ auth.user.email }}!</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";

const email = ref("");
const password = ref("");
const auth = useAuthStore();

async function handleLogin() {
  await auth.login(email.value, password.value);
}
</script>

<style>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
}
input {
  padding: 0.5rem;
  width: 200px;
}
button {
  padding: 0.5rem 1rem;
}
</style>
