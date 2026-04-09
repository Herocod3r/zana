import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './styles/tokens.css'
import './styles/fonts.css'
import './styles/reset.css'
import './styles/globals.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
