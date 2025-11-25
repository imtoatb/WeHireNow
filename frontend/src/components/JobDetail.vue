<template>
  <div class="job-detail">
    <!-- Loading / Error states -->
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
    </div>

    <!-- Not found -->
    <p v-else class="info">Job not found.</p>
  </div>
</template>



<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const job = ref(null)
const loading = ref(false)
const error = ref("")

const jobId = computed(() => route.params.id)

function goBack() {
  router.back()
}

async function loadJob() {
  try {
    loading.value = true
    error.value = ""

    // Appelle ton backend via le proxy Vite (comme JobSearch)
    const res = await fetch(`/api/jobs/${jobId.value}`, {
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




<style>

</style>