<template>
    <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0" />
    </head>
    <AppHeader/>
    <div class="post-container container my-3 mt-5">
        <div class="pic-arrow">
            <a href="#" class="material-symbols-outlined arrow">arrow_back</a>
            <img src="../assets/mock-img3.jpg">
        </div>
        <div class="comment-section">
            <div class="top-comment-section">
                <div class="name-top-com-section">
                    <p class="sub-AppHeader">Name Grid</p>
                    <div class="name-bot-com-section">
                        <p>25 comments</p>
                        <p>10</p>
                        <a href="#" class="material-symbols-outlined like-icon">favorite</a>
                    </div>
                </div>
                <div class="user-comment user-container">
                    <p>@username</p>
                    <button @click="handleButtonClick" class="button-image">
                        <img src="../assets/mock-user1.png" class="image-button">
                    </button>
                </div>
            </div>
            <div class="comment-box">
                <div class="user-comment">
                    <div class="user">
                        <button @click="handleButtonClick" class="button-image">
                            <img src="../assets/mock-user3.png" class="image-button">
                        </button>
                    </div>
                    <div class="comment">
                        <div class="comment-content">
                            <p class="username">username</p>
                            <p>bla bla bla bla bla bla bla bla</p>
                        </div>
                        <p>20.03.2024 14:03</p>
                    </div>
                </div>

                <div class="user-comment">
                    <div class="user">
                        <button @click="handleButtonClick" class="button-image">
                            <img src="../assets/mock-user2.png" class="image-button">
                        </button>
                    </div>
                    <div class="comment">
                        <div class="comment-content">
                            <p class="username">username</p>
                            <p>bla bla bla bla bla bla </p>
                        </div>
                        <p>20.03.2024 14:23</p>
                    </div>
                </div>
            </div>
            <div class="comment-input-group">
                <input type="text" class="comment-input" placeholder="Add comment">
                <a href="#" class="material-symbols-outlined like-icon">favorite</a>
            </div>
        </div>
    </div>
</template>

<script>
import AppHeader from "./AppHeader.vue";
export default {
  name: "view-post",
  components: {
    AppHeader,
  },
};
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

.user-comment,
.comment-content,
.top-comment-section,
.name-bot-com-section,
.comment-input-group {
    display: flex;
    justify-content: center;
}

.user-comment {
    margin: 2vh 0;
    justify-content: left;
}

.user-comment p,
.comment p {
    color: black;
    text-align: left;
}

.button-image {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    display: inline-block;
}

.image-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
}

.post-container {
    padding: 0;
    width: 100%;
    height: auto;
    display: flex;
}
.pic-arrow {
    width: max-content;
    display: flex;
    justify-content: space-evenly;
    align-items: flex-start;
    margin-right: 5px;
}
.pic-arrow img {
    width: 30vw;
    height: auto;
    object-fit: cover;
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
.user-comment.user-container {
    align-items: center;
}
.user-comment.user-container p {
    margin-right: 1vw;
}
.comment-input-group {
    margin-top: auto;
    align-self: flex-end;
    align-items: center;
}

.name-top-com-section p,
.like-icon {
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

.comment-input-group .like-icon {
    font-size: 2.5em;
}

p + p,
.comment-input + span,
.arrow + img {
    margin-left: 2vw;
}

.sub-AppHeader {
    font-size: 2em;
    margin: 1vh 0;
}
</style>