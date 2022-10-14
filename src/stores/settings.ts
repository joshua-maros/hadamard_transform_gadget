import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSettings = defineStore('currentTool', () => {
  const tool = ref('magnitude');
  const normalizeIcons = ref(false);

  return { tool, normalizeIcons }
})
