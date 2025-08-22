<template>
  <div id="root">
    <div class="child">
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
<style>

#root {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #40b883;
}

.child {
  width: 960px;
  height: 480px;
  background-color: yellow;
}

</style>
