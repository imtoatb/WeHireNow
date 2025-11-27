import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8085/api',
  withCredentials: true, // for session cookies
});

export default api;