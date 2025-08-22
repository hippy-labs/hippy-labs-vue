import {NativeNodeProps} from "../../types";
import {parseRemStyle} from "../../util/rem";
import {HippyElement} from "../element/hippy-element";

/**
 * REM
 */
export function normalizeRemStyleValues(node: HippyElement, styleObject: NativeNodeProps): NativeNodeProps {
    let style: NativeNodeProps = {};
    const keys = Object.keys(styleObject);

    if (keys.length) {
        keys.forEach((key) => {
            style[key] = parseRemStyle(styleObject[key]);
        });
    } else {
        style = styleObject;
    }

    return style;
}
