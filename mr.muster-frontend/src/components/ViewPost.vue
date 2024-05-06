<template>

    <head>
        <link rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0" />
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
                    <div class="name-bot-com-section" style="display: flex; justify-content: flex-start; gap: 30px;">
                        <p>{{ commentsAmount }} comments</p>
                        <div style="display: flex;">
                            <p> {{ likes }}</p>
                            <button class="material-symbols-outlined like-icon">favorite</button>
                        </div>
                    </div>
                </div>
                <div class="user-comment user-container">
                    <p>@{{ gridAuthor }}</p>
                    <button @click="handleButtonClick" class="button-image">
                        <img :src="authorIcon" class="image-button">
                    </button>
                </div>
            </div>

            <div class="comment-input-group" style="margin: 30px 0px;">
                <input type="text" class="comment-input" placeholder="Add comment" v-model="newComment">
                <button class="material-symbols-outlined send-icon" @click="addComment">send</button>
            </div>
            <div class="comment-box">
                <p v-if="!renderComments().length" style="margin-top: 40px;">Be the first to leave a comment!</p>
                <Comment v-for="item in renderComments()" :key="item.comment.id" :comment="item.comment" :user="item"
                    :userID="item.username" :userIcon="item.userIcon" :commentRef="item.commentRef"
                    @commentDeleted="handleCommentDeleted" @removeCommentFromState="removeCommentFromState"
                    @commentUpdated="handleCommentUpdated" />
            </div>

        </div>
    </div>
</template>

<script>
import Comment from "./Comment.vue";
import { db } from "../firebase";
import { doc, getDoc, addDoc, collection, arrayUnion, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
    name: "view-post",
    components: {
        Comment,
    },
    data() {
        return {
            title: "",
            likes: 0,
            commentsAmount: 0,
            gridAuthor: "",
            authorIcon: "",
            content: "",
            newComment: '',
            commentsIDs: [],
            allComments: {},
            commentUsersIDs: {},
            allUsers: {},
        };
    },
    created() {
        this.getGridInfo();
    },
    methods: {
        async getGridInfo() {
            const gridID = this.$route.params.id;
            const gridRef = doc(db, "Grids", gridID);
            const gridSnap = await getDoc(gridRef);
            const gridData = gridSnap.data();
            if (gridData) {
                this.likes = gridData.Likes ? gridData.Likes.length : 0;
                this.commentsAmount = gridData.Comments ? gridData.Comments.length : 0;
                this.title = gridData.Title;
                this.content = gridData.Content;

                const authorID = gridData.Author;
                if (authorID) {
                    const authorRef = doc(db, authorID.path); // Changed this line
                    const authorSnap = await getDoc(authorRef);
                    if (authorSnap.exists()) {
                        this.gridAuthor = authorSnap.data().Username;
                        this.authorIcon = authorSnap.data().Icon;
                    }
                }
                this.commentsIDs = gridData.Comments || [];
                await this.fetchComments(this.commentsIDs);
                await this.fetchUsers(Object.values(this.commentUsersIDs));
            }
        },
        async fetchComments(commentsRefs) {
            if (commentsRefs) {
                for (const commentRef of commentsRefs) {
                    const commentSnap = await getDoc(commentRef);
                    const commentData = commentSnap.data();
                    const commentID = commentSnap.id;
                    this.allComments[commentID] = commentData;
                    const userID = commentData.Author.path.split('/')[1];
                    const userRef = doc(db, "Users", userID);
                    const userSnap = await getDoc(userRef);
                    this.commentUsersIDs[commentID] = [userID, userSnap.data().Username, userSnap.data().Icon];
                }
            } else {
                this.allComments = {};
            }
        },
        async fetchUsers(usersIDs) {
            if (usersIDs) {
                for (const [userID, username] of usersIDs) {
                    const userRef = doc(db, "Users", userID);
                    const userSnap = await getDoc(userRef);
                    this.allUsers[username] = userSnap.data();
                }
            } else {
                this.allUsers = {};
            }
        },
        renderComments() {
            if (!this.allComments) {
                return [];
            }
            return Object.keys(this.allComments).map(commentID => {
                const comment = this.allComments[commentID];
                if (!this.commentUsersIDs[commentID]) {
                    return null;
                }
                const [userID, username, userIcon] = this.commentUsersIDs[commentID];
                const user = this.allUsers[userID];
                const commentRef = doc(db, 'Comments', commentID);
                return { comment, user, userID, username, userIcon, commentRef };
            }).filter(comment => comment !== null, userIcon => userIcon !== "");
        },
        renderUsers() {
            if (!this.allUsers) {
                return [];
            }
            return Object.keys(this.allUsers).map(commentID => {
                return this.allUsers[this.commentUsersIDs[commentID][0]];
            });
        },
        async addComment() {
            if (this.newComment.trim() === '') {
                alert('Comment cannot be empty');
                return;
            }
            const gridID = this.$route.params.id;
            const gridRef = doc(db, "Grids", gridID);
            const auth = getAuth();
            const currentUserID = auth.currentUser.uid; // get the ID of the currently authenticated user
            const authorRef = doc(db, "Users", currentUserID);

            const comment = {
                Author: authorRef,
                Content: this.newComment,
                Date: new Date(),
                Grid: gridRef,
                isReported: false
            };

            const commentRef = await addDoc(collection(db, "Comments"), comment);

            // Add the reference of the new comment to the current grid
            await updateDoc(gridRef, {
                Comments: arrayUnion(commentRef)
            });
            this.newComment = '';
            this.getGridInfo(); // refresh the comments
        },
        handleCommentDeleted(commentRef) {
            const index = this.commentsIDs.findIndex(ref => ref.id === commentRef.id);
            if (index !== -1) {
                this.commentsIDs.splice(index, 1);
            }
        },
        removeCommentFromState(commentID) {
            delete this.allComments[commentID];
            delete this.commentUsersIDs[commentID];
        },
        async handleCommentUpdated(commentRef) {
            const commentSnap = await getDoc(commentRef);
            const commentData = commentSnap.data();
            const commentID = commentSnap.id;
            this.allComments[commentID] = commentData;
        },
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

p+p,
.comment-input+span,
.arrow+img {
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
