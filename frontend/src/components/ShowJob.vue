<template>
  <div class="show-jobs">
    <h2>Jobs you posted</h2>

    <!-- Si pas connecté ou pas recruteur -->
    <p v-if="!auth.user || auth.user.account_type !== 'recruiter'" class="info">
      You must be logged in as a recruiter to see your jobs.
    </p>

    <!-- Loading / Error -->
    <p v-else-if="loading" class="info">Loading your jobs…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <!-- Liste des jobs -->
    <ul v-else-if="jobs.length" class="listJob">
      <li
        v-for="job in jobs"
        :key="job.id"
        class="jobCard"
      >
        <h3>{{ job.name }}</h3>
        <p class="company">{{ job.company }}</p>
        <p class="localisation">{{ job.localisation }}</p>

        <p class="meta">
          <span v-if="job.contract_type">{{ job.contract_type }}</span>
          <span v-if="job.level"> · {{ job.level }}</span>
          <span v-if="job.time_type"> · {{ job.time_type }}</span>
          <span v-if="job.work_mode"> · {{ job.work_mode }}</span>
        </p>

        <p class="desc">
          {{ (job.description || job.desc || "").slice(0, 120) }}…
        </p>

        <RouterLink
          :to="{ name: 'JobStats', params: { id: job.id } }"
          class="detail_btn"
        >
          View details
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
