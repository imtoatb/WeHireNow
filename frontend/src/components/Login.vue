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
  <br />
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const auth = useAuthStore();
const router = useRouter();

async function handleLogin() {
  await auth.login(email.value, password.value);

  if (auth.user) {
    if (auth.user.account_type === "candidate") {
      router.push("/profil-c");
    } else if (auth.user.account_type === "recruiter") {
      router.push("/profil-r"); 
    } else {
      router.push("/");
    }
  }
}
</script>
