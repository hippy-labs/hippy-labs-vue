// style-css-variables-resolver.ts
import {HippyElement} from "../element/hippy-element";
import {CssDeclarationType} from "@hippy/hippy-vue-next-style-parser";
import {NativeNodeProps} from "../../types";

const MAX_VAR_DEPTH = 16;

/** 向上查找变量：节点 → 祖先 → 全局 */
function lookupVar(node: HippyElement, varName: string) {
    // 本节点
    if (node.cssVariables && varName in node.cssVariables) {
        return node.cssVariables[varName]
    }
    // 祖先链
    let p = node.parentNode as HippyElement | null;
    while (p) {
        if (p.cssVariables && varName in p.cssVariables) {
            return p.cssVariables[varName]
        }
        p = p.parentNode as HippyElement | null;
    }
    // 全局
    if (global.__HIPPY_CSS_VARIABLES__ && varName in global.__HIPPY_CSS_VARIABLES__) {
        return global.__HIPPY_CSS_VARIABLES__[varName];
    }
    return undefined;
}

/**
 * const s = "var(--a, var(--b, red))";
 * const open = 3; // '(' 的位置
 * findMatchingParen(s, open); // 返回最后一个 ')'
 */
/** 找到 `var(` 的右括号，支持嵌套括号计数 */
function findMatchingParen(str: string, openIdx: number): number {
    let depth = 0;
    for (let i = openIdx; i < str.length; i++) {
        const ch = str[i];
        if (ch === "(") depth++;
        else if (ch === ")") {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

/**
 * splitVarArgs("--a, var(--b, red)")
 * // => ["--a", "var(--b, red)"]
 *
 * splitVarArgs("--c")
 * // => ["--c", null]
 */
/** 拆分 var() 内部参数，找最外层逗号（支持括号嵌套） */
function splitVarArgs(inner: string): [string, string | null] {
    let depth = 0;
    for (let i = 0; i < inner.length; i++) {
        const ch = inner[i];
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        else if (ch === "," && depth === 0) {
            const name = inner.slice(0, i).trim();
            const fb = inner.slice(i + 1).trim();
            return [name, fb.length ? fb : null];
        }
    }
    return [inner.trim(), null];
}

/**
 * --a: var(--c, blue);
 * color: var(--a, var(--b, red));
 */
/** 递归解析任意包含 var() 的值，支持嵌套 & fallback */
function resolveValueWithVars(
    node: HippyElement,
    raw: string,
    depth = 0,
    seen: Set<string> = new Set()
): string {
    if (typeof raw !== "string") return raw as any;
    if (depth > MAX_VAR_DEPTH) {
        // 防炸栈：直接返回当前值
        return raw;
    }

    let out = "";
    let i = 0;

    while (i < raw.length) {
        // 寻找下一个 "var("
        const idx = raw.indexOf("var(", i);
        if (idx === -1) {
            out += raw.slice(i);
            break;
        }
        // 先拼接前缀
        out += raw.slice(i, idx);

        const open = idx + 3; // 指向 '(' 的位置
        const close = findMatchingParen(raw, open);
        if (close === -1) {
            // 括号不配对，保守拼接原文
            out += raw.slice(idx);
            break;
        }

        const inner = raw.slice(open + 1, close).trim(); // 去掉最外层括号
        const [name, fallback] = splitVarArgs(inner);

        // var 名必须以 -- 开头
        const varName = name;
        let replacement = "";

        if (varName.startsWith("--")) {
            if (seen.has(varName)) {
                // 环依赖：优先用 fallback，否则置空
                replacement =
                    fallback !== null
                        ? resolveValueWithVars(node, fallback, depth + 1, seen)
                        : "";
            } else {
                seen.add(varName);
                let v = lookupVar(node, varName);
                if (v == null || v === "") {
                    // 无定义 → fallback
                    replacement =
                        fallback !== null
                            ? resolveValueWithVars(node, fallback, depth + 1, seen)
                            : "";
                } else {
                    // 变量值本身可能仍包含 var()，递归解析
                    replacement = resolveValueWithVars(node, String(v), depth + 1, seen);
                }
                seen.delete(varName);
            }
        } else {
            // 非法 var 名，按空值处理或 fallback
            replacement =
                fallback !== null
                    ? resolveValueWithVars(node, fallback, depth + 1, seen)
                    : "";
        }

        out += replacement;
        i = close + 1; // 继续向后扫描
    }

    return out;
}

/**
 * 提取节点自身定义的 CSS 变量
 * @param node 节点对象
 * @param declarations CSS 声明数组
 */
export function extractCssVariables(
    node: HippyElement,
    declarations?: Array<CssDeclarationType>
) {
    if (!declarations?.length) return;
    node.cssVariables = node.cssVariables || {};
    declarations.forEach(({property, value}) => {
        if (property?.startsWith("--")) {
            node.cssVariables![property] = value as any;
        }
    });
}

/**
 * 解析节点的 CSS 变量（支持嵌套 var() 与 fallback 中再含 var()）
 * 规则：先收集当前节点所有 --*（不做解析），再解析普通属性
 */
export function resolveCssVariables(
    node: HippyElement,
    declarations: CssDeclarationType[]
): NativeNodeProps {
    if (!declarations?.length) return {};

    // ① 先收集当前节点上定义的自定义属性（不解析，保持引用）
    extractCssVariables(node, declarations)

    // ② 再解析普通属性里的 var()（支持嵌套）
    const resolved: Record<string, string | number> = {};
    for (const decl of declarations) {
        const {property} = decl;
        let {value} = decl;

        if (!property || property.startsWith("--")) {
            // 自定义属性不进入 resolved
            continue;
        }

        if (typeof value === "string" && value.includes("var(")) {
            value = resolveValueWithVars(node, value);
        }

        resolved[property] = value as any;
    }

    return resolved;
}