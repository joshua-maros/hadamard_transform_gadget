<script setup lang="ts">
import { useSettings } from '@/stores/settings';

defineProps<{
  normalizationConstant: number,
}>();

const settings = useSettings();

function prettyFmtNum(num: number) {
  if (num < 0.0) {
    throw new Error('unimplemented');
  } else if (num < 10.0) {
    return `${Math.floor(num + 0.005)}.${String(Math.round(num * 100.0) % 100).padStart(2, '0')}`
  } else if (num < 100.0) {
    return `${Math.floor(num + 0.05)}.${Math.round(num * 10.0) % 10}`
  } else {
    return `${Math.round(num)}`
  }
}
</script>

<template>
  <div id="container">
    <div v-if="normalizationConstant < 0.99 && settings.normalizeIcons" class="size-hint">
      Number icons are {{ prettyFmtNum(1.0 / normalizationConstant) }}x bigger than what they represent.
    </div>
    <div v-if="normalizationConstant < 0.49 && !settings.normalizeIcons" class="size-hint">
      Consider turning on normalized icons to see these numbers better.
    </div>
  </div>
</template>

<style scoped>
#container {
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
}
</style>