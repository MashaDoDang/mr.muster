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
        <RouterLink to="/"><img :src="logo" alt="logo"/></RouterLink>
      </div>
      <div class="buttons-container" v-if="!userState">
        <button class="btn log-button" @click="openLoginModal()">Log in</button>
        <button class="btn sign-button" @click="openRegisterModal()">
          Get started
        </button>
      </div>
      <div class="buttons-container" style="gap: 20px" v-else>
        <div class="user-container">
          <RouterLink :to="`/user-profile/${userID}`">
            <button class="button-image">
              <img :src="userIcon" class="image-button" />
            </button>
          </RouterLink>
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
import { ref } from "vue";
import LoginModal from "./LoginModal.vue";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const router = useRouter();
const userState = ref(false);
const openLogin = ref(false);
const registerModeRef = ref(false);
const userID =  ref("");
const userIcon = ref("");
const logo = ref("https://firebasestorage.googleapis.com/v0/b/mrmuster.appspot.com/o/cat-logo.png?alt=media&token=04a58dcb-e889-4df9-8fe8-0bc6301349b2");

const searchCriteria = ref("option-title");
const searchInput = ref("");


function openLoginModal() {
  openLogin.value = true;
  registerModeRef.value = false;
}

function openRegisterModal() {
  openLogin.value = true;
  registerModeRef.value = true;
}

onAuthStateChanged(auth, async (user) => {
  if (user) {  
    userState.value = !!user; // shorthand to convert truthy/falsy to boolean
    userID.value = auth.currentUser.uid; 
  
    await getUserIcon();
  } else {
    userState.value = false;
  }

});

async function getUserIcon() {
  console.log(userID.value);
  const userRef = doc(db, "Users", userID.value);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  if (userData) {
    userIcon.value = userData.Icon;
  }
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

function saveInput() {
  localStorage.setItem("searchInput", searchInput.value);
  router.push({ name: "LandingPage", query: { search: searchInput.value, criteria: searchCriteria.value } });
  searchInput.value = "";
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