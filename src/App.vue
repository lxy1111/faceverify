<template>
  <div id="app">
    <test msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
  import HelloWorld from "@/components/HelloWorld";
import faceTracking from "@/components/faceTracking";
import test from "@/components/test";

export default {
  name: 'app',
  components: {
    HelloWorld,
    faceTracking,
    test
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
