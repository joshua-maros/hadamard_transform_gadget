<script setup lang="ts">
import type { ComplexNum } from "@/math/ComplexNum";
import type { EditEvent } from "@/math/EditEvent";
import { computed } from "vue";
import ComplexNumDisplay from "./ComplexNumDisplay.vue";

const props = defineProps<{
  cols: number,
  nums: Array<ComplexNum>,
}>();

const rows = computed(() => Math.ceil(props.nums.length / props.cols));

const style = computed(() => `display: grid;`
  + `max-width: 100%;`
  + `max-height: 100%;`
  + `aspect-ratio: ${props.cols} / ${rows.value};`
  + `grid-template-columns: ${'1fr '.repeat(props.cols)};`
  + `grid-template-rows: ${'1fr'.repeat(rows.value)};`
);

const edit = (event: EditEvent) => {
  console.log(event)
}
</script>

<template>
  <div :style="style">
    <ComplexNumDisplay v-for="(num, idx) in nums" :key="idx" :num="num" :normalization-factor="1" @edit="edit" />
  </div>
</template>

<style scoped>
svg {
  width: 100%;
  aspect-ratio: 1/1;
}

svg ellipse.magnitude {
  fill: #ff00ff;
}
</style>
