<script setup lang="ts">
import type { ComplexNum } from "@/math/ComplexNum";
import { computed } from "vue";
import ComplexNumDisplay from "./ComplexNumDisplay.vue";

const props = defineProps<{
  cols: number,
  nums: Array<ComplexNum>,
}>();

const style = computed(() => `display: grid;`
  + `grid-template-columns: ${'1fr '.repeat(props.cols)};`
  + `grid-template-rows: ${'auto '.repeat(Math.ceil(props.nums.length / props.cols))};`
);
</script>

<template>
  <div :style="style">
    <ComplexNumDisplay v-for="(num, idx) in nums" :key="idx" :num="num" :normalization-factor="1"/>
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
