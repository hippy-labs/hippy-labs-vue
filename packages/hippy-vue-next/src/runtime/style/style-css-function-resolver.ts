import {HippyElement} from "../element/hippy-element";
import {NativeNodeProps} from "../../types";

/**
 * 简化版 CSS 函数解析：
 * - 支持 calc、min、max、clamp
 * - 单位仅支持 px 或无单位
 * - 不处理 rem / % / 颜色 / url / env
 */
export function resolveCssFunctions(
    _node: HippyElement,
    style: NativeNodeProps,
): NativeNodeProps {
    const out: NativeNodeProps = {...style};
    for (const key of Object.keys(out)) {
        const v = out[key];
        if (typeof v === "string" && /^[a-zA-Z_-][a-zA-Z0-9_-]*\s*\(/.test(v)) {
            out[key] = resolveValue(v);
        }
    }
    return out;
}

function resolveValue(input: string): string {
    let out = input;
    let guard = 0;
    while (guard++ < 50) {
        const fn = findInnermostFunction(out);
        if (!fn) break;
        const name = fn.name.trim().toLowerCase();
        const args = fn.args;
        const replacement = dispatchFunction(name, args);
        out = out.slice(0, fn.start) + replacement + out.slice(fn.end);
    }
    return out.trim();
}

function findInnermostFunction(
    input: string,
): { start: number; end: number; name: string; args: string } | null {
    const stack: number[] = [];
    for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "(") {
            stack.push(i);
        } else if (ch === ")") {
            const startParen = stack.pop();
            if (startParen == null) continue;
            let j = startParen - 1;
            while (j >= 0 && /\s/.test(input[j])) j--;
            let endName = j;
            while (j >= 0 && /[a-zA-Z0-9_-]/.test(input[j])) j--;
            const startName = j + 1;
            const name = input.slice(startName, endName + 1);
            const between = input.slice(endName + 1, startParen);
            if (/^\s*$/.test(between) && name) {
                const args = input.slice(startParen + 1, i);
                return {start: startName, end: i + 1, name, args};
            }
        }
    }
    return null;
}

function dispatchFunction(name: string, rawArgs: string): string {
    switch (name) {
        case "calc":
            return resolveCalc(rawArgs);
        case "min":
            return resolveMinMax(rawArgs, Math.min);
        case "max":
            return resolveMinMax(rawArgs, Math.max);
        case "clamp":
            return resolveClamp(rawArgs);
        default:
            return `${name}(${rawArgs})`;
    }
}

// ----------------- 核心函数解析 -----------------
function resolveCalc(expr: string): string {
    try {
        const safeExpr = expr.replace(/([+\-]?\d*\.?\d+)px/g, "($1)");
        const resolvedExpr = resolveValue(safeExpr); // 递归解析嵌套
        const safe = resolvedExpr.replace(/[^0-9+\-*/().\s]/g, "");
        // eslint-disable-next-line no-new-func
        const val = Function(`return ${safe}`)();
        return Number.isFinite(val) ? `${trimFloat(val)}px` : `calc(${expr})`;
    } catch {
        return `calc(${expr})`;
    }
}

// 支持嵌套函数参数解析
function splitArgs(argStr: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let buf = "";
    for (const ch of argStr) {
        if (ch === "(") depth++;
        if (ch === ")") depth--;
        if (ch === "," && depth === 0) {
            parts.push(buf.trim());
            buf = "";
        } else {
            buf += ch;
        }
    }
    if (buf) parts.push(buf.trim());
    return parts;
}

function resolveMinMax(args: string, fn: (...nums: number[]) => number): string {
    const parts = splitArgs(args);
    const nums: number[] = [];
    for (const p of parts) {
        const resolved = resolveValue(p); // 递归解析嵌套
        const m = resolved.trim().match(/^([+\-]?\d*\.?\d+)px?$/);
        if (!m) return `${fn === Math.min ? "min" : "max"}(${args})`;
        nums.push(parseFloat(m[1]));
    }
    return `${trimFloat(fn(...nums))}px`;
}

function resolveClamp(args: string): string {
    const parts = splitArgs(args);
    if (parts.length !== 3) return `clamp(${args})`;
    const nums: number[] = [];
    for (const p of parts) {
        const resolved = resolveValue(p); // 递归解析嵌套
        const m = resolved.trim().match(/^([+\-]?\d*\.?\d+)px?$/);
        if (!m) return `clamp(${args})`;
        nums.push(parseFloat(m[1]));
    }
    const [minV, valV, maxV] = nums;
    const clamped = Math.min(Math.max(valV, minV), maxV);
    return `${trimFloat(clamped)}px`;
}

// ----------------- 工具函数 -----------------
function trimFloat(n: number): string {
    return Number(n.toFixed(4)).toString();
}
