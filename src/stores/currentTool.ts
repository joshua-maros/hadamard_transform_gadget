import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCurrentTool = defineStore('currentTool', () => {
  const tool = ref('magnitude');

  return { tool }
})
