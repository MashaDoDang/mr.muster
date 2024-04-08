<template>

  <head>
    <link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap" rel="stylesheet">
  </head>
  <nav>
    <div class="top-nav">
      <div class="logo">
        <img src="../assets/cat-logo.png" alt="logo">
      </div>
      <slot></slot>
    </div>
    <div class="search-bar" id="search-bar">
      <span class="material-symbols-outlined">search</span>
      <input class="search-input" type="search" placeholder="Search type...">
    </div>
  </nav>

</template>

<script>
export default {
  name: "page-header"
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}
nav, .top-nav {
  width: 100%;
}
nav {
  height: 20vh;
  background-image: linear-gradient(to right,#f59f61,#e43f6c,#4b057a);
  padding: 0 7vw;
}
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 1vh 5vw 0;
}
.logo {
  width: max-content;
}
.logo img {
  width: 90px;
  z-index: 1;
}
.search-bar {
  --padding: 14px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: var(--padding); 
  background: linear-gradient(white, white) padding-box,
              linear-gradient(to right, #4b057a,#e43f6c) border-box;
  border-radius: 50em;
  border: 3px solid transparent;
  transition: box-shadow 0.25s;
}
.search-bar:focus-within {
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.75);
}
.search-input {
  font-size: 16px;
  font-family: 'Lexend', sans-serif;
  color: #333333;
  margin-left: var(--padding);
  outline: none;
  border: none;
  background: transparent;
  width: 95%;
}
.search-input::placeholder {
  color: rgba(0, 0, 0, 0.5);
}
.material-symbols-outlined {
  color: #4b057a;
}
</style>