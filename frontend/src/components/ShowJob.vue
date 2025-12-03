<template>
  <div class="show-jobs">
    <button class="back-btn" @click="goBack">←</button>

    <h2>Jobs you posted</h2>

    <!-- Si pas connecté ou pas recruteur -->
    <p v-if="!auth.user || auth.user.account_type !== 'recruiter'" class="info">
      You must be logged in as a recruiter to see your jobs.
    </p>

    <!-- Loading / Error -->
    <p v-else-if="loading" class="info">Loading your jobs…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <!-- Liste des jobs -->
    <ul v-else-if="jobs.length" class="card">
      <li
        v-for="job in jobs"
        :key="job.id"
        class="jobCard"
      >
        <h3>{{ job.name }}</h3>
        <p class="company">{{ job.company }}</p>
        <p class="localisation">{{ job.localisation }}</p>

        <p class="tags">
          <span v-if="job.contract_type" class="tag">{{ job.contract_type }}</span>
          <span v-if="job.level" class="tag"> · {{ job.level }}</span>
          <span v-if="job.time_type" class="tag"> · {{ job.time_type }}</span>
          <span v-if="job.work_mode" class="tag"> · {{ job.work_mode }}</span>
        </p>
        <br>

        <p class="desc">
          {{ (job.description || job.desc || "").slice(0, 120) }}…
        </p>

        <br>
        <RouterLink
          :to="{ name: 'ShowJob', params: { id: job.id } }"
          class="detail-btn"
        >
          View statistics
        </RouterLink>
      </li>
    </ul>

    <!-- Aucun job -->
    <p v-else class="info">
      You have not posted any jobs yet.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useAuthStore } from "../stores/auth"
import api from "../services/api"

const auth = useAuthStore()

const jobs = ref([])
const loading = ref(false)
const error = ref("")

const isRecruiter = computed(
  () => auth.user && auth.user.account_type === "recruiter"
)

async function loadJobs() {
  // sécurité : si pas recruteur → rien
  if (!isRecruiter.value) return

  if (!auth.user?.email) {
    error.value = "No user email found. Please log in again."
    return
  }

  try {
    loading.value = true
    error.value = ""

    console.log("➡️ Loading jobs for:", auth.user.email)

    const res = await api.get("/jobs/my", {
      params: {
        email: auth.user.email,
      },
    })

    jobs.value = res.data
    console.log("✅ Jobs loaded:", jobs.value)
  } catch (e) {
    console.error(e)
    error.value =
      e.response?.data?.error || e.message || "Error while loading jobs"
  } finally {
    loading.value = false
  }
}

onMounted(loadJobs)
</script>


<style scoped>
.show-jobs {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

ul {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
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
}

.title {
  margin-bottom: 0;
}

.detail-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  background: #754F44;
  color: white;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.back-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  background: #754F44;
  color: white;
}


.tags {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: #754f44;
  color: white;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
}


  
</style>

