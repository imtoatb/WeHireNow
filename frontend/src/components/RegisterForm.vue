<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const account_type = ref("candidate");

const handleRegister = async () => {
  await auth.register(email.value, password.value, account_type.value);

  if (auth.user) {
    if (auth.user.account_type === "candidate") {
      router.push("/profil-c");
    } else {
      router.push("/profil-r");
    }
  }
};
</script>

<template>
  <div class="register">
    <h2>Créer un compte</h2>

    <form @submit.prevent="handleRegister" class="register-form">
      <input v-model="email" type="email" placeholder="Email" required />

      <input v-model="password" type="password" placeholder="Mot de passe" required />

      <select v-model="account_type">
        <option value="candidate">Candidat</option>
        <option value="recruiter">Recruteur</option>
      </select>

      <button type="submit">Créer mon compte</button>
    </form>

    <p v-if="auth.error" class="error">{{ auth.error }}</p>
  </div>
</template>

<style scoped>
.register {
  max-width: 380px;
  margin: 80px auto;
  background: #FAF6F2;
  padding: 2rem;
  border-radius: 18px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.08);
  text-align: center;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register input,
.register select {
  width: 100%;
  padding: 0.8rem;
  border-radius: 10px;
  border: 1px solid #E8D9C5;
}

.register button {
  background-color: #EC7357;
  color: white;
  padding: 0.9rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
}

.register button:hover {
  background-color: #754F44;
}

.error {
  color: red;
  margin-top: 1rem;
}
</style>
