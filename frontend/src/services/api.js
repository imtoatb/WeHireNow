import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8085/api',
  withCredentials: true, // pour gérer les cookies de session
});

export default api;
