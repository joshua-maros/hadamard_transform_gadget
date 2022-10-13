<script setup lang="ts">
import { ComplexNum } from "@/math/ComplexNum";
import { ref } from "vue";
import ComplexNumGrid from "../components/ComplexNumGrid.vue";

const nums = ref([
  ComplexNum.polar(1.0, 0.0),
  ComplexNum.polar(0.0, 3.14),
  ComplexNum.polar(0.0, 3.14),
  ComplexNum.polar(0.0, 3.14),
  ComplexNum.polar(0.0, 3.14),
  ComplexNum.polar(0.0, 3.14),
  ComplexNum.polar(0.0, 3.14),
  ComplexNum.polar(0.0, 3.14),
]);
</script>

<template>
  <main>
    <ComplexNumGrid :cols="4" v-model="nums" />
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  overflow: hidden;
}
</style>
