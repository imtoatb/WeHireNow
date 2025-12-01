<template>
  <div class="job-applications-container">
    <div v-if="!authStore.isAuthenticated || authStore.user.account_type !== 'candidate'" class="not-authorized">
      <div class="error-card">
        <h2>Access Denied</h2>
        <p>This page is only accessible to candidates.</p>
        <router-link to="/jobsearch" class="btn-primary">
          Browse Jobs
        </router-link>
      </div>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="applications-header">
        <h1>My Job Applications</h1>
        <p class="subtitle">Track the status of all your job applications</p>
      </div>

      <!-- Stats -->
      <div class="stats-section" v-if="stats">
        <div class="stat-card" v-for="stat in statItems" :key="stat.label" :class="stat.class">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
        <p>Loading your applications...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button @click="loadApplications" class="btn-retry">
          Try Again
        </button>
      </div>

      <!-- Applications List -->
      <div v-else-if="applications.length > 0" class="applications-list">
        <div 
          v-for="app in applications" 
          :key="app.id" 
          class="application-card"
          :class="`status-${app.status}`"
        >
          <div class="application-header">
            <div class="job-info">
              <h3 class="job-title">{{ app.position }}</h3>
              <p class="company-name">{{ app.company_name }}</p>
              <div class="job-meta">
                <span class="job-location">{{ app.location }}</span>
                <span class="job-salary">{{ app.salary_range }}</span>
                <span class="job-type">{{ app.contract_type }}</span>
              </div>
            </div>
            <div class="status-badge" :class="`status-${app.status}`">
              {{ getStatusLabel(app.status) }}
            </div>
          </div>

          <div class="application-details">
            <div class="detail-row">
              <span class="detail-label">Applied on:</span>
              <span class="detail-value">{{ formatDate(app.application_date) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Last update:</span>
              <span class="detail-value">{{ formatDate(app.last_update) }}</span>
            </div>
            <div v-if="app.cover_letter" class="cover-letter">
              <p><strong>Cover Letter:</strong></p>
              <p>{{ app.cover_letter }}</p>
            </div>
          </div>

          <div class="application-actions">
            <button @click="viewJobDetails(app.job_id)" class="btn-view">
              View Job Details
            </button>
            <button @click="withdrawApplication(app.id)" class="btn-withdraw">
              Withdraw Application
            </button>
          </div>
        </div>
      </div>

      <!-- No Applications -->
      <div v-else class="no-applications">
        <div class="empty-state">
          <h2>No applications yet</h2>
          <p>You haven't applied to any jobs yet. Start your job search now!</p>
          <router-link to="/jobsearch" class="btn-primary">
            Browse Jobs
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { jobApplications } from '../services/api';

const router = useRouter();
const authStore = useAuthStore();

const applications = ref([]);
const stats = ref(null);
const loading = ref(false);
const error = ref('');

// Charger les candidatures
const loadApplications = async () => {
  if (!authStore.isAuthenticated || authStore.user.account_type !== 'candidate') {
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const [applicationsResponse, statsResponse] = await Promise.all([
      jobApplications.getApplications(),
      jobApplications.getApplicationStats()
    ]);

    applications.value = applicationsResponse.data;
    stats.value = statsResponse.data;
  } catch (err) {
    console.error('Error loading applications:', err);
    error.value = err.response?.data?.error || 'Failed to load applications';
  } finally {
    loading.value = false;
  }
};

// Statistiques formatées
const statItems = computed(() => {
  if (!stats.value) return [];
  
  return [
    { label: 'Total Applications', value: stats.value.total, class: 'stat-total' },
    { label: 'Pending', value: stats.value.pending, class: 'stat-pending' },
    { label: 'Under Review', value: stats.value.reviewed, class: 'stat-reviewed' },
    { label: 'Accepted', value: stats.value.accepted, class: 'stat-accepted' },
    { label: 'Rejected', value: stats.value.rejected, class: 'stat-rejected' }
  ];
});

// Retirer une candidature
const withdrawApplication = async (applicationId) => {
  if (!confirm('Are you sure you want to withdraw this application?')) {
    return;
  }

  try {
    await jobApplications.deleteApplication(applicationId);
    // Recharger la liste
    await loadApplications();
  } catch (err) {
    console.error('Error withdrawing application:', err);
    alert(err.response?.data?.error || 'Failed to withdraw application');
  }
};

// Voir les détails du job
const viewJobDetails = (jobId) => {
  router.push(`/jobs/${jobId}`);
};

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Libellé du statut
const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    reviewed: 'Under Review',
    accepted: 'Accepted',
    rejected: 'Rejected'
  };
  return labels[status] || status;
};

onMounted(() => {
  loadApplications();
});
</script>
