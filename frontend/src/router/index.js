import { createRouter, createWebHistory } from 'vue-router'
import RegisterForm from '../components/RegisterForm.vue'
import Login from '../pages/Login.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/register', component: RegisterForm },
  { path: '/login', component: Login },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
