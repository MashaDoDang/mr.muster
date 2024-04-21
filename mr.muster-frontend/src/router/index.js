import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import Register from '../views/RegisterView.vue';
import AppHeader from '@/components/AppHeader.vue';
import LandingPage from '@/components/LandingPage.vue';
import ViewPost from '@/components/ViewPost.vue';
import UserProfile from '@/components/UserProfile.vue';

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage },
  { path: '/login', component: LoginView },
  { path: '/register', component: Register },
  // Add other routes as needed
  { path: '/AppHeader', name: 'AppHeader', component: AppHeader },
  { path: '/view-post', name: 'ViewPost', component: ViewPost },
  { path: '/user-profile', name: 'UserProfile', component: UserProfile },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
