<template>
    <div class="user-comment">
        <div class="user">
            <button @click="handleButtonClick" class="button-image">
                <img :src="userIcon" class="image-button">
            </button>
        </div>
        <div class="comment">
            <div class="comment-content">
                <p class="username">@{{ userID }}</p>
                <p>{{ comment.Content }}</p>
            </div>
            <p>{{ date }}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: "user-comment",
    props: ["comment", "user", "userID", "userIcon"],
    data() {
        return {
            date: '',
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
        }
    },
    created() {
        this.formatDate();
    },
    // mounted () {
    //     this.fetchUserIcon(this.user);
    // },
    // methods: {
    //     fetchUserIcon(user) {
    //         if (user && user.userIcon) {
    //             import(`../assets/${user.userIcon}`).then((image) => {
    //                 this.userIcon = image.default;
    //         });
    //         } else {
    //             this.userIcon = null;
    //         }
    //     }
    // }
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
</style>
