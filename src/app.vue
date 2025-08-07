<template>
  <div id="root">
    <hippy-labs-view
      ref="viewRef"
      class="hippy-labs-view-css"
      message="我是来自 Props 的消息"
      @msg-event="onMsgEvent">
      <p class="hippy-labs-child-view-css">组件返回码：{{ code }}</p>
      <p class="hippy-labs-child-view-css">组件消息内容：{{ msg }}</p>
      <p class="hippy-labs-child-view-css">组件回调消息：{{ retMsg }}</p>
      <p class="hippy-labs-child-view-css">模块消息内容：{{ retModuleMsg }}</p>
    </hippy-labs-view>
  </div>
</template>
<script lang="ts">
import {defineComponent, onMounted, ref} from '@vue/runtime-core';
import HippyLabsComponent from "./components/HippyLabsComponent";
import {EventBus, Native} from "@hippy/vue-next";

export default defineComponent({
  name: 'App',
  components: {HippyLabsComponent},
  setup() {
    const code = ref<string>("")
    const msg = ref<string>("")
    const retMsg = ref<string>("")
    const retModuleMsg = ref<string>("")

    const viewRef = ref()

    //👉 注册模块消息监听
    EventBus.$on("onHippyLabsModuleEvent", (evt) => {
      const msg = evt.message
      retModuleMsg.value = (retModuleMsg.value + msg)
    });

    onMounted(() => {
      setTimeout(() => {
        //👉 调用组件的方法
        viewRef.value?.sendMessage("我是来自 Vue 的消息").then(msg => {
          retMsg.value = msg
        }, error => {
          console.log(error)
        })

        //👉 调用模块
        Native.callNativeWithPromise("HippyLabsModule", "sendMessage", "我是来自 Vue 的消息")
          .then(ret => {
            retModuleMsg.value = (retModuleMsg.value + "\n模块回调消息：" + ret)
          }, error => {
            console.log(error)
          })
      }, 3000)
    })

    function onMsgEvent(evt) {
      msg.value = evt.message
      code.value = `${evt.code}`
    }

    return {
      viewRef,
      onMsgEvent,
      retModuleMsg,
      retMsg,
      msg,
      code
    };
  },
});
</script>
<style>
#root {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #40b883;
}

.hippy-labs-view-css {
  width: 500px;
  height: 500px;
  background-color: palevioletred;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hippy-labs-child-view-css {
  width: 450px;
  height: 100px;
  background-color: purple;
  margin: 10px;
  text-align: center;
  color: white;
}

</style>
