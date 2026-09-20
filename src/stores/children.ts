import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

interface Child {
  id: number
  name: string
  avatar: string | null
  score: number
  created_at: string
}

export const useChildrenStore = defineStore('children', () => {
  const children = ref<Child[]>([])
  const currentChildId = ref<number | null>(null)

  async function fetchChildren() {
    const data = await request.get('/children') as { children: Child[] }
    children.value = data.children
    if (data.children.length > 0 && !currentChildId.value) {
      currentChildId.value = data.children[0].id
    }
  }

  async function addChild(name: string, avatar?: string) {
    await request.post('/children', { name, avatar })
    await fetchChildren()
  }

  async function updateChild(id: number, name: string, avatar?: string) {
    await request.put(`/children/${id}`, { name, avatar })
    await fetchChildren()
  }

  async function deleteChild(id: number) {
    await request.delete(`/children/${id}`)
    if (currentChildId.value === id) {
      currentChildId.value = children.value.length > 1
        ? children.value.find(c => c.id !== id)?.id || null
        : null
    }
    await fetchChildren()
  }

  return { children, currentChildId, fetchChildren, addChild, updateChild, deleteChild }
})
