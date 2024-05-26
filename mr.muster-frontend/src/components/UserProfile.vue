<template>
    <div class="profile-container container p-3 my-3 mt-5">
      <div class="user-container">
        <p class="username">{{ name }}</p>
        <button @click="handleButtonClick" class="button-image">
          <img :src="userIcon" class="image-button" />
        </button>
      </div>
      <div class="stat-container">
        <div class="stat"> 
          <p>{{ likes }}</p>
          <hr />
          <p>Likes</p>
        </div>
        <div class="stat"> 
          <p>{{ comments }}</p>
          <hr />
          <p>Comments</p>
        </div>
      </div>
    </div>
    <div class="profile-grids container p-3 my-3 mt-5">
      <div class="user-grids grids-container">
        <p v-if="isLoggedUserProfile">Patterns created by you</p>
        <p v-else>Patterns created by {{ name }}</p>
        <div class="pic-grid mt-3" v-if="userHasPosts()">
          <div class="row">
            <div
              class="col"
              v-for="(column, columnIndex) in columns(userGrids)"
              :key="columnIndex"
            >
              <template v-for="post in column" :key="post.id">
                <RouterLink :to="`/view-post/${post.id}`">
                  <img :src="post.postUrl" class="img-post"/>
                </RouterLink>
              </template>
            </div>
          </div>
        </div>
        <div v-else>
          <p v-if="isLoggedUserProfile">You haven't created any patterns yet.</p>
          <p v-else>{{ name }} hasn't created any patterns yet.</p>
        </div>
      </div>
  
      <div class="vr"></div>
  
      <div class="liked-grids grids-container">
        <p v-if="isLoggedUserProfile">Your Favourites</p>
        <p v-else>{{ name }}'s Favourites</p>
        <div class="pic-grid mt-3" v-if="userLikedPosts()">
          <div class="row">
            <div
              class="col"
              v-for="(column, columnIndex) in columns(likedGrids)"
              :key="columnIndex"
            >
              <template v-for="post in column" :key="post.id">
                <RouterLink :to="`/view-post/${post.id}`">
                  <img :src="post.postUrl" class="img-post"/>
                </RouterLink>
              </template>
            </div>
          </div>
        </div>
        <div v-else>
            <p v-if="isLoggedUserProfile">You haven't liked any patterns yet.</p>
            <p v-else>{{ name }} hasn't liked any patterns yet.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRoute } from "vue-router";
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "../firebase";
  import { ref, watch, onMounted } from "vue";
  import { getAuth, onAuthStateChanged } from "firebase/auth";

  const route = useRoute();
  const userProfileID = ref('');
  const likes = ref(0);
  const comments = ref(0);
  const name = ref("");
  const userIcon = ref("");
  const userGrids = ref([]);
  const likedGrids = ref([]);
  const isLoggedUserProfile = ref(false);

  userProfileID.value = route.params.id;
  
  const getUserInfo = async (userId) => {
    const userRef = doc(db, "Users", userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    if (userData) {
      name.value = userData.Username;
      userIcon.value = userData.Icon;
      if (userData.OwnedGrids) {
        for (let i = 0; i < userData.OwnedGrids.length; i++) {
          const gridID = userData.OwnedGrids[i].path.split("/")[1];
          const gridInfo = await fetchGridInfo(gridID);
          if (!isLoggedUserProfile.value && gridInfo.IsPrivate) {
            continue;
          }
          comments.value += gridInfo.Comments.length;
          userGrids.value.push(gridInfo);
        }
      }
      if (userData.LikedPosts) {
        for (let i = 0; i < userData.LikedPosts.length; i++) {
          const gridID = userData.LikedPosts[i].path.split("/")[1];
          const gridInfo = await fetchGridInfo(gridID);
          if (!isLoggedUserProfile.value && gridInfo.IsPrivate) {
            continue;
          }
          likedGrids.value.push(gridInfo);
          likes.value += gridInfo.Likes.length;
        }
      }
    }
  };
  
  const fetchGridInfo = async (gridId) => {
    const gridRef = doc(db, "Grids", gridId);
    const gridSnap = await getDoc(gridRef);
    const gridData = gridSnap.data();
    if (gridData) {
      return {
        id: gridId,
        postUrl: gridData.Content,
        IsPrivate: gridData.IsPrivate,
        Comments: gridData.Comments,
        Likes: gridData.Likes,
      };
    }
  };

  watch(
    () => route.params.id,
    () => {
      window.location.reload();
    }
); 
  
  const columns = (grids) => {
    const columnCount = 3;
    const result = [];
    for (let i = 0; i < columnCount; i++) {
      result.push([]);
    }
    grids.forEach((grid, index) => {
      const columnIndex = index % columnCount;
      result[columnIndex].push(grid);
    });
    return result;
  };
  onMounted(async () => {
    await getUserInfo(userProfileID.value);
  });

  function userHasPosts() {
    return userGrids.value.length > 0;
  }

  function userLikedPosts() {
    return likedGrids.value.length > 0;
  }

  onAuthStateChanged(getAuth(), (user) => {
    if (user) {
      isLoggedUserProfile.value = user.uid === userProfileID.value;
    }
  });
  </script>
  
  <style scoped>
  * {
    --font-family: "Lexend", sans-serif;
    --font-weight: 200;
    --font-size: 1.1em;
    --stat-width: 10vw;
    --grids-container-width: 50%;
    --user-grids-margin-right: 3vw;
    --liked-grids-margin-left: 3vw;
    --row-padding: 1vh 0.5vw;
    font-family: var(--font-family);
    font-weight: var(--font-weight);
    font-size: var(--font-size);
  }
  .user-container p {
    margin-bottom: 1vh;
  }
  .button-image {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    display: inline-block;
  }
  .image-button {
    width: 20vh;
    height: 20vh;
    border-radius: 50%;
    object-fit: cover;
  }
  .profile-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .stat-container {
    display: flex;
    width: var(--grids-container-width);
    justify-content: space-around;
    margin-top: 3vh;
  }
  .stat {
    width: var(--stat-width);
  }
  .stat p,
  .stat hr {
    margin: 0;
    padding: 0;
  }
  .stat hr {
    width: 100%;
    margin: 0.5vh 0;
    border: 1px solid black;
  }
  .profile-grids {
    display: flex;
    justify-content: space-around;
  }
  .grids-container {
    width: var(--grids-container-width);
  }
  
  .user-grids {
    margin-right: var(--user-grids-margin-right);
  }
  .liked-grids {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: var(--liked-grids-margin-left);
  }
  #row > * {
    padding: var(--row-padding);
  }
  .vr {
    border: 2px solid;
  }
  .img-post {
    max-width: 100%;
    border-radius: 10px;
    margin: 1vh 0;
    transition: box-shadow 0.3s ease;
  }
  .img-post:hover {
    cursor: pointer;
    box-shadow: -8px 8px 8px rgba(105,16,119, 0.4);
  }
  </style>