<template>
  <div class="add-job">
    <h2>Post a new job</h2>

    <!-- FORM JOB -->
    <form @submit.prevent="submitJob" class="job-form">
      <!-- Job Basic Info -->
      <div class="form-section">
        <label>Job title *</label>
        <input v-model="form.name" required />
      </div>

      <div class="form-section">
        <label>Position *</label>
        <input v-model="form.position" required placeholder="e.g., Full-Stack Developer" />
      </div>

      <div class="form-section">
        <label>Company name *</label>
        <input v-model="form.company_name" required />
      </div>

      <div class="form-section">
        <label>Location</label>
        <input v-model="form.location" placeholder="City, Country" />
      </div>

      <div class="form-section">
        <label>Contract type</label>
        <select v-model="form.contract_type">
          <option value="">-- select --</option>
          <option value="Permanent">CDI</option>
          <option value="Fixed-term">CDD</option>
          <option value="Internship">Internship</option>
          <option value="Apprenticeship">Alternance</option>
          <option value="Freelance">Freelance</option>
          <option value="Training">Formation</option>
        </select>
      </div>

      <div class="form-section">
        <label>Level</label>
        <select v-model="form.level">
          <option value="">-- select --</option>
          <option value="Junior">Junior</option>
          <option value="Mid-level">Intermédiaire</option>
          <option value="Senior">Senior</option>
          <option value="Expert">Expert</option>
          <option value="Starter">Starter</option>
        </select>
      </div>

      <div class="form-section">
        <label>Working time</label>
        <select v-model="form.time_type">
          <option value="">-- select --</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
        </select>
      </div>

      <div class="form-section">
        <label>Work mode</label>
        <select v-model="form.work_mode">
          <option value="">-- select --</option>
          <option value="On-site">Présentiel</option>
          <option value="Hybrid">Hybride</option>
          <option value="Remote">Télétravail</option>
        </select>
      </div>

      <div class="form-section">
        <label>Field / domain</label>
        <select v-model="form.field">
          <option value="">-- select --</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Data / AI">Data / AI</option>
          <option value="Marketing">Marketing</option>
          <option value="Finance">Finance</option>
          <option value="HR">HR</option>
          <option value="Design">Design</option>
          <option value="Industry">Industry</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Cloud Computing">Cloud Computing</option>
          <option value="Cybersecurity">Cybersecurity</option>
        </select>
      </div>

      <div class="form-section">
        <label>Salary range</label>
        <input v-model="form.salary_range" placeholder="e.g., 30-40k" />
      </div>

      <div class="form-section">
        <label>Job description *</label>
        <textarea
          v-model="form.description"
          rows="5"
          placeholder="Describe the role, responsibilities, stack, missions..."
          required
        ></textarea>
      </div>

      <div class="form-section">
        <label>Requirements</label>
        <textarea
          v-model="form.requirements"
          rows="3"
          placeholder="Required skills, experience, education..."
        ></textarea>
      </div>

      <div class="form-section">
        <label>Benefits</label>
        <textarea
          v-model="form.benefits"
          rows="3"
          placeholder="Company benefits, perks, etc..."
        ></textarea>
      </div>

      <!-- Hiring Preferences -->
      <div class="form-section hiring-preferences">
        <h3>Hiring Preferences</h3>

        <label>Types of Roles You Hire For</label>
        <div class="preferences-grid">
          <div
            v-for="role in roleTypes"
            :key="role.value"
            class="preference-item"
          >
            <input
              type="checkbox"
              :id="'role-' + role.value"
              :value="role.value"
              v-model="form.hiring_roles"
            />
            <label :for="'role-' + role.value">{{ role.label }}</label>
          </div>
        </div>

        <label>Technologies/Skills You Look For</label>
        <div class="skill-input">
          <input
            v-model="newSkill"
            placeholder="Add a technology or skill"
            @keyup.enter="addSkill"
          />
          <button type="button" @click="addSkill">+</button>
        </div>
        <ul class="skill-list">
          <li v-for="(skill, index) in form.skills" :key="index">
            {{ skill }}
            <span class="remove" @click="removeSkill(index)">×</span>
          </li>
        </ul>

        <label>Hiring Process Description</label>
        <textarea
          v-model="form.hiring_process"
          rows="3"
          placeholder="Describe your typical hiring process..."
        ></textarea>
      </div>

      <!-- Company Benefits -->
      <div class="form-section company-benefits">
        <h3>Company Benefits</h3>
        <div class="benefits-grid">
          <div
            v-for="benefit in benefitTypes"
            :key="benefit.value"
            class="benefit-item"
          >
            <input
              type="checkbox"
              :id="'benefit-' + benefit.value"
              :value="benefit.value"
              v-model="form.company_benefits"
            />
            <label :for="'benefit-' + benefit.value">{{ benefit.label }}</label>
          </div>
        </div>

        <label>Additional Benefits</label>
        <textarea
          v-model="form.additional_benefits"
          rows="2"
          placeholder="List any other benefits your company offers..."
        ></textarea>
      </div>

      <!-- Messages + submit button -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
      
      <div v-if="success" class="success-message">
        <p>Job created successfully!</p>
      </div>

      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? "Saving..." : "Post job" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../stores/auth"
import api from "../services/api"

const auth = useAuthStore()
const router = useRouter()

