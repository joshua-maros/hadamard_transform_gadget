<script setup lang="ts">
import { ComplexNum } from "@/math/ComplexNum";
import { computed } from "@vue/reactivity";
import { ref } from "vue";
import ComplexNumGrid from "../components/ComplexNumGrid.vue";

const input = ref([
  ComplexNum.polar(1.0, 0.0),
  ComplexNum.polar(0.0, 3.14),
  ComplexNum.polar(0.0, 3.14),
  ComplexNum.polar(0.0, 3.14),
  ComplexNum.polar(0.0, 3.14),
  ComplexNum.polar(0.0, 3.14),
  ComplexNum.polar(0.0, 3.14),
  ComplexNum.polar(0.0, 3.14),
]);

const output = computed(() => {
  let prev_result = Array.from(input.value);
  let next_result = Array.from(input.value);
  const dims = Math.log2(input.value.length);

  for (let dim = 0; dim < dims; dim++) {
    const stride = Math.pow(2, dim);
    for (let groupStart = 0; groupStart < input.value.length; groupStart += 2 * stride) {
      for (let element = 0; element < stride; element++) {
        const ia = groupStart + element;
        const ib = groupStart + element + stride;
        next_result[ia] = scaleComplexNum(addComplexNum(prev_result[ia], prev_result[ib]), Math.SQRT1_2);
        next_result[ib] = scaleComplexNum(subComplexNum(prev_result[ia], prev_result[ib]), Math.SQRT1_2);
      }
    }
    prev_result = Array.from(next_result);
  }

  return prev_result;
});
</script>

<template>
  <main>
    <ComplexNumGrid :cols="4" v-model="input" />
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  overflow: hidden;
}
</style>
