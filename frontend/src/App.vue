<template>
  <div class="app">
    <HeaderBar />
    <RouterView />
    <FooterBar />
  </div>
</template>

<script>
import HeaderBar from "./components/HeaderBar.vue";
import FooterBar from "./components/FooterBar.vue";

export default {
  components: { HeaderBar, FooterBar },
};
</script>

<style src="./assets/style.css"></style>