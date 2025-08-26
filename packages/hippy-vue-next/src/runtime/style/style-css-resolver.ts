//
import {HippyElement} from "../element/hippy-element";
import {resolveCssVariables} from "./style-css-variables-resolver";
import {CssDeclarationType} from "@hippy/hippy-vue-next-style-parser";
import {NativeNodeProps} from "../../types";
import {normalizeColorStyleValues} from "./style-color-normalizer";
import {normalizeSizeStyleValues} from "./style-size-normalizer";
import {resolveCssFunctions} from "./style-css-function-resolver";

/**
 *
 */
export function resolveCssStyle(node: HippyElement, declarations: CssDeclarationType[]): NativeNodeProps {
    let resolvedValue = resolveCssVariables(node, declarations);
    resolvedValue = resolveCssFunctions(node, resolvedValue);
    resolvedValue = normalizeColorStyleValues(node, resolvedValue)
    resolvedValue = normalizeSizeStyleValues(node, resolvedValue)
    return resolvedValue;
}