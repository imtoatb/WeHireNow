<template>
  <div class="jobsearch">
    <div class="page-header">
      <h1>Find Your Perfect Job</h1>
      <p class="subtitle">Browse through our curated list of opportunities</p>
    </div>

    <section class="filters">
      <!-- CONTRACT TYPE -->
      <div class="filter-group">
        <h3>Contract Type</h3>
        <div class="chip-row">
          <button
            v-for="type in contractOptions"
            :key="type"
            type="button"
            class="chip"
            :class="{ active: filters.contractTypes.includes(type) }"
            @click="toggleFilter('contractTypes', type)"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <!-- LEVEL -->
      <div class="filter-group">
        <h3>Experience Level</h3>
        <div class="chip-row">
          <button
            v-for="level in levelOptions"
            :key="level"
            type="button"
            class="chip"
            :class="{ active: filters.levels.includes(level) }"
            @click="toggleFilter('levels', level)"
          >
            {{ level }}
          </button>
        </div>
      </div>

      <!-- WORKING TIME -->
      <div class="filter-group">
        <h3>Working Time</h3>
        <div class="chip-row">
          <button
            v-for="time in timeOptions"
            :key="time"
            type="button"
            class="chip"
            :class="{ active: filters.timeTypes.includes(time) }"
            @click="toggleFilter('timeTypes', time)"
          >
            {{ time }}
          </button>
        </div>
      </div>

      <!-- WORK MODE -->
      <div class="filter-group">
        <h3>Work Mode</h3>
        <div class="chip-row">
          <button
            v-for="mode in modeOptions"
            :key="mode"
            type="button"
            class="chip"
            :class="{ active: filters.workModes.includes(mode) }"
            @click="toggleFilter('workModes', mode)"
          >
            {{ mode }}
          </button>
        </div>
      </div>

      <!-- FIELD / DOMAIN -->
      <div class="filter-group">
        <h3>Field</h3>
        <div class="chip-row">
          <button
            v-for="field in fieldOptions"
            :key="field"
            type="button"
            class="chip"
            :class="{ active: filters.fields.includes(field) }"
            @click="toggleFilter('fields', field)"
          >
            {{ field }}
          </button>
        </div>
      </div>

      <!-- AREA + KEYWORDS -->
      <div class="filter-group grid-2">
        <div>
          <h3>Location</h3>
          <input
            v-model="filters.area"
            type="text"
            placeholder="Country, region or city…"
            @keyup.enter="searchJobs"
            @input="handleAreaInput"
          />
        </div>
        <div>
          <h3>Keywords</h3>
          <input
            v-model="filters.keywords"
            type="text"
            placeholder="Skills, role, technology…"
            @keyup.enter="searchJobs"
            @input="handleKeywordsInput"
          />
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="actions">
        <button class="search-btn" @click="searchJobs" :disabled="loading">
          <span v-if="loading" class="btn-loading"></span>
          {{ loading ? "Searching..." : "Search Jobs" }}
        </button>
        <button class="reset-btn" type="button" @click="resetFilters">
          Reset All
        </button>
        <div class="filter-toggles">
          <label class="toggle-label">
            <input type="checkbox" v-model="showExpired" @change="searchJobs" />
            <span>Show expired jobs (3+ months)</span>
          </label>
        </div>
        <div class="results-count" v-if="!loading && jobs.length">
          {{ jobs.length }} job{{ jobs.length !== 1 ? 's' : '' }} found
          <span v-if="expiredJobsCount > 0" class="expired-count">
            ({{ expiredJobsCount }} expired)
          </span>
        </div>
      </div>

      <!-- Error / Loading -->
      <div v-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="searchJobs" class="retry-btn">Try Again</button>
      </div>
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading job listings…</p>
      </div>
    </section>

    <!-- RESULTS -->
    <section class="results" v-if="!loading">
      <div v-if="jobs.length" class="results-header">
        <h2>Available Positions</h2>
        <p class="results-subtitle">Details & apply</p>
      </div>

      <ul v-if="jobs.length" class="listJob">
        <li v-for="job in jobs" :key="job.id" class="jobCard" :class="{ 
            'job-expired': isJobExpired(job.created_at),
            'job-expiring-soon': isJobExpiringSoon(job.created_at)
          }"
        >
          <div class="job-card-header">
            <div class="job-title-section">
              <h3>{{ job.position }}</h3>
              <p class="company">{{ job.company_name }}</p>
            </div>
            <div class="job-salary" v-if="job.salary_range">
              {{ job.salary_range }}/€
            </div>
            <div v-if="isJobExpired(job.created_at)" class="expired-badge">
              Expired
            </div>
            <div v-else-if="isJobExpiringSoon(job.created_at)" class="expiring-soon-badge">
              Expiring soon
            </div>
          </div>
          
          <div class="job-card-body">
            <p class="localisation">
              {{ job.location }}
            </p>

            <div class="job-tags">
              <span class="job-tag" v-if="job.contract_type">{{ job.contract_type }}</span>
              <span class="job-tag" v-if="job.level">{{ job.level }}</span>
              <span class="job-tag" v-if="job.time_type">{{ job.time_type }}</span>
              <span class="job-tag" v-if="job.work_mode">{{ job.work_mode }}</span>
              <span class="job-tag field-tag" v-if="job.field">{{ job.field }}</span>
            </div>

            <p class="job-description" v-if="job.description">
              {{ truncateDescription(job.description) }}
            </p>

            <div class="job-card-footer">
              <RouterLink 
                :to="{ name: 'JobDetail', params: { id: job.id } }" 
                class="detail_btn"
                :class="{ 'btn-disabled': isJobExpired(job.created_at) }"
              >
                {{ isJobExpired(job.created_at) ? 'View (Expired)' : 'View Details' }}
              </RouterLink>
              <span class="post-date" :class="{ 'date-expired': isJobExpired(job.created_at) }">
                Posted {{ formatDate(job.created_at) }}
                <span v-if="isJobExpired(job.created_at)" class="expired-warning">Expired</span>
              </span>
            </div>
          </div>
        </li>
      </ul>

      <div v-else-if="!loading && !jobs.length && hasSearched" class="no-results">
        <div class="no-results-content">
          <h3>No jobs found</h3>
          <p>Try adjusting your filters or search terms</p>
          <button @click="resetFilters" class="reset-all-btn">
            Reset All Filters
          </button>
        </div>
      </div>

      <div v-else-if="!loading && !jobs.length && !hasSearched" class="welcome-message">
        <h3>Welcome to Job Search</h3>
        <p>Select filters above to find your perfect job match</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const jobs = ref([])
