<template>
  <div style="display: flex; align-items: center; justify-content: center; flex-direction: column;"
    @dragover.prevent="dragOver" @drop.prevent="dropFile" @dragleave.prevent="dragLeave">
    <div class="create-container" :class="{ 'dragging': isDragging }" style="padding: 20px;">
      <MusterOverlay :isProcessing="isProcessing" :processingLabel="processingLabel" />
      <MusterOverlay :isProcessing="isUploading" :processingLabel="actionLabel" />
      <input type="file" ref="fileInput" class="d-none" @change="previewImage" accept="image/*" data-cy="file-input">
      <div v-if="!file" class="uploading">
        <button class="btn log-button" :class="{ 'dragging': isDragging }" @click="triggerFileInput"
          data-cy="upload-button">
          {{ isDragging ? 'Drop Here' : 'Upload Image' }}
        </button>
        <p class="drop-file" data-cy="drop-file-text">or drop a file</p>
      </div>
      <div v-if="file" class="image-preview">
        <img :src="imageUrl" alt="Preview" class="preview-img" data-cy="preview-img">
        <div class="image-preview-controls">
          <button class="btn icon-button remove-button" @click="removeImage" title="Remove Image"
            data-cy="remove-image-button">
            <i class="fas fa-times"></i>
          </button>
          <button class="btn icon-button change-button" @click="triggerFileInput" title="Change Image"
            data-cy="change-image-button">
            <i class="fas fa-sync-alt"></i>
          </button>
          <ColorCarousel data-cy="color-carousel" v-if="file && usedColors.length && newGridCreated" :colors="usedColors" />
        </div>
      </div>
      <div class="details" style="min-width: 550px;">
        <p style="font-family: Lexend, sans-serif; padding-left: 10px;">Specify details</p>
        <input type="text" class="form-control" placeholder="Name" v-model="gridName" data-cy="grid-name-input">
        <input type="text" class="form-control" placeholder="No. colors" v-model="noColors"
          @input="validateInputPositiveInteger" data-cy="no-colors-input">
        <div class="input-group">
          <input type="text" class="form-control" :placeholder="isHorizontal ? 'Blocks in width' : 'Blocks in height'"
            v-model="noBlocks" @input="validateInputPositiveInteger" data-cy="no-blocks-input">
          <div class="input-group-append" style="margin-left: 50px;">
            <v-btn-toggle v-model="isHorizontal" color="deep-purple-accent-3" rounded="0" group mandatory
              style="width: 280px;">
              <v-btn :value='true' style="width: 50%;" data-cy="horizontal-toggle">Horizontal</v-btn>
              <v-btn :value='false' style="width: 50%;" data-cy="vertical-toggle">Vertical</v-btn>
            </v-btn-toggle>
          </div>
        </div>
        <input type="text" class="form-control" placeholder="Scale factor" v-model="scaleFactor"
          @input="validateInputPositiveNumber" data-cy="scale-factor-input">
        <div style="display: flex; align-items: center; width: 100%; justify-content: space-between">
          <input v-if="isGrid" type="text" class="form-control" placeholder="Thick line frequency"
            v-model="thickLineFrequency" @input="validateInputPositiveInteger"
            style="margin-bottom: 0px; width: 220px; padding: 6px 12px;" data-cy="thick-line-frequency-input">
          <span v-else style="margin-left: 12px" data-cy="generate-with-grid-text">Generate with grid</span>
          <v-btn-toggle v-model="isGrid" color="deep-purple-accent-3" rounded="0" group mandatory style="width: 280px;">
            <v-btn :value='true' style="width: 50%;" data-cy="grid-yes-toggle">Yes</v-btn>
            <v-btn :value='false' style="width: 50%;" data-cy="grid-no-toggle">No</v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </div>
    <div class="button-container">
      <!-- If newGridCreated is false, display the Cancel and Generate buttons -->
      <template v-if="!newGridCreated">
        <button class="btn upload-button cancel" @click="navigateToHome" data-cy="cancel-button">Cancel</button>
        <button class="btn upload-button" @click="sendImageToServer" data-cy="generate-button">Generate</button>
      </template>

      <!-- If newGridCreated is true, display the Discard, Save, and Publish buttons -->
      <template v-else>
        <button class="btn upload-button cancel" @click="removeImage" data-cy="discard-button">Discard</button>
        <button class="btn upload-button" @click="sendImageToServer" data-cy="generate-again-button">Generate
          again</button>
        <button class="btn upload-button" @click="showModal('save')" :disabled="!isLoggedIn"
          data-cy="save-button">Save</button>
        <button class="btn upload-button" @click="showModal('publish')" :disabled="!isLoggedIn"
          data-cy="publish-button">Publish</button>
      </template>
    </div>
    <ConfirmationModal v-if="showConfirmationModal" :modalType="modalType" @close="showConfirmationModal = false"
      @save="handleSave" @publish="handlePublish" />
    <div v-if="showSuccessModal" class="login-overlay">
      <div class="login-modal">
        <h2 class="modal-header">Success!</h2>
        <p>The operation resulted in a success. What would you like to do next?</p>
        <div style="display: flex; justify-content: space-evenly; gap: 5px; margin-top: 50px;">
          <button @click="showSuccessModal = false" class="btn btn-primary mb-3 btn-yellow" type="button"
            style="flex: 1; border-radius: 40px" data-cy="continue-generating-button">
            Continue Generating
          </button>
          <button @click="viewPost" class="btn btn-primary mb-3 btn-orange" type="button"
            style="flex: 1; border-radius: 40px" data-cy="view-post-button">
            View Post
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import MusterOverlay from './MusterOverlay.vue';
import ColorCarousel from './ColorCarousel.vue';
import ConfirmationModal from './ConfirmationModal.vue';
import { storage, db, auth } from '../firebase';
import { ref as firebaseRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, updateDoc, arrayUnion, doc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';


const router = useRouter();
const file = ref(null);
const imageUrl = ref('');
let fileInput = ref(null);
const isDragging = ref(false); // State to manage drag status
let dragTimeout = null;  // To store the timeout reference
const isGrid = ref(false);
const isHorizontal = ref(true);
const noColors = ref();
const noBlocks = ref();
const scaleFactor = ref();
const thickLineFrequency = ref();
const newGridCreated = ref(false);
const gridName = ref('');

const showConfirmationModal = ref(false);
const modalType = ref('');

let isProcessing = ref(false);
let processingLabels = ref(['Hang tight, creating your masterpiece!', 'Almost there, adding the final touches!', 'Just a bit more, framing your art!', 'Hold on, polishing the pixels!']);
let currentLabelIndex = ref(0);
let processingLabel = ref(processingLabels.value[currentLabelIndex.value]);

const isUploading = ref(false);
const actionLabel = ref('');

let intervalId = null;
let usedColors = ref([]);

const isLoggedIn = ref(false);
const showSuccessModal = ref(false);
const newlyCreatedGrid = ref(null);

onAuthStateChanged(auth, user => {
  isLoggedIn.value = !!user;
});

onBeforeUnmount(() => {
  clearTimeout(dragTimeout);
  clearInterval(intervalId);
});

watch(isGrid, (newValue) => {
  if (newValue) {
    thickLineFrequency.value = '';
  }
});

watch(file, () => {
  newGridCreated.value = false;
});

function showModal(type) {
  modalType.value = type;
  showConfirmationModal.value = true;
}

async function addToStorageAndSaveAsGrid(isPrivate) {
  isUploading.value = true;
  // Convert the base64 string in imageUrl to a Blob object
  const response = await fetch(imageUrl.value);
  const blob = await response.blob();

  // Create a storage reference from our storage service
  const storageRef = firebaseRef(storage, 'generated/' + gridName.value + new Date().getTime() + '.png');

  // Start the upload
  const uploadTask = uploadBytesResumable(storageRef, blob);

  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on('state_changed',
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
    },
    (error) => {
      // Handle unsuccessful uploads
      console.error('Upload failed:', error);
      isUploading.value = false;
    },
    async () => {
      // Handle successful uploads on complete
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      console.log('File available at', downloadURL);

      // Get the current user's UID
      const uid = auth.currentUser ? auth.currentUser.uid : null;

      // Add a new document to the grids collection
      const docRef = await addDoc(collection(db, "Grids"), {
        Author: doc(db, "Users", uid),
        Comments: [],
        Content: downloadURL,
        IsPrivate: isPrivate,
        Likes: [],
        PostedDate: new Date(),
        Title: gridName.value,
        isReported: [] // Initialize isReported as an empty array
      });

      console.log("Document written with ID: ", docRef.id);

      // Get a reference to the user document
      const userDocRef = doc(db, "Users", uid);

      // Add the reference to the new grid document to the OwnedGrids array of the user document
      await updateDoc(userDocRef, {
        OwnedGrids: arrayUnion(docRef)
      });

      isUploading.value = false;
      newlyCreatedGrid.value = docRef;
      showSuccessModal.value = true;
    }
  );
}

