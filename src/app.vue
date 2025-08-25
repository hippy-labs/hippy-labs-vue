<template>
  <div id="root">
    <!-- 使用全局变量 -->
    <div class="card card-global">
      <p>全局变量元素</p>
    </div>

    <!-- 局部覆盖变量 -->
    <div class="card card-local">
      <p>局部覆盖变量元素</p>
    </div>

    <!-- 点击切换全局变量 -->
    <div class="card card-controller" @click="toggleColor">
      <p>点击我切换全局主色</p>
    </div>

    <!-- 父容器作用域覆盖 -->
    <div class="scope-container">
      <div class="card card-scope-child">
        <p>父容器覆盖变量 → 子元素继承</p>
      </div>
      <div class="card card-scope-child-local">
        <p>子元素再次覆盖变量</p>
      </div>
    </div>

    <!-- 嵌套变量示例 -->
    <div class="card card-nested">
      <p>嵌套变量引用 → --card-bg = var(--color-primary)</p>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, onMounted} from "vue";
import {cssVarManager} from "@hippy/vue-next";

export default defineComponent({
  name: "App",
  setup() {
    const isRed = ref(true)

    // 点击时切换全局 CSS 变量
    const toggleColor = () => {
      isRed.value = !isRed.value
      const color = isRed.value ? '#ff0000' : '#00ff00' // 大红 ↔ 鲜绿色
      const margin = isRed.value ? '5px' : '16px'
      //
      // cssVarManager.setGlobalVar('--space-md', margin)
      cssVarManager.setGlobalVar('--color-primary', color)
      // global.__HIPPY_CSS_VARIABLES__['--color-primary'] = color
    }

    return {
      isRed,
      toggleColor
    }
  }
})
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
  margin: var(--space-md);
  justify-content: center;
  align-items: center;
  background-color: gray; /* fallback */
  border-radius: 12px;
  color: #fff;
  font-weight: bold;
  display: flex;
}

/* 使用全局变量 */
.card-global {
  background-color: var(--color-primary);
}

/* 局部覆盖变量 */
.card-local {
  --color-primary: #ffcc00;
  background-color: var(--color-primary);
  color: #000;
}

/* 控制器 */
.card-controller {
  background-color: palevioletred;
}

/* 父作用域覆盖变量 */
.scope-container {
  --color-primary: #0066ff;
  display: flex;
  width: 400px;
  height: 300px;
}

/* 子元素继承父作用域 */
.card-scope-child {
  background-color: var(--color-primary);
}

/* 子元素再次覆盖 */
.card-scope-child-local {
  --color-primary: purple;
  background-color: var(--color-primary);
}

/* 嵌套变量示例 */
.card-nested {
  --card-bg: var(--color-primary, gray);
  background-color: var(--card-bg);
}
</style>