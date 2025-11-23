import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MainPage from '../components/MainPage.vue'
import RegisterForm from '../components/RegisterForm.vue'
import Login from '../components/Login.vue'
import ProfilCandidat from '../components/ProfilCandidate.vue'
import ProfilRecruiter from '../components/ProfilRecruiter.vue'
import JobSearch from '../components/JobSearch.vue'

const routes = [
  { path: '/', redirect: '/mainpage' },
  { path: '/mainpage', component: MainPage },
  { path: '/register', component: RegisterForm },
  { path: '/login', component: Login },
  { path: '/profil-c', component: ProfilCandidat, meta: { requiresAuth: true, role: 'candidate' } },
  { path: '/profil-r', component: ProfilRecruiter, meta: { requiresAuth: true, role: 'recruiter' } },
  { path: '/jobsearch', name: 'JobSearch', component: JobSearch },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
