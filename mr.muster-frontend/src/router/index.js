import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import Register from '../views/RegisterView.vue';
import HelloWorld from '@/components/HelloWorld.vue';
import Header from '@/components/Header.vue';
import LandingPage from '@/components/LandingPage.vue';
import ViewPost from '@/components/ViewPost.vue';
import UserProfile from '@/components/UserProfile.vue';

const routes = [
  { path: '/', component: HelloWorld },
  { path: '/login', component: LoginView },
  { path: '/register', component: Register },
  // Add other routes as needed
  {path: '/header', name: 'Header', component: Header},
  {path: '/landing-page', name: 'LandingPage', component: LandingPage},
  {path: '/view-post', name: 'ViewPost', component: ViewPost},
  {path: '/user-profile', name: 'UserProfile', component: UserProfile},
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
