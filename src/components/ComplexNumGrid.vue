<script setup lang="ts">
import { ComplexNum } from "@/math/ComplexNum";
import type { EditEndEvent, EditEvent, EditStartEvent } from "@/events";
import { computed, reactive, ref, watch } from "vue";
import ComplexNumDisplay from "./ComplexNumDisplay.vue";
import { useSettings } from "@/stores/settings";

const props = defineProps<{
  cols: number,
  modelValue: Array<ComplexNum>,
  normalizationConstant: number,
}>();

const emit = defineEmits<{
  (name: 'update:modelValue', event: Array<ComplexNum>): void,
}>();

const settings = useSettings();

const previousValue = ref([] as Array<ComplexNum>);

const rows = computed(() => Math.ceil(props.modelValue.length / props.cols));

const style = computed(() => `display: grid;`
  + `max-width: 100%;`
  + `max-height: 100%;`
  + `aspect-ratio: ${props.cols} / ${rows.value};`
  + `grid-template-columns: ${'1fr '.repeat(props.cols)};`
  + `grid-template-rows: ${'1fr'.repeat(rows.value)};`
);

const setMagnitudes = (requests: Array<{ index: number, magnitude: number }>) => {
  const result = Array.from(previousValue.value);
  const restScale = Math.sqrt(1.0 / (previousValue.value.length - requests.length));
  let oldTargetsMag = Math.sqrt(requests.map(r => previousValue.value[r.index]).map(n => n.magnitude() * n.magnitude()).reduce((a, b) => a + b, 0));
  let newTargetsMag = Math.sqrt(requests.map(r => r.magnitude * r.magnitude).reduce((a, b) => a + b, 0));
  const oldRestMag = Math.sqrt(Math.max(1.0 - oldTargetsMag * oldTargetsMag, 0.0)) * restScale;
  const newRestMag = Math.sqrt(Math.max(1.0 - newTargetsMag * newTargetsMag, 0.0)) * restScale;
  for (let index = 0; index < previousValue.value.length; index++) {
    const old = previousValue.value[index];
    let newVal;
    const newIndex = requests.findIndex(r => r.index == index);
    if (newIndex == -1) {
      newVal = old.scaledByRatio(newRestMag, oldRestMag);
    } else {
      newVal = old.scaledByRatio(requests[newIndex].magnitude, old.magnitude());
    }
    result[index] = newVal;
  }
  return result;
}


const editStart = (event: EditStartEvent, editIndex: number) => {
  previousValue.value = Array.from(props.modelValue);
}

const edit = (event: EditEvent, editIndex: number) => {
  if (event.tool == 'magnitude') {
    const oldTargetMag = previousValue.value[editIndex].magnitude();
    const newTargetMag = Math.sqrt(Math.min(Math.max(oldTargetMag * oldTargetMag + event.delta, 0.0), 1.0));
    emit('update:modelValue', setMagnitudes([{ index: editIndex, magnitude: newTargetMag }]));
  } else {
    const result = Array.from(previousValue.value);
    result[editIndex] = result[editIndex].withPhaseFrom(ComplexNum.polar(1.0, event.angle));
    emit('update:modelValue', result)
  }
}

const editEnd = (event: EditEndEvent, editIndex: number) => {
  let result = Array.from(props.modelValue);
  if (!event.editFired) {
    if (event.tool == 'magnitude') {
      const nonZero = result.filter(x => x.magnitude() > 1e-5).length;
      const targetMagnitude = Math.sqrt(1.0 / (nonZero + 1.0));
      const typicalMagnitude = Math.sqrt(1.0 / nonZero);
      const currentlyHigh = result[editIndex].magnitude() >= typicalMagnitude / 10.0;
      result = setMagnitudes([{ index: editIndex, magnitude: currentlyHigh ? 0.0 : targetMagnitude }]);
    } else if (event.tool == 'phase') {
      const n = result[editIndex].clone();
      if (n.magnitude() >= 1e-5) {
        n.real = -n.real;
        n.imaginary = -n.imaginary;
      }
      result[editIndex] = n;
    }
  }
  if (event.tool == 'magnitude') {
    const nonZero = result.filter(x => x.magnitude() > 1e-5).length;
    const typicalMagnitude = Math.sqrt(1.0 / nonZero);
    let allIndices = [];
    for (let i = 0; i < result.length; i++) allIndices.push(i);
    const close = allIndices.filter(i => Math.abs(result[i].magnitude() - typicalMagnitude) < 0.2 * typicalMagnitude);
    const reqs = close.map(index => ({ index, magnitude: typicalMagnitude }));
    previousValue.value = Array.from(result);
    result = setMagnitudes(reqs);
  } else if (event.tool == 'phase') {
    const num = result[editIndex];
    const phase = num.phase();
    const snappedPhase = Math.round(phase / Math.PI * 4.0) / 4.0 * Math.PI;
    result[editIndex] = ComplexNum.polar(num.magnitude(), snappedPhase);
  }
  emit('update:modelValue', result);
}
</script>

<template>
  <div id="root">
    <div :style="style">
      <ComplexNumDisplay v-for="(num, idx) in modelValue" :key="idx"
        :num="settings.normalizeIcons ? num.scaled(1.0 / (normalizationConstant || 1)) : num" :normalization-factor="1"
        @edit-start="editStart($event, idx)" @edit="edit($event, idx)" @edit-end="editEnd($event, idx)" />
    </div>
  </div>
</template>

<style scoped>
#root {
  background: rgba(220, 220, 220, 0.5);
  margin: 0.5em;
  padding: 0.5em;
}
</style>
