<template>
  <div class="space-y-4 md:space-y-6">
    <h1 class="text-xl md:text-2xl font-bold">{{ t('admin.users') }}</h1>

    <div v-if="auth.user?.role === 'admin'" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('admin.username') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">{{ t('admin.role') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('admin.status') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">{{ t('admin.createdAt') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('admin.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="u in users" :key="u.id">
              <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ u.username }}</td>
              <td class="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                <span
                  :class="u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'"
                  class="px-2 py-1 rounded-full text-xs"
                >
                  {{ u.role }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">
                <span
                  :class="u.is_disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                  class="px-2 py-1 rounded-full text-xs"
                >
                  {{ u.is_disabled ? t('admin.disable') : t('admin.enable') }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{{ formatDate(u.created_at) }}</td>
              <td class="px-4 py-3 text-sm">
                <div class="flex space-x-1">
                  <button
                    @click="openResetPassword(u)"
                    class="p-2 text-orange-600 hover:bg-orange-50 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center"
                    :title="t('admin.resetPassword')"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </button>
                  <button
                    v-if="u.role !== 'admin'"
                    @click="handleToggle(u)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <svg v-if="!u.is_disabled" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    v-if="u.role !== 'admin'"
                    @click="handleDelete(u)"
                    class="p-2 text-red-500 hover:bg-red-50 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="bg-white p-4 md:p-6 rounded-lg shadow">
      <h2 class="text-lg font-semibold mb-4">{{ t('admin.changePassword') }}</h2>
      <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-sm">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.currentPassword') }}</label>
          <input
            v-model="passwordForm.oldPassword"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.newPassword') }}</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            required
            autocomplete="new-password"
            class="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="passwordForm.newPassword" class="text-xs mt-1" :class="checkPasswordStrength(passwordForm.newPassword) >= 2 ? 'text-green-600' : 'text-red-500'">
            {{ t('auth.passwordHint') }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.confirmPassword') }}</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            class="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword" class="text-red-500 text-xs mt-1">
            {{ t('auth.passwordMismatch') }}
          </p>
        </div>
        <p v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</p>
        <p v-if="passwordSuccess" class="text-green-500 text-sm">{{ passwordSuccess }}</p>
        <button
          type="submit"
          :disabled="passwordLoading || !canChangePassword"
          class="w-full py-3 px-4 bg-blue-600 text-white rounded-md text-base font-medium active:scale-95 disabled:opacity-50"
        >
          {{ passwordLoading ? t('common.loading') : t('admin.updatePassword') }}
        </button>
      </form>
    </div>

    <div v-if="showResetModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 class="text-lg font-semibold mb-4">{{ t('admin.resetPasswordFor', { username: resetTarget?.username }) }}</h3>
        <div class="space-y-3">
          <input
            v-model="resetPassword"
            type="password"
            :placeholder="t('admin.newPassword')"
            class="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="resetPassword" class="text-xs mt-1" :class="checkPasswordStrength(resetPassword) >= 2 ? 'text-green-600' : 'text-red-500'">
            {{ t('auth.passwordHint') }}
          </p>
          <input
            v-model="resetConfirmPassword"
            type="password"
            :placeholder="t('auth.confirmPassword')"
            class="w-full px-3 py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="resetPassword && resetConfirmPassword && resetConfirmPassword !== resetPassword" class="text-red-500 text-xs">
            {{ t('auth.passwordMismatch') }}
          </p>
          <p v-if="resetError" class="text-red-500 text-sm">{{ resetError }}</p>
          <div class="flex space-x-2">
            <button
              @click="showResetModal = false"
              class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-md text-base font-medium active:scale-95"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="handleResetPassword"
              :disabled="resetLoading || !canResetPassword"
              class="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md text-base font-medium active:scale-95 disabled:opacity-50"
            >
              {{ resetLoading ? t('common.loading') : t('common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import request from '@/utils/request'
import { formatDate } from '@/utils/date'

const { t } = useI18n()
const auth = useAuthStore()

interface User {
  id: number
  username: string
  role: string
  is_disabled: number
  created_at: string
}

const users = ref<User[]>([])

const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

function checkPasswordStrength(pw: string): number {
  let types = 0
  if (/[a-z]/.test(pw)) types++
  if (/[A-Z]/.test(pw)) types++
  if (/[0-9]/.test(pw)) types++
  if (/[^a-zA-Z0-9]/.test(pw)) types++
  return types
}

const canChangePassword = computed(() => {
  return passwordForm.value.oldPassword
    && passwordForm.value.newPassword
    && passwordForm.value.newPassword.length >= 8
    && checkPasswordStrength(passwordForm.value.newPassword) >= 2
    && passwordForm.value.confirmPassword === passwordForm.value.newPassword
})

const showResetModal = ref(false)
const resetTarget = ref<User | null>(null)
const resetPassword = ref('')
const resetConfirmPassword = ref('')
const resetLoading = ref(false)
const resetError = ref('')

const canResetPassword = computed(() => {
  return resetPassword.value
    && resetPassword.value.length >= 8
    && checkPasswordStrength(resetPassword.value) >= 2
    && resetConfirmPassword.value === resetPassword.value
})

async function fetchUsers() {
  const data = await request.get('/admin/users') as { users: User[] }
  users.value = data.users
}

async function handleToggle(u: User) {
  if (confirm(t('admin.confirmToggle'))) {
    await request.put(`/admin/users/${u.id}/toggle`)
    await fetchUsers()
  }
}

async function handleDelete(u: User) {
  if (confirm(t('admin.confirmDelete'))) {
    await request.delete(`/admin/users/${u.id}`)
    await fetchUsers()
  }
}

function openResetPassword(u: User) {
  resetTarget.value = u
  resetPassword.value = ''
  resetConfirmPassword.value = ''
  resetError.value = ''
  showResetModal.value = true
}

async function handleResetPassword() {
  if (!resetTarget.value || !canResetPassword.value) return
  resetLoading.value = true
  resetError.value = ''
  try {
    await request.put(`/admin/users/${resetTarget.value.id}/reset-password`, {
      newPassword: resetPassword.value,
    })
    showResetModal.value = false
  } catch (e: unknown) {
    const msg = (e as { message?: string }).message
    resetError.value = msg || t('common.error')
  } finally {
    resetLoading.value = false
  }
}

async function handleChangePassword() {
  if (!canChangePassword.value) return
  passwordLoading.value = true
  passwordError.value = ''
  passwordSuccess.value = ''
  try {
    await request.put('/auth/password', {
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    })
    passwordSuccess.value = t('admin.passwordUpdateSuccess')
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch (e: unknown) {
    const msg = (e as { message?: string }).message
    if (msg === 'Old password is incorrect') {
      passwordError.value = t('admin.wrongPassword')
    } else {
      passwordError.value = msg || t('common.error')
    }
  } finally {
    passwordLoading.value = false
  }
}

onMounted(async () => {
  if (auth.user?.role === 'admin') {
    await fetchUsers()
  }
})
</script>
