/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export interface SelectorType {
  type: string;
  identifier?: string;
  property?: string;
  test?: string;
  value?: string;
}

export type PairValueType = [//
      SelectorType[] | undefined,//
      undefined | string//
];//


//[PairValueType, PairValueType, PairValueType]
//[SelectorType[][], SelectorType[][], SelectorType[][]]
export type ParsedSelectorValueType = (SelectorType[][] | PairValueType)[];


export interface CombinatorType {
  start: number;
  end: number;
  value: string;
}

export interface SelectorParsedType {
  start: number | undefined;
  end: number | undefined;
  value: ParsedSelectorValueType;
}

// Check the Regexp is support sticky flag.
//检测当前 JavaScript 引擎是否支持正则表达式的 sticky 修饰符 (y)。
//•	g → 会跳过不匹配的位置继续往后找
//•	y → 必须严格从 lastIndex 开始，否则返回 null
const REGEXP_SUPPORTING_STICKY_FLAG = (() => {
  try {
    return !!new RegExp('foo', 'y');
  } catch (err) {
    return false;
  }
})();

// Regexp strings
const REGEXP_STRINGS = {
  whiteSpaceRegEx: '\\s*',
  universalSelectorRegEx: '\\*',
  simpleIdentifierSelectorRegEx: '(#|\\.|:|\\b)([_-\\w][_-\\w\\d]*)',
  attributeSelectorRegEx:
    '\\[\\s*([_-\\w][_-\\w\\d]*)\\s*(?:(=|\\^=|\\$=|\\*=|\\~=|\\|=)\\s*(?:([_-\\w][_-\\w\\d]*)|"((?:[^\\\\"]|\\\\(?:"|n|r|f|\\\\|0-9a-f))*)"|\'((?:[^\\\\\']|\\\\(?:\'|n|r|f|\\\\|0-9a-f))*)\')\\s*)?\\]',
  combinatorRegEx: '\\s*(\\+|~|>)?\\s*',
};

// RegExp instance cache
const REGEXPS = {};

// Execute the RegExp
function execRegExp(regexpKey, text, start) {
  let flags = '';

  // Check the sticky flag supporting, and cache the RegExp instance.
  if (REGEXP_SUPPORTING_STICKY_FLAG) {
    flags = 'gy';
  }
  if (!REGEXPS[regexpKey]) {
    REGEXPS[regexpKey] = new RegExp(REGEXP_STRINGS[regexpKey], flags);
  }
  const regexp = REGEXPS[regexpKey];
  let result;
  // Fallback to split the text if sticky is not supported.
  if (REGEXP_SUPPORTING_STICKY_FLAG) {
    regexp.lastIndex = start;
    //
    result = regexp.exec(text);
    // • 作用：在目标字符串中执行一次正则匹配。
    // • 返回值：
    //    • 如果匹配成功 → 返回一个数组（RegExpExecArray），包含整个匹配结果和各捕获组。
    //    • result[0]：完整匹配到的字符串
    //    • result[1..n]：捕获分组内容
    //    • result.index：匹配在字符串中的起始位置
    //    • result.input：原始字符串
    //    • 如果匹配失败 → 返回 null。
  } else {
    // eslint-disable-next-line no-param-reassign
    text = text.slice(start, text.length);
    result = regexp.exec(text);
    if (!result) {
      return {
        result: null,
        regexp,
      };
    }
    // add start index to prevent infinite loop caused by class name like .aa_bb.aa
    regexp.lastIndex = start + result[0].length;
  }
  return {
    result,
    regexp,
  };
}

function parseUniversalSelector(text, start) {
  const { result, regexp } = execRegExp('universalSelectorRegEx', text, start);
  if (!result) {
    return null;
  }
  const end = regexp.lastIndex;
  return {
    value: {
      type: '*',
    },
    start,
    end,
  };
}

