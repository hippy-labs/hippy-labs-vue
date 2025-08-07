/**
 * 注册 element: HippyLabsVueElement
 */
import {App} from "@vue/runtime-core";
import {registerElement} from "@hippy/vue-next";

function registerHippyLabsElement(app: App) {
  const hippyLabsElement = {
    component: {
      //👉 对应Native 层组件的名称：HippyLabsNativeElement，必须保持一致
      name: "HippyLabsNativeElement",
      //👉 处理Native 层组件发送的事件
      processEventData(
        evtData,
        nativeEventParams: {
          message: string;
          code: number;
        },
      ) {
        if (!evtData || typeof evtData !== 'object') {
          return {};
        }
        const {handler: event = {}, __evt: nativeEventName} = evtData ?? {};
        switch (nativeEventName) {
          //👉 处理 Native 层组件发送的事件：onNativeEvent
          case "onNativeEvent":
            //👉 处理 Native 层组件发送的事件的 code 字段
            event.code = Number(nativeEventParams.code ?? -1);
            //👉 处理 Native 层组件发送的事件的 message 字段
            event.message = nativeEventParams.message ?? '';
            break;
          default:
            console.warn(`[hippy-labs] 未处理的 nativeEvent: ${nativeEventName}`);
            break;
        }
        return {
          ...event,
          code: nativeEventParams.code,
          message: nativeEventParams.message
        };
      },
    },
  };
  //👉 注册 element 名称为：HippyLabsVueElement
  registerElement("HippyLabsVueElement", hippyLabsElement);
}

export default registerHippyLabsElement;
