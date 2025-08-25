// style-css-variables-manager.ts
import {HippyElement} from "../element/hippy-element";

interface VarDependency {
    node: HippyElement;
    scope: "global" | HippyElement;
}

class CssVarManager {
    // Map: varName → Map<scopeKey, VarDependency>
    private deps: Map<string, Map<string, VarDependency>> = new Map();
    private globals: Record<string, string> = global.__HIPPY_CSS_VARIABLES__ || (global.__HIPPY_CSS_VARIABLES__ = {});

    private makeKey(node: HippyElement, scope: "global" | HippyElement, varName: string) {
        return `${varName}::${scope === "global" ? "g" : (scope as HippyElement).nodeId}::${node.nodeId}`;
    }

    /**
     * 注册依赖：node 使用了 scope 中的 varName
     */
    addDependency(node: HippyElement, varName: string, scope: "global" | HippyElement) {
        if (!this.deps.has(varName)) {
            this.deps.set(varName, new Map());
        }
        const set = this.deps.get(varName)!;
        const key = this.makeKey(node, scope, varName);
        if (!set.has(key)) {
            set.set(key, {node, scope});
            console.debug("addDependency:", node.nodeId, varName, scope === "global" ? "global" : `node:${(scope as HippyElement).nodeId}`);
        }
    }

    /**
     * 移除依赖（节点销毁时调用）
     */
    removeNode(node: HippyElement) {
        for (const [, set] of this.deps) {
            for (const [key, dep] of set) {
                if (dep.node === node || dep.scope === node) {
                    set.delete(key);
                }
            }
        }
    }

    /**
     * 当变量 varName 更新时，触发依赖节点的刷新
     */
    notifyVarChanged(varName: string, scope: "global" | HippyElement = "global") {
        const set = this.deps.get(varName);
        if (!set) return;

        for (const dep of set.values()) {
            if (scope === "global" && dep.scope === "global") {
                dep.node.updateNativeNode(false);
            } else if (scope !== "global" && dep.scope === scope) {
                dep.node.updateNativeNode(false);
            }
        }
    }

    /**
     * 查询全局变量
     */
    getGlobalVar(varName: string): string | undefined {
        return this.globals[varName];
    }

    /**
     * 更新全局变量，并触发依赖刷新
     */
    setGlobalVar(varName: string, value: string) {
        this.globals[varName] = value;
        this.notifyVarChanged(varName, "global");
    }
}

// 单例管理器
export const cssVarManager = new CssVarManager();

// 重点优化方向：
// 	1.	依赖表改成 Map<varName, Map<scopeKey, Set<nodeId>>>，避免内存泄漏。
// 	2.	批量刷新 / 异步刷新，减少重复 updateNativeNode。
// 	3.	增加缓存（解析结果缓存 / fallback 缓存），减少重复解析。
// 	4.	全局变量存储隔离（避免污染 global）。
// 	5.	类型系统改进（避免过多 any，数值保持 number）。