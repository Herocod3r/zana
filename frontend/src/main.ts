import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useThemeStore } from './stores/theme'

import './styles/tokens.css'
import './styles/fonts.css'
import './styles/reset.css'
import './styles/globals.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

useThemeStore(pinia).init()

app.mount('#app')

// HMR: dispose the theme store's media-query listener when Vite hot-reloads.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    useThemeStore().dispose()
  })
}
