<template>
  <div class="add-job">
    <h2>Post a new job</h2>

    <!-- FORM JOB -->
    <form @submit.prevent="submitJob" class="job-form">
      <div class="form-section">
        <label>Job title</label>
        <input v-model="form.name" required />
      </div>

      <div class="form-section">
        <label>Company</label>
        <input v-model="form.company" required />
      </div>

      <div class="form-section">
        <label>Location</label>
        <input v-model="form.localisation" placeholder="City, Country" />
      </div>

      <div class="form-section">
        <label>Contract type</label>
        <select v-model="form.contract_type">
          <option value="">-- select --</option>
          <option>CDI</option>
          <option>CDD</option>
          <option>Internship</option>
          <option>Alternance</option>
          <option>Freelance</option>
          <option>Formation</option>
        </select>
      </div>

      <div class="form-section">
        <label>Level</label>
        <select v-model="form.level">
          <option value="">-- select --</option>
          <option>Starter</option>
          <option>Junior</option>
          <option>Intermédiaire</option>
          <option>Senior</option>
          <option>Expert</option>
        </select>
      </div>

      <div class="form-section">
        <label>Working time</label>
        <select v-model="form.time_type">
          <option value="">-- select --</option>
          <option>Full-time</option>
          <option>Part-time</option>
        </select>
      </div>

      <div class="form-section">
        <label>Work mode</label>
        <select v-model="form.work_mode">
          <option value="">-- select --</option>
          <option>Présentiel</option>
          <option>Hybride</option>
          <option>Télétravail</option>
          <option>Nomade</option>
        </select>
      </div>

      <div class="form-section">
        <label>Field / domain</label>
        <select v-model="form.field">
          <option value="">-- select --</option>
          <option>Informatique</option>
          <option>Data / IA</option>
          <option>Marketing</option>
          <option>Finance</option>
          <option>RH</option>
          <option>Design</option>
          <option>Industrie</option>
        </select>
      </div>

      <div class="form-section">
        <label>Description</label>
        <textarea
          v-model="form.description"
          rows="5"
          placeholder="Describe the role, stack, missions..."
        ></textarea>
      </div>

      <!-- Hiring Preferences -->
      <div class="form-section">
        <h2>Hiring Preferences</h2>

        <label>Types of Roles You Hire For</label>
        <div class="preferences-grid">
          <div
            v-for="role in roleTypes"
            :key="role.value"
            class="preference-item"
          >
            <input
              type="checkbox"
              :id="role.value"
              :value="role.value"
              v-model="formData.hiring_roles"
            />
            <label :for="role.value">{{ role.label }}</label>
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
          <li v-for="(skill, index) in formData.skills" :key="index">
            {{ skill }}
            <span class="remove" @click="removeSkill(index)">×</span>
          </li>
        </ul>

        <label>Hiring Process Description</label>
        <textarea
          v-model="formData.hiring_process"
          placeholder="Describe your typical hiring process..."
        ></textarea>
      </div>

      <!-- Company Benefits -->
      <div class="form-section">
        <h2>Company Benefits</h2>
        <div class="benefits-grid">
          <div
            v-for="benefit in benefitTypes"
            :key="benefit.value"
            class="benefit-item"
          >
            <input
              type="checkbox"
              :id="benefit.value"
              :value="benefit.value"
              v-model="formData.company_benefits"
            />
            <label :for="benefit.value">{{ benefit.label }}</label>
          </div>
        </div>

        <label>Additional Benefits</label>
        <textarea
          v-model="formData.additional_benefits"
          placeholder="List any other benefits your company offers..."
        ></textarea>
      </div>

      <!-- Messages + submit button -->
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Job created successfully!</p>

      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? "Saving..." : "Post job" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

// ==== Partie "préférences / benefits" (front uniquement) ====
const formData = reactive({
  hiring_roles: [],
  skills: [],
  hiring_process: "",
  company_benefits: [],
  additional_benefits: "",
})

const newSkill = ref("")

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

function addSkill() {
  if (!newSkill.value.trim()) return
  formData.skills.push(newSkill.value.trim())
  newSkill.value = ""
}

function removeSkill(index) {
  formData.skills.splice(index, 1)
}

// ==== Partie "vrai job" envoyé au backend ====
const form = ref({
  name: "",
  company: "",
  localisation: "",
  description: "",
  contract_type: "",
  level: "",
  time_type: "",
  work_mode: "",
  field: "",
})

const loading = ref(false)
const error = ref("")
const success = ref(false)

async function submitJob() {
  try {
    loading.value = true
    error.value = ""
    success.value = false

    const res = await fetch("/api/jobs", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      // On envoie uniquement les champs du job vers le backend MySQL
      body: JSON.stringify(form.value),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || "Failed to create job")
    }

    success.value = true

    setTimeout(() => {
      router.push("/jobsearch")
    }, 800)
  } catch (e) {
    console.error(e)
    error.value = e.message || "Error while creating job"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.add-job {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

.job-form {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

/* remplace l'ancien .field */
.form-section {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-section label {
  font-weight: 600;
  font-size: 0.9rem;
}

.form-section input,
.form-section select,
.form-section textarea {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.submit-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  background: #754f44;
  color: white;
}

.error {
  color: #b91c1c;
  margin-bottom: 8px;
}

.success {
  color: #15803d;
  margin-bottom: 8px;
}
</style>

    

