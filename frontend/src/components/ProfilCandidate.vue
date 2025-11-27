<script setup>
import { useAuthStore } from "../stores/auth";
import { onMounted } from "vue";

const auth = useAuthStore();

// Charger le profil au montage du composant
onMounted(() => {
  if (auth.user && !auth.user.profile) {
    // Vérifiez d'abord que la fonction existe
    if (auth.loadProfile && typeof auth.loadProfile === 'function') {
      auth.loadProfile();
    }
  }
});

// Profil avec valeurs par défaut - version sécurisée
const profile = auth.user?.profile || {
  first_name: auth.user?.first_name || "",
  last_name: auth.user?.last_name || "",
  bio: "",
  email: auth.user?.email || "",
  phone: "",
  linkedin: "",
  github: "",
  profile_picture: "",
  skills: [],
  experiences: [],
  educations: [],
  activities: []
};

const getInitials = (fullName) => {
  if (!fullName.trim()) return "U";
  return fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAccountTypeDisplay = (accountType) => {
  const types = {
    'candidate': 'Candidat',
    'recruiter': 'Recruteur', 
    'company': 'Entreprise'
  };
  return types[accountType] || accountType;
};
</script>

<template>
  <div class="profile-container">
    <div v-if="auth.user">
      <!-- Bandeau avec photo et nom -->
      <div class="header-profil">
        <div class="profile-picture-container">
          <img 
            v-if="profile.profile_picture" 
            :src="profile.profile_picture" 
            alt="Photo de profil" 
            class="profile-picture"
          />
          <div v-else class="profile-picture-placeholder">
            {{ getInitials(profile.first_name + ' ' + profile.last_name) }}
          </div>
        </div>
        
        <div class="profile-info">
          <h1 class="profile-name">
            {{ profile.first_name || 'Prénom' }} {{ profile.last_name || 'Nom' }}
          </h1>
          <p class="profile-title">
            {{ getAccountTypeDisplay(auth.user.account_type) }}
          </p>
        </div>
      </div>

      <div class="profile-content-spacer"></div>

      <!-- Détails du profil -->
      <div class="profile-details">
        <!-- Bio -->
        <div class="bio card">
          <h2>À propos de moi</h2>
          <p class="bio-content">{{ profile.bio || "Aucune bio renseignée" }}</p>
        </div>

        <!-- Contact -->
        <div class="contact-info card">
          <h2>Informations de contact</h2>
          <div class="contact-grid">
            <div class="contact-item">
              <span class="contact-label">Email :</span>
              <span class="contact-value">{{ profile.email }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Téléphone :</span>
              <span class="contact-value">{{ profile.phone || "Non renseigné" }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">LinkedIn :</span>
              <span class="contact-value">{{ profile.linkedin || "Non renseigné" }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">GitHub :</span>
              <span class="contact-value">{{ profile.github || "Non renseigné" }}</span>
            </div>
          </div>
        </div>

        <!-- Compétences -->
        <div class="skills-section card">
          <h2>Compétences</h2>
          <div class="skills-grid" v-if="profile.skills && profile.skills.length > 0">
            <span class="skill-tag" v-for="skill in profile.skills" :key="skill">
              {{ skill }}
            </span>
          </div>
          <p v-else class="no-data">Aucune compétence renseignée</p>
        </div>

        <!-- Expériences -->
        <div class="experience-section card">
          <h2>Expériences professionnelles</h2>
          <div v-if="profile.experiences && profile.experiences.length > 0">
            <div
              v-for="(experience, index) in profile.experiences"
              :key="index"
              class="experience-item"
            >
              <h3>{{ experience.position }} chez {{ experience.company }}</h3>
              <p class="experience-duration">{{ experience.duration }}</p>
              <p class="experience-description">{{ experience.description }}</p>
            </div>
          </div>
          <p v-else class="no-data">Aucune expérience renseignée</p>
        </div>

        <!-- Formation -->
        <div class="education-section card">
          <h2>Formation</h2>
          <div v-if="profile.educations && profile.educations.length > 0">
            <div
              v-for="(education, index) in profile.educations"
              :key="index"
              class="education-item"
            >
              <h3>{{ education.degree }} - {{ education.institution }}</h3>
              <p class="education-duration">{{ education.duration }}</p>
              <p class="education-description">{{ education.description }}</p>
            </div>
          </div>
          <p v-else class="no-data">Aucune formation renseignée</p>
        </div>

        <!-- Activités -->
        <div class="activity-section card">
          <h2>Activités</h2>
          <div v-if="profile.activities && profile.activities.length > 0">
            <div
              v-for="(activity, index) in profile.activities"
              :key="index"
              class="activity-item"
            >
              <h3>{{ activity.name }}</h3>
              <p class="activity-duration">{{ activity.duration }}</p>
              <p class="activity-description">{{ activity.description }}</p>
            </div>
          </div>
          <p v-else class="no-data">Aucune activité renseignée</p>
        </div>
      </div>
    </div>
    <div v-else class="not-connected">
      <p>Veuillez vous connecter pour voir votre profil</p>
    </div>
  </div>
</template>