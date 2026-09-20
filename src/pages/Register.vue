<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm">
      <div class="bg-white p-6 md:p-8 rounded-lg shadow">
        <h2 class="text-xl md:text-2xl font-bold text-center mb-6">{{ t('auth.registerTitle') }}</h2>
        <form @submit.prevent="handleRegister" class="space-y-4">
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
              autocomplete="new-password"
              class="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p v-if="password" class="text-xs mt-1" :class="passwordStrength >= 2 ? 'text-green-600' : 'text-red-500'">
              {{ t('auth.passwordHint') }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.confirmPassword') }}</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              autocomplete="new-password"
              class="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p v-if="confirmPassword && confirmPassword !== password" class="text-red-500 text-xs mt-1">
              {{ t('auth.passwordMismatch') }}
            </p>
          </div>
          <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
          <p v-if="success" class="text-green-500 text-sm">{{ success }}</p>
          <button
            type="submit"
            :disabled="loading || !canSubmit"
            class="w-full py-3 px-4 bg-blue-600 text-white rounded-md text-base font-medium active:scale-95 disabled:opacity-50"
          >
            {{ loading ? t('common.loading') : t('auth.register') }}
          </button>
        </form>
        <p class="mt-4 text-center text-sm text-gray-600">
          {{ t('auth.hasAccount') }}
          <router-link to="/login" class="text-blue-600 hover:underline">{{ t('auth.login') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const passwordStrength = computed(() => {
  let types = 0
  if (/[a-z]/.test(password.value)) types++
  if (/[A-Z]/.test(password.value)) types++
  if (/[0-9]/.test(password.value)) types++
  if (/[^a-zA-Z0-9]/.test(password.value)) types++
  return types
})

const canSubmit = computed(() => {
  return username.value.length > 0
    && password.value.length >= 8
    && passwordStrength.value >= 2
    && confirmPassword.value === password.value
})

async function handleRegister() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await auth.register(username.value, password.value)
    success.value = t('auth.registerSuccess')
    setTimeout(() => router.push({ name: 'login' }), 1500)
  } catch (e: unknown) {
    const msg = (e as { message?: string }).message
    error.value = msg || t('common.error')
  } finally {
    loading.value = false
  }
}
</script>
