<template>
  <MainPage/>
</template>

<script lang="ts">
import MainPage from './Views/MainPage.vue';
import {defineComponent} from 'vue';

export default defineComponent({
  components: {
    MainPage,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
}
body {
  padding: 0;
  margin: 0;
}
</style>
