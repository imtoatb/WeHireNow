<template>
  <div class="form-container">
    <h1>Complete Your Candidate Profile</h1>

    <!-- Error and Success Messages -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="success" class="success-message">
      Profile saved successfully! Redirecting...
    </div>

    <!-- Personal Information -->
    <div class="form-section">
      <label>First Name *</label>
      <input type="text" v-model="profile.first_name" placeholder="Enter your first name" required />
      
      <label>Last Name *</label>
      <input type="text" v-model="profile.last_name" placeholder="Enter your last name" required />
    </div>

    <!-- Photo -->
    <div class="form-section">
      <label>Profile Picture</label>
      <input type="file" accept="image/*" @change="handleImage" />
      <!-- Image preview -->
      <div v-if="profile.profile_picture" class="image-preview">
        <img :src="profile.profile_picture" alt="Profile preview" class="preview-image" />
        <button @click="removeImage" class="remove-image-btn">Remove Image</button>
      </div>
    </div>

    <!-- Bio -->
    <div class="form-section">
      <label>Bio *</label>
      <textarea v-model="profile.bio" placeholder="Tell us about yourself..." required></textarea>
    </div>

    <!-- Contact -->
    <div class="form-section">
      <label>Email</label>
      <input type="email" :value="auth.user.email" disabled />
      
      <label>Phone Number</label>
      <input type="text" v-model="profile.phone" placeholder="06..." />

      <label>LinkedIn</label>
      <input type="text" v-model="profile.linkedin" placeholder="https://linkedin.com/in/yourprofile" />

      <label>GitHub</label>
      <input type="text" v-model="profile.github" placeholder="https://github.com/yourusername" />
    </div>

    <!-- Skills -->
    <div class="form-section">
      <label>Skills</label>

      <div class="skill-input">
        <input v-model="newSkill" placeholder="Add a skill" @keyup.enter="addSkill" />
        <button @click="addSkill">+</button>
      </div>

      <ul class="skill-list">
        <li v-for="(skill, index) in profile.skills" :key="index">
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
        v-for="(exp, index) in profile.experiences"
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
        v-for="(edu, index) in profile.educations"
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
        v-for="(act, index) in profile.activities"
        :key="index"
      >
        <input v-model="act.name" placeholder="Activity Name" />
        <input v-model="act.duration" placeholder="Duration" />
        <textarea v-model="act.description" placeholder="Description of your involvement"></textarea>
        <button @click="removeActivity(index)">Delete</button>
      </div>

      <button @click="addActivity" class="add-btn">Add Activity</button>
    </div>

    <button class="submit-btn" @click="submitProfile" :disabled="loading">
      {{ loading ? "Saving..." : "Save Profile" }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const auth = useAuthStore();

// Use reactive profile object
const profile = reactive({
  first_name: "",
  last_name: "",
  bio: "",
  phone: "",
  linkedin: "",
  github: "",
  profile_picture: "",
  skills: [],
  experiences: [],
  educations: [],
  activities: []
});

// Skills
const newSkill = ref("");

// Form state
const loading = ref(false);
const error = ref("");
const success = ref(false);

// Load existing profile data when component mounts
onMounted(() => {
  if (auth.user?.profile) {
    loadExistingProfileData();
  }
});

// Function to load existing profile data
const loadExistingProfileData = () => {
  const existingProfile = auth.user.profile;
  
  console.log("Loading existing profile data:", existingProfile);
  
  profile.first_name = existingProfile.first_name || "";
  profile.last_name = existingProfile.last_name || "";
  profile.bio = existingProfile.bio || "";
  profile.phone = existingProfile.phone || "";
  profile.linkedin = existingProfile.linkedin || "";
  profile.github = existingProfile.github || "";
  profile.profile_picture = existingProfile.profile_picture || "";
  
  // Ensure skills is an array
  if (Array.isArray(existingProfile.skills)) {
    profile.skills = [...existingProfile.skills];
  } else if (existingProfile.skills) {
    profile.skills = [existingProfile.skills];
  } else {
    profile.skills = [];
  }
  
  // Ensure experiences is an array
  if (Array.isArray(existingProfile.experiences)) {
    profile.experiences = existingProfile.experiences.map(exp => ({
      position: exp.position || "",
      company: exp.company || "",
      duration: exp.duration || "",
      description: exp.description || ""
    }));
  } else if (existingProfile.experiences) {
    profile.experiences = [existingProfile.experiences];
  } else {
    profile.experiences = [];
  }
  
  // Ensure educations is an array
  if (Array.isArray(existingProfile.educations)) {
    profile.educations = existingProfile.educations.map(edu => ({
      degree: edu.degree || "",
      institution: edu.institution || "",
      duration: edu.duration || "",
      description: edu.description || ""
    }));
  } else if (existingProfile.educations) {
    profile.educations = [existingProfile.educations];
  } else {
    profile.educations = [];
  }
  
  // Ensure activities is an array
  if (Array.isArray(existingProfile.activities)) {
    profile.activities = existingProfile.activities.map(act => ({
      name: act.name || "",
      duration: act.duration || "",
      description: act.description || ""
    }));
  } else if (existingProfile.activities) {
    profile.activities = [existingProfile.activities];
  } else {
    profile.activities = [];
  }
  
  console.log("Loaded profile data:", {
    skillsCount: profile.skills.length,
    experiencesCount: profile.experiences.length,
    educationsCount: profile.educations.length,
    activitiesCount: profile.activities.length
  });
};

function addSkill() {
  if (newSkill.value.trim() !== "") {
    profile.skills.push(newSkill.value.trim());
    newSkill.value = "";
  }
}

function removeSkill(index) {
  profile.skills.splice(index, 1);
}

function addExperience() {
  profile.experiences.push({ 
    position: "", 
    company: "", 
    duration: "", 
    description: "" 
  });
}

function removeExperience(index) {
  profile.experiences.splice(index, 1);
}

function addEducation() {
  profile.educations.push({ 
    degree: "", 
    institution: "", 
    duration: "", 
    description: "" 
  });
}

function removeEducation(index) {
  profile.educations.splice(index, 1);
}

function addActivity() {
  profile.activities.push({ 
    name: "", 
    duration: "", 
    description: "" 
  });
}

function removeActivity(index) {
  profile.activities.splice(index, 1);
}

// Remove image
function removeImage() {
  profile.profile_picture = "";
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
      profile.profile_picture = e.target.result;
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

// Validation function
function validateProfileData(data) {
  const errors = [];
  
  if (!data.first_name?.trim()) errors.push("First name is required");
  if (!data.last_name?.trim()) errors.push("Last name is required");
  if (!data.bio?.trim()) errors.push("Bio is required");
  
  // Ensure arrays are properly formatted
  if (!Array.isArray(data.skills)) data.skills = [];
  if (!Array.isArray(data.experiences)) data.experiences = [];
  if (!Array.isArray(data.educations)) data.educations = [];
  if (!Array.isArray(data.activities)) data.activities = [];
  
  // Clean up array data
  data.skills = data.skills.filter(skill => skill && skill.trim() !== "");
  data.experiences = data.experiences.filter(exp => 
    exp.position || exp.company || exp.duration || exp.description
  );
  data.educations = data.educations.filter(edu => 
    edu.degree || edu.institution || edu.duration || edu.description
  );
  data.activities = data.activities.filter(act => 
    act.name || act.duration || act.description
  );
  
  // Limit array sizes
  if (data.skills.length > 50) {
    data.skills = data.skills.slice(0, 50);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    validatedData: data
  };
}

async function submitProfile() {
  try {
    loading.value = true;
    error.value = "";
    success.value = false;
    
    // Validate data
    const validation = validateProfileData({ ...profile });
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Prepare data for sending
    const dataToSend = {
      ...validation.validatedData,
      email: auth.user.email
    };
    
    console.log('PROFILE DATA TO SEND:', {
      firstName: dataToSend.first_name,
      lastName: dataToSend.last_name,
      skillsCount: dataToSend.skills.length,
      experiencesCount: dataToSend.experiences.length,
      educationsCount: dataToSend.educations.length,
      activitiesCount: dataToSend.activities.length,
      hasImage: !!dataToSend.profile_picture,
      imageSize: dataToSend.profile_picture ? dataToSend.profile_picture.length : 0
    });
    
    // Log sample data to verify
    if (dataToSend.experiences.length > 0) {
      console.log('Sample experience:', dataToSend.experiences[0]);
    }
    if (dataToSend.educations.length > 0) {
      console.log('Sample education:', dataToSend.educations[0]);
    }
    if (dataToSend.activities.length > 0) {
      console.log('Sample activity:', dataToSend.activities[0]);
    }
    
    // Save via store
    await auth.setProfile(dataToSend);
    
    // Success
    success.value = true;
    setTimeout(() => {
      router.push('/profil-c');
    }, 1500);
    
  } catch (e) {
    console.error('Error saving profile:', e);
    error.value = e.message || "Failed to save profile";
    success.value = false;
  } finally {
    loading.value = false;
  }
}
</script>

