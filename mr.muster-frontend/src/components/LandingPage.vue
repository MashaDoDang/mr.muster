<template>
  <div>
    <div class="container">
      <div class="text-container">
        <h1>Create your own grid</h1>
        <p>try your custom size and colors</p>
      </div>
      <div class="upload-container">
        <button class="btn upload-button">Upload image</button>
        <a href="#">or paste URL</a>
      </div>
    </div>
    <div class="pic-grid">
      <div class="row">
        <div class="col">
          <img src="../assets/mock-img1.jpg" class="img" />
          <img src="../assets/mock-img2.jpg" class="img" />
        </div>
        <div class="col">
          <img src="../assets/mock-img3.jpg" class="img" @click="navigateToPost()" />
          <img src="../assets/mock-img4.png" class="img" />
        </div>
        <div class="col">
          <img src="../assets/mock-img5.jpg" class="img" />
          <img src="../assets/mock-img6.png" class="img" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: "landing-page",
  setup() {
    const router = useRouter();

    function navigateToPost() {
      router.push('/view-post');
    }

    return { navigateToPost };
  }
};
</script>


<style scoped>
* {
  font-family: 'Lexend', sans-serif;
}
.buttons-container {
  width: max-content;
  height: 70px;
  padding-bottom: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn {
  font-size: 16px;
  border-radius: 40px;
}
.log-button {
  background-color: #d95b00;
  border-color: #d95b00;
  color: white;
  width: 110px;
}
.sign-button {
  border-color: #fbc46a;
  color: #fbc46a;
}
.upload-button {
  background-color: #b73c91;
  border-color: #b73c91;
  color: white;
  border-radius: 40px;
  font-weight: 200;
  font-size: 1.5em;
  width: 230px;
}
.upload-button:hover {
  background-color: #d172b4;
  border-color: #d172b4;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.upload-container a{
  text-decoration: none;
  color: white;
  font-family:  'Lexend', sans-serif;
  font-size: 1.2em;
}

.container {
  width: 100vw;
  height: 40vh;
  margin: 10vh 10vw 10vh 7vw;
  padding: 5vh 5vw;
  background-image: linear-gradient(to right, rgb(149, 122, 177), rgb(157, 53, 168));
  border-radius: 20px;
  color: white;
  font-weight: 100;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.container h1 {
  font-weight: 100;
  font-size: 3.5em;
}
.container p {
  font-size: 1.3em;
}
.text-container {
  text-align: left;
}
.pic-grid {
  margin: 0 7vw;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.img {
  width: 100%;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.img:hover {
  cursor: pointer;
}
</style>