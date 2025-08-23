import {HippyElement} from "../element/hippy-element";
import {NativeNodeProps} from "../../types";
import {tryConvertNumber} from "../../util";

/**
 * Size
 */
export function normalizeSizeStyleValues(node: HippyElement, style: NativeNodeProps): NativeNodeProps {

    const normalizedStyle: NativeNodeProps = {};

    for (const property in style) {
        let value = style[property];

        try {
            // 如果是变量（--xxx），不做处理，直接原样返回
            if (property.startsWith("--")) {
                normalizedStyle[property] = value;
                continue;
            }

            // 只处理字符串/数字类型
            if (typeof value === "string") {
                // 1. 尝试转为数字（"12" → 12, "12px" 保持字符串）
                value = tryConvertNumber(value);
                // 2. 转换 px → pt（只对特定属性生效）
                value = convertPxUnitToPt(value);
            }

            normalizedStyle[property] = value;
        } catch (e) {
            console.warn(
                `normalizeSizeStyleValues: failed to normalize size for ${property}: ${value}`,
                e
            );
            normalizedStyle[property] = value; // 保底返回原值
        }
    }

    return normalizedStyle;
}


function convertPxUnitToPt(value) {
    // If value is number just ignore
    if (Number.isInteger(value)) {
        return value;
    }
    // If value unit is rpx, don't need to filter
    if (typeof value === 'string' && value.endsWith('rpx')) {
        return value;
    }
    // If value unit is px, change to use pt as 1:1.
    if (typeof value === 'string' && value.endsWith('px')) {
        const num = parseFloat(value.slice(0, value.indexOf('px')));
        if (!Number.isNaN(num)) {
            value = num;
        }
    }
    return value;
}