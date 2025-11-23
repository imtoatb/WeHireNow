<template>
  <div class="form-container">
    <h1>Compléter votre profil recruteur</h1>

    <!-- Logo -->
    <div class="form-section">
      <label>Logo de l'entreprise</label>
      <input type="file" accept="image/*" @change="handleLogo">
    </div>

    <!-- Infos entreprise -->
    <div class="form-section">
      <label>Nom de l'entreprise</label>
      <input type="text" v-model="companyName">

      <label>Description</label>
      <textarea v-model="description"></textarea>

      <label>Secteur d'activité</label>
      <input type="text" v-model="industry">

      <label>Site web</label>
      <input type="text" v-model="website">

      <label>Adresse</label>
      <input type="text" v-model="address">

      <label>Taille de l'entreprise</label>
      <select v-model="companySize">
        <option>1 - 10 employés</option>
        <option>10 - 50 employés</option>
        <option>50 - 200 employés</option>
        <option>200 - 1000 employés</option>
        <option>1000+ employés</option>
      </select>
    </div>

    <button class="submit-btn" @click="submitProfile">Enregistrer</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();

const companyName = ref("");
const description = ref("");
const industry = ref("");
const website = ref("");
const address = ref("");
const companySize = ref("");

function handleLogo(e) {
  const file = e.target.files[0];
  console.log("Selected logo:", file);
}

function submitProfile() {
  const payload = {
    user_id: auth.user.id,
    companyName: companyName.value,
    description: description.value,
    industry: industry.value,
    website: website.value,
    address: address.value,
    companySize: companySize.value,
  };

  console.log("RECRUITER PROFILE:", payload);
  alert("Profil recruteur enregistré !");
}
</script>

<style scoped>
.form-container {
  max-width: 700px;
  margin: auto;
  padding: 40px;
}
.form-section {
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
}
.submit-btn {
  margin-top: 20px;
  padding: 12px 20px;
}
</style>
