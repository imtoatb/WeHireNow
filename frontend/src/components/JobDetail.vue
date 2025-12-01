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

  // Vérifier que l'utilisateur est un candidat
  if (authStore.user.account_type !== 'candidate') {
    alert("Only candidates can apply to jobs");
    return;
  }

  try {
    // Créer la payload
    const payload = {
      jobId: jobId
    };
    
    console.log("Sending application for job:", jobId);
    console.log("User ID from store:", authStore.user?.id);
    
    // Utiliser l'API avec les bonnes credentials
    const response = await fetch("http://localhost:8085/api/applications", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      credentials: "include", // IMPORTANT: Inclure les cookies de session
      body: JSON.stringify(payload),
    })

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Application error response:", responseData);
      throw new Error(responseData.error || "Failed to apply to this job");
    }
    
    console.log("Application successful:", responseData);
    alert("Application sent successfully!");
    
    // Optionnel: Rediriger vers la page des applications
    if (confirm("View your applications?")) {
      router.push("/applications");
    }
  } catch (e) {
    console.error("Apply error:", e);
    alert(e.message || "Error while applying.");
  }
}

onMounted(loadJob)
</script>
