<template>
    <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0" />
    </head>
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
                        <a href="#" class="material-symbols-outlined like-icon">favorite</a>
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
                <Comment v-for="item in renderComments()" :key="item.comment.id" :comment="item.comment" :user="item.user" :userID="item.userID"/>
            </div>
            <div class="comment-input-group">
                <input type="text" class="comment-input" placeholder="Add comment">
                <a href="#" class="material-symbols-outlined like-icon">favorite</a>
            </div>
        </div>
    </div>
</template>

<script>
import Comment from "./Comment.vue";
import { mockFirestore } from "../database/mockFirebaseFunctions";
//import { all } from "core-js/fn/promise";
export default {
  name: "view-post",
  components: {
    Comment,
  },
  data() {
    return {
        title: null,
        likes: null,
        commentsAmount: null,
        gridAuthor: null,
        authorIcon: null,
        content: "",
        commentsIDs: [],
        allComments: {},
        commentUsersIDs: {},
        allUsers: {},
    };
  },
  created() {
    this.fetchGridData("gridID1");
  },
  watch: {
        allComments: {
            handler(newVal) {
            if (Object.keys(newVal).length) {
                this.renderComments();
            }
            },
            deep: true
        },
        allUsers: {
            handler(newVal) {
                if (Object.keys(newVal).length) {
                    this.renderUsers();
                }
            },
            deep: true
        },
        commentUsersIDs: {
            handler(newVal) {
                if (Object.keys(newVal).length) {
                    this.renderUsers();
                }
            },
            deep: true
        },
    },
  methods: {
    async fetchGridData(gridId) {
        const docSnapshot = await mockFirestore.collection("grids").doc(gridId).get();
        const gridData = docSnapshot.data();
        this.likes = gridData ? gridData.likes.length : null;
        this.commentsAmount = gridData ? gridData.comments.length : null;
        this.title = gridData ? gridData.title : null;
        this.gridAuthor = gridData ? gridData.author : null;
        if (gridData && gridData.content) {
            import(`../assets/${gridData.content}`).then((image) => {
                this.content = image.default;
        });
        } else {
            this.content = null;
        }
        this.commentsIDs = gridData ? gridData.comments : [];
        await this.fetchComments(this.commentsIDs);
        await this.fetchUsers(Object.values(this.commentUsersIDs));
        await this.fetchAuthorIcon();
    },
    
    async fetchComments(commentsIDs) {
        if (commentsIDs) {
            for (const commentID of commentsIDs) {
                const commentSnapshot = await mockFirestore.collection("comments").doc(commentID).get();
                const commentData = commentSnapshot.data();
                this.allComments[commentID] = commentData;
                this.commentUsersIDs[commentID] = commentData.author;
            }
        } else {
            this.allComments = {};
        }
    },
    async fetchUsers(usersIDs) {
        if (usersIDs) {
            for (const userID of usersIDs) {
                const userSnapshot = await mockFirestore.collection("users").doc(userID).get();
                const userData = userSnapshot.data();
                this.allUsers[userID] = userData;
            }
        } else {
            this.allUsers = {};
        }
    },
    async fetchAuthorIcon() {
        const docSnapshot = await mockFirestore.collection("users").doc(this.gridAuthor).get();
        const authorData = docSnapshot.data();
        if (authorData && authorData.userIcon) {
            import(`../assets/${authorData.userIcon}`).then((image) => {
                this.authorIcon = image.default;
            });
        } else {
            this.authorIcon = null;
        }
    },
    renderComments() {
        return Object.keys(this.allComments).map(commentID => {
            const comment = this.allComments[commentID];
            const userID = this.commentUsersIDs[commentID];
            const user = this.allUsers[userID];
            return {comment, user, userID};
        });
    },
    renderUsers() {
        return Object.keys(this.allUsers).map(commentID => {
            return this.allUsers[this.commentUsersIDs[commentID]];
        });
    }
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
