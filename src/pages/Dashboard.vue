<template>
  <div class="space-y-4 md:space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl md:text-2xl font-bold">{{ t('dashboard.title') }}</h1>
      <select
        v-if="childrenStore.children.length"
        v-model="childrenStore.currentChildId"
        class="px-3 py-2 border border-gray-300 rounded-md text-sm max-w-[120px]"
      >
        <option v-for="c in childrenStore.children" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <div v-if="!childrenStore.children.length" class="text-center py-12 text-gray-500">
      {{ t('dashboard.noData') }} — {{ t('children.add') }}
    </div>

    <template v-else>
      <div class="grid grid-cols-2 gap-3 md:gap-4">
        <div v-for="card in statCards" :key="card.label" class="bg-white p-3 md:p-4 rounded-lg shadow text-center">
          <p class="text-xs md:text-sm text-gray-500">{{ card.label }}</p>
          <p class="text-xl md:text-2xl font-bold mt-1" :class="card.color">{{ card.value }}</p>
        </div>
      </div>

      <div class="bg-white p-3 md:p-4 rounded-lg shadow">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-sm md:text-base">{{ t('dashboard.trend') }}</h3>
          <div class="flex space-x-1">
            <button
              v-for="p in ['week', 'month']"
              :key="p"
              @click="trendPeriod = p"
              class="px-3 py-1 text-xs rounded"
              :class="trendPeriod === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
            >
              {{ t(`dashboard.${p}`) }}
            </button>
          </div>
        </div>
        <v-chart :option="trendOption" style="height: 180px" class="md:!h-[250px]" autoresize />
      </div>

      <div class="bg-white p-3 md:p-4 rounded-lg shadow">
        <h3 class="font-semibold text-sm md:text-base mb-3">{{ t('dashboard.breakdown') }}</h3>
        <v-chart :option="breakdownOption" style="height: 180px" class="md:!h-[250px]" autoresize />
      </div>

      <div v-if="childrenStore.children.length > 1" class="bg-white p-3 md:p-4 rounded-lg shadow">
        <h3 class="font-semibold text-sm md:text-base mb-3">{{ t('dashboard.ranking') }}</h3>
        <v-chart :option="rankingOption" style="height: 180px" class="md:!h-[250px]" autoresize />
      </div>

      <div class="bg-white p-3 md:p-4 rounded-lg shadow">
        <h3 class="font-semibold text-sm md:text-base mb-3">{{ t('dashboard.recentRecords') }}</h3>
        <div v-if="recentRecords.length === 0" class="text-gray-500 text-sm">{{ t('dashboard.noData') }}</div>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="r in recentRecords" :key="r.id" class="py-2.5 flex justify-between items-center text-sm">
            <div class="min-w-0 flex-1">
              <span class="font-medium truncate block">{{ r.name }}</span>
              <span class="text-gray-400 text-xs">{{ r.child_name }}</span>
            </div>
            <span :class="r.score > 0 ? 'text-green-600' : 'text-red-600'" class="font-medium ml-2">
              {{ r.score > 0 ? '+' : '' }}{{ r.score }}
            </span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useChildrenStore } from '@/stores/children'
import request from '@/utils/request'

use([CanvasRenderer, LineChart, PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const { t } = useI18n()
const childrenStore = useChildrenStore()

const trendPeriod = ref('week')
const overview = ref({ total: 0, today: 0, week: 0, month: 0 })
const trendData = ref<{ date: string; score: number }[]>([])
const breakdownData = ref<{ name: string; value: number }[]>([])
const recentRecords = ref<{ id: number; name: string; score: number; child_name: string }[]>([])

const statCards = computed(() => [
  { label: t('dashboard.totalScore'), value: overview.value.total, color: 'text-blue-600' },
  { label: t('dashboard.todayChange'), value: overview.value.today, color: overview.value.today >= 0 ? 'text-green-600' : 'text-red-600' },
  { label: t('dashboard.weekChange'), value: overview.value.week, color: overview.value.week >= 0 ? 'text-green-600' : 'text-red-600' },
  { label: t('dashboard.monthChange'), value: overview.value.month, color: overview.value.month >= 0 ? 'text-green-600' : 'text-red-600' },
])

const trendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 10, top: 10, bottom: 24 },
  xAxis: { type: 'category', data: trendData.value.map(d => d.date.slice(5)), axisLabel: { fontSize: 10 } },
  yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
  series: [{ data: trendData.value.map(d => d.score), type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, itemStyle: { color: '#3b82f6' }, symbolSize: 4 }],
}))

const breakdownOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie',
    radius: ['35%', '65%'],
    data: breakdownData.value,
    label: { show: true, fontSize: 10 },
  }],
}))

const rankingOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 10, top: 10, bottom: 24 },
  xAxis: { type: 'category', data: childrenStore.children.map(c => c.name), axisLabel: { fontSize: 10 } },
  yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
  series: [{ data: childrenStore.children.map(c => c.score), type: 'bar', itemStyle: { color: '#3b82f6' }, barWidth: '40%' }],
}))

async function fetchDashboard() {
  const childId = childrenStore.currentChildId
  if (!childId) return
  try {
    const [ov, tr, br, rc] = await Promise.all([
      request.get(`/dashboard/child/${childId}/overview`) as Promise<{ total: number; today: number; week: number; month: number }>,
      request.get(`/dashboard/child/${childId}/trend`, { params: { period: trendPeriod.value } }) as Promise<{ data: { date: string; score: number }[] }>,
      request.get(`/dashboard/child/${childId}/breakdown`) as Promise<{ data: { name: string; value: number }[] }>,
      request.get('/points', { params: { child_id: childId, pageSize: 10 } }) as Promise<{ records: { id: number; name: string; score: number; child_name: string }[] }>,
    ])
    overview.value = ov
    trendData.value = tr.data
    breakdownData.value = br.data
    recentRecords.value = rc.records
  } catch {
    // ignore
  }
}

onMounted(async () => {
  await childrenStore.fetchChildren()
  fetchDashboard()
})

watch(() => childrenStore.currentChildId, fetchDashboard)
watch(trendPeriod, fetchDashboard)
</script>
