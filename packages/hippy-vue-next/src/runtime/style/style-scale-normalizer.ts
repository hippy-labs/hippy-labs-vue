import {NativeNodeProps} from "../../types";
import {HippyElement} from "../element/hippy-element";
import {getHippyCachedInstance} from "../../util/instance";
import type {NeedToTyped} from "../../types";

export const scaleProps = [
    // 尺寸相关
    "width",
    "height",
    "minWidth",
    "minHeight",
    "maxWidth",
    "maxHeight",

    // 外边距
    "margin",
    "marginTop",
    "marginRight",
    "marginBottom",
    "marginLeft",
    "marginVertical",
    "marginHorizontal",

    // 内边距
    "padding",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "paddingVertical",
    "paddingHorizontal",

    // 边框宽度
    "borderWidth",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",

    // 圆角
    "borderRadius",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderBottomLeftRadius",
    "borderBottomRightRadius",

    // 位置类（适用于 position: absolute / relative）
    "top",
    "right",
    "bottom",
    "left",

    // 字体
    "fontSize",
    "lineHeight",
    "letterSpacing",

    // 阴影（部分数值可能为字符串，如 '0px 2px 4px rgba(0,0,0,0.2)'，需额外处理）
    "shadowOffsetX",
    "shadowOffsetY",
    "shadowRadius",

    // 图片圆角、尺寸
    "resizeMode",
    "aspectRatio", // 非直接缩放，但常一起处理
];

/**
 * 适配
 */
export function normalizeScaleStyleValues(node: HippyElement, styleObject: NativeNodeProps): NativeNodeProps {
    let style: NativeNodeProps = {};
    const keys = Object.keys(styleObject);

    if (keys.length) {
        keys.forEach((key) => {
            if (scaleProps.includes(key)) {
                style[key] = scaleStyle(styleObject[key]);
            } else {
                style[key] = styleObject[key];
            }
        });
    } else {
        style = styleObject;
    }
    return style;
}


export function scaleStyle(styleValue: NeedToTyped): NeedToTyped {
    const {width, scale} = global.Hippy.device.screen;
    const {ratioBaseWidth} = getHippyCachedInstance();
    const scalePx = (width * scale) / ratioBaseWidth;
    // return styleValue;
    return (styleValue * scalePx) / scale;
}
