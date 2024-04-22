<template>
    <div class="user-comment">
        <div class="user">
            <button @click="handleButtonClick" class="button-image">
                <img :src="userIcon" class="image-button">
            </button>
        </div>
        <div class="comment">
            <div class="comment-content">
                <p class="username">{{ userID }}</p>
                <p>{{ comment.content }}</p>
            </div>
            <p>{{ comment.date }}</p>
        </div>
    </div>
</template>

<script>
    export default {
        name: "user-comment",
        props: ["comment", "user", "userID"],
        data() {
            return {
                userIcon: null,
            }
        },
        mounted () {
            this.fetchUserIcon(this.user);
        },
        methods: {
            fetchUserIcon(user) {
                if (user && user.userIcon) {
                    import(`../assets/${user.userIcon}`).then((image) => {
                        this.userIcon = image.default;
                });
                } else {
                    this.userIcon = null;
                }
            }
        }
    };
</script>

<style scoped>
.user-comment,
.comment-content {
    display: flex;
    justify-content: left;
}
.user-comment {
    margin: 2vh 0;
}
.user-comment p {
    color: black;
    text-align: left;
    margin: 0 1vw;
}
</style>
