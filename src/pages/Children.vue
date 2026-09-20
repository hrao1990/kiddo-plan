<template>
  <div class="space-y-4 md:space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl md:text-2xl font-bold">{{ t('children.title') }}</h1>
      <button
        v-if="childrenStore.children.length < maxChildren"
        @click="showForm = true; editingChild = null; formName = ''; formAvatar = ''"
        class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium active:scale-95"
      >
        {{ t('children.add') }}
      </button>
    </div>

    <div v-if="showForm" class="bg-white p-4 md:p-6 rounded-lg shadow">
      <h3 class="font-semibold mb-4">{{ editingChild ? t('children.edit') : t('children.add') }}</h3>
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('children.name') }}</label>
          <input
            v-model="formName"
            required
            class="w-full px-3 py-3 border border-gray-300 rounded-md text-base"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('children.avatar') }}</label>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="emoji in avatars"
              :key="emoji"
              type="button"
              @click="formAvatar = emoji"
              class="aspect-square text-2xl rounded-lg border-2 flex items-center justify-center active:scale-95 transition-transform"
              :class="formAvatar === emoji ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
        <div class="flex space-x-2">
          <button type="submit" class="flex-1 py-3 bg-blue-600 text-white rounded-md text-sm font-medium active:scale-95">
            {{ t('common.save') }}
          </button>
          <button type="button" @click="showForm = false" class="px-4 py-3 bg-gray-100 text-gray-600 rounded-md text-sm">
            {{ t('common.cancel') }}
          </button>
        </div>
      </form>
    </div>

    <div class="space-y-3">
      <div v-for="child in childrenStore.children" :key="child.id" class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-3xl">{{ child.avatar || '👦' }}</span>
            <div>
              <div class="font-semibold">{{ child.name }}</div>
              <div class="text-sm text-gray-500">{{ t('children.score') }}: <span class="font-medium text-blue-600">{{ child.score }}</span></div>
            </div>
          </div>
          <div class="flex space-x-1">
            <button @click="startEdit(child)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="handleDelete(child.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="childrenStore.children.length === 0" class="text-center py-12 text-gray-500">
      {{ t('dashboard.noData') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChildrenStore } from '@/stores/children'
import request from '@/utils/request'

const { t } = useI18n()
const childrenStore = useChildrenStore()

const avatars = [
  '👦', '👧', '👶', '🧒',
  '👦🏻', '👧🏻', '👶🏻', '🧒🏻',
  '👦🏼', '👧🏼', '👶🏼', '🧒🏼',
  '🦸‍♂️', '🦸‍♀️', '🧑‍🚀', '🧑‍🎓',
]

const showForm = ref(false)
const editingChild = ref<{ id: number; name: string; avatar: string | null } | null>(null)
const formName = ref('')
const formAvatar = ref('')
const maxChildren = ref(5)

onMounted(async () => {
  await childrenStore.fetchChildren()
  const config = await request.get('/config') as { maxChildrenPerUser: number }
  maxChildren.value = config.maxChildrenPerUser
})

function startEdit(child: { id: number; name: string; avatar: string | null }) {
  editingChild.value = child
  formName.value = child.name
  formAvatar.value = child.avatar || ''
  showForm.value = true
}

async function handleSave() {
  if (editingChild.value) {
    await childrenStore.updateChild(editingChild.value.id, formName.value, formAvatar.value || undefined)
  } else {
    await childrenStore.addChild(formName.value, formAvatar.value || undefined)
  }
  showForm.value = false
}

async function handleDelete(id: number) {
  if (confirm(t('children.confirmDelete'))) {
    await childrenStore.deleteChild(id)
  }
}
</script>
