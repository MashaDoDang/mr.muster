<template>
  <div style="display: flex; align-items: center; justify-content: center; flex-direction: column;"
    @dragover.prevent="dragOver" @drop.prevent="dropFile" @dragleave.prevent="dragLeave">
    <div class="create-container" :class="{ 'dragging': isDragging }">
      <input type="file" ref="fileInput" class="d-none" @change="previewImage" accept="image/*">
      <div v-if="!file" class="uploading">
        <button class="btn log-button" :class="{ 'dragging': isDragging }" @click="triggerFileInput">
          {{ isDragging ? 'Drop Here' : 'Upload Image' }}
        </button>
        <p class="drop-file">or drop a file</p>
      </div>
      <div v-if="file" class="image-preview">
        <img :src="imageUrl" alt="Preview" class="preview-img">
        <div class="image-preview-controls">
          <button class="btn icon-button remove-button" @click="removeImage" title="Remove Image">
            <i class="fas fa-times"></i>
          </button>
          <button class="btn icon-button change-button" @click="triggerFileInput" title="Change Image">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
      <div class="details">
        <p style="font-family: Lexend, sans-serif; padding-left: 10px;">Specify details</p>
        <input min="1" step="1" type="number" class="form-control" placeholder="No. colors" v-model="noColors"
          @input="validateInputPositiveInteger">
        <div class="input-group">
          <input min="1" step="1" type="number" class="form-control" :placeholder="isHorizontal ? 'Width' : 'Height'"
            v-model="noBlocks" @input="validateInputPositiveInteger">
          <div class="input-group-append">
            <v-btn-toggle v-model="isHorizontal" color="deep-purple-accent-3" rounded="0" group mandatory
              style="width: 280px;">
              <v-btn :value='true' style="width: 50%;">Horizontal</v-btn>
              <v-btn :value='false' style="width: 50%;">Vertical</v-btn>
            </v-btn-toggle>
          </div>
        </div>
        <div style="display: flex; align-items: center; width: 100%; justify-content: space-between">
          <span>Generate with grid</span>
          <v-btn-toggle v-model="isGrid" color="deep-purple-accent-3" rounded="0" group mandatory style="width: 280px;">
            <v-btn :value='true' style="width: 50%;">Yes</v-btn>
            <v-btn :value='false' style="width: 50%;">No</v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </div>
    <div class="button-container">
      <button class="btn upload-button cancel" @click="navigateToHome">Cancel</button>
      <button class="btn upload-button">Generate</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const file = ref(null);
const imageUrl = ref('');
let fileInput = ref(null);
const isDragging = ref(false); // State to manage drag status
let dragTimeout = null;  // To store the timeout reference
const isGrid = ref(true);
const isHorizontal = ref(true);
const noColors = ref();
const noBlocks = ref();

function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.click();
  } else {
    console.error('The file input element is not found.');
  }
}

function previewImage(event) {
  handleFiles(event.target.files);
}

function dragOver(event) {
  event.preventDefault();
  clearTimeout(dragTimeout);  // Clear any existing timeout
  isDragging.value = true;
}

function dropFile(event) {
  event.preventDefault();
  clearTimeout(dragTimeout);  // Ensure no timeout is running
  isDragging.value = false;
  handleFiles(event.dataTransfer.files);
}

function dragLeave(event) {
  event.preventDefault();
  // Start a timeout when the file leaves the drop zone
  dragTimeout = setTimeout(() => {
    isDragging.value = false;
  }, 1000);  // Delay of 1 second
}

function handleFiles(files) {
  const selectedFile = files[0];
  if (selectedFile && selectedFile.type.startsWith('image/')) {
    file.value = selectedFile;
    imageUrl.value = URL.createObjectURL(selectedFile);
  } else {
    alert('Please drop an image file.');
  }
}

function removeImage() {
  file.value = null;
  imageUrl.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function navigateToHome() {
  router.push('/');
}

function validateInputPositiveInteger() {
  // Regular expression to allow only digits
  noColors.value = parseInt(noColors.value.toString().replace(/[^0-9]+/g, ''));
}
</script>

<style scoped>
.create-container {
  --padding: 55px;
  width: 75%;
  display: flex;
  gap: 20px;
  align-items: center;
  padding: var(--padding);
  background: linear-gradient(white, white) padding-box,
    linear-gradient(to left, #4b057a, #e43f6c) border-box;
  border-radius: 20px;
  border: 3px solid transparent;
  transition: box-shadow 0.25s;
  margin-top: 5%;
  min-height: 400px;
  justify-content: space-around;
}

.btn:hover {
  background-color: #f5bc6c;
  border-color: #f5bc6c;
}

button {
  font-family: Lexend, sans-serif;
  font-weight: 300;
}

.log-button {
  background-color: #d95b00;
  border-color: #d95b00;
  color: white;
  font-size: 50px;
  padding: 30px;
  border-radius: 70px;
}

.drop-file {
  font-family: Lexend, sans-serif;
  font-weight: 300;
  font-size: 25px
}

input {
  outline: 0;
  border-width: 0 0 2px;
  border-color: #d95b00;
  border-radius: 0px;
  width: 250px;
  margin-bottom: 30px;
}

input:focus {
  border-color: #d95b00;
  outline: 2px #d95b00
}

.uploading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

[placeholder]:focus::-webkit-input-placeholder {
  transition: text-indent 0.4s 0.4s ease;
  text-indent: -100%;
  opacity: 1;
}

.details {
  display: grid;
  justify-items: start;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  width: 75%;
  padding: 20px 0px;
  gap: 20px;
}

.upload-button {
  background-color: #b73c91;
  border-color: #b73c91;
  color: white;
  border-radius: 20px;
  font-weight: 500;
  font-size: 18px;
  padding: 15px;
  border-width: 3px;
}

.cancel {
  background-color: rgb(255, 255, 255);
  color: black;
}

.image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.preview-img {
  max-width: 80%;
  max-height: 80%;
  border-radius: 20px;
  margin-top: 20px;
  /* Adjust the margin as needed */
  object-fit: contain;
  /* This ensures that the aspect ratio of the image is maintained */
}

.image-preview-controls {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  /* Adjust the margin as needed */
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  /* or any other padding you prefer */
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-button i {
  color: inherit;
  /* Icon color inherits from the button color */
}

.remove-button {
  color: #ce2924;
  /* Red color for the remove button */
}

.change-button {
  color: #5d00ff;
  /* Green color for the change button */
}

/* Add some size to the icons, if needed */
.icon-button i {
  font-size: 34px;
  /* or any other size you prefer */
}

.d-none {
  display: none !important;
}

.dragging {
  border-color: #ffa500;
  /* Change to a prominent color */
  background-color: #fffbea;
  /* Light background to indicate active drop zone */
}

.btn.dragging {
  background-color: #ffa500;
  color: white;
}
</style>