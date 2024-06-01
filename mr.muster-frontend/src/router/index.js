import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '@/firebase'; // import firebase auth
import { getDoc, doc } from 'firebase/firestore'; // import firestore methods
import { db } from '@/firebase'; // import firestore instance
import AppHeader from '@/components/AppHeader.vue';
import LandingPage from '@/components/LandingPage.vue';
import ViewPost from '@/components/ViewPost.vue';
import UserProfile from '@/components/UserProfile.vue';
import CreateGrid from '@/components/CreateGrid.vue';
import AdminPage from '@/components/AdminPage.vue';
import NotFound from '@/components/NotFound.vue';

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage },
  // Add other routes as needed
  { path: '/AppHeader', name: 'AppHeader', component: AppHeader },
  { path: '/view-post', name: 'ViewPost', component: ViewPost },
  { path: '/view-post/:id', name: 'ViewPost', component: ViewPost },
  { path: '/user-profile/:id', name: 'UserProfile', component: UserProfile },
  { path: '/create', name: 'CreatePost', component: CreateGrid },
  { path: '/admin-page', name: 'AdminPage', component: AdminPage, meta: { requiresAdmin: true } }, // add meta property
  {path: '/user-profile/:pathName(.*)*', name: 'NotFound', component: NotFound},
  { path: '/:pathName(.*)', name: 'NotFound', component: NotFound },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  if (requiresAdmin) {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      if (userData && userData.isAdmin) {
        next();
      } else {
        next({ name: 'LandingPage' }); // redirect to landing page if user is not an admin
        alert('You do not have permission to access this page');
      }
    } else {
      next({ name: 'LandingPage' }); // redirect to landing page if user is not logged in
      alert('You do not have permission to access this page');
    }
  } else {
    next();
  }
});

export default router;
