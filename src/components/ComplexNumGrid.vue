<script setup lang="ts">
import { ComplexNum } from "@/math/ComplexNum";
import type { EditEvent } from "@/events";
import { computed, reactive, ref } from "vue";
import ComplexNumDisplay from "./ComplexNumDisplay.vue";

const props = defineProps<{
  cols: number,
  modelValue: Array<ComplexNum>,
}>();

const emit = defineEmits<{
  (name: 'update:modelValue', event: Array<ComplexNum>): void
}>();

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
  emit('update:modelValue', result)
}


const editStart = () => {
  previousValue.value = Array.from(props.modelValue);
}

const edit = (event: EditEvent, editIndex: number) => {
  if (event.tool == 'magnitude') {
    const oldTargetMag = previousValue.value[editIndex].magnitude();
    const newTargetMag = Math.sqrt(Math.min(Math.max(oldTargetMag * oldTargetMag + event.delta, 0.0), 1.0));
    setMagnitudes([{ index: editIndex, magnitude: newTargetMag }]);
  } else {
    const result = Array.from(previousValue.value);
    result[editIndex] = result[editIndex].withPhaseFrom(ComplexNum.polar(1.0, event.angle));
    emit('update:modelValue', result)
  }
}
</script>

<template>
  <div>
    <div :style="style">
      <ComplexNumDisplay v-for="(num, idx) in modelValue" :key="idx" :num="num" :normalization-factor="1"
        @edit-start="editStart" @edit="edit($event, idx)" />
    </div>
    <div class="size-hint">asdf</div>
  </div>
</template>

<style scoped>
.size-hint {
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
}
</style>
