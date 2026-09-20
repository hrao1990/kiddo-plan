<template>
  <div class="space-y-4 md:space-y-6">
    <h1 class="text-xl md:text-2xl font-bold">{{ t('admin.users') }}</h1>

    <div class="bg-white rounded-lg shadow overflow-hidden">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import request from '@/utils/request'

const { t } = useI18n()

interface User {
  id: number
  username: string
  role: string
  is_disabled: number
  created_at: string
}

const users = ref<User[]>([])

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

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

onMounted(fetchUsers)
</script>
