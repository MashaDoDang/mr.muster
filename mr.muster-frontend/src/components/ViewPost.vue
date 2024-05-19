<template>
    <head>
        <link rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0,0" />
    </head>
    <div class="post-container container">
        <div class="comment-section">
            <img :src="content" style="height: 60%; max-height: 65vh; object-fit: contain;">
            <div class="top-comment-section">
                <div class="name-top-com-section">
                    <div style="display: flex; gap: 20px; align-items: center;">
                        <p class="sub-header" v-if="!editMode">{{ title }}</p>
                        <input class="sub-header" v-else v-model="newTitle" @blur="updateTitle"
                            @keyup.enter="updateTitle" v-focus />
                        <button @click="toggleEditMode" v-if="!editMode && (isAuthor || isAdmin)"
                            class="material-symbols-outlined edit-icon">edit</button>
                        <button @click="openDeleteModal" v-if="!editMode && (isAuthor || isAdmin)"
                            class="material-symbols-outlined trash-icon" style="height: 30px;">delete</button>
                        <button @click="toggleReport" v-if="!editMode && !isAuthor && isLoggedIn" class="material-symbols-outlined">
                            {{ isReported ? 'report_off' : 'report' }}
                        </button>
                        <div v-if="!editMode && (isAuthor || isAdmin)" class="visibility-dropdown">
                            <select v-model="isPrivate" @change="toggleVisibility">
                                <option value="false">Public</option>
                                <option value="true">Private</option>
                            </select>
                        </div>
                    </div>
                    <div class="name-bot-com-section" style="display: flex; justify-content: flex-start; gap: 30px;">
                        <p>{{ commentsAmount }} comments</p>
                        <div style="display: flex;">
                            <p> {{ likes }}</p>
                            <button class="material-symbols-outlined like-icon" @click="toggleLike">favorite</button>
                        </div>
                    </div>
                </div>
                <div class="user-comment user-container">
                    <RouterLink :to="`/user-profile/${authorID}`" class="author-id">
                        <p>@{{ gridAuthor }}</p>
                        <button @click="handleButtonClick" class="button-image">
                            <img :src="authorIcon" class="image-button">
                        </button>
                    </RouterLink>
                </div>
            </div>

            <div class="comment-input-group" style="margin: 30px 0px;">
                <textarea class="comment-input" placeholder="Add comment" v-model="newComment"></textarea>
                <button class="material-symbols-outlined send-icon" @click="addComment">send</button>
            </div>
            <div class="comment-box">
                <p v-if="!renderComments().length" style="margin-top: 40px;">Be the first to leave a comment!</p>
                <Comment v-for="item in renderComments()" :key="item.comment.id" :comment="item.comment" :user="item"
                    :userID="item.userID" :username="item.username" :userIcon="item.userIcon" :commentRef="item.commentRef"
                    @commentDeleted="handleCommentDeleted" @removeCommentFromState="removeCommentFromState"
                    @commentUpdated="handleCommentUpdated" />
            </div>

        </div>
    </div>
    <DeleteModal v-if="showDeleteModal" @close="showDeleteModal = false" @delete="deleteGrid"></DeleteModal>
    <MusterOverlay :isProcessing="isDeleting" :processingLabel="'Deleting...'" />
</template>

