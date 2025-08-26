<template>
  <div id="root">
    <!-- 使用 calc -->
    <div class="card card-calc">
      <p>calc(var(--space-md) * 2)</p>
    </div>

    <!-- 使用 min -->
    <div class="card card-min">
      <p>min(var(--space-md), 300px)</p>
    </div>

    <!-- 使用 max -->
    <div class="card card-max">
      <p>max(var(--space-md), 12px)</p>
    </div>

    <!-- 使用 clamp -->
    <div class="card card-clamp">
      <p>clamp(8px, var(--space-md), 500px)</p>
    </div>

    <!-- 点击切换全局尺寸变量 -->
    <div class="card card-controller" @click="toggleMargin">
      <p>点击切换全局尺寸变量</p>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import {cssVarManager} from "@hippy/vue-next";

export default defineComponent({
  name: "App",
  setup() {
    const isSmall = ref(true);

    // 点击切换全局尺寸变量
    const toggleMargin = () => {
      isSmall.value = !isSmall.value;
      const margin = isSmall.value ? '400px' : '600px';
      cssVarManager.setGlobalVar('--space-md', margin);
    };

    return {toggleMargin, isSmall};
  }
});
</script>

<style>
#root {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #40b883;
}

/* 基础卡片样式 */
.card {
  width: 400px;
  height: 100px;
  margin: 20px;
  justify-content: center;
  align-items: center;
  background-color: gray;
  border-radius: 12px;
  color: #fff;
  font-weight: bold;
  display: flex;
  text-align: center;
}

/* calc 示例 */
.card-calc {
  width: calc(var(--space-md) * 2);
  background-color: teal;
}

/* min 示例 */
.card-min {
  width: min(var(--space-md), 300px);
  background-color: orange;
}

/* max 示例 */
.card-max {
  width: max(var(--space-md), 12px);
  background-color: purple;
}

/* clamp 示例 */
.card-clamp {
  width: clamp(8px, var(--space-md), 500px);
  background-color: palevioletred;
}

/* 控制按钮 */
.card-controller {
  background-color: #ff0000;
}
</style>
