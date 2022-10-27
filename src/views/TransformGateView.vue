<script setup lang="ts">
import deepEqual from 'deep-equal';
import { ComplexNum, hadamardTransform } from "@/math/ComplexNum";
import { useSettings } from "@/stores/settings";
import { computed } from "@vue/reactivity";
import { ref } from "vue";
import GridGroup from "../components/GridGroup.vue";

const settings = useSettings();

const basis = ref([
  [ComplexNum.polar(1, 0)]
]);

const gateOutput = ref([
  [ComplexNum.polar(1, 0)]
])

function dot(col1: Array<ComplexNum>, col2: Array<ComplexNum>): ComplexNum {
  return col1.map((x, idx) => x.product(col2[idx])).reduce((a, b) => a.sum(b));
}

function sum(col1: Array<ComplexNum>, col2: Array<ComplexNum>): Array<ComplexNum> {
  return col1.map((x, idx) => x.sum(col2[idx]));
}

function normalized(col: Array<ComplexNum>): Array<ComplexNum> {
  const factor = Math.sqrt(col.map(x => Math.pow(x.magnitude(), 2)).reduce((a, b) => a + b));
  return col.map(x => x.scaled(1.0 / factor));
}

function setGateOutput(newOutput: Array<Array<ComplexNum>>) {
  const modifiedColumnIndex = newOutput.findIndex((col, idx) => !deepEqual(col, gateOutput.value[idx]));
    console.log(modifiedColumnIndex);
  if (modifiedColumnIndex === -1) return;
  const modifiedColumn = newOutput[modifiedColumnIndex];
  gateOutput.value[modifiedColumnIndex] = modifiedColumn;
  for (let i = 0; i < newOutput.length; i++) {
    if (i == modifiedColumnIndex) continue;
    let col = Array.from(newOutput[i]);
    const modifiedFactor = dot(col, modifiedColumn).product(ComplexNum.cartesian(-1, 0));
    col = sum(col, modifiedColumn.map(x => x.product(modifiedFactor)));
    for (let j = 0; j < i; j++) {
      if (j == modifiedColumnIndex) continue;
      const prev = gateOutput.value[j];
      const factor = dot(col, prev).product(ComplexNum.cartesian(-1, 0));
      col = sum(col, prev.map(x => x.product(factor)));
    }
    if (col.every(x => x.magnitude() < 1e-5)) {
      col = col.map(_ => ComplexNum.polar(1 / Math.sqrt(modifiedColumn.length), 0));
      const modifiedFactor = dot(col, modifiedColumn).product(ComplexNum.cartesian(-1, 0));
      col = sum(col, modifiedColumn.map(x => x.product(modifiedFactor)));
      for (let j = 0; j < i; j++) {
        if (j == modifiedColumnIndex) continue;
        const prev = gateOutput.value[j];
        const factor = dot(col, prev).product(ComplexNum.cartesian(-1, 0));
        col = sum(col, prev.map(x => x.product(factor)));
      }
    }
    gateOutput.value[i] = normalized(col);
  }
}

function linearCombination(ofVectors: Array<Array<ComplexNum>>, coefficients: Array<ComplexNum>): Array<ComplexNum> {
  if (ofVectors.length != coefficients.length) {
    return [];
  }
  let sum = ofVectors[0].map(_ => ComplexNum.cartesian(0, 0));
  for (let i = 0; i < coefficients.length; i++) {
    const scaledVec = ofVectors[i].map(x => x.product(coefficients[i]));
    for (let j = 0; j < sum.length; j++) {
      sum[j] = sum[j].sum(scaledVec[j]);
    }
  }
  return sum;
}

const transformedOutput = computed(() => {
  return basis.value.map(basisVec => {
    const input = hadamardTransform(basisVec);
    const output = linearCombination(gateOutput.value, input);
    return hadamardTransform(output);
  });
})

const cols = ref(2);
const colsPerGrid = ref(1);

const setNumBits = (numBits: number) => {
  basis.value = [];
  gateOutput.value = [];
  colsPerGrid.value = numBits;
  const probVectorSize = Math.pow(2, numBits);
  for (let veci = 0; veci < probVectorSize; veci++) {
    const vec = [];
    for (let eli = 0; eli < probVectorSize; eli++) {
      const mag = eli == veci ? 1 : 0;
      vec.push(ComplexNum.polar(mag, 0));
    }
    basis.value.push(vec);
    const vec2 = [];
    for (let eli = 0; eli < probVectorSize; eli++) {
      const mag = eli == veci ? 1 : 0;
      vec2.push(ComplexNum.polar(mag, 0));
    }
    gateOutput.value.push(vec2);
  }
};

setNumBits(1);

// const output = computed(() => hadamardTransform(basis.value));
</script>

<template>
  <main>
    <div id="toolbar">
      <button @click="setNumBits(1)">1 Qubit Gate</button>
      <button @click="setNumBits(2)">2 Qubit Gate</button>
      <button v-if="!settings.normalizeIcons" @click="settings.normalizeIcons = true">Use Normalized Icons</button>
      <button v-if="settings.normalizeIcons" @click="settings.normalizeIcons = false">Use Unnormalized Icons</button>
    </div>
    <div id="input">
      <GridGroup :cols="cols" :cols-per-grid="colsPerGrid" :model-value="basis" />
    </div>
    <div id="output">
      <GridGroup :cols="cols" :cols-per-grid="colsPerGrid" :model-value="gateOutput"
        @update:model-value="setGateOutput" />
    </div>
    <div id="transformed-output">
      <GridGroup :cols="cols" :cols-per-grid="colsPerGrid" :model-value="transformedOutput" />
    </div>
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr auto auto auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "toolbar toolbar toolbar toolbar toolbar"
    "_0 input output transformed-output _1";
}

#toolbar {
  grid-area: toolbar;
}

#input,
#output,
#transformed-output {
  padding: 1em;
  width: min(80vh, 30vw);
}

#input {
  grid-area: input;
}

#output {
  grid-area: output;
}

#transformed-output {
  grid-area: transformed-output;
}
</style>
