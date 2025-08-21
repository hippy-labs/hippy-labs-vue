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
<style>

/*#main{*/
/*  width: 1920px;*/
/*  height: 1080px;*/
/*  background-color: purple;*/
/*}*/
/*#main > .item.active[role="tab"]:focus + .notice {*/
#main > .item.active + .notice {
  background-color: yellow;
  /*width: 192px;*/
  /*height: 108px;*/
}
</style>
