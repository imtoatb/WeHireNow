import axios from 'axios';

// Configure l'URL de ton backend
const api = axios.create({
  baseURL: 'http://localhost:8085/api',
  withCredentials: true, // pour gérer les cookies de session
});

// Fonctions pour les candidatures
export const jobApplications = {
  // Créer une candidature
  createApplication: (jobId, coverLetter = null) => 
    api.post('/applications', { jobId, coverLetter }),

  // Récupérer toutes les candidatures
  getApplications: () => 
    api.get('/applications'),

  // Récupérer les statistiques
  getApplicationStats: () => 
    api.get('/applications/stats'),

  // Récupérer une candidature spécifique
  getApplication: (id) => 
    api.get(`/applications/${id}`),

  // Mettre à jour une candidature
  updateApplication: (id, status) => 
    api.put(`/applications/${id}`, { status }),

  // Supprimer une candidature
  deleteApplication: (id) => 
    api.delete(`/applications/${id}`)
};

// Exporter par défaut l'instance axios pour les autres appels
export default api;