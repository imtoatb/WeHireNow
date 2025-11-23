import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MainPage from '../components/MainPage.vue'
import RegisterForm from '../components/RegisterForm.vue'
import Login from '../components/Login.vue'
import ProfilCandidat from '../components/ProfilCandidate.vue'
import ProfilRecruiter from '../components/ProfilRecruiter.vue'

const routes = [
  { path: '/', redirect: '/mainpage' },
  { path: '/mainpage', component: MainPage },
  { path: '/register', component: RegisterForm },
  { path: '/login', component: Login },
  { path: '/profil-c', component: ProfilCandidat, meta: { requiresAuth: true, role: 'candidate' } },
  { path: '/profil-r', component: ProfilRecruiter, meta: { requiresAuth: true, role: 'recruiter' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.user) {
    return next("/login");
  }

  if (to.meta.role && auth.user?.account_type !== to.meta.role) {
    return next("/mainpage"); // ou une page /unauthorized
  }

  next();
});



export default router
