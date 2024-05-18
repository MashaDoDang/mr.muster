import { createRouter, createWebHistory } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import LandingPage from '@/components/LandingPage.vue';
import ViewPost from '@/components/ViewPost.vue';
import UserProfile from '@/components/UserProfile.vue';
import CreateGrid from '@/components/CreateGrid.vue';

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage },
  // Add other routes as needed
  { path: '/AppHeader', name: 'AppHeader', component: AppHeader },
  { path: '/view-post', name: 'ViewPost', component: ViewPost },
  { path: '/view-post/:id', name: 'ViewPost', component: ViewPost },
  { path: '/user-profile/:id', name: 'UserProfile', component: UserProfile },
  { path: '/create', name: 'CreatePost', component: CreateGrid },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
