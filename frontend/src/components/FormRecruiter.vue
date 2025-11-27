<template>
  <div class="form-container">
    <h1>Complete Your Recruiter Profile</h1>

    <!-- Personal Information -->
    <div class="form-section">
      <label>First Name *</label>
      <input type="text" v-model="formData.first_name" placeholder="Enter your first name" required />
      
      <label>Last Name *</label>
      <input type="text" v-model="formData.last_name" placeholder="Enter your last name" required />
      
      <label>Position in Company *</label>
      <input type="text" v-model="formData.position" placeholder="e.g., HR Manager, Talent Acquisition" required />
    </div>

    <!-- Photo -->
    <div class="form-section">
      <label>Profile Picture</label>
      <input type="file" accept="image/*" @change="handleImage" />
      <!-- Image preview -->
      <div v-if="formData.profile_picture" class="image-preview">
        <img :src="formData.profile_picture" alt="Profile preview" class="preview-image" />
        <button @click="removeImage" class="remove-image-btn">Remove Image</button>
      </div>
    </div>

    <!-- Personal Bio -->
    <div class="form-section">
      <label>Professional Bio *</label>
      <textarea v-model="formData.bio" placeholder="Tell us about your professional background..." required></textarea>
    </div>

    <!-- Contact -->
    <div class="form-section">
      <label>Email</label>
      <input type="email" :value="auth.user.email" disabled />
      
      <label>Phone Number *</label>
      <input type="text" v-model="formData.phone" placeholder="06..." required />

      <label>LinkedIn</label>
      <input type="text" v-model="formData.linkedin" placeholder="https://linkedin.com/in/yourprofile" />

      <label>Work Email</label>
      <input type="email" v-model="formData.work_email" placeholder="your.email@company.com" />
    </div>

    <!-- Company Information -->
    <div class="form-section company-section">
      <h2>Company Information</h2>
      
      <label>Company Name *</label>
      <input type="text" v-model="formData.company_name" placeholder="Enter company name" required />

      <label>Company Website</label>
      <input type="text" v-model="formData.company_website" placeholder="https://company.com" />

      <label>Industry/Sector *</label>
      <select v-model="formData.industry" required>
        <option value="">Select Industry</option>
        <option value="technology">Technology</option>
        <option value="healthcare">Healthcare</option>
        <option value="finance">Finance</option>
        <option value="education">Education</option>
        <option value="manufacturing">Manufacturing</option>
        <option value="retail">Retail</option>
        <option value="hospitality">Hospitality</option>
        <option value="other">Other</option>
      </select>

      <label>Company Size *</label>
      <select v-model="formData.company_size" required>
        <option value="">Select Company Size</option>
        <option value="1-10">1-10 employees</option>
        <option value="11-50">11-50 employees</option>
        <option value="51-200">51-200 employees</option>
        <option value="201-500">201-500 employees</option>
        <option value="501-1000">501-1000 employees</option>
        <option value="1000+">1000+ employees</option>
      </select>

      <label>Annual Revenue</label>
      <select v-model="formData.annual_revenue">
        <option value="">Select Revenue Range</option>
        <option value="0-1M">0 - €1M</option>
        <option value="1M-5M">€1M - €5M</option>
        <option value="5M-20M">€5M - €20M</option>
        <option value="20M-100M">€20M - €100M</option>
        <option value="100M+">€100M+</option>
      </select>

      <label>Company Description *</label>
      <textarea v-model="formData.company_description" placeholder="Describe your company, mission, values..." required></textarea>

      <label>Company Headquarters</label>
      <input type="text" v-model="formData.company_location" placeholder="City, Country" />

      <label>Founded Year</label>
      <input type="number" v-model="formData.founded_year" placeholder="e.g., 2010" min="1900" :max="new Date().getFullYear()" />
    </div>

    <!-- Hiring Preferences -->
    <div class="form-section">
      <h2>Hiring Preferences</h2>
      
      <label>Types of Roles You Hire For</label>
      <div class="preferences-grid">
        <div v-for="role in roleTypes" :key="role.value" class="preference-item">
          <input type="checkbox" :id="role.value" :value="role.value" v-model="formData.hiring_roles" />
          <label :for="role.value">{{ role.label }}</label>
        </div>
      </div>

      <label>Technologies/Skills You Look For</label>
      <div class="skill-input">
        <input v-model="newSkill" placeholder="Add a technology or skill" @keyup.enter="addSkill" />
        <button @click="addSkill">+</button>
      </div>
      <ul class="skill-list">
        <li v-for="(skill, index) in formData.skills" :key="index">
          {{ skill }}
          <span class="remove" @click="removeSkill(index)">×</span>
        </li>
      </ul>

      <label>Hiring Process Description</label>
      <textarea v-model="formData.hiring_process" placeholder="Describe your typical hiring process..."></textarea>
    </div>

    <!-- Company Benefits -->
    <div class="form-section">
      <h2>Company Benefits</h2>
      <div class="benefits-grid">
        <div v-for="benefit in benefitTypes" :key="benefit.value" class="benefit-item">
          <input type="checkbox" :id="benefit.value" :value="benefit.value" v-model="formData.company_benefits" />
          <label :for="benefit.value">{{ benefit.label }}</label>
        </div>
      </div>
      
      <label>Additional Benefits</label>
      <textarea v-model="formData.additional_benefits" placeholder="List any other benefits your company offers..."></textarea>
    </div>

    <button class="submit-btn" @click="submitProfile" :disabled="saving">
      {{ saving ? 'Saving...' : 'Save Profile' }}
    </button>

    <!-- Debug info -->
    <div v-if="debug" style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
      <h3>Debug Info:</h3>
      <p>User: {{ auth.user ? auth.user.email : 'No user' }}</p>
      <p>Profile exists: {{ !!auth.user?.profile }}</p>
      <p>Saving state: {{ saving }}</p>
      <p>First Name: {{ formData.first_name }}</p>
      <p>Company: {{ formData.company_name }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const auth = useAuthStore();
const saving = ref(false);
const debug = ref(true); // Mettre à false en production
const newSkill = ref("");

// Utiliser reactive pour grouper toutes les données du formulaire
const formData = reactive({
  // Personal Information
  first_name: "",
  last_name: "",
  position: "",
  bio: "",
  phone: "",
  linkedin: "",
  work_email: "",
  profile_picture: "",
  
  // Company Information
  company_name: "",
  company_website: "",
  industry: "",
  company_size: "",
  annual_revenue: "",
  company_description: "",
  company_location: "",
  founded_year: "",
  
  // Hiring Preferences
  hiring_roles: [],
  skills: [],
  hiring_process: "",
  
  // Company Benefits
  company_benefits: [],
  additional_benefits: ""
});

// Constants for options
const roleTypes = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "product", label: "Product Management" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Customer Support" },
  { value: "operations", label: "Operations" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "Human Resources" }
];

