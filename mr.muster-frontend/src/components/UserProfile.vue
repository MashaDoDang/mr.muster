<template>
    <Header>
        <div class="sign-up"><a href="#">Sign up</a></div>
    </Header>
    <div class="profile-container container p-3 my-3 mt-5">
        <div class="user-container">
            <p class="username">Username</p>
            <button @click="handleButtonClick" class="button-image">
                <img src="../assets/mock-user.png" class="image-button">
            </button>
        </div>
        <div class="stat-container">
            <div class="stat">
                <p>25</p>
                <hr>
                <p>Following</p>
            </div>
            <div class="stat">
                <p>25</p>
                <hr>
                <p>Followed</p>
            </div>
            <div class="stat">
                <p>25</p>
                <hr>
                <p>Likes</p>
            </div>
        </div>
      </div>
      <div class="profile-grids container p-3 my-3 mt-5">
        <div class="user-grids grids-container">
            <p>Patterns created by you</p>
            <div class="pic-grid mt-3">
                <div class="row" id="row">
                    <div class="col-lg-4 col-md-12 mb-4 mb-lg-0">
                        <img src="../assets/mock-img1.jpg" class="w-100 shadow-1-strong rounded mb-4" />
                        <img src="../assets/mock-img2.jpg" class="w-100 shadow-1-strong rounded mb-4" />
                    </div>
                    <div class="col-lg-4 mb-4 mb-lg-0">
                        <img src="../assets/mock-img3.jpg" class="w-100 shadow-1-strong rounded mb-4" />
                        <img src="../assets/mock-img4.png" class="w-100 shadow-1-strong rounded mb-4" />
                    </div>
                    <div class="col-lg-4 mb-4 mb-lg-0">
                        <img src="../assets/mock-img5.jpg" class="w-100 shadow-1-strong rounded mb-4" />
                        <img src="../assets/mock-img6.png" class="w-100 shadow-1-strong rounded mb-4" />
                    </div>
                </div>
            </div>
        </div>
        <div class="liked-grids grids-container">
            <p>Your Favourites</p>
            <div class="pic-grid mt-3">
                <div class="row" id="row">
                    <div class="col-lg-4 col-md-12 mb-2 mb-lg-0">
                        <img src="../assets/mock-img1.jpg" class="w-100 shadow-1-strong rounded mb-2" />
                        <img src="../assets/mock-img2.jpg" class="w-100 shadow-1-strong rounded mb-2" />
                    </div>
                    <div class="col-lg-4 mb-2 mb-lg-0">
                        <img src="../assets/mock-img3.jpg" class="w-100 shadow-1-strong rounded mb-2" />
                        <img src="../assets/mock-img4.png" class="w-100 shadow-1-strong rounded mb-2" />
                    </div>
                    <div class="col-lg-4 mb-2 mb-lg-0">
                        <img src="../assets/mock-img5.jpg" class="w-100 shadow-1-strong rounded mb-2" />
                        <img src="../assets/mock-img6.png" class="w-100 shadow-1-strong rounded mb-2" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Header from "./Header.vue";
    export default {
    name: "view-post",
    components: {
        Header,
    },
    };
</script>

<style scoped>
    * {
        --font-family: 'Lexend', sans-serif;
        --font-weight: 200;
        --font-size: 1.1em;
        --sign-up-margin-bottom: 3vh;
        --link-color: #f5bc6c;
        --stat-width: 10vw;
        --grids-container-width: 50%;
        --user-grids-margin-right: 3vw;
        --liked-grids-margin-left: 3vw;
        --row-padding: 1vh 0.5vw;
        font-family: var(--font-family);
        font-weight: var(--font-weight);
        font-size: var(--font-size);
    }
    .sign-up {
        margin-bottom: var(--sign-up-margin-bottom);
    }
    .sign-up a{
        color: var(--link-color);
        font-weight: var(--font-weight);
        text-decoration: none;
    }
    .user-container p {
        margin-bottom: 1vh;
    }
    .button-image {
        background-color: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        display: inline-block;
    }
    .image-button {
        width: 20vh;
        height: 20vh;
        border-radius: 50%;
        object-fit: cover;
    }
    .profile-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .stat-container {
        display: flex;
        width: var(--grids-container-width);
        justify-content: space-around;
        margin-top: 3vh;
    }
    .stat {
        width: var(--stat-width);
    }
    .stat p, .stat hr {
        margin: 0;
        padding: 0;
    }
    .stat hr {
        width: 100%;
        margin: 0.5vh 0;
        border: 1px solid black;
    }
    .profile-grids {
        display: flex;
        justify-content: space-around;
    }
    .grids-container {
        width: var(--grids-container-width);
    }
    .user-grids{
        margin-right: var(--user-grids-margin-right);
    }
    .liked-grids {
        margin-left: var(--liked-grids-margin-left);
    }
    #row>* {
        padding: var(--row-padding);
    }
</style>