function handleSave() {
  actionLabel.value = 'Saving...';
  addToStorageAndSaveAsGrid(true);
}

function handlePublish() {
  actionLabel.value = 'Publishing...';
  addToStorageAndSaveAsGrid(false);
}

function viewPost() {
  router.push(`/view-post/${newlyCreatedGrid.value.id}`);
}

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

const validateInputPositiveInteger = (event) => {
  let value = event.target.value;
  // Check if the input is a valid number format
  if (!/^\d{1,4}$/.test(value)) {
    event.target.value = event.target.value.slice(0, -1);
    return;
  }
  value = parseFloat(value);
  if (isNaN(value) || value < 0) {
    event.target.value = event.target.value.slice(0, -1);
  }
};


const validateInputPositiveNumber = (event) => {
  let value = event.target.value;
  // Check if the input is a valid number format
  if (!/^\d*([.,])?\d*$/.test(value)) {
    event.target.value = event.target.value.slice(0, -1);
    return;
  }
  value = parseFloat(value);
  if (isNaN(value) || value < 0) {
    event.target.value = event.target.value.slice(0, -1);
  }
};

function validateInputs() {
  if (!file.value) {
    alert('Please provide a file.');
    return false;
  }

  if (!gridName.value) {
    alert('Please provide a name for the grid. It does not have to be unique');
    return false;
  }

  if (!noColors.value || noColors.value <= 0) {
    alert('Please provide a number of colors. It must be greater than 0');
    return false;
  }

  if (!noBlocks.value || noBlocks.value <= 0) {
    alert('Please provide a number of blocks. It must be greater than 0');
    return false;
  }

  if (!scaleFactor.value || scaleFactor.value <= 0) {
    alert('Please provide a scale factor. It cannot be 0');
    return false;
  }

  scaleFactor.value = scaleFactor.value.replace(',', '.');

  if ((!thickLineFrequency.value || thickLineFrequency.value < 0) && isGrid.value) {
    alert('Please provide a thick line frequency. It must be greater than 0');
    return false;
  }

  return true;
}

