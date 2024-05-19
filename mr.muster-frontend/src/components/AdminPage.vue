<template>
    <div class="container">
        <h1>Analytics</h1>

        <hr>
        <h1>Reported Posts</h1>
        <div class="row">
            <div class="col" v-for="(post, postIndex) in posts" :key="postIndex">
                <router-link style="text-decoration: none; color: inherit;" :to="`/view-post/${post.id}`">
                    <div class="post-card">
                        <img :src="post.postUrl" class="img-post" />
                        <div class="post-info">
                            <h2 v-if="post.title">{{ post.title }}</h2>
                            <span>Author: {{ post.author }}</span>
                            <span>{{ post.postedDate }}</span>
                            <span>Reports: {{ post.reports.length }}</span>
                            <button @click.stop="clearReports(post)">Clear Reports</button>
                        </div>
                    </div>
                </router-link>
            </div>
        </div>
        <hr>
        <h1>Reported Comments</h1>
        <div class="col" v-for="(comment, commentIndex) in comments" :key="commentIndex">
            <div class="comment-card">
                <div class="comment-info">
                    <div class="comment-details">
                        <span>Author: {{ comment.author }}</span>
                        <span>{{ comment.postedDate }}</span>
                        <span>Reports: {{ comment.reports.length }}</span>
                        <button @click.stop="clearCommentReports(comment)">Clear Reports</button>
                        <button @click.stop="deleteComment(comment)">Delete Comment</button>
                    </div>
                    <div class="comment-content">
                        <span>Content: {{ comment.content }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { collection, getDocs, getDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

const posts = ref([]);
const comments = ref([]);

async function getPosts() {
    const querySnapshot = await getDocs(collection(db, "Grids"));
    const tempPosts = [];
    for (let docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        if (data.isReported && data.isReported.length > 0) {
            const userRef = doc(db, "Users", data.Author.path.split("/")[1]);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            tempPosts.push({
                id: docSnapshot.id,
                postUrl: data.Content,
                title: data.Title,
                author: userData.Username,
                postedDate: data.PostedDate.toDate().toLocaleDateString(),
                reports: data.isReported,
            });
        }
    }
    posts.value = tempPosts;
}

async function clearReports(post) {
    const postRef = doc(db, "Grids", post.id);
    await updateDoc(postRef, { isReported: [] });
    posts.value = posts.value.filter(p => p.id !== post.id);
}

async function getComments() {
    const querySnapshot = await getDocs(collection(db, "Comments"));
    const tempComments = [];
    for (let docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        if (data.isReported && data.isReported.length > 0) {
            const userRef = doc(db, "Users", data.Author?.path.split("/")[1]);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            tempComments.push({
                id: docSnapshot.id,
                content: data.Content,
                author: userData.Username,
                postedDate: data.Date?.toDate().toLocaleDateString(),
                reports: data.isReported,
                grid: data.Grid,
            });
        }
    }
    comments.value = tempComments;
}

async function clearCommentReports(comment) {
    const commentRef = doc(db, "Comments", comment.id);
    await updateDoc(commentRef, { isReported: [] });
    comments.value = comments.value.filter(c => c.id !== comment.id);
}

async function deleteComment(comment) {
    if (!comment || !comment.id || !comment.grid) {
        console.error('Invalid comment:', comment);
        return;
    }
    const commentRef = doc(db, "Comments", comment.id);
    // Get the Grid document that the comment is associated with
    const gridRef = doc(db, comment.grid.path);
    const gridDoc = await getDoc(gridRef);
    const gridData = gridDoc.data();
    // Remove the comment reference from the Comments array in the Grid document
    const gridComments = gridData.Comments.filter(c => c.path !== commentRef.path);
    await updateDoc(gridRef, { Comments: gridComments });
    await deleteDoc(commentRef);
    comments.value = comments.value.filter(c => c.id !== comment.id);
}

onBeforeMount(() => {
    getPosts();
    getComments();
});
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: 50px;
}

.col {
    flex: 1 0 21%;
    /* 5 items per row */
    margin: 1%;
}

.post-card {
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 10px;
    text-align: center;
    color: rgb(0, 0, 0);
    /* or any color you want */
    background-color: rgb(255, 255, 255);
    display: flex;
    width: 85vw;
    max-width: 100%;
}

.img-post {
    width: 150px;
    height: 100%;
    object-fit: cover;
}

.post-info {
    margin-top: 10px;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    justify-content: space-evenly;
    align-items: center;
    width: 100%;
}

h1 {
    text-align: center;
    margin-bottom: 20px;
}

hr {
    margin-top: 20px;
}

.comment-details {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
}

.comment-content {
    display: flex;
    justify-content: left;
    font-size: 20px;
    white-space: pre-wrap;
    font-weight: 500;
    margin: 10px 0;
}
</style>