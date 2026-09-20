<template>
  <div class="min-h-screen bg-gray-50 pb-20 md:pb-0">
    <nav class="bg-white shadow md:shadow-sm">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-12 md:h-14">
          <div class="flex items-center">
            <router-link to="/" class="text-lg md:text-xl font-bold text-blue-600">
              {{ t('app.title') }}
            </router-link>
          </div>
          <div class="flex items-center space-x-2">
            <button @click="toggleLang" class="px-2 py-1 text-xs rounded-md text-gray-600 hover:bg-gray-100">
              {{ locale === 'zh' ? 'EN' : '中文' }}
            </button>
            <span class="text-xs text-gray-500 hidden sm:inline">{{ auth.user?.username }}</span>
            <button @click="handleLogout" class="px-2 py-1 text-xs rounded-md text-red-600 hover:bg-red-50">
              {{ t('nav.logout') }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 pt-4 pb-24 md:pt-16 md:pb-6">
      <router-view />
    </main>

    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div class="flex justify-around items-center h-16">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center w-full h-full text-xs"
          :class="{ '!text-blue-600': isActive(item.to) }"
        >
          <component :is="item.icon" class="w-6 h-6 mb-1" />
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <nav class="hidden md:block fixed top-14 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex space-x-6">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="py-3 text-sm font-medium border-b-2"
          :class="isActive(item.to) ? '!text-blue-600 !border-blue-600' : 'text-gray-700 hover:text-blue-600 border-transparent'"
        >
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t, locale } = useI18n()
const router = useRouter()
const auth = useAuthStore()

function isActive(to: string) {
  if (to === '/') return router.currentRoute.value.path === '/'
  return router.currentRoute.value.path.startsWith(to)
}

const IconDashboard = {
  render: () =>
    h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '1.5',
        stroke: 'currentColor',
      },
      [
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          d: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z',
        }),
      ],
    ),
}

const IconPoints = {
  render: () =>
    h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '1.5',
        stroke: 'currentColor',
      },
      [
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          d: 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
        }),
      ],
    ),
}

const IconChildren = {
  render: () =>
    h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '1.5',
        stroke: 'currentColor',
      },
      [
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          d: 'M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z',
        }),
      ],
    ),
}

const IconPresets = {
  render: () =>
    h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        'stroke-width': '1.5',
        stroke: 'currentColor',
      },
      [
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          d: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z',
        }),
        h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' }),
      ],
    ),
}

const navItems = computed(() => {
  const items = [
    { to: '/', label: t('nav.dashboard'), icon: IconDashboard },
    { to: '/points', label: t('nav.points'), icon: IconPoints },
    { to: '/children', label: t('nav.children'), icon: IconChildren },
    { to: '/presets', label: t('nav.presets'), icon: IconPresets },
  ]
  if (auth.user?.role === 'admin') {
    items.push({ to: '/admin/users', label: t('nav.users'), icon: IconPresets })
  }
  return items
})

function toggleLang() {
  const newLang = locale.value === 'zh' ? 'en' : 'zh'
  locale.value = newLang
  localStorage.setItem('lang', newLang)
}

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>