function parseSimpleIdentifierSelector(text, start) {
  const { result, regexp } = execRegExp(
    'simpleIdentifierSelectorRegEx',
    text,
    start,
  );
  if (!result) {
    return null;
  }
  const end = regexp.lastIndex;
  const type = result[1];
  const identifier = result[2];
  const value = { type, identifier };
  return {
    value,
    start,
    end,
  };
}

function parseAttributeSelector(text, start) {
  const { result, regexp } = execRegExp('attributeSelectorRegEx', text, start);
  if (!result) {
    return null;
  }
  const end = regexp.lastIndex;
  const property = result[1];
  if (result[2]) {
    const test = result[2];
    const value = result[3] || result[4] || result[5];
    return {
      value: {
        type: '[]',
        property,
        test,
        value,
      },
      start,
      end,
    };
  }
  return {
    value: {
      type: '[]',
      property,
    },
    start,
    end,
  };
}

function parseSimpleSelector(text, start) {
  return (
    parseUniversalSelector(text, start)
    ?? parseSimpleIdentifierSelector(text, start)
    ?? parseAttributeSelector(text, start)
  );
}

function parseSimpleSelectorSequence(text, start) {
  let simpleSelector = parseSimpleSelector(text, start);
  if (!simpleSelector) {
    return null;
  }
  let { end } = simpleSelector;
  const value: any[] = [];
  while (simpleSelector) {
    value.push(simpleSelector.value);
    ({ end } = simpleSelector);
    simpleSelector = parseSimpleSelector(text, end);
  }
  return {
    start,
    end,
    value,
  };
}

function parseCombinator(text, start) {
  const { result, regexp } = execRegExp('combinatorRegEx', text, start);
  if (!result) {
    return null;
  }
  let end;
  if (REGEXP_SUPPORTING_STICKY_FLAG) {
    end = regexp.lastIndex;
  } else {
    end = start;
  }
  const value = result[1] || ' ';
  return {
    start,
    end,
    value,
  };
}

/**
 * parse the selector
 * after parsing：
 * 1、end is the index of the position where the selector ends
 * 2、start is the specified start position
 * 3、value is the value of the selector, including type: such as id selector, class selector, etc.
 *
 * @param text - selector content
 * @param start - starting position
 */
function parseSelector(
  text: string,
  start: number | undefined,
): SelectorParsedType {
  //从 0 开始去掉空白
  let end = start;
  const { result, regexp } = execRegExp('whiteSpaceRegEx', text, start);
  if (result) {
    end = regexp.lastIndex;
  }
  const value: ParsedSelectorValueType = [];
  let combinator: CombinatorType | null;
  let expectSimpleSelector = true;
  let pair: PairValueType = [undefined, undefined];
  let cssText;
  if (REGEXP_SUPPORTING_STICKY_FLAG) {
    cssText = [text];
  } else {
    cssText = text.split(' ');
  }
  cssText.forEach((newText) => {
    if (!REGEXP_SUPPORTING_STICKY_FLAG) {
      if (newText === '') {
        return;
      }
      end = 0;
    }
    do {
      const simpleSelectorSequence = parseSimpleSelectorSequence(newText, end);
      if (!simpleSelectorSequence) {
        if (expectSimpleSelector) {
          //如果上字符一个是组合器，当前解析器为空，则说明非法字符直接返回
          return;
        }
        //否则进行下一个循环
        break;
      }
      ({ end } = simpleSelectorSequence);
      if (combinator) {
        pair[1] = combinator.value;
      }
      //[
      //  [simpleSelectorSequence.value, combinator.value],
      //  [simpleSelectorSequence.value, undefined],
      // ]
      pair = [simpleSelectorSequence.value, undefined];
      value.push(pair);

      combinator = parseCombinator(newText, end);
      if (combinator) {
        ({ end } = combinator);
      }
      expectSimpleSelector = !!(combinator && combinator.value !== ' ');
    } while (combinator);
  });
  return {
    start,
    end,
    value,
  };
}

export { parseSelector };
