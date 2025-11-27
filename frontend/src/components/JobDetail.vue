<template>
  <div class="job-detail">
    <!-- Loading / Error -->
    <p v-if="loading" class="info">Loading job details…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <!-- Job content -->
    <div v-else-if="job" class="card">
      <button class="back-btn" @click="goBack">← Back to jobs</button>

      <h1 class="title">{{ job.name }}</h1>
      <p class="company">{{ job.company }}</p> 
      <p class="location">{{ job.localisation }}</p>

      <div class="tags">
        <span v-if="job.contract_type" class="tag">{{ job.contract_type }}</span>
        <span v-if="job.level" class="tag">{{ job.level }}</span>
        <span v-if="job.time_type" class="tag">{{ job.time_type }}</span>
        <span v-if="job.work_mode" class="tag">{{ job.work_mode }}</span>
        <span v-if="job.field" class="tag">{{ job.field }}</span>
      </div>

      <h2>Description</h2>
      <p class="description">
        {{ job.description || job.desc || "No description provided." }}
      </p>

      <!--<button class="apply-btn">Apply</button> allow the register user to apply, if not register, alert not register do you want to register to continue?-->
    </div>

    <!-- Not found -->
    <p v-else class="info">Job not found.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const job = ref(null)
const loading = ref(false)
const error = ref("")

// GET job ID from URL
const jobId = route.params.id

function goBack() {
  router.push("/jobs") // ou router.back()
}

async function loadJob() {
  try {
    loading.value = true
    error.value = ""

    // EXACTEMENT comme JobSearch
    const res = await fetch(`/api/jobs/${jobId}`, {
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
}

.title {
  margin-bottom: 0;
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

.apply-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  background: #754F44;
  color: white;
}
  
</style>