<script>
import Comment from "./Comment.vue";
import { db } from "../firebase";
import { doc, getDoc, addDoc, collection, arrayUnion, updateDoc, deleteDoc, arrayRemove, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { storage } from "../firebase";
import { deleteObject, ref } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import DeleteModal from "./DeleteModal.vue";
import router from "@/router";
import MusterOverlay from './MusterOverlay.vue';

export default {
    name: "view-post",
    components: {
        Comment,
        DeleteModal,
        MusterOverlay,
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
            editMode: false,
            newTitle: '',
            isAuthor: false,
            isAdmin: false,
            authorID: null,
            isPrivate: false,
            showDeleteModal: false,
            isDeleting: false,
            isReported: false,
            reports: [],
            isLoggedIn: false,
        };
    },
    async created() {
        await this.getGridInfo();
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, check if the user is the author
                this.isAuthor = user.uid === this.authorID;
                const userDoc = await getDoc(doc(db, 'Users', user.uid));
                this.isAdmin = userDoc.data().isAdmin;
                // Calculate isReported
                this.isReported = this.reports.includes(`/Users/${user.uid}`);
                this.isLoggedIn = true;
            } else {
                // User is signed out, set isAuthor and isReported to false
                this.isAuthor = false;
                this.isReported = false;
                this.isLoggedIn = false;
                this.isAdmin = false;
            }
        });
    },
    methods: {
        async getGridInfo() {
            const gridID = this.$route.params.id;
            const gridRef = doc(db, "Grids", gridID);
            const gridSnap = await getDoc(gridRef);
            const gridData = gridSnap.data();
            if (gridData) {
                this.content = gridData.Content;
                this.title = gridData.Title;
                this.isPrivate = gridData.IsPrivate;
                this.likes = gridData.Likes ? gridData.Likes.length : 0;
                this.commentsAmount = gridData.Comments ? gridData.Comments.length : 0;
                this.reports = gridData.isReported || [];

                const authorID = gridData.Author;
                if (authorID) {
                    this.authorID = authorID.id; // Store the author's ID
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
        async toggleVisibility() {
            const gridID = this.$route.params.id;
            const gridRef = doc(db, "Grids", gridID);
            await updateDoc(gridRef, {
                IsPrivate: this.isPrivate === 'true',
            });
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
        async addComment() {
            this.newComment = this.newComment.trim();
            if (this.newComment === '') {
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
                isReported: [],
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
        toggleEditMode() {
            this.editMode = !this.editMode;
            if (this.editMode) {
                this.newTitle = this.title;
            }
        },
        async updateTitle() {
            if (this.newTitle.trim() === '') {
                alert('Title cannot be empty');
                this.newTitle = this.title;
                return;
            }
            const gridID = this.$route.params.id;
            const gridRef = doc(db, "Grids", gridID);
            await updateDoc(gridRef, {
                Title: this.newTitle
            });
            this.title = this.newTitle;
            this.editMode = false;
        },
        async deleteGrid() {
            this.showDeleteModal = false;
            this.isDeleting = true;
            const gridID = this.$route.params.id;
            const gridRef = doc(db, "Grids", gridID);
            const gridSnap = await getDoc(gridRef);
            const gridData = gridSnap.data();

            // Delete the resource from Firebase Storage
            const storageRef = ref(storage, gridData.Content);
            try {
                await deleteObject(storageRef);
            } catch (error) {
                console.error("Error deleting object:", error);
            }

            // Delete all comments connected to the grid
            const comments = gridData.Comments;
            for (const commentRef of comments) {
                await deleteDoc(commentRef);
            }

            // Delete all likes connected to the grid
            const likes = gridData.Likes;
            for (const likeRef of likes) {
                await deleteDoc(likeRef);
            }

            // Delete the grid itself
            await deleteDoc(gridRef);

            // Delete reference to the grid from the author's OwnedGrids array
            const authorRef = gridData.Author;
            await updateDoc(authorRef, {
                OwnedGrids: arrayRemove(gridRef)
            });

            // Delete reference to the grid from all users' LikedPosts array
            const usersRef = collection(db, "Users");
            const usersSnap = await getDocs(usersRef);
            usersSnap.forEach(async (userDoc) => {
                const userData = userDoc.data();
                const likedPostsRefs = userData.LikedPosts;
                for (const likedPostRef of likedPostsRefs) {
                    if (likedPostRef.path === gridRef.path) {
                        await updateDoc(doc(db, "Users", userDoc.id), {
                            LikedPosts: arrayRemove(likedPostRef)
                        });
                    }
                }
            });

            this.isDeleting = false;
            router.push('/');
        },
        openDeleteModal() {
            this.showDeleteModal = true;
        },
        async toggleLike() {
            const auth = getAuth();
            const currentUserID = auth.currentUser.uid; // get the ID of the currently authenticated user
            const userRef = doc(db, "Users", currentUserID);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            const gridID = this.$route.params.id;
            const gridRef = doc(db, "Grids", gridID);
            const likeRef = collection(db, "Likes");
            const userLikedGrid = userData.LikedPosts.find(ref => ref.path === gridRef.path);

            if (userLikedGrid) {
                // User has already liked the post, so unlike it
                const likeCollectionRef = collection(db, "Likes");
                const likeQuery = query(likeCollectionRef, where("Author", "==", userRef), where("Grid", "==", gridRef));
                const likeSnapshot = await getDocs(likeQuery);
                const userLikeRef = likeSnapshot.docs[0] ? doc(db, "Likes", likeSnapshot.docs[0].id) : null;
                await deleteDoc(userLikeRef);
                await updateDoc(userRef, {
                    LikedPosts: arrayRemove(userLikedGrid)
                });
                await updateDoc(gridRef, {
                    Likes: arrayRemove(userLikeRef)
                });
                this.likes--;
            } else {
                // User hasn't liked the post, so like it
                const newLikeRef = await addDoc(likeRef, {
                    Author: userRef,
                    Date: serverTimestamp(),
                    Grid: gridRef
                });
                await updateDoc(userRef, {
                    LikedPosts: arrayUnion(gridRef)
                });
                await updateDoc(gridRef, {
                    Likes: arrayUnion(newLikeRef)
                });
                this.likes++;
            }
        },
        async toggleReport() {
            const gridID = this.$route.params.id;
            const gridRef = doc(db, "Grids", gridID);
            const auth = getAuth();
            const user = auth.currentUser;
            if (this.isReported) {
                // If the post is already reported, unreport it
                await updateDoc(gridRef, {
                    isReported: arrayRemove(`/Users/${user.uid}`),
                });
            } else {
                // If the post is not reported, report it
                await updateDoc(gridRef, {
                    isReported: arrayUnion(`/Users/${user.uid}`),
                });
            }
            // Toggle the isReported state
            this.isReported = !this.isReported;
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
    margin-top: 50px;
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
    border-radius: 15px;
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

.visibility-dropdown select {
    width: 100px;
    height: 30px;
    background-color: white;
}

.visibility-dropdown {
    display: flex;
    justify-content: center;
    align-items: center;
}

.outlined-flag-icon {
    color: red;
    height: 30px;
}

.flag-icon {
    height: 30px;
}

.author-id p, .author-id button {
    transition: 0.3s ease;
}

.author-id p:hover, .author-id button:hover {
    text-decoration: underline;
    font-weight: 300;
}
</style>
