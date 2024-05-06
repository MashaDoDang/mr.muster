<template>
  <div v-if="props.isProcessing" class="loading-overlay" >
    <Loading :active="isProcessing" color="#000000" background-color="#ffffff" />
    <div  class="loading-label">{{ processingLabel }}</div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

const props = defineProps({
  isProcessing: {
    type: Boolean,
    required: true
  },
  processingLabel: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.loading-overlay {
  position: relative;
}

.loading-label {
    margin-top: 65px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #000000;
    font-weight: 600;
    z-index: 9999;
    font-family: 'Lexend';
    font-size: x-large;
}
</style>