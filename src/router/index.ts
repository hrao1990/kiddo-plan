import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Login.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/Register.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('@/pages/Layout.vue'),
      meta: { auth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/pages/Dashboard.vue'),
        },
        {
          path: 'points',
          name: 'points',
          component: () => import('@/pages/Points.vue'),
        },
        {
          path: 'children',
          name: 'children',
          component: () => import('@/pages/Children.vue'),
        },
        {
          path: 'presets',
          name: 'presets',
          component: () => import('@/pages/Presets.vue'),
        },
        {
          path: 'admin/users',
          name: 'admin-users',
          component: () => import('@/pages/admin/Users.vue'),
          meta: { admin: true },
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.auth && !auth.isLoggedIn) {
    return { name: 'login' }
  }
  if (auth.isLoggedIn && !auth.user) {
    const ok = await auth.fetchMe()
    if (!ok) {
      auth.logout()
      return { name: 'login' }
    }
  }
  if (to.meta.guest && auth.isLoggedIn) {
    return { name: 'dashboard' }
  }
  if (to.meta.admin && auth.user?.role !== 'admin') {
    return { name: 'dashboard' }
  }
})

export default router
