<script setup lang="ts">
import type { ComplexNum } from '@/math/ComplexNum';
import { computed } from 'vue';

const props = defineProps<{
  num: ComplexNum,
  normalizationFactor: number,
}>();

const normalizedNum = computed(() => props.num.scaled(props.normalizationFactor));

const scale = 53;
const phaseSize = 0.65;

const radius = computed(() => normalizedNum.value.magnitude() * scale);
</script>

<template>
  <svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg">
    <ellipse class="phase" :cx="normalizedNum.real * scale" :cy="normalizedNum.imaginary * scale"
      :rx="phaseSize * radius" :ry="phaseSize * radius" />
    <ellipse class="magnitude" cx="0" cy="0" :rx="radius" :ry="radius" />
  </svg>
</template>

<style scoped>
svg {
  width: 100%;
}

svg ellipse.magnitude {
  fill: #0e5ca1;
  stroke: #0095ff;
}

svg ellipse.phase {
  fill: #920992;
  stroke: #ff00ff;
}

svg * {
  stroke-width: 7%;
}
</style>
