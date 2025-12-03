import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../components/MainPage.vue'
import RegisterForm from '../components/RegisterForm.vue'
import Login from '../components/Login.vue'
import JobSearch from '../components/JobSearch.vue'
import JobDetail from '../components/JobDetail.vue'
import FormCandidate from "../components/FormCandidate.vue"
import FormRecruiter from "../components/FormRecruiter.vue"
import ProfilCandidate from '../components/ProfilCandidate.vue'
import ProfilRecruiter from '../components/ProfilRecruiter.vue'
import AddJob from '../components/AddJob.vue'
import ShowJob from '../components/ShowJob.vue'
import JobApplication from '../components/JobApplication.vue'
import JobStats from "../components/JobStats.vue";

const routes = [
  { path: '/', redirect: '/mainpage' },
  { path: '/mainpage', component: MainPage },
  { path: '/register', component: RegisterForm },
  { path: '/login', component: Login },
  { path: '/jobsearch', name: 'JobSearch', component: JobSearch },
  { path: '/jobs/:id', name: 'JobDetail', component: JobDetail },
  { path: "/form-candidate", component: FormCandidate, meta: { requiresAuth: true } },
  { path: "/form-recruiter", component: FormRecruiter, meta: { requiresAuth: true } },
  { path: '/profil-c', component: ProfilCandidate, meta: { requiresAuth: true, role: 'candidate' } },
  { path: "/profil-r", component: ProfilRecruiter, meta: { requiresAuth: true, role: 'recruiter' } },
  { path: '/addjob', name: 'AddJob', component: AddJob },
  { path: '/showjob', name: 'ShowJob', component: ShowJob},
  { path: '/applications', name: 'JobApplication', component: JobApplication, meta: { requiresAuth: true, role: 'candidate' } },
  { path: '/job-stats/:id', name: 'JobStats', component: JobStats, meta: { requiresAuth: true, role: 'recruiter' } },

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  console.log('[router] navigating to', to.fullPath)
})

export default router