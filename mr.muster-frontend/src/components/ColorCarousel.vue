<template>
    <div>
      <!-- If the number of colors is less than or equal to 9, display them without a carousel -->
      <div v-if="colors.length <= 11" class="color-container" style="justify-content: center;">
        <div v-for="(color, index) in colors" :key="index" class="color-box" :style="{ backgroundColor: color }">
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props, on }">
              <div v-bind="props" v-on="on" :style="{ backgroundColor: color, height: '50px', width: '50px', border: '2px solid white' }"></div>
            </template>
            <span>{{ color }}</span>
          </v-tooltip>
        </div>
      </div>
  
      <!-- If the number of colors is more than 9, display them in a carousel -->
      <v-slide-group v-else class="custom-slide-group dark-theme" dark style="max-width: 550px;">
        <v-slide-item v-for="(color, index) in colors" :key="index">
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props, on }">
              <div v-bind="props" v-on="on" :style="{ backgroundColor: color, height: '50px', width: '50px', border: '2px solid white' }"></div>
            </template>
            <span>{{ color }}</span>
          </v-tooltip>
        </v-slide-item>
      </v-slide-group>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      colors: {
        type: Array,
        required: true
      }
    }
  }
  </script>
  
  <style scoped>
  .color-container {
    display: flex;
    justify-content: space-between;
  }
  
  .color-box {
    width: 50px;
    height: 50px;
    border: 2px solid white;
  }
  
  .dark-theme {
    background: linear-gradient(to right, rgb(189, 139, 255), rgb(80, 29, 151));    
    border-radius: 27.5px;
  }
  </style>