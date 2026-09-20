<template>
  <div class="space-y-4 md:space-y-6">
    <h1 class="text-xl md:text-2xl font-bold">{{ t('points.title') }}</h1>

    <div class="bg-white p-4 md:p-6 rounded-lg shadow">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('points.selectChild') }}</label>
        <select
          v-model="childrenStore.currentChildId"
          class="w-full px-3 py-3 border border-gray-300 rounded-md text-base"
        >
          <option v-for="c in childrenStore.children" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div class="space-y-4">
        <div class="flex rounded-lg overflow-hidden border border-gray-200">
          <button
            @click="mode = 'preset'"
            class="flex-1 py-3 text-sm font-medium"
            :class="mode === 'preset' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
          >
            {{ t('points.preset') }}
          </button>
          <button
            @click="mode = 'custom'"
            class="flex-1 py-3 text-sm font-medium"
            :class="mode === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
          >
            {{ t('points.custom') }}
          </button>
        </div>

        <div v-if="mode === 'preset'" class="grid grid-cols-2 gap-2">
          <button
            v-for="p in presets"
            :key="p.id"
            @click="selectedPreset = p"
            class="p-3 rounded-lg border text-left active:scale-95 transition-transform"
            :class="selectedPreset?.id === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
          >
            <div class="font-medium text-sm">{{ p.name }}</div>
            <div :class="p.score > 0 ? 'text-green-600' : 'text-red-600'" class="text-sm mt-1">
              {{ p.score > 0 ? '+' : '' }}{{ p.score }}
            </div>
          </button>
        </div>

        <div v-else class="space-y-3">
          <input
            v-model="customName"
            :placeholder="t('points.projectName')"
            class="w-full px-3 py-3 border border-gray-300 rounded-md text-base"
          />
          <input
            v-model.number="customScore"
            type="number"
            :placeholder="t('points.scoreValue')"
            class="w-full px-3 py-3 border border-gray-300 rounded-md text-base"
          />
          <div class="flex space-x-2">
            <button
              @click="customScore = Math.abs(customScore || 10)"
              class="flex-1 py-3 bg-green-100 text-green-700 rounded-md text-sm font-medium active:scale-95"
            >
              {{ t('points.addScore') }}
            </button>
            <button
              @click="customScore = -Math.abs(customScore || 10)"
              class="flex-1 py-3 bg-red-100 text-red-700 rounded-md text-sm font-medium active:scale-95"
            >
              {{ t('points.subScore') }}
            </button>
          </div>
        </div>

        <div v-if="mode === 'preset' && selectedPreset" class="bg-gray-50 p-3 rounded-lg text-sm">
          {{ selectedPreset.name }}:
          <span :class="selectedPreset.score > 0 ? 'text-green-600' : 'text-red-600'" class="font-medium"
            >{{ selectedPreset.score > 0 ? '+' : '' }}{{ selectedPreset.score }}</span
          >
        </div>

        <input
          v-model="note"
          :placeholder="t('points.note')"
          class="w-full px-3 py-3 border border-gray-300 rounded-md text-base"
        />

        <button
          @click="handleSubmit"
          :disabled="!canSubmit || loading"
          class="w-full py-3 px-4 bg-blue-600 text-white rounded-md text-base font-medium active:scale-95 disabled:opacity-50"
        >
          {{ loading ? t('common.loading') : t('points.add') }}
        </button>
      </div>
    </div>

    <div class="bg-white p-4 md:p-6 rounded-lg shadow">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold">{{ t('points.history') }}</h3>
        <div @click="openDatePicker">
          <input
            ref="dateInput"
            v-model="selectedDate"
            type="date"
            class="px-3 py-1.5 border border-gray-300 rounded-md text-sm cursor-pointer"
          />
        </div>
      </div>
      <div v-if="records.length === 0 && !loadingMore" class="text-gray-500 text-sm py-4 text-center">{{ t('dashboard.noData') }}</div>
      <ul v-else class="divide-y divide-gray-100">
        <li v-for="r in records" :key="r.id" class="py-3 flex justify-between items-center">
          <div class="min-w-0 flex-1">
            <div class="text-sm truncate">
              <span class="font-medium">{{ r.name }}</span>
              <span v-if="r.note" class="text-gray-400 text-xs ml-2">{{ r.note }}</span>
            </div>
            <div class="text-gray-400 text-xs mt-0.5">{{ formatTime(r.created_at) }}</div>
          </div>
          <div class="flex items-center space-x-2 ml-2">
            <span :class="r.score > 0 ? 'text-green-600' : 'text-red-600'" class="font-medium text-sm">
              {{ r.score > 0 ? '+' : '' }}{{ r.score }}
            </span>
            <button
              @click="handleDelete(r.id)"
              class="text-red-400 hover:text-red-600 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </li>
      </ul>
      <div v-if="loadingMore" class="text-gray-400 text-sm py-3 text-center">{{ t('common.loading') }}</div>
      <div v-else-if="noMore && records.length > 0" class="text-gray-400 text-xs py-3 text-center">{{ t('points.noMore') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChildrenStore } from '@/stores/children'
import request from '@/utils/request'

const { t } = useI18n()
const childrenStore = useChildrenStore()

const mode = ref<'preset' | 'custom'>('preset')
const presets = ref<{ id: number; name: string; score: number }[]>([])
const selectedPreset = ref<{ id: number; name: string; score: number } | null>(null)
const customName = ref('')
const customScore = ref(10)
const note = ref('')
const loading = ref(false)
const records = ref<{ id: number; name: string; score: number; note: string; created_at: string }[]>([])

const today = new Date().toISOString().slice(0, 10)
const selectedDate = ref(today)
const dateInput = ref<HTMLInputElement | null>(null)
const page = ref(1)
const loadingMore = ref(false)
const noMore = ref(false)

function openDatePicker() {
  nextTick(() => {
    dateInput.value?.showPicker()
  })
}

const canSubmit = computed(() => {
  if (!childrenStore.currentChildId) return false
  if (mode.value === 'preset') return !!selectedPreset.value
  return !!customName.value && customScore.value !== 0
})

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

async function fetchPresets() {
  const data = (await request.get('/presets')) as { presets: { id: number; name: string; score: number }[] }
  presets.value = data.presets
}

async function fetchRecords(reset = true) {
  if (!childrenStore.currentChildId) return
  if (reset) {
    page.value = 1
    records.value = []
    noMore.value = false
  }

  if (noMore.value && !reset) return
  loadingMore.value = true

  try {
    const data = (await request.get('/points', {
      params: {
        child_id: childrenStore.currentChildId,
        date_from: selectedDate.value,
        date_to: selectedDate.value,
        page: page.value,
        pageSize: 20,
      },
    })) as { records: { id: number; name: string; score: number; note: string; created_at: string }[] }

    if (reset) {
      records.value = data.records
    } else {
      records.value.push(...data.records)
    }

    if (data.records.length < 20) {
      noMore.value = true
    } else {
      page.value++
    }
  } finally {
    loadingMore.value = false
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    const payload: Record<string, unknown> = {
      child_id: childrenStore.currentChildId,
      note: note.value,
    }
    if (mode.value === 'preset' && selectedPreset.value) {
      payload.preset_id = selectedPreset.value.id
      payload.name = selectedPreset.value.name
      payload.score = selectedPreset.value.score
    } else {
      payload.name = customName.value
      payload.score = customScore.value
    }
    await request.post('/points', payload)
    note.value = ''
    customName.value = ''
    selectedPreset.value = null
    await fetchRecords(true)
    await childrenStore.fetchChildren()
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: number) {
  await request.delete(`/points/${id}`)
  await fetchRecords(true)
  await childrenStore.fetchChildren()
}

function handleScroll() {
  const el = document.documentElement
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
    if (!loadingMore.value && !noMore.value) {
      fetchRecords(false)
    }
  }
}

onMounted(async () => {
  await childrenStore.fetchChildren()
  await fetchPresets()
  await fetchRecords(true)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(() => childrenStore.currentChildId, () => fetchRecords(true))
watch(selectedDate, () => fetchRecords(true))
</script>
