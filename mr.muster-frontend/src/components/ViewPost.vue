<template>
    <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0" />
    </head>
    <AppHeader />
    <div class="post-container container">
        <div class="pic-arrow">
            <a href="#" class="material-symbols-outlined arrow">arrow_back</a>
            <img :src="content">
        </div>
        <div class="comment-section">
            <div class="top-comment-section">
                <div class="name-top-com-section">
                    <p class="sub-header">{{ title }}</p>
                    <div class="name-bot-com-section">
                        <p>{{ commentsAmount }} comments</p>
                        <p> {{ likes }}</p>
                        <button class="material-symbols-outlined like-icon">favorite</button>
                    </div>
                </div>
                <div class="user-comment user-container">
                    <p>@{{ gridAuthor }}</p>
                    <button @click="handleButtonClick" class="button-image">
                        <img :src="authorIcon" class="image-button"> 
                    </button>
                </div>
            </div>
            
            <div class="comment-box">
                <p v-if="!renderComments().length">Be the first to leave the comment!</p>
                <Comment v-for="item in renderComments()" :key="item.comment.id" :comment="item.comment" :user="item.user" :userID="item.username" :userIcon="item.userIcon"/>
            </div>
            <div class="comment-input-group">
                <input type="text" class="comment-input" placeholder="Add comment">
                <button class="material-symbols-outlined send-icon">send</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import AppHeader from './AppHeader.vue';
import Comment from "./Comment.vue";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref } from "vue";

const title = ref("");
const likes = ref(0);
const commentsAmount = ref(0);
const gridAuthor = ref("");
const authorIcon = ref("");
const content = ref("");
const commentsIDs = ref([]);
const allComments = ref({});
const commentUsersIDs = ref({});
const allUsers = ref({});

const getGridInfo = async (gridID) => {
  const gridRef = doc(db, "Grids", gridID);
  const gridSnap = await getDoc(gridRef);
  const gridData = gridSnap.data();
  if (gridData) {
    likes.value = gridData.Likes ? gridData.Likes.length : 0;
    commentsAmount.value = gridData.Comments ? gridData.Comments.length : 0;
    title.value = gridData.Title;
    content.value = gridData.Content;

    const authorID = gridData.Author;
    if (authorID) {
      const authorRef = doc(db, "Users", authorID.path.split('/')[1]);
      const authorSnap = await getDoc(authorRef);
      if (authorSnap.exists()) {
        gridAuthor.value = authorSnap.data().Username;
        authorIcon.value = authorSnap.data().Icon;
      }
    }
    commentsIDs.value = gridData.Comments || [];
    await fetchComments(commentsIDs.value);
    await fetchUsers(Object.values(commentUsersIDs.value));
  }
};

const fetchComments = async (commentsIDs) => {
  if (commentsIDs) {
    for (const commentID_path of commentsIDs) {
      const commentID = commentID_path.path.split('/')[1];
      const commentRef = doc(db, "Comments", commentID);
      const commentSnap = await getDoc(commentRef);
      const commentData = commentSnap.data();
      allComments.value[commentID] = commentData;
      const userID = commentData.Author.path.split('/')[1];
      const userRef = doc(db, "Users", userID);
      const userSnap = await getDoc(userRef);
      commentUsersIDs.value[commentID] = [userID, userSnap.data().Username, userSnap.data().Icon];
    }
  } else {
    allComments.value = {};
  }
};

const fetchUsers = async (usersIDs) => {
  if (usersIDs) {
    for (const [userID, username] of usersIDs) {
      const userRef = doc(db, "Users", userID);
      const userSnap = await getDoc(userRef);
      allUsers.value[username] = userSnap.data();
    }
  } else {
    allUsers.value = {};
  }
};

const renderComments = () => {
  if (!allComments.value) {
    return [];
  }
  return Object.keys(allComments.value).map(commentID => {
    const comment = allComments.value[commentID];
    if (!commentUsersIDs.value[commentID]) {
      return null;
    }
    const [userID, username, userIcon] = commentUsersIDs.value[commentID];
    const user = allUsers.value[userID];
    return {comment, user, userID, username, userIcon};
  }).filter(comment => comment !== null);
};

getGridInfo("kTze50ggmENEcKIbwzfG");

</script>

<style scoped>
* {
    --font-family: 'Lexend', sans-serif;
    --font-weight: 200;
    --font-size: 20px;
    --hover: 0 0.5em 0.5em -0.4em;
    margin: 0;
    padding: 0;
    font-size: var(--font-size);
    font-family: var(--font-family);
    font-weight: var(--font-weight);
}

a {
    text-decoration: none;
    color: black;
}

.comment-content,
.top-comment-section,
.name-bot-com-section,
.comment-input-group {
    display: flex;
    justify-content: center;
}

.comment p {
    color: black;
    text-align: left;
}

.post-container {
    padding: 0;
    margin: 7vh 7vw;
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
}
.pic-arrow {
    width: max-content;
    display: flex;
    justify-content: space-evenly;
    align-items: flex-start;
}
.pic-arrow img {
    width: 30vw;
    height: auto;
    object-fit: cover;
    margin-right: 2vw;
}
.comment-section {
    width: 100%;
    display: flex;
    flex-direction: column; 
}
.top-comment-section,
.name-bot-com-section,
.comment-input-group {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
    margin: 0;
}
.comment-input-group {
    margin-top: auto;
    align-self: flex-end;
    align-items: center;
}

.name-top-com-section p,
.like-icon,
.send-icon {
    font-weight: var(--font-weight);
    text-align: left;
}
.comment-input {
    width: 100%;
    display: flex;
    padding: 10px;
    border: 1px solid;
    border-radius: 50em;
}

.send-icon {
    font-size: 2.5em;
}

p + p,
.comment-input + span,
.arrow + img {
    margin-left: 2vw;
}

.sub-header {
    font-size: 2em;
    margin: 1vh 0;
}

.image-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
}
</style>
