<template>
  <div class="jobsearch">
    <h2>Find your perfect job!</h2>

    <section class="filters">
      <!-- CONTRACT TYPE -->
      <div class="filter-group">
        <h3>Contract</h3>
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
        <h3>Level</h3>
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

      <!-- TIME -->
      <div class="filter-group">
        <h3>Working time</h3>
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
        <h3>Work mode</h3>
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
          <h3>Area</h3>
          <input
            v-model="filters.area"
            type="text"
            placeholder="Country / region / city…"
          />
        </div>
        <div>
          <h3>Keywords</h3>
          <input
            v-model="filters.keywords"
            type="text"
            placeholder="Tech stack, skills, role…"
          />
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="actions">
        <button class="search-btn" @click="searchJobs" :disabled="loading">
          {{ loading ? "Searching..." : "Search" }}
        </button>
        <button class="reset-btn" type="button" @click="resetFilters">
          Reset
        </button>
      </div>

      <!-- Error / Loading -->
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="loading" class="loading">Loading job listings…</p>
    </section>

    <!-- RESULTS -->
    <section class="results">
      <ul v-if="!loading && jobs.length" class="listJob">
        <li v-for="job in jobs" :key="job.id" class="jobCard">
          <h3>{{ job.position }}</h3>
          <p class="company">{{ job.company_name }}</p>
          <p class="localisation">{{ job.location }}</p>

          <p class="meta">
            <span v-if="job.contract_type">{{ job.contract_type }}</span>
            <span v-if="job.level"> · {{ job.level }}</span>
            <span v-if="job.time_type"> · {{ job.time_type }}</span>
            <span v-if="job.work_mode"> · {{ job.work_mode }}</span>
          </p>

          <RouterLink :to="{ name: 'JobDetail', params: { id: job.id } }" class="detail_btn">View details</RouterLink>
        </li>
      </ul>

      <p v-else-if="!loading && !jobs.length" class="no-jobs">
        No jobs found. Try changing the filters.
      </p>
    </section>
  </div>
</template>

<!-- seulement la partie script setup -->

<script setup>
import { ref, onMounted, watch } from "vue"

const jobs = ref([])
const loading = ref(false)
const error = ref("")

const contractOptions = ["CDI","CDD","Internship","Alternance","Freelance","Formation"]
const levelOptions = ["Starter","Junior","Intermediate","Senior","Expert"]
const timeOptions = ["Part-time","Full-time"]
const modeOptions = ["On-site","Hybrid","Remote","Nomadic"]
const fieldOptions = ["IT","Cybersecurity", "Cloud Computing", "Software Engineering", "Data / AI", "Artificial Intelligence", "Marketing","Finance","HR","Design","Industry", "Designe"]




const filters = ref({
  contractTypes: [],
  levels: [],
  timeTypes: [],
  workModes: [],
  fields: [],
  area: "",
  keywords: "",
})

function toggleFilter(key, value) {
  const arr = filters.value[key]
  const index = arr.indexOf(value)
  if (index === -1) arr.push(value)
  else arr.splice(index, 1)

  searchJobs() // << lance la recherche dès que l'utilisateur clique sur un tag
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
  searchJobs()
}

async function searchJobs() {
  try {
    loading.value = true
    error.value = ""
    jobs.value = []

    const params = new URLSearchParams()
    if (filters.value.contractTypes.length) params.append("contractTypes", filters.value.contractTypes.join(","))
    if (filters.value.levels.length) params.append("levels", filters.value.levels.join(","))
    if (filters.value.timeTypes.length) params.append("timeTypes", filters.value.timeTypes.join(","))
    if (filters.value.workModes.length) params.append("workModes", filters.value.workModes.join(","))
    if (filters.value.fields.length) params.append("fields", filters.value.fields.join(","))
    if (filters.value.area) params.append("area", filters.value.area)
    if (filters.value.keywords) params.append("keywords", filters.value.keywords)

    console.log("Fetching jobs with params:", params.toString())

    const res = await fetch(`http://localhost:8085/api/jobs/search?${params.toString()}`)
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { data = text }

    if (!res.ok) {
      const errorMessage = (data && (data.error || data.message)) || `Error ${res.status}`
      throw new Error(errorMessage)
    }

    console.log("Jobs received:", data)
    jobs.value = data
  } catch (e) {
    console.error("Error in searchJobs:", e)
    error.value = e.message || "Failed to load jobs"
  } finally {
    loading.value = false
  }
}

onMounted(searchJobs)
</script>

