<template>
  <div class="jobsearch">
    <h2>Find your perfect job! </h2>

    <!--Search panel-->
    <div class="reseach">

        <!--research / selection form-->
        <form action="">

        </form>

        <button @click="searchJobs" :disabled="loading">
        {{ loading ? "Searching..." : "Search" }}
      </button>

       <!-- Error -->
        <p v-if="error" class="error">{{ error }}</p>

        <!-- Loading -->
        <p v-if="loading" class="loading">Loading job listings…</p>

        <!--output-->
        <ul v-if="!loading && jobs.length" class="listJob">
        <li v-for="job in jobs" :key="job.id" class="jobCard">
          <h3>{{ job.name }}</h3>
          <p class="company">{{ job.company }}</p>
          <p class="localisation">{{ job.localisation }}</p>

          <p class="desc">
            {{ job.desc ? job.desc.slice(0, 120) : '' }}...
          </p>

          <!-- Route vers les détails du job -->
          <router-link :to="`/job/${job.id}`" class="detail_btn">
            View details
          </router-link>
        </li>
      </ul>
      
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const jobs = ref([])

// Exemple d'appel à ton backend Node
async function fetchJobs() {
  try {
    const res = await fetch('/api/jobs') // adapte si ton backend est ailleurs
    if (!res.ok) throw new Error('Error while loading jobs')
    jobs.value = await res.json()
  } catch (e) {
    console.error(e)
  }
}

onMounted(fetchJobs)
</script>

<style scoped>
.jobCard {
  background-color: white;
  padding: 2rem;
  width: 300px;
  border-radius: 18px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
  transition: 0.3s ease;
  border: 2px solid transparent;
  list-style: none;
}

.listJob ul {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 0;
  margin: 0;
}
</style>
