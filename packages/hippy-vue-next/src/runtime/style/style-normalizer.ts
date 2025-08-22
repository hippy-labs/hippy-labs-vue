import {HippyElement} from "../element/hippy-element";
import {NativeNodeProps} from "../../types";
import {normalizeRemStyleValues} from "./style-rem-normalizer";
import {normalizeScaleStyleValues} from "./style-scale-normalizer";

export function normalizeStyleValues(node: HippyElement, styleObject: NativeNodeProps): NativeNodeProps {
    const remStyles = normalizeRemStyleValues(node, styleObject);
    const scaleStyles = normalizeScaleStyleValues(node, remStyles);
    return scaleStyles;
}
