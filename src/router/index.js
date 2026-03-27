import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../components/LoginPage.vue'
import Dashboard from '../components/Dashboard.vue'
import AdminDashboard from '../components/AdminDashboard.vue'
import { getJWTToken } from '../utils/socket.js'

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
      path: '/admin',
      name: 'admin-dashboard',
      component: AdminDashboard,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

// Navigation guard — admin routes are always verified with the server so that
// setting a localStorage value cannot grant admin access.
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('auth_token')) {
    next({ name: 'login' })
    return
  }

  if (to.meta.requiresAdmin) {
    try {
      const token = getJWTToken() || localStorage.getItem('auth_token')
      const res = await fetch('/api/user-info', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      })
      if (!res.ok) throw new Error('not authenticated')
      const data = await res.json()
      if (!data.is_admin) {
        next({ name: 'dashboard' })
        return
      }
    } catch {
      next({ name: 'login' })
      return
    }
  }

  next()
})

export let loggingOut = false
export function setLoggingOut(val) { loggingOut = val }

export default router
