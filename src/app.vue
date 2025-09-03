<template>
  <div id="main">
    <div class="item active" role="tab" tabindex="0"
         v-pseudo:focus="focusValue"
         v-pseudo:active="activeValue">
      这是主标签
    </div>
    <div class="notice">
      <p class="card-text" :style="{ backgroundColor: backgroundColor }">直接子提示</p>
      <div class="inner-notice">
        <p class="card-text">嵌套子提示</p>
        <div class="deep">
          <p class="card-text">更深层提示</p>
        </div>
      </div>
    </div>

    <p class="card-text"> 同级提示 </p>

    <div class="card" @click="toggleFocus">
      <p>点击切换伪类 focus 状态</p>
    </div>
    <div class="card" @click="toggleActive">
      <p>点击切换伪类 active 状态</p>
    </div>
    <div class="card" @click="toggleStyle">
      <p>点击切换样式</p>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from "@vue/runtime-core";
import HippyLabsComponent from "./components/HippyLabsComponent";
import {ref} from "vue";

export default defineComponent({
  name: "App",
  components: {HippyLabsComponent},
  setup() {
    const focusValue = ref<boolean>(false);
    const activeValue = ref<boolean>(false);
    const backgroundColor = ref<string>('red')
    let flag = false

    function toggleFocus() {
      focusValue.value = !focusValue.value;
    }

    function toggleActive() {
      activeValue.value = !activeValue.value;
    }

    function toggleStyle() {
      if (flag) {
        backgroundColor.value = 'red';
      } else {
        backgroundColor.value = 'purple';
      }
      flag = !flag;
    }

    return {
      backgroundColor,
      toggleFocus,
      toggleActive,
      focusValue,
      activeValue,
      toggleStyle
    };
  },
});
</script>
<style>

#main {
  width: 1920px;
  height: 1080px;
  background-color: green;
  justify-content: center;
  align-items: center;
}

.notice {
  width: 960px;
  height: 480px;
  background-color: palevioletred;
  display: flex;
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

.card-text {
  color: deepskyblue;
}

#main > .item.active[role="tab"]:focus + .notice {
  background-color: yellow;
}

#main > .item.active[role="tab"]:focus + .notice > .card-text {
  color: black;
}

/* 影响所有 notice 内 p，包括嵌套子孙 */
#main > .item.active[role="tab"]:active + .notice p {
  background-color: orange;
  color: white;
}

</style>


