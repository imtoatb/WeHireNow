<template>
  <div class="register">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <select v-model="account_type">
        <option value="candidate">Candidate</option>
        <option value="recruiter">Recruiter</option>
      </select>
      <button type="submit">Sign up</button>
    </form>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const email = ref('')
const password = ref('')
const account_type = ref('candidate')
const message = ref('')

const register = async () => {
  try {
    const res = await api.post('/auth/register', {
      email: email.value,
      password: password.value,
      account_type: account_type.value,
    })
    message.value = `Account created for ${res.data.email}`
  } catch (err) {
    console.error(err)
    message.value = err.response?.data?.error || 'Registration failed'
  }
}
</script>

<style scoped>
.register {
  max-width: 300px;
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

button {
  background-color: #EC7357;
  color: white;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
}

button:hover {
  background-color: #754F44;
}
</style>
