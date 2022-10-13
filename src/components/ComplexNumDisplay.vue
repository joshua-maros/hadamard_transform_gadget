<script setup lang="ts">
import type { ComplexNum } from '@/math/ComplexNum';
import type { EditEndEvent, EditEvent, EditStartEvent } from '@/events';
import { computed } from 'vue';

const props = defineProps<{
  num: ComplexNum,
}>();

const emit = defineEmits<{
  (name: 'edit-start', event: EditStartEvent): void,
  (name: 'edit', event: EditEvent): void,
  (name: 'edit-end', event: EditEndEvent): void,
}>();

const scale = 53;
const phaseSize = 0.65;

const radius = computed(() => props.num.magnitude() * scale);

let startx: number, starty: number;

function onMouseDown(event: MouseEvent) {
  event.preventDefault();
  startx = event.clientX;
  starty = event.clientY;
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const tool = event.button == 0 ? 'magnitude' : 'phase';
  let editFired = false;
  const moveListener = (event: MouseEvent) => {
    const angle = Math.atan2(event.clientY - rect.top - (height / 2), event.clientX - rect.left - (width / 2));
    const dy = event.clientY - starty;
    const dx = event.clientX - startx;
    const delta = (-dy + dx) / width;
    if (!editFired && Math.abs(dy) + Math.abs(dx) < 1.0 * parseFloat(getComputedStyle(document.body).fontSize)) {
      return;
    }
    editFired = true;
    emit('edit', { angle, delta, tool });
  };
  const mouseUpListener = () => {
    window.removeEventListener("mousemove", moveListener);
    window.removeEventListener("mouseup", mouseUpListener);
    emit('edit-end', { editFired, tool });
  };
  window.addEventListener("mousemove", moveListener);
  window.addEventListener("mouseup", mouseUpListener);
  emit('edit-start', { tool });
}
</script>

<template>
  <svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg" @mousedown="onMouseDown">
    <ellipse class="phase" :cx="num.real * scale" :cy="num.imaginary * scale" :rx="phaseSize * radius"
      :ry="phaseSize * radius" />
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
