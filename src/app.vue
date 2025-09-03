<template>
  <div id="main">
    <div class="card">
      <p>按钮</p>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from "@vue/runtime-core";
import HippyLabsComponent from "./components/HippyLabsComponent";

export default defineComponent({
  name: "App",
  components: {HippyLabsComponent},
  setup() {

    return {};
  },
});
</script>
<style scoped>

#main {
  width: 1920px;
  height: 1080px;
  background-color: green;
  justify-content: center;
  align-items: center;
}

.card {
  width: 400px;
  height: 100px;
  margin: 20px;
  justify-content: center;
  align-items: center;
  background-color: red;
  border-radius: 12px;
  color: #fff;
  font-weight: bold;
  display: flex;
  text-align: center;
}

</style>