async function sendImageToServer() {
  if (!validateInputs()) {
    return;
  }
  isProcessing.value = true;
  currentLabelIndex.value = 0;
  processingLabel.value = processingLabels.value[currentLabelIndex.value];
  intervalId = setInterval(() => {
    currentLabelIndex.value = (currentLabelIndex.value + 1) % processingLabels.value.length;
    processingLabel.value = processingLabels.value[currentLabelIndex.value];
  }, 6000);
  const formData = new FormData();
  formData.append('image', file.value); // Append file from ref
  formData.append('is_height', isHorizontal.value);
  formData.append('block_num', noBlocks.value);
  formData.append('max_colors', noColors.value);
  formData.append('thick_line_freq', isGrid.value ? thickLineFrequency.value : 5);
  formData.append('scale_factor', scaleFactor.value); // Use ref value
  formData.append('generate_grid', isGrid.value);
  try {
    const response = await axios.post('http://localhost:5000/pixelate_image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    // Now response.data.image should be a base64 string
    imageUrl.value = 'data:image/png;base64,' + response.data.image;

    // response.data.colors should be an array of colors
    usedColors.value = response.data.colors;

    isProcessing.value = false;
    clearInterval(intervalId);
    newGridCreated.value = true;

  } catch (error) {
    console.error('Error uploading image:', error);
    isProcessing.value = false;
    clearInterval(intervalId);
    newGridCreated.value = false;
  }
}
</script>

<style scoped>
.create-container {
  width: 86%;
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
}

.button-container {
  display: flex;
  justify-content: flex-end;
  width: 86%;
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

.vue-loading-text {
  visibility: visible;
  /* Make sure it's not hidden */
  color: black;
  /* Ensure the text is a visible color */
  font-size: 16px;
  /* Ensure the text has a reasonable size */
}

.vue-loading-text {
  z-index: 100;
  /* Make it higher than the overlay's z-index if needed */
}

.container {
  display: flex;
  /* Enables flexbox */
  justify-content: space-between;
  /* Spaces out the child divs */
  padding: 20px;
  /* Adds padding around the contents */
}


.left-panel {
  display: flex;
  align-items: center;
  /* Vertically center the content */
  justify-content: center;
  /* Horizontally center the content */
  height: 100px;
  /* Set a fixed height for demonstration */
}

.right-panel {
  display: flex;
  align-items: baseline;
  /* Aligns items to their baseline */
  height: 100px;
  /* Set a fixed height for demonstration */
}

.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-modal {
  background-color: rgb(255, 255, 255);
  padding: 40px 30px;
  border-radius: 30px;
  width: 400px;
}

.modal-header {
  margin-bottom: 40px;
  font-size: 32px;
  font-weight: 500;
  justify-content: center;
  align-items: center;
}

.btn-orange {
  background-color: #d95b00;
  border-color: #d95b00;
  color: white;
}

.btn-yellow {
  border-color: #fbc46a;
  color: #fbc46a;
  background-color: rgb(248, 248, 248);
}
</style>