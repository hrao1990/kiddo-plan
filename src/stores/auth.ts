import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

interface User {
  id: number
  username: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  async function login(username: string, password: string) {
    const data = await request.post('/auth/login', { username, password }) as { token: string; user: User }
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
  }

  async function register(username: string, password: string) {
    await request.post('/auth/register', { username, password })
  }

  async function fetchMe() {
    if (!token.value) return false
    try {
      const data = await request.get('/auth/me') as { user: User }
      user.value = data.user
      return true
    } catch {
      return false
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, isLoggedIn, login, register, fetchMe, logout }
})
