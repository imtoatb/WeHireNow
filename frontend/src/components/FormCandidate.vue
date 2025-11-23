<template>
  <div class="form-container">
    <h1>Compléter votre profil candidat</h1>

    <!-- Photo -->
    <div class="form-section">
      <label>Photo de profil</label>
      <input type="file" accept="image/*" @change="handleImage" />
    </div>

    <!-- Bio -->
    <div class="form-section">
      <label>Bio</label>
      <textarea v-model="bio" placeholder="Parlez un peu de vous..."></textarea>
    </div>

    <!-- Contact -->
    <div class="form-section">
      <label>Email</label>
      <input type="email" :value="auth.user.email" disabled />
      
      <label>Numéro de téléphone</label>
      <input type="text" v-model="phone" placeholder="06..." />

      <label>LinkedIn</label>
      <input type="text" v-model="linkedin" />

      <label>GitHub</label>
      <input type="text" v-model="github" />
    </div>

    <!-- Skills -->
    <div class="form-section">
      <label>Skills</label>

      <div class="skill-input">
        <input v-model="newSkill" placeholder="Ajouter un skill" />
        <button @click="addSkill">+</button>
      </div>

      <ul class="skill-list">
        <li v-for="(skill, index) in skills" :key="index">
          {{ skill }}
          <span class="remove" @click="removeSkill(index)">x</span>
        </li>
      </ul>
    </div>

    <!-- Experience -->
    <div class="form-section">
      <label>Expériences</label>

      <div
        class="experience-item"
        v-for="(exp, index) in experiences"
        :key="index"
      >
        <input v-model="exp.position" placeholder="Poste" />
        <input v-model="exp.company" placeholder="Entreprise" />
        <input v-model="exp.duration" placeholder="Durée" />
        <textarea v-model="exp.description" placeholder="Description"></textarea>
        <button @click="removeExperience(index)">Supprimer</button>
      </div>

      <button @click="addExperience" class="add-btn">Ajouter une expérience</button>
    </div>

    <!-- Education -->
    <div class="form-section">
      <label>Éducation</label>

      <div
        class="education-item"
        v-for="(edu, index) in education"
        :key="index"
      >
        <input v-model="edu.degree" placeholder="Diplôme" />
        <input v-model="edu.institution" placeholder="École / Université" />
        <input v-model="edu.duration" placeholder="Durée" />
        <textarea v-model="edu.description" placeholder="Description"></textarea>
        <button @click="removeEducation(index)">Supprimer</button>
      </div>

      <button @click="addEducation" class="add-btn">Ajouter une formation</button>
    </div>

    <!-- Activities -->
    <div class="form-section">
      <label>Activités</label>

      <div
        class="activity-item"
        v-for="(act, index) in activities"
        :key="index"
      >
        <input v-model="act.name" placeholder="Nom de l'activité" />
        <input v-model="act.duration" placeholder="Durée" />
        <textarea v-model="act.description" placeholder="Description"></textarea>
        <button @click="removeActivity(index)">Supprimer</button>
      </div>

      <button @click="addActivity" class="add-btn">Ajouter une activité</button>
    </div>

    <button class="submit-btn" @click="submitProfile">Enregistrer</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();

// Champs simples
const bio = ref("");
const phone = ref("");
const linkedin = ref("");
const github = ref("");

// Skills
const skills = ref([]);
const newSkill = ref("");

function addSkill() {
  if (newSkill.value.trim() !== "") skills.value.push(newSkill.value.trim());
  newSkill.value = "";
}

function removeSkill(i) {
  skills.value.splice(i, 1);
}

// Experience
const experiences = ref([]);

function addExperience() {
  experiences.value.push({ position: "", company: "", duration: "", description: "" });
}
function removeExperience(i) {
  experiences.value.splice(i, 1);
}

// Education
const education = ref([]);

function addEducation() {
  education.value.push({ degree: "", institution: "", duration: "", description: "" });
}
function removeEducation(i) {
  education.value.splice(i, 1);
}

// Activities
const activities = ref([]);

function addActivity() {
  activities.value.push({ name: "", duration: "", description: "" });
}
function removeActivity(i) {
  activities.value.splice(i, 1);
}

// Image
function handleImage(e) {
  const file = e.target.files[0];
  console.log("Selected image:", file);
}

// Submit
function submitProfile() {
  const payload = {
    user_id: auth.user.id,
    bio: bio.value,
    phone: phone.value,
    linkedin: linkedin.value,
    github: github.value,
    skills: skills.value,
    experiences: experiences.value,
    education: education.value,
    activities: activities.value,
  };

  console.log("PROFILE DATA TO SEND:", payload);
  alert("Profil candidat enregistré !");
}
</script>

<style scoped>
.form-container {
  max-width: 800px;
  margin: auto;
  padding: 40px;
}

.form-section {
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
}

.skill-input {
  display: flex;
  gap: 10px;
}

.skill-list li {
  display: flex;
  justify-content: space-between;
}

.add-btn {
  margin-top: 10px;
}

.submit-btn {
  margin-top: 30px;
  padding: 12px 20px;
}
</style>
