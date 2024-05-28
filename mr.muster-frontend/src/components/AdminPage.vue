<template>
    <div class="container">
        <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 5vh;">
            <button class="btn log-button" @click="activeTab = 'Analytics'">Analytics</button>
            <button class="btn log-button" @click="activeTab = 'Reported Posts'">Reported Posts</button>
            <button class="btn log-button" @click="activeTab = 'Reported Comments'">Reported Comments</button>
        </div>
        <div v-show="activeTab === 'Analytics'">
            <h1>Analytics</h1>
            <div class="charts">
                <canvas id="gridsChart" width="400" height="200"></canvas>
                <canvas id="likesChart" width="400" height="200"></canvas>
                <canvas id="commentsChart" width="400" height="200"></canvas>
            </div>
            <hr>
        </div>
        <div v-show="activeTab === 'Reported Posts'">
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
        </div>
        <div v-show="activeTab === 'Reported Comments'">
            <h1 style="margin-bottom: 50px;">Reported Comments</h1>
            <div class="col" v-for="(comment, commentIndex) in comments" :key="commentIndex">
                <div class="comment-card" style="margin-bottom: 10vh;">
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
            <hr>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { collection, getDocs, getDoc, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import Chart from "chart.js/auto";

const posts = ref([]);
const comments = ref([]);
let activeTab = ref('Analytics');

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
    posts.value = posts.value.filter((p) => p.id !== post.id);
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
    comments.value = comments.value.filter((c) => c.id !== comment.id);
}

async function deleteComment(comment) {
    if (!comment || !comment.id || !comment.grid) {
        console.error("Invalid comment:", comment);
        return;
    }
    const commentRef = doc(db, "Comments", comment.id);
    // Get the Grid document that the comment is associated with
    const gridRef = doc(db, comment.grid.path);
    const gridDoc = await getDoc(gridRef);
    const gridData = gridDoc.data();
    // Remove the comment reference from the Comments array in the Grid document
    const gridComments = gridData.Comments.filter((c) => c.path !== commentRef.path);
    await updateDoc(gridRef, { Comments: gridComments });
    await deleteDoc(commentRef);
    comments.value = comments.value.filter((c) => c.id !== comment.id);
}

async function fetchData(collectionName, dateField) {
    const q = query(collection(db, collectionName), orderBy(dateField));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        [dateField]: doc.data()[dateField].toDate().toLocaleDateString()
    }));
}

function aggregateDataByDate(data, dateField) {
    return data.reduce((acc, doc) => {
        const date = doc[dateField];
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date]++;
        return acc;
    }, {});
}

async function createCharts() {
    const gridsData = await fetchData('Grids', 'PostedDate');
    const likesData = await fetchData('Likes', 'Date');
    const commentsData = await fetchData('Comments', 'Date');

    const aggregatedGrids = aggregateDataByDate(gridsData, 'PostedDate');
    const aggregatedLikes = aggregateDataByDate(likesData, 'Date');
    const aggregatedComments = aggregateDataByDate(commentsData, 'Date');

    const gridDates = Object.keys(aggregatedGrids);
    const gridCounts = Object.values(aggregatedGrids);

    const likeDates = Object.keys(aggregatedLikes);
    const likeCounts = Object.values(aggregatedLikes);

    const commentDates = Object.keys(aggregatedComments);
    const commentCounts = Object.values(aggregatedComments);

    const ctx1 = document.getElementById("gridsChart").getContext("2d");
    new Chart(ctx1, {
        type: "line",
        data: {
            labels: gridDates,
            datasets: [
                {
                    label: "Grids",
                    data: gridCounts,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    fill: false,
                    tension: 0.1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
                title: {
                    display: true,
                    text: "Number of Grids Created Over Time",
                },
            },
            hover: {
                mode: "nearest",
                intersect: true,
            },
        },
    });

    const ctx2 = document.getElementById("likesChart").getContext("2d");
    new Chart(ctx2, {
        type: "line",
        data: {
            labels: likeDates,
            datasets: [
                {
                    label: "Likes",
                    data: likeCounts,
                    borderColor: "rgba(153, 102, 255, 1)",
                    backgroundColor: "rgba(153, 102, 255, 0.2)",
                    fill: false,
                    tension: 0.1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
                title: {
                    display: true,
                    text: "Number of Likes Over Time",
                },
            },
            hover: {
                mode: "nearest",
                intersect: true,
            },
        },
    });

    const ctx3 = document.getElementById("commentsChart").getContext("2d");
    new Chart(ctx3, {
        type: "line",
        data: {
            labels: commentDates,
            datasets: [
                {
                    label: "Comments",
                    data: commentCounts,
                    borderColor: "rgba(255, 159, 64, 1)",
                    backgroundColor: "rgba(255, 159, 64, 0.2)",
                    fill: false,
                    tension: 0.1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
                title: {
                    display: true,
                    text: "Number of Comments Over Time",
                },
            },
            hover: {
                mode: "nearest",
                intersect: true,
            },
        },
    });
}

onMounted(() => {
    getPosts();
    getComments();
    nextTick(() => {
        createCharts();
    });
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
    margin: 1%;
}

.post-card {
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 10px;
    text-align: center;
    color: rgb(0, 0, 0);
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

.btn {
    font-size: 16px;
    border-radius: 40px;
}

.btn:hover {
    background-color: #f5bc6c;
    border-color: #f5bc6c;
}

.log-button {
    background-color: #d95b00;
    border-color: #d95b00;
    color: white;
    min-width: 110px;
}

/* .charts {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    max-width: 100%;
} */
</style>