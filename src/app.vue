<template>
  <div id="main">
    <div class="item active" role="tab" tabindex="0">
      这是主标签
    </div>
    <div class="notice">
      相邻提示
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

#main > .item.active[role="tab"]:focus + .notice {
  background-color: yellow;
}
</style>
