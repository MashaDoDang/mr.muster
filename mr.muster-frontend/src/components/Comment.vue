<template>
    <div class="user-comment">
        <div class="user">
            <button @click="handleButtonClick" class="button-image">
                <img :src="userIcon" class="image-button">
            </button>
        </div>
        <div class="comment">
            <div>
                <div class="comment-content">
                    <p class="username">@{{ userID }}</p>
                    <p>{{ date }}</p>
                    <div v-if="isCurrentUserAuthor" class="comment-icons"
                        style="display: flex; gap: 10px; align-items: center;">
                        <i class="fas fa-edit" @click="startEditComment"></i>
                        <i class="fas fa-trash-alt" @click="deleteComment"></i>
                    </div>
                </div>
                <div v-if="!isEditing">
                    <p style="font-weight: 600;">{{ comment.Content }}</p>
                </div>
                <div v-else style="display: flex;">
                    <div style="min-width: 169px">
                        <p style="font-weight: 600;">Edit comment:</p>
                        <button style="border: 1px solid black; border-radius: 25px; color: black; padding: 5px; margin-right: 10px;"
                            @click="cancelEditComment">Cancel</button>
                        <button style="border: 1px solid orange; border-radius: 25px; color: orange; padding: 5px; margin-top: 10px;"
                            @click="saveEditedComment">Save</button>
                    </div>
                    <textarea style="width: 65%;" v-model="editedComment"></textarea>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { db } from '../firebase';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, deleteDoc, arrayRemove, updateDoc } from "firebase/firestore";

export default {
    name: "user-comment",
    props: ["commentRef", "comment", "user", "userID", "userIcon"],
    data() {
        return {
            date: '',
            currentUser: null,
            isCurrentUserAuthor: false,
            isEditing: false,
            editedComment: '',
        }
    },
    methods: {
        pad(number) {
            if (number < 10) {
                return '0' + number;
            }
            return number;
        },
        formatDate() {
            console.log(typeof this.userIcon);
            const date = this.comment.Date.toDate();
            this.date = `${this.pad(date.getDate())}/${this.pad(date.getMonth() + 1)}/${date.getFullYear()} ${this.pad(date.getHours())}:${this.pad(date.getMinutes())}`;
        },
        editComment() {

        },
        deleteComment() {
            const commentRef = doc(db, 'Comments', this.commentRef._key.path.segments[1]);
            deleteDoc(commentRef).then(() => {
                console.log('Comment successfully deleted!');
                const gridDoc = doc(db, 'Grids', this.$route.params.id);
                updateDoc(gridDoc, {
                    Comments: arrayRemove(commentRef)
                }).then(() => {
                    console.log('Comment reference successfully removed from grid!');
                    this.$emit('commentDeleted', this.commentRef);
                    this.$emit('removeCommentFromState', this.commentRef.id); // Emit the new event
                }).catch((error) => {
                    console.error('Error removing comment reference from grid: ', error);
                });
            }).catch((error) => {
                console.error('Error deleting comment: ', error);
            });
        },
        startEditComment() {
            this.isEditing = true;
            this.editedComment = this.comment.Content;
        },
        async saveEditedComment() {
            if (this.editedComment.trim() === '') {
                alert('Comment cannot be empty');
                return;
            }
            const commentRef = doc(db, 'Comments', this.commentRef._key.path.segments[1]);
            await updateDoc(commentRef, {
                Content: this.editedComment,
                Date: new Date()
            });
            this.isEditing = false;
            this.$emit('commentUpdated', commentRef);
        },
        cancelEditComment() {
            this.isEditing = false;
            this.editedComment = '';
        },
    },
    created() {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.currentUser = user.uid;
                this.isCurrentUserAuthor = user.uid === this.user.userID;
            }
        });
        this.formatDate();
    },
};
</script>

<style scoped>
.user-comment,
.comment-content {
    display: flex;
    justify-content: left;
    font-size: 18px;
}

.user-comment {
    margin: 2vh 0;
}

.user-comment p {
    color: black;
    text-align: left;
    margin: 0 1vw;
}

.image-button {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover;
}

.icon {
    width: 20px;
    height: 20px;
    cursor: pointer;
}
</style>
