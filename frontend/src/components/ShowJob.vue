<template>
  <div class="show-jobs">
    <button class="back-btn" @click="goBack">← Back to jobs</button>

    <h2>Jobs you posted</h2>

    <!-- Si pas connecté ou pas recruteur -->
    <p v-if="!auth.user || auth.user.account_type !== 'recruiter'" class="info">
      You must be logged in as a recruiter to see your jobs.
    </p>

    <!-- Loading / Error -->
    <p v-else-if="loading" class="info">Loading your jobs…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <!-- Liste des jobs -->
    <div v-else-if="jobs.length" class="jobs-list">
      <div class="jobs-grid">
        <div
          v-for="job in jobs"
          :key="job.id"
          class="job-card"
        >
          <div class="job-header">
            <h3>{{ job.name || job.position }}</h3>
            <span class="job-id">#{{ job.id }}</span>
          </div>
          
          <p class="company">{{ job.company_name }}</p>
          <p class="location">{{ job.location }}</p>

          <div class="job-tags">
            <span v-if="job.contract_type" class="tag">{{ job.contract_type }}</span>
            <span v-if="job.level" class="tag">{{ job.level }}</span>
            <span v-if="job.time_type" class="tag">{{ job.time_type }}</span>
            <span v-if="job.work_mode" class="tag">{{ job.work_mode }}</span>
            <span v-if="job.field" class="tag">{{ job.field }}</span>
          </div>

          <p class="description">
            {{ (job.description || "").slice(0, 150) }}...
          </p>

          <div class="job-footer">
            <span class="date">Posted: {{ formatDate(job.created_at) }}</span>
            
            <div class="actions">
              <RouterLink
                :to="{ name: 'JobStats', params: { id: job.id } }"
                class="btn-view"
              >
                View applications
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Aucun job -->
    <div v-else class="no-jobs">
      <p class="info">
        You have not posted any jobs yet.
      </p>
      <RouterLink to="/addjob" class="btn-post">
        Post your first job
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../stores/auth"
import api from "../services/api"

const auth = useAuthStore()
const router = useRouter()

const jobs = ref([])
const loading = ref(false)
const error = ref("")

const isRecruiter = computed(
  () => auth.user && auth.user.account_type === "recruiter"
)

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function goBack() {
  router.push("/jobsearch")
}

// Load jobs
async function loadJobs() {
  if (!isRecruiter.value) return

  if (!auth.user?.email) {
    error.value = "No user email found. Please log in again."
    return
  }

  try {
    loading.value = true
    error.value = ""

    console.log("Loading jobs for recruiter:", auth.user.email)

    const res = await api.get("/jobs/my", {
      params: {
        email: auth.user.email,
      },
    })

    jobs.value = res.data || []
    console.log("Jobs loaded:", jobs.value.length)
  } catch (e) {
    console.error("Error loading jobs:", e)
    error.value = e.response?.data?.error || e.message || "Error while loading jobs"
  } finally {
    loading.value = false
  }
}

// Watch for auth changes
import { watch } from "vue"
watch(() => auth.user, (newUser) => {
  if (newUser && newUser.account_type === 'recruiter') {
    loadJobs()
  }
})

onMounted(() => {
  if (isRecruiter.value) {
    loadJobs()
  }
})
</script>

