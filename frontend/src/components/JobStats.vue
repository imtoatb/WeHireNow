<template>
  <div class="job-stats">
    <button class="back-btn" @click="goBack">←</button>

    <p v-if="loading" class="info">Loading statistics…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <div v-else>
      <!-- Job Info -->
      <div class="job-info" v-if="job">
        <h3>{{ job.name || job.position }}</h3>
        <p><strong>Company:</strong> {{ job.company_name }}</p>
        <p><strong>Location:</strong> {{ job.location }}</p>
        <p><strong>Posted:</strong> {{ formatDate(job.created_at) }}</p>
      </div>

      <!-- Stats -->
      <div class="stats-card" v-if="applications.length">
        <h3>Application Statistics</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ total }}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-item pending">
            <div class="stat-value">{{ counts.pending }}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-item reviewed">
            <div class="stat-value">{{ counts.reviewed }}</div>
            <div class="stat-label">Reviewed</div>
          </div>
          <div class="stat-item accepted">
            <div class="stat-value">{{ counts.accepted }}</div>
            <div class="stat-label">Accepted</div>
          </div>
          <div class="stat-item rejected">
            <div class="stat-value">{{ counts.rejected }}</div>
            <div class="stat-label">Rejected</div>
          </div>
        </div>
      </div>


      <div v-if="applications.length" class="applications-section">
        <h3>Applications</h3>
        
        <div class="applications-list">
          <div v-for="app in applications" :key="app.id" class="app-card">
            <div class="app-header">
              <div class="candidate-info">
                <h4>{{ app.first_name || 'Candidate' }} {{ app.last_name || '' }}</h4>
                <p class="email">{{ app.email }}</p>
              </div>
              <span class="status-badge" :class="app.status">
                {{ app.status }}
              </span>
            </div>
            
            <div class="app-details">
              <p class="date">
                <strong>Applied:</strong> {{ formatDate(app.application_date || app.created_at) }}
              </p>
              
              <div v-if="app.skills && app.skills.length" class="skills">
                <strong>Skills:</strong>
                <div class="skill-tags">
                  <span v-for="(skill, index) in app.skills" :key="index" class="skill-tag">
                    {{ skill }}
                  </span>
                </div>
              </div>
              
              <div v-if="app.cover_letter" class="cover-letter">
                <strong>Cover Letter:</strong>
                <p class="cover-text">{{ app.cover_letter }}</p>
              </div>
              
              <div class="app-actions">
                <button 
                  @click="updateStatus(app.id, 'reviewed')"
                  :disabled="app.status === 'reviewed'"
                  class="btn-action"
                >
                  Mark as Reviewed
                </button>
                <button 
                  @click="updateStatus(app.id, 'accepted')"
                  :disabled="app.status === 'accepted'"
                  class="btn-action accept"
                >
                  Accept
                </button>
                <button 
                  @click="updateStatus(app.id, 'rejected')"
                  :disabled="app.status === 'rejected'"
                  class="btn-action reject"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
const updatingStatus = ref(false);

// Compute statistics
const counts = computed(() => {
  const c = { pending: 0, reviewed: 0, accepted: 0, rejected: 0 };
  applications.value.forEach((a) => {
    if (c[a.status] !== undefined) c[a.status]++;
  });
  return c;
});

const total = computed(() => applications.value.length);

function goBack() {
  router.push({ name: "ShowJob" });
}

function formatDate(d) {
  if (!d) return "N/A";
  const date = new Date(d);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function updateStatus(applicationId, newStatus) {
  if (!confirm(`Change application status to "${newStatus}"?`)) return;
  
  try {
    updatingStatus.value = true;
    
    // use special route to apply
    await api.put(`/applications/${applicationId}/recruiter`, { status: newStatus });
    
    // Update local state
    const appIndex = applications.value.findIndex(app => app.id === applicationId);
    if (appIndex !== -1) {
      applications.value[appIndex].status = newStatus;
    }
    
  } catch (e) {
    console.error("Error updating status:", e);
    alert(e.response?.data?.error || "Failed to update status");
  } finally {
    updatingStatus.value = false;
  }
}

async function loadData() {
  // Security: recruiter only
  if (!auth.user || auth.user.account_type !== "recruiter") {
    error.value = "You must be a recruiter to view these statistics.";
    return;
  }

  try {
    loading.value = true;
    error.value = "";

    // 1) Get job details
    const jobRes = await api.get(`/jobs/${jobId}`);
    job.value = jobRes.data;

    // 2) Get applications for this job
    const appsRes = await api.get(`/applications/by-job/${jobId}`);
    applications.value = appsRes.data || [];
    
    console.log(`Loaded ${applications.value.length} applications for job ${jobId}`);
    
  } catch (e) {
    console.error("Error loading statistics:", e);
    error.value = e.response?.data?.error || e.message || "Error while loading statistics";
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>
