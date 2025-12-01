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
          :to="{ name: 'JobDetail', params: { id: job.id } }"
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

const auth = useAuthStore()

const jobs = ref([])
const loading = ref(false)
const error = ref("")

// nom de l'entreprise du recruteur
const companyName = computed(() => auth.user?.profile?.company_name || "")

async function loadJobs() {
  // sécurité : si pas recruteur → rien
  if (!auth.user || auth.user.account_type !== "recruiter") return

  if (!companyName.value) {
    // profil pas rempli → pas de filtre possible
    error.value =
      "No company name found in your profile. Please complete your recruiter profile first."
    return
  }

  try {
    loading.value = true
    error.value = ""

    // récupère tous les jobs (comme JobSearch, sans filtres)
    const res = await fetch("/api/jobs/search", {
      credentials: "include",
    })

    if (!res.ok) {
      throw new Error("Failed to load jobs")
    }

    const allJobs = await res.json()

    // filtre côté frontend par nom d'entreprise
    jobs.value = allJobs.filter(
      (job) => job.company && job.company === companyName.value
    )
  } catch (e) {
    console.error(e)
    error.value = e.message || "Error while loading jobs"
  } finally {
    loading.value = false
  }
}

onMounted(loadJobs)
</script>

<style scoped>
.show-jobs {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

/* tu peux réutiliser les mêmes classes que JobSearch */
.listJob {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  display: grid;
  gap: 1rem;
}

.jobCard {
  background: #fff;
  padding: 1.2rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
}

.company {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.localisation {
  font-size: 0.9rem;
  color: #555;
}

.meta {
  font-size: 0.85rem;
  color: #754f44;
  margin: 0.25rem 0 0.5rem;
}

.desc {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.detail_btn {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 10px;
  background: #754f44;
  color: #fff;
  font-size: 0.85rem;
  text-decoration: none;
}

.info {
  margin-top: 1rem;
  color: #444;
}

.error {
  margin-top: 1rem;
  color: #b91c1c;
}
</style>
