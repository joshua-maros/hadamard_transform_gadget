<script setup lang="ts">
import type { ComplexNum } from "@/math/ComplexNum";
import type { EditEndEvent, EditEvent, EditStartEvent } from "@/events";
import { computed, reactive, ref } from "vue";
import ComplexNumDisplay from "./ComplexNumDisplay.vue";
import { useSettings } from "@/stores/settings";
import ComplexNumGrid from "./ComplexNumGrid.vue";
import SizeHint from "./SizeHint.vue";

const props = defineProps<{
  cols: number,
  colsPerGrid: number,
  modelValue: Array<Array<ComplexNum>>,
}>();

const emit = defineEmits<{
  (name: 'update:modelValue', event: Array<Array<ComplexNum>>): void
}>();

const settings = useSettings();

const rows = computed(() => Math.ceil(props.modelValue.length / props.cols));

const style = computed(() => `display: grid;`
  + `max-width: 100%;`
  + `max-height: 100%;`
  + `aspect-ratio: ${props.cols} / ${rows.value};`
  + `grid-template-columns: ${'1fr '.repeat(props.cols)};`
  + `grid-template-rows: ${'1fr'.repeat(rows.value)};`
);

const normalizationConstant = computed(() => Math.max(...props.modelValue.map(
  a => Math.max(...a.map(n => n.magnitude()))
)));

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

const setArray = (value: Array<ComplexNum>, index: number) => {
  const newValue = Array.from(props.modelValue);
  newValue[index] = value;
  emit('update:modelValue', newValue);
};
</script>

<template>
  <div>
    <div :style="style">
      <ComplexNumGrid v-for="(array, idx) in modelValue" :key="idx" :model-value="array"
        :normalization-constant="normalizationConstant" @update:model-value="setArray($event, idx)"
        :cols="colsPerGrid" />
    </div>
    <SizeHint :normalization-constant="normalizationConstant"/>
  </div>
</template>

<style scoped>
.size-hint {
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
}
</style>
