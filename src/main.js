import { createApp } from 'vue'
import App from './App.vue'
import { registerSW } from 'virtual:pwa-register'

const app = createApp(App)
app.mount('#app')

// Enregistrement du service worker avec Vite PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Gérer la mise à jour si nécessaire
    console.log('Nouvelle version disponible')
  },
  onOfflineReady() {
    // L'app est prête à fonctionner hors ligne
    console.log('App prête pour le mode hors ligne')
  },
}) 