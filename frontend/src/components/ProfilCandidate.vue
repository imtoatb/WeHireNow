<script setup>
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { onMounted, ref, watch } from "vue";

const auth = useAuthStore();
const router = useRouter();

// Use reactive profile data
const profile = ref({
  first_name: "",
  last_name: "",
  bio: "",
  email: "",
  phone: "",
  linkedin: "",
  github: "",
  profile_picture: "",
  skills: [],
  experiences: [],
  educations: [],
  activities: []
});

// Load profile when component mounts
onMounted(() => {
  loadProfileData();
});

// Watch for auth.user profile changes
watch(() => auth.user?.profile, (newProfile) => {
  if (newProfile) {
    console.log("🔄 Profile updated in store, refreshing display...");
    profile.value = { ...newProfile };
  }
}, { deep: true });

// Function to load profile data
const loadProfileData = async () => {
  if (auth.user) {
    console.log("📥 Loading profile data...");
    
    // First load from database to get fresh data
    if (auth.loadProfileFromDB) {
      await auth.loadProfileFromDB();
    }
    
    // Then update display with current data
    if (auth.user?.profile) {
      profile.value = { ...auth.user.profile };
      console.log("✅ Profile data loaded:", profile.value);
    } else {
      console.log("ℹ️ No profile data found");
    }
  }
};

// Logout function
const handleLogout = async () => {
  try {
    await auth.logout();
    router.push('/login');
  } catch (error) {
    console.error('❌ Logout error:', error);
  }
};

// Function to edit profile
const handleEditProfile = () => {
  router.push('/form-candidate');
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
    'candidate': 'Candidate',
    'recruiter': 'Recruiter', 
    'company': 'Company'
  };
  return types[accountType] || accountType;
};
</script>

<template>
  <div class="profile-container">
    <div v-if="auth.user">
      <!-- Header with photo, name and buttons -->
      <div class="header-profil">
        <div class="profile-picture-container">
          <img 
            v-if="profile.profile_picture" 
            :src="profile.profile_picture" 
            alt="Profile Picture" 
            class="profile-picture"
          />
          <div v-else class="profile-picture-placeholder">
            {{ getInitials(profile.first_name + ' ' + profile.last_name) }}
          </div>
        </div>
        
        <div class="profile-info">
          <h1 class="profile-name">
            {{ profile.first_name || 'First Name' }} {{ profile.last_name || 'Last Name' }}
          </h1>
          <p class="profile-title">
            {{ getAccountTypeDisplay(auth.user.account_type) }}
          </p>
        </div>

        <!-- Action buttons -->
        <div class="profile-actions">
          <button @click="handleEditProfile" class="btn-edit">
            Edit Profile
          </button>
          <button @click="loadProfileData" class="btn-refresh">
            Refresh
          </button>
          <button @click="handleLogout" class="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div class="profile-content-spacer"></div>

      <!-- Profile details -->
      <div class="profile-details">
        <!-- Bio -->
        <div class="bio card">
          <h2>About Me</h2>
          <p class="bio-content">{{ profile.bio || "No bio provided" }}</p>
        </div>

        <!-- Contact -->
        <div class="contact-info card">
          <h2>Contact Information</h2>
          <div class="contact-grid">
            <div class="contact-item">
              <span class="contact-label">Email:</span>
              <span class="contact-value">{{ auth.user.email }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Phone:</span>
              <span class="contact-value">{{ profile.phone || "Not provided" }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">LinkedIn:</span>
              <span class="contact-value">{{ profile.linkedin || "Not provided" }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">GitHub:</span>
              <span class="contact-value">{{ profile.github || "Not provided" }}</span>
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div class="skills-section card">
          <h2>Skills</h2>
          <div class="skills-grid" v-if="profile.skills && profile.skills.length > 0">
            <span class="skill-tag" v-for="skill in profile.skills" :key="skill">
              {{ skill }}
            </span>
          </div>
          <p v-else class="no-data">No skills added</p>
        </div>

        <!-- Experience -->
        <div class="experience-section card">
          <h2>Professional Experience</h2>
          <div v-if="profile.experiences && profile.experiences.length > 0">
            <div
              v-for="(experience, index) in profile.experiences"
              :key="index"
              class="experience-item"
            >
              <h3>{{ experience.position }} at {{ experience.company }}</h3>
              <p class="experience-duration">{{ experience.duration }}</p>
              <p class="experience-description">{{ experience.description }}</p>
            </div>
          </div>
          <p v-else class="no-data">No experience added</p>
        </div>

        <!-- Education -->
        <div class="education-section card">
          <h2>Education</h2>
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
          <p v-else class="no-data">No education added</p>
        </div>

        <!-- Activities -->
        <div class="activity-section card">
          <h2>Activities</h2>
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
          <p v-else class="no-data">No activities added</p>
        </div>
      </div>
    </div>
    <div v-else class="not-connected">
      <p>Please log in to view your profile</p>
    </div>
  </div>
</template>

