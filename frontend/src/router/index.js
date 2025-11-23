import { createRouter, createWebHistory } from 'vue-router'

import MainPage from '../components/MainPage.vue'
import RegisterForm from "../components/RegisterForm.vue"
import Login from '../components/Login.vue'
import FormCandidate from "../components/FormCandidate.vue";
import FormRecruiter from "../components/FormRecruiter.vue";
import ProfilCandidat from '../components/ProfilCandidate.vue'
import ProfilRecruiter from '../components/ProfilRecruiter.vue'
import JobSearch from '../components/JobSearch.vue'

const routes = [
  { path: '/', redirect: '/mainpage' },
  { path: '/mainpage', component: MainPage },
  { path: '/register', component: RegisterForm },
  { path: '/login', component: Login },
  { path: "/form-candidate", component: FormCandidate, meta: { requiresAuth: true } },
  { path: "/form-recruiter", component: FormRecruiter, meta: { requiresAuth: true } },

  { path: "/profil-c", component: ProfilCandidat, meta: { requiresAuth: true } },
  { path: "/profil-r", component: ProfilRecruiter, meta: { requiresAuth: true } },

  { path: '/jobsearch', name: 'JobSearch', component: JobSearch },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
