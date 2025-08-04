import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import Dashboard from '../components/Dashboard.vue'
import NotFound from '../components/NotFound.vue'
import PublicPool from '../components/PublicPool.vue';
import GiftLunch from '../components/GiftLunch.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/gift-lunch',
      name: 'gift-lunch',
      component: GiftLunch,
      meta: { requiresAuth: true }
    },
    {
      path: '/public-pool',
      name: 'public-pool',
      component: PublicPool,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound
    } // Catch-all
  ]
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('is_authenticated')) {
    // Redirect to login if trying to access protected route without authentication
    next({ name: 'login' })
  } else {
    // Allow navigation
    next()
  }
})

export default router
