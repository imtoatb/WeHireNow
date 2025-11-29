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
            {{ profile.position || 'Position' }} at {{ profile.company_name || 'Company' }}
          </p>
          <p class="profile-company">
            Recruiter
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
          <button @click="handleAddJob" class="btn-addjob">
            Post a job
          </button>
          <button @click="handleLogout" class="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div class="profile-content-spacer"></div>

      <!-- Profile details -->
      <div class="profile-details">
        <!-- Personal Bio -->
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
              <span class="contact-label">Work Email:</span>
              <span class="contact-value">{{ profile.work_email || "Not provided" }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Phone:</span>
              <span class="contact-value">{{ profile.phone || "Not provided" }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">LinkedIn:</span>
              <span class="contact-value">{{ profile.linkedin || "Not provided" }}</span>
            </div>
          </div>
        </div>

        <!-- Company Information -->
        <div class="company-info card">
          <h2>Company Information</h2>
          <div class="company-grid">
            <div class="company-item">
              <span class="company-label">Company Name:</span>
              <span class="company-value">{{ profile.company_name || "Not provided" }}</span>
            </div>
            <div class="company-item">
              <span class="company-label">Website:</span>
              <span class="company-value">
                <a v-if="profile.company_website" :href="profile.company_website" target="_blank">
                  {{ profile.company_website }}
                </a>
                <span v-else>Not provided</span>
              </span>
            </div>
            <div class="company-item">
              <span class="company-label">Industry:</span>
              <span class="company-value">{{ profile.industry || "Not provided" }}</span>
            </div>
            <div class="company-item">
              <span class="company-label">Company Size:</span>
              <span class="company-value">{{ profile.company_size || "Not provided" }}</span>
            </div>
            <div class="company-item">
              <span class="company-label">Annual Revenue:</span>
              <span class="company-value">{{ profile.annual_revenue || "Not provided" }}</span>
            </div>
            <div class="company-item">
              <span class="company-label">Location:</span>
              <span class="company-value">{{ profile.company_location || "Not provided" }}</span>
            </div>
            <div class="company-item">
              <span class="company-label">Founded:</span>
              <span class="company-value">{{ profile.founded_year || "Not provided" }}</span>
            </div>
          </div>
          
          <div class="company-description">
            <h3>Company Description</h3>
            <p>{{ profile.company_description || "No company description provided" }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="not-connected">
      <p>Please log in to view your profile</p>
      <button @click="handleLogin" class="btn-login">Login</button>
    </div>
  </div>
</template>

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
  position: "",
  bio: "",
  phone: "",
  linkedin: "",
  work_email: "",
  profile_picture: "",
  company_name: "",
  company_website: "",
  industry: "",
  company_size: "",
  annual_revenue: "",
  company_description: "",
  company_location: "",
  founded_year: ""
});

// Load profile when component mounts
onMounted(() => {
  console.log('ProfilRecruiter mounted');
  loadProfileData();
});

// Watch for auth.user profile changes
watch(() => auth.user?.profile, (newProfile) => {
  if (newProfile) {
    console.log("Profile updated in store, refreshing display...");
    profile.value = { ...newProfile };
  }
}, { deep: true });

// Function to load profile data
const loadProfileData = async () => {
  if (auth.user) {
    console.log("Loading recruiter profile data...");
    
    // First load from database to get fresh data
    if (auth.loadProfileFromDB) {
      await auth.loadProfileFromDB();
    }
    
    // Then update display with current data
    if (auth.user?.profile) {
      profile.value = { ...auth.user.profile };
      console.log("Recruiter profile data loaded:", profile.value);
    } else {
      console.log("No recruiter profile data found");
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

// Login function
const handleLogin = () => {
  router.push('/login');
};

// Function to edit profile
const handleEditProfile = () => {
  router.push('/form-recruiter');
};

const getInitials = (fullName) => {
  if (!fullName.trim()) return "R";
  return fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
</script>