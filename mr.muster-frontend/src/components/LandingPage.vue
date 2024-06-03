<template>
  <div>
    <div v-if="!isSearching">
      <div class="container">
        <div class="text-container">
          <h1>Create your own grid</h1>
          <p>try your custom size and colors</p>
        </div>
        <div class="upload-container">
          <button class="btn upload-button" @click="navigateToCreate()">Upload image</button>
          <a href="#">or paste URL</a>
        </div>
      </div>
      <div class="pic-grid">
        <div class="row">
          <div class="col" v-for="(column, columnIndex) in columnsPosts()" :key="columnIndex">
            <template v-for="post in column" :key="post.id">
              <RouterLink :data-cy="`post-link-${post.id}`" :to="`/view-post/${post.id}`">
                <img :src="post.postUrl" class="img-post"/>
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="search-result-container" v-else>
      <div v-if="searchResults.length === 0">
        <h2>No results found for "{{ searchInput }}"</h2>
        <button data-cy="back-home-button" @click="navigateToHome" class="go-back-button">
          Back to All Grids
        </button>
      </div>

      <div class="search-result-container" v-else>
        <h2>Search Results for "{{ searchInput }}"</h2>
        <div class="pic-grid">
          <div class="row">
            <div
              class="col"
              v-for="(column, columnIndex) in columnsResults()"
              :key="columnIndex"
            >
              <template v-for="post in column" :key="post.id">
                <RouterLink :data-cy="`post-link-${post.id}`" :to="`/view-post/${post.id}`">
                  <img :src="post.postUrl" class="img-post"/>
                </RouterLink>
              </template>
            </div>
          </div>
        </div>
        <button data-cy="back-home-button" @click="navigateToHome" class="go-back-button">
          Back to All Grids
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { ref, onBeforeMount, watch } from "vue";

const router = useRouter();
const posts = ref([]);

const searchResults = ref([]);
const isSearching = ref(false);
const searchInput = ref('');

async function getPosts() {
  const querySnapshot = await getDocs(collection(db, "Grids"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.Content && !data.IsPrivate) {
      posts.value.push({
        id: doc.id,
        postUrl: data.Content,
      });
    }
  });
}

onBeforeMount(async () => {
  router.push('/');
  await getPosts();
});

watch([
  () => router.currentRoute.value.query.search,
  () => router.currentRoute.value.query.criteria],
  async ([newSearch, newCriteria]) => {
  resetSearch();
  if (newSearch) {
      searchInput.value = newSearch;
      await handleSearch(newCriteria);
    }
});

const columnsPosts = () => {
  const columnCount = 3;
  const result = [];
  for (let i = 0; i < columnCount; i++) {
    result.push([]);
  }
  posts.value.forEach((post, index) => {
    const columnIndex = index % columnCount;
    result[columnIndex].push(post);
  });
  return result;
};

const columnsResults = () => {
  const columnCount = 3;
  const result = [];
  for (let i = 0; i < columnCount; i++) {
    result.push([]);
  }
  searchResults.value.forEach((post, index) => {
    const columnIndex = index % columnCount;
    result[columnIndex].push(post);
  });
  return result;
};

async function handleSearch(searchCriteria) {
  isSearching.value = true;
  const querySnapshot = await getDocs(collection(db, "Grids"));
  querySnapshot.forEach(async (document) => {
    const data = document.data();
    if (searchCriteria === "option-title") {
      const searchForTitle = data.Title.toLowerCase();
      if (searchForTitle.includes(searchInput.value.toLowerCase())) {
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
      if (searchForUsername.includes(searchInput.value.toLowerCase())) {
        searchResults.value.push({
          id: document.id,
          postUrl: data.Content,
        });
      }
    }
  });
}

function resetSearch() {
  isSearching.value = false;
  searchResults.value = [];
  searchInput.value = '';
}

function navigateToHome() {
  resetSearch();
  router.push("/");
}

function navigateToCreate() {
  router.push("/create");
}
</script>

<style scoped>
* {
  font-family: "Lexend", sans-serif;
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
.upload-button {
  background-color: #b73c91;
  border-color: #b73c91;
  color: white;
  border-radius: 40px;
  font-weight: 200;
  font-size: 1.5em;
  width: 230px;
}
.upload-button:hover {
  background-color: #d172b4;
  border-color: #d172b4;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.upload-container a {
  text-decoration: none;
  color: white;
  font-family: "Lexend", sans-serif;
  font-size: 1.2em;
}

.container {
  width: 100vw;
  height: 40vh;
  margin: 10vh 10vw 10vh 7vw;
  padding: 5vh 5vw;
  background-image: linear-gradient(
    to right,
    rgb(149, 122, 177),
    rgb(157, 53, 168)
  );
  border-radius: 20px;
  color: white;
  font-weight: 100;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.container h1 {
  font-weight: 100;
  font-size: 3.5em;
}
.container p {
  font-size: 1.3em;
}
.text-container {
  text-align: left;
}
.pic-grid {
  margin: 0 7vw;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
}

.img-post {
  width: 100%;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-bottom: 4vh;
  transition: box-shadow 0.3s ease;
}

.img-post:hover {
  cursor: pointer;
  box-shadow: -8px 8px 8px rgba(105,16,119, 0.4);
}

.search-container {
  margin-top: 8vh;
}

.go-back-button {
  color: black;
  box-shadow: inset 0 0 0 0 #324355;
  margin: 5vh 5vw -.25rem;
  padding: 0 .25rem;
  transition: color .3s ease-in-out, box-shadow .3s ease-in-out;
  text-decoration: underline;
  font-size: 1.3em;
}

.go-back-button:hover {
  box-shadow: inset 320px 0 0 0 #324355;
  color: white;
}

.search-result-container {
  margin: 10vh 0;
}
</style>