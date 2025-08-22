import { createApp, type HippyApp, Native } from "@hippy/vue-next";

import App from "./app.vue";
import { setGlobalInitProps } from "./util";

global.Hippy.on("uncaughtException", (err) => {
  console.log("uncaughtException error", err.stack, err.message);
});

// only supported in iOS temporarily
global.Hippy.on("unhandledRejection", (reason) => {
  console.log("unhandledRejection reason", reason);
});

const app: HippyApp = createApp(App, {
  appName: "Demo",
  styleOptions: {
    //👉 TODO
    ratioBaseWidth: 1920,
    beforeLoadStyle: (decl) => {
      let { value } = decl;
      // 比如可以对 rem 单位进行处理
      if (typeof value === "string" && /rem$/.test(value)) {
        // get the numeric value of rem

        const { screen } = Native.Dimensions;
        // 比如可以对 rem 单位进行处理
        if (typeof value === "string" && /rem$/.test(value)) {
          const { width, height } = screen;
          // 防止hippy 旋转后，宽度发生变化
          const realWidth = width > height ? width : height;
          value = Number(
            parseFloat(
              `${(realWidth * 100 * Number(value.replace("rem", ""))) / 844}`,
            ).toFixed(2),
          );
        }
      }
      return { ...decl, value };
    },
  },
});

// 👉 注册 Element
import registerHippyLabsElement from "./element/HippyLabsElement";

registerHippyLabsElement(app);

// 👉 注册 Component
import registerHippyLabsComponent from "./components/HippyLabsComponent";

registerHippyLabsComponent(app);

const initCallback = ({ superProps, rootViewId }) => {
  setGlobalInitProps({
    superProps,
    rootViewId,
  });
  app.mount("#root");
};
app.$start().then(initCallback);
