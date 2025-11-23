<script setup>
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();

// Profil du candidat (vide si aucun profil encore enregistré)
const profile = auth.user?.profile || {
  first_name: "",
  last_name: "",
  bio: "",
  email: auth.user?.email || "",
  phone: "",
  linkedin: "",
  github: "",
  skills: [],
  experiences: [],
  educations: [],
  activities: []
};
</script>

<template>
  <div class="header-profil">
    <img src="" alt="Profile Picture" class="profile-picture" />
    <img src="" alt="Background Image" class="background-image" />
    <h1>{{ profile.first_name }} {{ profile.last_name }}</h1>
  </div>

  <div class="profil-details">
    <div>
      <h1>Bienvenue {{ auth.user.email }}</h1>
      <p>Type : {{ auth.user.account_type }}</p>
    </div>

    <div class="bio">
      <h2>About Me</h2>
      <p>{{ profile.bio }}</p>
    </div>

    <div class="contact-info">
      <h2>Contact Information</h2>
      <p>Email: {{ profile.email }}</p>
      <p>Phone: {{ profile.phone }}</p>
      <p>LinkedIn: {{ profile.linkedin }}</p>
      <p>GitHub: {{ profile.github }}</p>
    </div>

    <div class="skills-experience">
      <h2>Skills</h2>
      <ul>
        <li v-for="skill in profile.skills" :key="skill">{{ skill }}</li>
      </ul>

      <h2>Experience</h2>
      <div
        v-for="experience in profile.experiences"
        :key="experience.id"
        class="experience-item"
      >
        <h3>{{ experience.position }} at {{ experience.company }}</h3>
        <p>{{ experience.duration }}</p>
        <p>{{ experience.description }}</p>
      </div>
    </div>

    <div class="education">
      <h2>Education</h2>
      <div
        v-for="education in profile.educations"
        :key="education.id"
        class="education-item"
      >
        <h3>{{ education.degree }} from {{ education.institution }}</h3>
        <p>{{ education.duration }}</p>
        <p>{{ education.description }}</p>
      </div>
    </div>

    <div class="Activity">
      <h2>Activities</h2>
      <div
        v-for="activity in profile.activities"
        :key="activity.id"
        class="activity-item"
      >
        <h3>{{ activity.name }}</h3>
        <p>{{ activity.duration }}</p>
        <p>{{ activity.description }}</p>
      </div>
    </div>
  </div>
</template>
