<template>
  <div class="form-container">
    <h1>Complete Your Candidate Profile</h1>

    <!-- Personal Information -->
    <div class="form-section">
      <label>First Name *</label>
      <input type="text" v-model="first_name" placeholder="Enter your first name" required />
      
      <label>Last Name *</label>
      <input type="text" v-model="last_name" placeholder="Enter your last name" required />
    </div>

    <!-- Photo -->
    <div class="form-section">
      <label>Profile Picture</label>
      <input type="file" accept="image/*" @change="handleImage" />
      <!-- Image preview -->
      <div v-if="profile_picture" class="image-preview">
        <img :src="profile_picture" alt="Profile preview" class="preview-image" />
      </div>
    </div>

    <!-- Bio -->
    <div class="form-section">
      <label>Bio *</label>
      <textarea v-model="bio" placeholder="Tell us about yourself..." required></textarea>
    </div>

    <!-- Contact -->
    <div class="form-section">
      <label>Email</label>
      <input type="email" :value="auth.user.email" disabled />
      
      <label>Phone Number</label>
      <input type="text" v-model="phone" placeholder="06..." />

      <label>LinkedIn</label>
      <input type="text" v-model="linkedin" placeholder="https://linkedin.com/in/yourprofile" />

      <label>GitHub</label>
      <input type="text" v-model="github" placeholder="https://github.com/yourusername" />
    </div>

    <!-- Skills -->
    <div class="form-section">
      <label>Skills</label>

      <div class="skill-input">
        <input v-model="newSkill" placeholder="Add a skill" @keyup.enter="addSkill" />
        <button @click="addSkill">+</button>
      </div>

      <ul class="skill-list">
        <li v-for="(skill, index) in skills" :key="index">
          {{ skill }}
          <span class="remove" @click="removeSkill(index)">×</span>
        </li>
      </ul>
    </div>

    <!-- Experience -->
    <div class="form-section">
      <label>Experience</label>

      <div
        class="experience-item"
        v-for="(exp, index) in experiences"
        :key="index"
      >
        <input v-model="exp.position" placeholder="Position" />
        <input v-model="exp.company" placeholder="Company" />
        <input v-model="exp.duration" placeholder="Duration (e.g., 2020-2022)" />
        <textarea v-model="exp.description" placeholder="Description of your responsibilities and achievements"></textarea>
        <button @click="removeExperience(index)">Delete</button>
      </div>

      <button @click="addExperience" class="add-btn">Add Experience</button>
    </div>

    <!-- Education -->
    <div class="form-section">
      <label>Education</label>

      <div
        class="education-item"
        v-for="(edu, index) in education"
        :key="index"
      >
        <input v-model="edu.degree" placeholder="Degree (e.g., Bachelor of Science)" />
        <input v-model="edu.institution" placeholder="School / University" />
        <input v-model="edu.duration" placeholder="Duration (e.g., 2016-2020)" />
        <textarea v-model="edu.description" placeholder="Description of your studies, achievements"></textarea>
        <button @click="removeEducation(index)">Delete</button>
      </div>

      <button @click="addEducation" class="add-btn">Add Education</button>
    </div>

    <!-- Activities -->
    <div class="form-section">
      <label>Activities</label>

      <div
        class="activity-item"
        v-for="(act, index) in activities"
        :key="index"
      >
        <input v-model="act.name" placeholder="Activity Name" />
        <input v-model="act.duration" placeholder="Duration" />
        <textarea v-model="act.description" placeholder="Description of your involvement"></textarea>
        <button @click="removeActivity(index)">Delete</button>
      </div>

      <button @click="addActivity" class="add-btn">Add Activity</button>
    </div>

    <button class="submit-btn" @click="submitProfile">Save Profile</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const auth = useAuthStore();

// Personal Information (Required)
const first_name = ref(auth.user?.first_name || "");
const last_name = ref(auth.user?.last_name || "");

// Simple fields
const bio = ref("");
const phone = ref("");
const linkedin = ref("");
const github = ref("");
const profile_picture = ref("");

// Skills
const skills = ref([]);
const newSkill = ref("");

function addSkill() {
  if (newSkill.value.trim() !== "") {
    skills.value.push(newSkill.value.trim());
    newSkill.value = "";
  }
}

function removeSkill(index) {
  skills.value.splice(index, 1);
}

// Experience
const experiences = ref([]);

function addExperience() {
  experiences.value.push({ 
    position: "", 
    company: "", 
    duration: "", 
    description: "" 
  });
}

function removeExperience(index) {
  experiences.value.splice(index, 1);
}

// Education
const education = ref([]);

function addEducation() {
  education.value.push({ 
    degree: "", 
    institution: "", 
    duration: "", 
    description: "" 
  });
}

function removeEducation(index) {
  education.value.splice(index, 1);
}

// Activities
const activities = ref([]);

function addActivity() {
  activities.value.push({ 
    name: "", 
    duration: "", 
    description: "" 
  });
}

function removeActivity(index) {
  activities.value.splice(index, 1);
}

// Image handling
async function handleImage(event) {
  const file = event.target.files[0];
  if (file) {
    console.log("Selected image:", file);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }
    
    // Convert file to base64 for storage
    const reader = new FileReader();
    reader.onload = (e) => {
      profile_picture.value = e.target.result;
      console.log("Image converted to base64");
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      alert('Error reading image file');
    };
    reader.readAsDataURL(file);
  }
}

// Submit
function submitProfile() {
  // Basic validation
  if (!first_name.value.trim()) {
    alert('Please enter your first name');
    return;
  }

  if (!last_name.value.trim()) {
    alert('Please enter your last name');
    return;
  }

  if (!bio.value.trim()) {
    alert('Please add a bio');
    return;
  }

  const payload = {
    first_name: first_name.value,
    last_name: last_name.value,
    bio: bio.value,
    phone: phone.value,
    linkedin: linkedin.value,
    github: github.value,
    profile_picture: profile_picture.value,
    skills: skills.value,
    experiences: experiences.value,
    educations: education.value,
    activities: activities.value,
    email: auth.user.email,
  };

  console.log("PROFILE DATA TO SEND:", payload);

  // Save to Pinia store
  auth.setProfile(payload);

  // Redirect to profile page
  router.push("/profil-c");
}
</script>