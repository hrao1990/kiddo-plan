<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm">
      <div class="bg-white p-6 md:p-8 rounded-lg shadow">
        <h2 class="text-xl md:text-2xl font-bold text-center mb-6">{{ t('auth.loginTitle') }}</h2>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.username') }}</label>
            <input
              v-model="username"
              type="text"
              required
              autocomplete="username"
              class="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.password') }}</label>
            <input
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-blue-600 text-white rounded-md text-base font-medium active:scale-95 disabled:opacity-50"
          >
            {{ loading ? t('common.loading') : t('auth.login') }}
          </button>
        </form>
        <p class="mt-4 text-center text-sm text-gray-600">
          {{ t('auth.noAccount') }}
          <router-link to="/register" class="text-blue-600 hover:underline">{{ t('auth.register') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(username.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (e: unknown) {
    const msg = (e as { message?: string }).message
    error.value = msg || t('common.error')
  } finally {
    loading.value = false
  }
}
</script>