const loading = ref(false)
const error = ref("")
const hasSearched = ref(false)
const showExpired = ref(false) // Par défaut, ne pas montrer les jobs expirés

// Options standardisées pour correspondre à PostgreSQL
const contractOptions = ["Permanent", "Fixed-term", "Internship", "Apprenticeship", "Freelance", "Training"]
const levelOptions = ["Junior", "Mid-level", "Senior", "Expert"]
const timeOptions = ["Part-time", "Full-time"]
const modeOptions = ["On-site", "Hybrid", "Remote"]
const fieldOptions = [
  "Software Engineering", 
  "Cybersecurity", 
  "Cloud Computing", 
  "Data / AI", 
  "Artificial Intelligence", 
  "Marketing", 
  "Finance", 
  "HR", 
  "Design", 
  "Industry"
]

const filters = ref({
  contractTypes: [],
  levels: [],
  timeTypes: [],
  workModes: [],
  fields: [],
  area: "",
  keywords: "",
})

// Délai pour éviter trop de requêtes pendant la saisie
let searchTimeout = null

// Computed pour compter les jobs expirés
const expiredJobsCount = computed(() => {
  return jobs.value.filter(job => isJobExpired(job.created_at)).length
})

function toggleFilter(key, value) {
  const arr = filters.value[key]
  const index = arr.indexOf(value)
  if (index === -1) arr.push(value)
  else arr.splice(index, 1)
  
  searchJobs()
}

function handleAreaInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchJobs()
  }, 500)
}

function handleKeywordsInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchJobs()
  }, 500)
}

function resetFilters() {
  filters.value = {
    contractTypes: [],
    levels: [],
    timeTypes: [],
    workModes: [],
    fields: [],
    area: "",
    keywords: "",
  }
  showExpired.value = false
  searchJobs()
}

async function searchJobs() {
  try {
    loading.value = true
    error.value = ""
    hasSearched.value = true

    const params = new URLSearchParams()
    
    // Ajouter seulement les filtres non vides
    if (filters.value.contractTypes.length) {
      params.append("contractTypes", filters.value.contractTypes.join(","))
    }
    if (filters.value.levels.length) {
      params.append("levels", filters.value.levels.join(","))
    }
    if (filters.value.timeTypes.length) {
      params.append("timeTypes", filters.value.timeTypes.join(","))
    }
    if (filters.value.workModes.length) {
      params.append("workModes", filters.value.workModes.join(","))
    }
    if (filters.value.fields.length) {
      params.append("fields", filters.value.fields.join(","))
    }
    if (filters.value.area.trim()) {
      params.append("area", filters.value.area.trim())
    }
    if (filters.value.keywords.trim()) {
      params.append("keywords", filters.value.keywords.trim())
    }

    // Ajouter le paramètre pour montrer les jobs expirés
    params.append("showExpired", showExpired.value)

    console.log("Fetching jobs with params:", params.toString())

    const res = await fetch(`http://localhost:8085/api/jobs/search?${params.toString()}`)
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: Failed to load jobs`)
    }

    const data = await res.json()
    console.log("Jobs received:", data.length)
    jobs.value = data
  } catch (e) {
    console.error("Error in searchJobs:", e)
    error.value = e.message || "Failed to load jobs. Please try again."
    jobs.value = []
  } finally {
    loading.value = false
  }
}

// Vérifier si un job est expiré (plus de 3 mois)
function isJobExpired(createdAt) {
  if (!createdAt) return false
  const jobDate = new Date(createdAt)
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  return jobDate < threeMonthsAgo
}

// Vérifier si un job expire bientôt (entre 2.5 et 3 mois)
function isJobExpiringSoon(createdAt) {
  if (!createdAt) return false
  const jobDate = new Date(createdAt)
  const twoAndHalfMonthsAgo = new Date()
  twoAndHalfMonthsAgo.setMonth(twoAndHalfMonthsAgo.getMonth() - 2.5)
  
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  
  return jobDate < twoAndHalfMonthsAgo && jobDate >= threeMonthsAgo
}

function truncateDescription(description, maxLength = 120) {
  if (!description) return ""
  if (description.length <= maxLength) return description
  return description.substring(0, maxLength) + "..."
}

function formatDate(dateString) {
  if (!dateString) return ""
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "today"
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 90) return `${Math.floor(diffDays / 30)} months ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  // Charger tous les jobs au démarrage
  searchJobs()
})
</script>