// Form data matching the backend expectations
const form = reactive({
  name: "",
  position: "",
  company_name: "",
  location: "",
  description: "",
  contract_type: "",
  level: "",
  time_type: "",
  work_mode: "",
  field: "",
  salary_range: "",
  requirements: "",
  benefits: "",
  hiring_roles: [],
  skills: [],
  hiring_process: "",
  company_benefits: [],
  additional_benefits: ""
})

// Skill input
const newSkill = ref("")

// Role types for hiring preferences
const roleTypes = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "product", label: "Product Management" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Customer Support" },
  { value: "operations", label: "Operations" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "Human Resources" },
]

// Benefit types
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
  { value: "bonuses", label: "Performance Bonuses" },
]

// Skill management functions
function addSkill() {
  if (!newSkill.value.trim()) return
  if (!form.skills.includes(newSkill.value.trim())) {
    form.skills.push(newSkill.value.trim())
  }
  newSkill.value = ""
}

function removeSkill(index) {
  form.skills.splice(index, 1)
}

// Form state
const loading = ref(false)
const error = ref("")
const success = ref(false)

async function submitJob() {
  try {
    loading.value = true
    error.value = ""
    success.value = false

    // Validate user
    if (!auth.user || !auth.user.email) {
      throw new Error("You must be logged in as a recruiter to post a job.")
    }

    if (auth.user.account_type !== 'recruiter') {
      throw new Error("Only recruiters can post jobs.")
    }

    // Basic validation
    if (!form.name.trim()) {
      throw new Error("Job title is required")
    }
    if (!form.company_name.trim()) {
      throw new Error("Company name is required")
    }
    if (!form.description.trim()) {
      throw new Error("Job description is required")
    }

    // Prepare payload - ensure arrays are properly formatted
    const payload = {
      email: auth.user.email,
      name: form.name,
      position: form.position || form.name,
      company_name: form.company_name,
      location: form.location || "",
      description: form.description,
      contract_type: form.contract_type || "",
      level: form.level || "",
      time_type: form.time_type || "",
      work_mode: form.work_mode || "",
      field: form.field || "",
      salary_range: form.salary_range || "",
      requirements: form.requirements || "",
      benefits: form.benefits || "",
      hiring_roles: Array.isArray(form.hiring_roles) ? form.hiring_roles : [],
      skills: Array.isArray(form.skills) ? form.skills : [],
      hiring_process: form.hiring_process || "",
      company_benefits: Array.isArray(form.company_benefits) ? form.company_benefits : [],
      additional_benefits: form.additional_benefits || ""
    }

    console.log("Sending job data:", payload)

    const res = await api.post("/jobs", payload)

    console.log("Job created:", res.data)
    success.value = true
    error.value = ""

    // Reset form after delay
    setTimeout(() => {
      // Reset all form fields
      Object.keys(form).forEach(key => {
        if (Array.isArray(form[key])) {
          form[key] = []
        } else {
          form[key] = ""
        }
      })
      newSkill.value = ""
      
      // Redirect to job search
      router.push("/jobsearch")
    }, 1500)

  } catch (e) {
    console.error("Error creating job:", e)
    console.error("Full error:", e.response?.data)
    
    // Better error messages
    if (e.response?.data?.details) {
      error.value = `Database error: ${e.response.data.details}`
    } else if (e.response?.data?.message) {
      error.value = e.response.data.message
    } else if (e.response?.data?.error) {
      error.value = e.response.data.error
    } else {
      error.value = e.message || "Error while creating job"
    }
    
    success.value = false
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.add-job {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.job-form {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-section label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}

.form-section input,
.form-section select,
.form-section textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-section input:focus,
.form-section select:focus,
.form-section textarea:focus {
  outline: none;
  border-color: #754f44;
  box-shadow: 0 0 0 3px rgba(117, 79, 68, 0.1);
}

/* Hiring Preferences Styles */
.hiring-preferences,
.company-benefits {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1rem;
}

.hiring-preferences h3,
.company-benefits h3 {
  margin-top: 0;
  color: #754f44;
  border-bottom: 2px solid #e9d7d2;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.preferences-grid,
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 1rem;
}

.preference-item,
.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preference-item input[type="checkbox"],
.benefit-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 0;
}

.preference-item label,
.benefit-item label {
  font-weight: normal;
  cursor: pointer;
}

/* Skills input */
.skill-input {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.skill-input input {
  flex: 1;
}

.skill-input button {
  padding: 0 15px;
  background: #754f44;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
}

.skill-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-list li {
  background: #e9d7d2;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-list li .remove {
  cursor: pointer;
  color: #754f44;
  font-weight: bold;
  font-size: 1.2rem;
}

/* Submit button */
.submit-btn {
  padding: 14px 28px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  background: #754f44;
  color: white;
  transition: background-color 0.2s, transform 0.1s;
  width: 100%;
  margin-top: 2rem;
}

.submit-btn:hover:not(:disabled) {
  background: #5a3c34;
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* Messages */
.error-message {
  color: #b91c1c;
  margin: 1rem 0;
  padding: 12px;
  background-color: #fee2e2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.success-message {
  color: #15803d;
  margin: 1rem 0;
  padding: 12px;
  background-color: #dcfce7;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
}

h2 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
}

h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

textarea {
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}
</style>