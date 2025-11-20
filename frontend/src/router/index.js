import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../components/MainPage.vue'
import RegisterForm from '../components/RegisterForm.vue'
import Login from '../components/Login.vue'

const routes = [
  { path: '/', redirect: '/mainpage' },
  { path: '/mainpage', component: MainPage },
  { path: '/register', component: RegisterForm },
  { path: '/login', component: Login },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
