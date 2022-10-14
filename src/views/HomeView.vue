<script setup lang="ts">
import { ComplexNum, hadamardTransform } from "@/math/ComplexNum";
import { computed } from "@vue/reactivity";
import { ref } from "vue";
import ComplexNumGrid from "../components/ComplexNumGrid.vue";

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
  grid-template-areas:
    "_0 input output _1";
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
