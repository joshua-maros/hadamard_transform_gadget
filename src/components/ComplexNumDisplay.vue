<script setup lang="ts">
import type { ComplexNum } from '@/math/ComplexNum';
import type { EditEvent } from '@/math/EditEvent';
import { computed } from 'vue';

const props = defineProps<{
  num: ComplexNum,
  normalizationFactor: number,
}>();

const emit = defineEmits<{
  (name: 'edit-start'): void,
  (name: 'edit', event: EditEvent): void,
  (name: 'edit-end'): void,
}>();

const normalizedNum = computed(() => props.num.scaled(props.normalizationFactor));

const scale = 53;
const phaseSize = 0.65;

const radius = computed(() => normalizedNum.value.magnitude() * scale);

let startx: number, starty: number;

function onMouseDown(event: MouseEvent) {
  startx = event.offsetX;
  starty = event.offsetY;
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const moveListener = (event: MouseEvent) => {
    console.log(event.offsetY, height);
    const angle = Math.atan2(event.offsetY - (height / 2), event.offsetX - (width / 2));
    const delta = -(event.offsetY - starty) + (event.offsetX - startx)
    emit('edit', { angle, delta });
  };
  const mouseUpListener = () => {
    window.removeEventListener("mousemove", moveListener);
    window.removeEventListener("mouseup", mouseUpListener);
    emit('edit-end');
  };
  window.addEventListener("mousemove", moveListener);
  window.addEventListener("mouseup", mouseUpListener);
  emit('edit-start');
}
</script>

<template>
  <svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg" @mousedown="onMouseDown">
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
