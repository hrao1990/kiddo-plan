<template>
  <div class="space-y-4 md:space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl md:text-2xl font-bold">{{ t('presets.title') }}</h1>
      <button
        @click="showForm = true; editingPreset = null; formName = ''; formScore = 10; formCategory = 'custom'"
        class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium active:scale-95"
      >
        {{ t('presets.add') }}
      </button>
    </div>

    <div v-if="showForm" class="bg-white p-4 md:p-6 rounded-lg shadow">
      <h3 class="font-semibold mb-4">{{ editingPreset ? t('presets.edit') : t('presets.add') }}</h3>
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('presets.name') }}</label>
          <input
            v-model="formName"
            required
            class="w-full px-3 py-3 border border-gray-300 rounded-md text-base"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('presets.score') }}</label>
          <input
            v-model.number="formScore"
            type="number"
            required
            class="w-full px-3 py-3 border border-gray-300 rounded-md text-base mb-2"
          />
          <div class="flex space-x-2">
            <button type="button" @click="formScore = Math.abs(formScore || 10)" class="flex-1 py-3 bg-green-100 text-green-700 rounded-md text-sm font-medium active:scale-95">
              {{ t('presets.positive') }}
            </button>
            <button type="button" @click="formScore = -Math.abs(formScore || 10)" class="flex-1 py-3 bg-red-100 text-red-700 rounded-md text-sm font-medium active:scale-95">
              {{ t('presets.negative') }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('presets.category') }}</label>
          <select
            v-model="formCategory"
            class="w-full px-3 py-3 border border-gray-300 rounded-md text-base"
          >
            <option value="homework">{{ t('presets.categories.homework') }}</option>
            <option value="chore">{{ t('presets.categories.chore') }}</option>
            <option value="behavior">{{ t('presets.categories.behavior') }}</option>
            <option value="exchange">{{ t('presets.categories.exchange') }}</option>
            <option value="custom">{{ t('presets.categories.custom') }}</option>
          </select>
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
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-4 py-3 bg-green-50 font-semibold text-green-800 text-sm">{{ t('presets.positive') }}</div>
        <ul class="divide-y divide-gray-100">
          <li v-for="p in positivePresets" :key="p.id" class="px-4 py-3 flex justify-between items-center">
            <div class="min-w-0 flex-1">
              <span class="font-medium text-sm">{{ p.name }}</span>
              <span class="text-xs text-gray-400 ml-2">{{ t(`presets.categories.${p.category}`) }}</span>
            </div>
            <div class="flex items-center space-x-1 ml-2">
              <span class="text-green-600 font-medium text-sm">+{{ p.score }}</span>
              <button @click="startEdit(p)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="handleDelete(p.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </li>
          <li v-if="positivePresets.length === 0" class="px-4 py-6 text-gray-500 text-sm text-center">{{ t('dashboard.noData') }}</li>
        </ul>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-4 py-3 bg-red-50 font-semibold text-red-800 text-sm">{{ t('presets.negative') }}</div>
        <ul class="divide-y divide-gray-100">
          <li v-for="p in negativePresets" :key="p.id" class="px-4 py-3 flex justify-between items-center">
            <div class="min-w-0 flex-1">
              <span class="font-medium text-sm">{{ p.name }}</span>
              <span class="text-xs text-gray-400 ml-2">{{ t(`presets.categories.${p.category}`) }}</span>
            </div>
            <div class="flex items-center space-x-1 ml-2">
              <span class="text-red-600 font-medium text-sm">{{ p.score }}</span>
              <button @click="startEdit(p)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="handleDelete(p.id)" class="p-2 text-red-500 hover:bg-red-50 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </li>
          <li v-if="negativePresets.length === 0" class="px-4 py-6 text-gray-500 text-sm text-center">{{ t('dashboard.noData') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import request from '@/utils/request'

const { t } = useI18n()

interface Preset {
  id: number
  name: string
  score: number
  category: string
}

const presets = ref<Preset[]>([])
const showForm = ref(false)
const editingPreset = ref<Preset | null>(null)
const formName = ref('')
const formScore = ref(10)
const formCategory = ref('custom')

const positivePresets = computed(() => presets.value.filter(p => p.score > 0))
const negativePresets = computed(() => presets.value.filter(p => p.score < 0))

async function fetchPresets() {
  const data = await request.get('/presets') as { presets: Preset[] }
  presets.value = data.presets
}

function startEdit(preset: Preset) {
  editingPreset.value = preset
  formName.value = preset.name
  formScore.value = preset.score
  formCategory.value = preset.category
  showForm.value = true
}

async function handleSave() {
  const payload = { name: formName.value, score: formScore.value, category: formCategory.value }
  if (editingPreset.value) {
    await request.put(`/presets/${editingPreset.value.id}`, payload)
  } else {
    await request.post('/presets', payload)
  }
  showForm.value = false
  await fetchPresets()
}

async function handleDelete(id: number) {
  if (confirm(t('presets.confirmDelete'))) {
    await request.delete(`/presets/${id}`)
    await fetchPresets()
  }
}

onMounted(fetchPresets)
</script>
