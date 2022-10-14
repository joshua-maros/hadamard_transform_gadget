<script setup lang="ts">
import { ComplexNum, hadamardTransform } from "@/math/ComplexNum";
import { useSettings } from "@/stores/settings";
import { computed } from "@vue/reactivity";
import { ref } from "vue";
import ComplexNumGrid from "../components/ComplexNumGrid.vue";

const settings = useSettings();

const input = ref([
  ComplexNum.polar(1.0, 0.0),
]);

const cols = ref(2);

const setNumBits = (numBits: number) => {
  input.value = [ComplexNum.polar(1, 0)];
  for (let i = 1; i < Math.pow(2, numBits); i++) {
    input.value.push(ComplexNum.polar(0, 0));
  }
  cols.value = Math.pow(2, Math.ceil(numBits / 2));
};

setNumBits(1);

const output = computed(() => hadamardTransform(input.value));
</script>

<template>
  <main>
    <div id="toolbar">
      <button @click="setNumBits(1)">1 Qubit</button>
      <button @click="setNumBits(2)">2 Qubits</button>
      <button @click="setNumBits(3)">3 Qubits</button>
      <button @click="setNumBits(4)">4 Qubits</button>
      <button @click="setNumBits(6)">6 Qubits</button>
      <button v-if="!settings.normalizeIcons" @click="settings.normalizeIcons = true">Use Normalized Icons</button>
      <button v-if="settings.normalizeIcons" @click="settings.normalizeIcons = false">Use Unnormalized Icons</button>
    </div>
    <div id="input">
      <ComplexNumGrid :cols="cols" v-model="input" />
    </div>
    <div id="output">
      <ComplexNumGrid :cols="cols" :model-value="output" />
    </div>
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr auto auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "toolbar toolbar toolbar toolbar"
    "_0 input output _1";
}

#toolbar {
  grid-area: toolbar;
}

#input,
#output {
  width: min(80vh, 50vw);
}

#input {
  grid-area: input;
}

#output {
  grid-area: output;
}
</style>
