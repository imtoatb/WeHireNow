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
          <h3>{{ job.name }}</h3>
          <p class="company">{{ job.company }}</p>
          <p class="localisation">{{ job.localisation }}</p>

          <p class="meta">
            <span v-if="job.contract_type">{{ job.contract_type }}</span>
            <span v-if="job.level"> · {{ job.level }}</span>
            <span v-if="job.time_type"> · {{ job.time_type }}</span>
            <span v-if="job.work_mode"> · {{ job.work_mode }}</span>
          </p>

          <RouterLink 
            :to="{ name: 'JobDetail', params: { id: job.id } }"
            class="detail_btn"
          >
            View details
          </RouterLink>

          <RouterLink :to="{ name: 'JobDetail', params: { id: job.id } }" class="detail_btn"> View details</RouterLink>


        </li>
      </ul>

      <p v-else-if="!loading && !jobs.length">
        No jobs found. Try changing the filters.
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const jobs = ref([])
const loading = ref(false)
const error = ref("")

// Tag options (you can rename / translate as you want)
const contractOptions = [
  "CDI",
  "CDD",
  "Internship",
  "Alternance",
  "Freelance",
  "Formation",
]

const levelOptions = ["Starter", "Junior", "Intermédiaire", "Senior", "Expert"]

const timeOptions = ["Part-time", "Full-time"]

const modeOptions = ["Présentiel", "Hybride", "Télétravail", "Nomade"]

// Example fields – change to your real ones (IT, HR, etc.)
const fieldOptions = [
  "Informatique",
  "Data / IA",
  "Marketing",
  "Finance",
  "RH",
  "Design",
  "Industrie",
]

// All filters in one object
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
  if (index === -1) {
    arr.push(value)
  } else {
    arr.splice(index, 1)
  }
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

    const params = new URLSearchParams()

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
    if (filters.value.area) {
      params.append("area", filters.value.area)
    }
    if (filters.value.keywords) {
      params.append("keywords", filters.value.keywords)
    }

    // database connection
    //const res = await fetch(
      //`http://localhost:8085/api/jobs/search?${params.toString()}`,
      //{
        //credentials: "include", 
      //}
    //)
    //end of database connection

    //temporary connection
    const res = await fetch(`/api/jobs/search?${params.toString()}`, {
      credentials: "include",
    })



    //end of temporary connection

    if (!res.ok) {
      throw new Error("Error while loading jobs")
    }

    jobs.value = await res.json()
  } catch (e) {
    console.error(e)
    error.value = e.message || "Failed to load jobs"
  } finally {
    loading.value = false
  }
}

// Load once on page open with default filters
onMounted(searchJobs)
</script>

<style scoped>
.jobsearch {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.filters {
  background: #ffff;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 24px;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group h3 {
  margin: 0 0 6px;
  font-size: 0.95rem;
  font-weight: 600;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border-radius: 999px;
  border: 1px solid #ccc;
  padding: 6px 12px;
  background: #e8d8d2;
  color: #1f1f1f;
  cursor: pointer;
  font-size: 0.85rem;
}

.chip.active {
  background: #EC7357;
  color: white;
  border-color: #754F44;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.grid-2 input {
  width: 100%;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.search-btn,
.reset-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.search-btn {
  background: #754F44;
  color: white;
}

.reset-btn {
  background: #e5e7eb;
}

.error {
  color: #b91c1c;
  margin-top: 8px;
}

.loading {
  margin-top: 8px;
}

.results {
  margin-top: 10px;
}

.listJob {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 0;
  margin: 0;
}

.jobCard {
  background-color: white;
  padding: 1.5rem;
  width: 280px;
  border-radius: 18px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  text-align: left;
  border: 1px solid #e5e7eb;
  list-style: none;
}

.company {
  font-weight: 600;
}

.localisation {
  color: #6b7280;
  font-size: 0.9rem;
}

.meta {
  color: #4b5563;
  font-size: 0.8rem;
  margin: 4px 0 8px;
}

.detail_btn {
  display: inline-block;
  margin-top: 10px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #754f44;
  color: white;
  text-decoration: none;
  font-size: 0.85rem;
}
</style>
