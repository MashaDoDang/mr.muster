import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import Register from '../views/RegisterView.vue';
import HelloWorld from '@/components/HelloWorld.vue';

const routes = [
  { path: '/', component: HelloWorld },
  { path: '/login', component: LoginView },
  { path: '/register', component: Register },
  // Add other routes as needed
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
