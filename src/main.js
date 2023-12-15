import { createApp } from 'vue'
import { createVuetify } from 'vuetify'

import App from './App.vue'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'

const vuetify = createVuetify({
  components,
})

const app = createApp(App)

app.use(vuetify).mount('#app')
