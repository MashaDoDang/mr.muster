<<<<<<< HEAD
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index';
import 'bootstrap/dist/css/bootstrap.min.css';
=======
import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
>>>>>>> b692d6e4243c7a1ea6de9d632c8e4bd91467ee72

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

createApp(App).use(router).use(vuetify).mount('#app')