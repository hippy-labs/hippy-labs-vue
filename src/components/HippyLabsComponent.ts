import {defineComponent, h, ref} from "vue";
import {App} from "@vue/runtime-core";
import {Native} from "@hippy/vue-next";

/**
 * 注册 component: hippy-labs-view
 * 把 element 包装成Vue3组件：hippy-labs-view
 */
function registerHippyLabsComponent(app: App) {
  const hippyLabsComponent = defineComponent({
    name: "hippy-labs-view",
    //👉 声明抛出事件的名称，vue3语法
    emits: ["msg-event"],
    props: {
      propsMsg: {
        type: String,
        default: '',
      },
    },
    setup(props, context) {
      const viewRef = ref();

      //👉 声明组件的方法，方法里面调用 Native 层组件的方法：sendMessage
      function sendMessage(msg: string): Promise<string> {
        return new Promise((resolve, reject) => {
          // 👉 调用安卓层组件的方法：sendMessage
          Native.callUIFunction(viewRef.value, "sendMessage", [msg], (res) => {
            console.log("------sendMessage----返回值----------->>>>", res);
            resolve(res as string); // 👈 将返回值传出去
          });
        });
      }

      context.expose({
        viewRef,
        //👉 expose method : Vue3语法
        sendMessage,
      });

      return () => {
        const children = context.slots.default && context.slots.default();
        return h(
          //👉 使用的 element的名称：HippyLabsVueElement
          "HippyLabsVueElement",
          {
            ref: viewRef,
            ...props,  // 👈 将所有 props 直接传入原生组件
            //👉 Native 层发送的事件名称：onNativeEvent
            onNativeEvent: (evt) => {
              //👉 转发事件名称为：msg-event
              context.emit("msg-event", evt);
            },
          },
          children,
        );
      };
    },
  });
  //👉 声明组件的名称：hippy-labs-view，给页面使用
  app.component("hippy-labs-view", hippyLabsComponent);
}

export default registerHippyLabsComponent;
