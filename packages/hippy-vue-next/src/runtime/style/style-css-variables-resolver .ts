//
import {HippyElement} from "../element/hippy-element";
import {CssDeclarationType} from "@hippy/hippy-vue-next-style-parser";
import {NativeNodeProps} from "../../types";

/**
 * 提取节点自身定义的 CSS 变量
 * @param node 节点对象
 * @param declarations CSS 声明数组
 */
export function extractCssVariables(node: HippyElement, declarations?: Array<CssDeclarationType>) {
    if (!declarations?.length) return;
    node.cssVariables = node.cssVariables || {};
    declarations.forEach(({property, value}) => {
        if (property?.startsWith('--')) {
            node.cssVariables[property] = value;
        }
    });
}

/**
 * 解析节点的 CSS 变量
 * @param node 当前节点
 * @param declarations CSS 声明数组
 * @returns 解析后的属性对象
 */
export function resolveCssVariables(
    node: HippyElement,
    declarations: CssDeclarationType[]
): NativeNodeProps {
    if (!declarations?.length) return {};

    const resolved: Record<string, string | number> = {};
    node.cssVariables = node.cssVariables || {};

    declarations.forEach((declaration) => {
        const {property} = declaration;
        let {value} = declaration;

        if (!property) return;

        // 变量声明直接提取，不加入 resolved
        if (property.startsWith("--")) {
            node.cssVariables[property] = value;
            return;
        }

        // 普通属性解析 var()
        if (typeof value === "string" && value.includes("var(")) {
            const varRegex = /var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g;
            value = value.replace(varRegex, (_match, varName, fallback) => {
                let varValue = node.cssVariables?.[varName];
                let parent = node.parentNode as HippyElement;

                while (!varValue && parent) {
                    varValue = parent.cssVariables?.[varName];
                    parent = parent.parentNode as HippyElement;
                }

                if (!varValue && global["__HIPPY_CSS_VARIABLES__"]) {
                    varValue = global["__HIPPY_CSS_VARIABLES__"][varName];
                }

                return varValue ?? fallback ?? "";
            });
        }

        resolved[property] = value;
    });

    return resolved;
}