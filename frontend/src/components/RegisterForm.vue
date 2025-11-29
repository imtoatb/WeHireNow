<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const account_type = ref("candidate");

const registerUser = async () => {
  await auth.register(email.value, password.value, account_type.value);

  if (auth.user) {
    // Redirection selon le type de compte
    if (auth.user.account_type === "candidate") {
      router.push("/form-candidate");
    } else {
      router.push("/form-recruiter");
    }
  }
};
</script>


<template>
  <div class="register">
    <h2>Create an account</h2>

    <form @submit.prevent="registerUser" class="register-form">

      <input v-model="email" type="email" placeholder="Email" required />

      <input v-model="password" type="password" placeholder="Mot de passe" required />

      <select v-model="account_type">
        <option value="candidate">Candidate</option>
        <option value="recruiter">Recruiter</option>
      </select>

      <button type="submit">Create my account</button>
    </form>

    <p v-if="auth.error" class="error">{{ auth.error }}</p>
  </div>
</template>