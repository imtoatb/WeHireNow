<template>
  <div class="job-stats">
    <button class="back-btn" @click="goBack">← Back to your jobs</button>

    <h2>Applications for "{{ job?.name || 'Job' }}"</h2>

    <p v-if="loading" class="info">Loading statistics…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <div v-else>
      <!-- Stats -->
      <div class="stats-card" v-if="applications.length">
        <p><strong>Total applications:</strong> {{ total }}</p>
        <p><strong>Pending:</strong> {{ counts.pending }}</p>
        <p><strong>Reviewed:</strong> {{ counts.reviewed }}</p>
        <p><strong>Accepted:</strong> {{ counts.accepted }}</p>
        <p><strong>Rejected:</strong> {{ counts.rejected }}</p>
      </div>

      <!-- Liste des candidatures -->
      <ul v-if="applications.length" class="apps-list">
        <li v-for="app in applications" :key="app.id" class="app-card">
          <h3>
            {{ app.first_name || 'Candidate' }} {{ app.last_name || '' }}
            <span class="email">({{ app.email }})</span>
          </h3>
          <p class="status">Status: <strong>{{ app.status }}</strong></p>
          <p class="date">
            Applied on:
            {{ formatDate(app.created_at) }}
          </p>
          <p v-if="app.cover_letter" class="cover">
            <strong>Cover letter:</strong> {{ app.cover_letter }}
          </p>
        </li>
      </ul>

      <p v-else class="info">No applications for this job yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const jobId = route.params.id;

const job = ref(null);
const applications = ref([]);
const loading = ref(false);
const error = ref("");

// stats simples
const counts = computed(() => {
  const c = { pending: 0, reviewed: 0, accepted: 0, rejected: 0 };
  applications.value.forEach((a) => {
    if (c[a.status] !== undefined) c[a.status]++;
  });
  return c;
});

const total = computed(
  () =>
    counts.value.pending +
    counts.value.reviewed +
    counts.value.accepted +
    counts.value.rejected
);

function goBack() {
  router.push({ name: "ShowJob" });
}

function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleString();
}

async function loadData() {
  // sécurité : recruteur only
  if (!auth.user || auth.user.account_type !== "recruiter") {
    error.value = "You must be a recruiter to view these statistics.";
    return;
  }

  try {
    loading.value = true;
    error.value = "";

    // 1) récupérer le job
    const jobRes = await api.get(`/jobs/${jobId}`);
    job.value = jobRes.data;

    // 2) récupérer les candidatures pour ce job
    const appsRes = await api.get(`/applications/by-job/${jobId}`, {
      withCredentials: true,
    });
    applications.value = appsRes.data;
  } catch (e) {
    console.error(e);
    error.value =
      e.response?.data?.error || e.message || "Error while loading statistics";
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped>
.job-stats {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.back-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  background: #754f44;
  color: white;
  margin-bottom: 1rem;
}

.stats-card {
  background: #fff;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
  margin-bottom: 1.5rem;
}

.apps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.app-card {
  background: #fff;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-bottom: 1rem;
}

.email {
  font-size: 0.9rem;
  color: #555;
}

.status {
  margin: 0.3rem 0;
}

.cover {
  margin-top: 0.5rem;
}

.info {
  margin-top: 1rem;
}

.error {
  color: #b91c1c;
}
</style>