const benefitTypes = [
  { value: "health_insurance", label: "Health Insurance" },
  { value: "dental_insurance", label: "Dental Insurance" },
  { value: "vision_insurance", label: "Vision Insurance" },
  { value: "retirement_plan", label: "Retirement Plan" },
  { value: "flexible_hours", label: "Flexible Hours" },
  { value: "remote_work", label: "Remote Work" },
  { value: "paid_timeoff", label: "Paid Time Off" },
  { value: "parental_leave", label: "Parental Leave" },
  { value: "professional_development", label: "Professional Development" },
  { value: "wellness_program", label: "Wellness Program" },
  { value: "stock_options", label: "Stock Options" },
  { value: "bonuses", label: "Performance Bonuses" }
];

// Load existing profile data when component mounts
onMounted(() => {
  console.log('FormRecruiter mounted, user:', auth.user);
  if (auth.user?.profile) {
    console.log('Loading existing profile data');
    loadExistingProfileData();
  } else {
    console.log('No existing profile found');
  }
});

// Function to load existing profile data
const loadExistingProfileData = () => {
  const profile = auth.user.profile;
  
  console.log('Loading profile data:', profile);
  
  // Mettre à jour formData avec les données existantes
  Object.keys(formData).forEach(key => {
    if (profile[key] !== undefined) {
      formData[key] = profile[key];
    }
  });
};

function addSkill() {
  if (newSkill.value.trim() !== "") {
    formData.skills.push(newSkill.value.trim());
    newSkill.value = "";
  }
}

function removeSkill(index) {
  formData.skills.splice(index, 1);
}

// Remove image
function removeImage() {
  formData.profile_picture = "";
}

// Image compression function
function compressImage(file, maxWidth = 400, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
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
  
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }
  
  if (file.size > 500 * 1024) {
    alert('Image size should be less than 500KB. Compressing...');
  }
  
  try {
    const compressedImage = await compressImage(file);
    console.log("Image compressed:", compressedImage);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      formData.profile_picture = e.target.result;
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
  if (saving.value) return;

  console.log('Starting profile submission...');
  console.log('Form data:', formData);

  // Basic validation
  if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.position.trim()) {
    alert('Please fill all required personal information fields');
    return;
  }

  if (!formData.bio.trim()) {
    alert('Please add a professional bio');
    return;
  }

  if (!formData.company_name.trim() || !formData.industry || !formData.company_size || !formData.company_description.trim()) {
    alert('Please fill all required company information fields');
    return;
  }

  saving.value = true;

  try {
    // Créer une copie des données pour l'envoi
    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      position: formData.position,
      bio: formData.bio,
      phone: formData.phone,
      linkedin: formData.linkedin,
      work_email: formData.work_email,
      company_name: formData.company_name,
      company_website: formData.company_website,
      industry: formData.industry,
      company_size: formData.company_size,
      annual_revenue: formData.annual_revenue,
      company_description: formData.company_description,
      company_location: formData.company_location,
      founded_year: formData.founded_year,
      hiring_roles: formData.hiring_roles,
      skills: formData.skills,
      hiring_process: formData.hiring_process,
      company_benefits: formData.company_benefits,
      additional_benefits: formData.additional_benefits,
      email: auth.user.email,
    };

    // Check image size before sending
    if (formData.profile_picture) {
      const base64Size = formData.profile_picture.length;
      console.log("Final image size:", base64Size, "bytes");
      
      if (base64Size > 300 * 1024) {
        alert('Image too large after compression. Please use a smaller image or remove it.');
        saving.value = false;
        return;
      }
      
      payload.profile_picture = formData.profile_picture;
    }

    console.log("RECRUITER PROFILE DATA TO SEND:", {
      company: payload.company_name,
      hasImage: !!payload.profile_picture,
      hiringRoles: payload.hiring_roles.length
    });

    // Appel à l'action setProfile
    console.log('Calling auth.setProfile...');
    await auth.setProfile(payload);
    
    console.log('Recruiter profile saved successfully in store');
    console.log('Current user profile after save:', auth.user?.profile);
    
    // Attendre un peu pour s'assurer que le store est mis à jour
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Redirecting to /profil-r...');
    
    // Redirection explicite vers le profil recruteur
    router.push("/profil-r");
    
  } catch (error) {
    console.error("Error saving recruiter profile:", error);
    
    if (error.message.includes('413')) {
      alert('The data is too large. Please try with a smaller profile picture or remove some content.');
    } else {
      alert("Error saving profile: " + error.message);
    }
  } finally {
    saving.value = false;
  }
}
</script>
