<script setup lang="ts">
import { ComplexNum } from "@/math/ComplexNum";
import ComplexNumGrid from "../components/ComplexNumGrid.vue";
</script>

<template>
  <main>
    <ComplexNumGrid :cols="1" :nums="[ComplexNum.polar(1.0, 0.0), ComplexNum.polar(1.0, 3.14)]" />
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  overflow: hidden;
}
</style>
