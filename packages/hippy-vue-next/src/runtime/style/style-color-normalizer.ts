import {HippyElement} from "../element/hippy-element";
import {translateColor} from "@hippy/hippy-vue-next-style-parser";
import {NativeNodeProps} from "../../types";

/**
 * 👉 background-color
 * 判断属性是否是颜色相关属性
 */
const COLOR_PROPERTIES = new Set([
    'color',
    'backgroundColor',
    'borderColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'outlineColor',
    // 可以根据需求继续添加
]);

/**
 * Color
 */
export function normalizeColorStyleValues(node: HippyElement, style: NativeNodeProps): NativeNodeProps {

    const normalizedStyle: NativeNodeProps = {};
    for (const property in style) {
        let value = style[property];
        if (COLOR_PROPERTIES.has(property) && typeof value === "string") {
            try {
                value = translateColor(value);
                console.log(
                    "normalizeColorStyleValues: property:",
                    property,
                    "value",
                    value
                );
            } catch (e) {
                console.warn(
                    `normalizeColorStyleValues: failed to translate color for ${property}: ${value}`
                );
            }
        }
        normalizedStyle[property] = value;
    }
    return normalizedStyle;
}
