<template>
  <div class="job-detail">
    <!-- Loading / Error -->
    <p v-if="loading" class="info">Loading job details…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <!-- Job content -->
    <div v-else-if="job" class="card">
      <button class="back-btn" @click="goBack">← Back to jobs</button>

      <h1 class="title">{{ job.position }}</h1>
      <p class="company">{{ job.company_name }}</p> 
      <p class="location">{{ job.location }}</p>

      <div class="tags">
        <span v-if="job.contract_type" class="tag">{{ job.contract_type }}</span>
        <span v-if="job.level" class="tag">{{ job.level }}</span>
        <span v-if="job.time_type" class="tag">{{ job.time_type }}</span>
        <span v-if="job.work_mode" class="tag">{{ job.work_mode }}</span>
        <span v-if="job.field" class="tag">{{ job.field }}</span>
        <span v-if="job.salary_range" class="tag salary">{{ job.salary_range }}</span>
      </div>

      <div class="job-sections">
        <div class="section">
          <h2>Job Description</h2>
          <p class="description">{{ job.description || "No description provided." }}</p>
        </div>

        <div v-if="job.requirements" class="section">
          <h2>Requirements</h2>
          <pre class="requirements">{{ job.requirements }}</pre>
        </div>

        <div v-if="job.benefits" class="section">
          <h2>Benefits</h2>
          <pre class="benefits">{{ job.benefits }}</pre>
        </div>
      </div>

      <button class="apply-btn" @click="applyToJob">Apply Now</button>
    </div>

    <!-- Not found -->
    <p v-else class="info">Job not found.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "../stores/auth"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const job = ref(null)
const loading = ref(false)
const error = ref("")

const jobId = route.params.id

function goBack() {
  router.push({ name: "JobSearch" }) 
}

async function loadJob() {
  try {
    loading.value = true
    error.value = ""

    const res = await fetch(`http://localhost:8085/api/jobs/${jobId}`, {
      credentials: "include",
    })

    if (!res.ok) {
      if (res.status === 404) {
        job.value = null
        error.value = "Job not found."
        return
      }
      throw new Error("Failed to load job details")
    }

    job.value = await res.json()
  } catch (e) {
    console.error(e)
    error.value = e.message || "Error while loading job"
  } finally {
    loading.value = false
  }
}

async function applyToJob() {
  if (!authStore.isAuthenticated) {
    if (confirm("You must be logged in to apply. Go to login page?")) {
      router.push("/login")
    }
    return
  }

  try {
    const res = await fetch("http://localhost:8085/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        jobId,
        userId: authStore.user.id,
      }),
    })

    if (!res.ok) throw new Error("Failed to apply to this job")
    alert("Application sent successfully!")
  } catch (e) {
    console.error(e)
    alert(e.message || "Error while applying.")
  }
}

onMounted(loadJob)
</script>

<style scoped>
.job-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.back-btn {
  background: transparent;
  border: none;
  color: #754f44;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: #f5f5f5;
}

.title {
  margin-bottom: 0;
  color: #1f1f1f;
  font-size: 2rem;
}

.company {
  color: #EC7357;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 8px 0;
}

.location {
  color: #6b7280;
  margin-bottom: 20px;
}

.tags {
  margin: 20px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: #f3f4f6;
  color: #374151;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
}

.tag.salary {
  background: #10b981;
  color: white;
}

.job-sections {
  margin: 30px 0;
}

.section {
  margin-bottom: 30px;
}

.section h2 {
  color: #1f1f1f;
  border-bottom: 2px solid #EC7357;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.description, .requirements, .benefits {
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-wrap;
}

.apply-btn {
  display: block;
  width: 100%;
  padding: 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  background: #754F44;
  color: white;
  transition: background 0.2s ease;
  margin-top: 30px;
}

.apply-btn:hover {
  background: #5a3a30;
}

.info {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.error {
  text-align: center;
  padding: 40px;
  color: #b91c1c;
  background: #fee2e2;
  border-radius: 8px;
}
</style>