<template>
    <div class="error-message">
        <h1><b>Error</b></h1>
        <p>The requested page '/{{path}}' was not found</p>
        <img :src="catImg"><br>
        <RouterLink to="/" class="route-link">Go back to the home page</RouterLink>
    </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { ref } from "vue";

const route = useRoute();
const path = ref(route.params.pathName);
const catImg = ref("https://firebasestorage.googleapis.com/v0/b/mrmuster.appspot.com/o/sad-cat.png?alt=media&token=ec0db875-7c74-4576-bf5f-188b8ea4601d");
</script>

<style scoped>
* {
    font-family: 'Lexend', sans-serif;
    --color: black;
}
.error-message {
    text-align: center;
    margin: 10vh 0;
}

.error-message h1 {
    font-size: 3.5em;
}
.error-message p, .route-link {
    font-size: 1.5em;
}
.route-link {
    color: black;
    box-shadow: inset 0 0 0 0 #324355;
    margin: 0 -.25rem;
    padding: 0 .25rem;
    transition: color .3s ease-in-out, box-shadow .3s ease-in-out;
}

.route-link:hover {
  box-shadow: inset 320px 0 0 0 #324355;
  color: white;
}

.error-message img {
    width: 15%; 
}

</style>