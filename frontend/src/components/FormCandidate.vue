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
        <button @click="removeImage" class="remove-image-btn">Remove Image</button>
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
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const auth = useAuthStore();

// Personal Information - Pre-fill with existing data
const first_name = ref("");
const last_name = ref("");
const bio = ref("");
const phone = ref("");
const linkedin = ref("");
const github = ref("");
const profile_picture = ref("");

// Skills
const skills = ref([]);
const newSkill = ref("");

// Experience
const experiences = ref([]);

// Education
const education = ref([]);

// Activities
const activities = ref([]);

// Load existing profile data when component mounts
onMounted(() => {
  if (auth.user?.profile) {
    loadExistingProfileData();
  }
});

// Function to load existing profile data
const loadExistingProfileData = () => {
  const profile = auth.user.profile;
  
  first_name.value = profile.first_name || "";
  last_name.value = profile.last_name || "";
  bio.value = profile.bio || "";
  phone.value = profile.phone || "";
  linkedin.value = profile.linkedin || "";
  github.value = profile.github || "";
  profile_picture.value = profile.profile_picture || "";
  skills.value = profile.skills || [];
  experiences.value = profile.experiences || [];
  education.value = profile.educations || [];
  activities.value = profile.activities || [];
};

function addSkill() {
  if (newSkill.value.trim() !== "") {
    skills.value.push(newSkill.value.trim());
    newSkill.value = "";
  }
}

function removeSkill(index) {
  skills.value.splice(index, 1);
}

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

// Remove image
function removeImage() {
  profile_picture.value = "";
}

// Image compression function
function compressImage(file, maxWidth = 400, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw compressed image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with reduced quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Image handling with compression
async function handleImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  console.log("Selected image:", file);
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }
  
  // Reduce max size to 500KB
  if (file.size > 500 * 1024) {
    alert('Image size should be less than 500KB. Compressing...');
  }
  
  try {
    // Compress image
    const compressedImage = await compressImage(file);
    console.log("Image compressed:", compressedImage);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      profile_picture.value = e.target.result;
      console.log("Image converted to base64, size:", e.target.result.length, "bytes");
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      alert('Error reading image file');
    };
    reader.readAsDataURL(compressedImage);
  } catch (error) {
    console.error('Error processing image:', error);
    alert('Error processing image');
  }
}

// Submit with size validation
async function submitProfile() {
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
    skills: skills.value,
    experiences: experiences.value,
    educations: education.value,
    activities: activities.value,
    email: auth.user.email,
  };

  // Check image size before sending
  if (profile_picture.value) {
    const base64Size = profile_picture.value.length;
    console.log("Final image size:", base64Size, "bytes");
    
    // If image exceeds 300KB, don't send it
    if (base64Size > 300 * 1024) {
      alert('Image too large after compression. Please use a smaller image or remove it.');
      return;
    }
    
    payload.profile_picture = profile_picture.value;
  }

  console.log("PROFILE DATA TO SEND:", {
    hasImage: !!payload.profile_picture,
    imageSize: payload.profile_picture ? payload.profile_picture.length : 0,
    totalSkills: payload.skills.length,
    totalExperiences: payload.experiences.length,
    totalEducations: payload.educations.length,
    totalActivities: payload.activities.length
  });

  try {
    await auth.setProfile(payload);
    console.log("Profile saved successfully, redirecting...");
    router.push("/profil-c");
  } catch (error) {
    console.error("Error saving profile:", error);
    
    if (error.message.includes('413')) {
      alert('The data is too large. Please try with a smaller profile picture or remove some content.');
    } else {
      alert("Error saving profile: " + error.message);
    }
  }
}
</script>
