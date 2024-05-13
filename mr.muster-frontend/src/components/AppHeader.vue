<template>
  <head>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap"
      rel="stylesheet"
    />
  </head>
  <nav>
    <div class="top-nav">
      <div class="logo">
        <img
          src="../assets/cat-logo.png"
          alt="logo"
          @click="navigateToHome()"
        />
      </div>
      <div class="buttons-container" v-if="!userState">
        <button class="btn log-button" @click="openLoginModal()">Log in</button>
        <button class="btn sign-button" @click="openRegisterModal()">
          Get started
        </button>
      </div>
      <div class="buttons-container" style="gap: 20px" v-else>
        <div class="user-container">
          <button @click="navigateToUserProfile()" class="button-image">
            <img src="../assets/mock-user.png" class="image-button" />
          </button>
        </div>
        <button class="btn sign-button" @click="logout">Log out</button>
      </div>
      <slot></slot>
    </div>
    <div class="search-bar" id="search-bar">
      <span v-on:click="saveInput()" class="material-symbols-outlined"
        >search</span
      >
      <input
        class="search-input"
        type="search"
        v-model="searchInput"
        @keydown.enter="saveInput()"
        placeholder="Search the grid..."
      />
      <select
        class="form-select"
        id="select-search"
        v-model="searchCriteria"
        @change="saveChoice"
      >
        <option value="option-title">by title</option>
        <option value="option-author">by author</option>
      </select>
    </div>
  </nav>
  <LoginModal
    v-if="openLogin"
    :registerMode="registerModeRef"
    @close="closeModal"
  />
</template>

<script setup>
import { useRouter } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import { ref, defineProps, defineEmits } from "vue";
import LoginModal from "./LoginModal.vue";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";

const router = useRouter();
const userState = ref(false);
const openLogin = ref(false);
const registerModeRef = ref(false);

const searchCriteria = ref("option-title");
const searchInput = ref("");
const searchResults = ref([]);
const isSearching = ref(false);

const emit = defineEmits(["reset"]);

const props = defineProps({
  getResult: {
    type: Function,
  },
});

function openLoginModal() {
  openLogin.value = true;
  registerModeRef.value = false;
}

function openRegisterModal() {
  openLogin.value = true;
  registerModeRef.value = true;
}

onAuthStateChanged(auth, (user) => {
  userState.value = !!user; // shorthand to convert truthy/falsy to boolean
});

function navigateToHome() {
  router.push("/");
}

function navigateToUserProfile() {
  router.push("/user-profile");
}

function closeModal() {
  openLogin.value = false;
}

const logout = () => {
  return signOut(auth);
};

function saveChoice() {
  localStorage.setItem("searchCriteria", searchCriteria.value);
}

const resetSearch = () => {
  searchResults.value = [];
};

async function saveInput() {
  emit("reset");
  resetSearch();
  saveChoice();
  localStorage.setItem("searchInput", searchInput.value);
  await handleSearch(searchInput.value, searchCriteria.value);
  console.log(searchResults.value.length);
  isSearching.value = true;
  props.getResult(searchResults.value, isSearching.value, searchInput.value);
  searchInput.value = "";
}

async function handleSearch(searchInput, searchCriteria) {
  const querySnapshot = await getDocs(collection(db, "Grids")); // search | grids | criteria
  querySnapshot.forEach(async (document) => {
    const data = document.data();
    if (searchCriteria === "option-title") {
      const searchForTitle = data.Title.toLowerCase();
      if (searchForTitle.includes(searchInput.toLowerCase())) {
        console.log(
          searchForTitle,
          searchInput.toLowerCase(),
          searchForTitle.includes(searchInput.toLowerCase())
        ); //debug
        searchResults.value.push({
          id: document.id,
          postUrl: data.Content,
        });
      }
    } else if (searchCriteria === "option-author") {
      const userRef = doc(db, "Users", data.Author.path.split("/")[1]);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const searchForUsername = userData.Username.toLowerCase();
      if (searchForUsername.includes(searchInput.toLowerCase())) {
        console.log(
          searchForUsername,
          searchInput.toLowerCase(),
          searchForUsername.includes(searchInput.toLowerCase())
        ); //debug
        searchResults.value.push({
          id: document.id,
          postUrl: data.Content,
        });
      }
    }
  });
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}
nav,
.top-nav {
  width: 100%;
}
nav {
  height: 150px;
  background-image: linear-gradient(to right, #f59f61, #e43f6c, #4b057a);
  padding: 0 7vw;
}
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 1vh 5vw 0;
}
.logo {
  width: max-content;
}
.logo img {
  width: 90px;
  z-index: 1;
}

.logo:hover {
  cursor: pointer;
}

.search-bar {
  --padding: 14px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: var(--padding);
  background: linear-gradient(white, white) padding-box,
    linear-gradient(to right, #4b057a, #e43f6c) border-box;
  border-radius: 50em;
  border: 3px solid transparent;
  transition: box-shadow 0.25s;
}
.search-bar:focus-within {
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.75);
}
.search-input {
  font-size: 16px;
  font-family: "Lexend", sans-serif;
  color: #333333;
  margin-left: var(--padding);
  outline: none;
  border: none;
  background: transparent;
  width: 95%;
}
.search-input::placeholder {
  color: rgba(0, 0, 0, 0.5);
}
.material-symbols-outlined {
  color: #4b057a;
}

.buttons-container {
  width: max-content;
  height: 70px;
  padding-bottom: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  font-size: 16px;
  border-radius: 40px;
}

.log-button {
  background-color: #d95b00;
  border-color: #d95b00;
  color: white;
  width: 110px;
}
.sign-button {
  border-color: #fbc46a;
  color: #fbc46a;
}

.user-container,
.user-container p {
  font-size: 1em;
  color: white;
}

.user-container {
  font-weight: 100;
  padding-bottom: 10px;
}

.user-container p {
  font-weight: var(--font-weight);
  margin-bottom: 0;
}

.user-container:hover,
.user-container:focus {
  box-shadow: var(--hover);
  transform: translateY(-0.25em);
}

.image-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

button {
  font-family: Lexend, sans-serif;
}

.btn:hover {
  background-color: #f5bc6c;
  border-color: #f5bc6c;
}

#select-search {
  font-family: "Lexend", sans-serif;
  font-size: 16px;
  height: 100%;
  margin: 0;
  width: 20vw;
}
#select-search:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(105, 16, 119, 0.5);
}
</style>
