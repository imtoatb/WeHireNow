import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'

// Création de l'application Vue
const app = createApp(App)

// Ajout de Pinia (store global)
app.use(createPinia())

// Ajout du router (navigation entre pages)
app.use(router)

// Montage de l'application dans index.html
app.mount('#app')
