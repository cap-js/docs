
// Utils from the eslint-online-playground: https://github.com/ota-meshi/eslint-online-playground
// See License: ./LICENSE.txt
// The following functions are used in the above playground source code. We use them here to compress
// our example lint file sources into a URL that takes us to that playground.

import { zlibSync, strToU8, strFromU8 } from 'fflate';

export function compress(sources: any): string {
    try {
        return utoa(JSON.stringify(sources));
    } catch {
        // return silently
        return "";
    }
}

function utoa(data: string): string {
    const buffer = strToU8(data);
    const zipped = zlibSync(buffer, { level: 9 });
    const binary = strFromU8(zipped, true);
    return btoa(binary);
}

const indentStr = "  ";
export function prettyStringify(object: unknown): string {
    return toLines("", object).join("\n");
}

function toLines(indent: string, object: unknown): string[] {
    if (!object || typeof object !== "object") {
        return [indent + JSON.stringify(object)];
    }
    if (Array.isArray(object)) {
        return toLinesObject(
            indent,
            "[]",
            object.map((element: unknown) => toLines(indent + indentStr, element)),
        );
    }
    return toLinesObject(
        indent,
        "{}",
        Object.entries(object).map(([k, v]) => {
            const vs = toLines(indent + indentStr, v);
            return [
                `${indent + indentStr}${JSON.stringify(k)}: ${vs[0].trim()}`,
                ...vs.slice(1),
            ];
        }),
        true,
    );
}

function toLinesObject(
    indent: string,
    [open, close]: string,
    elements: string[][],
    forceLF = false,
): string[] {
    if (elements.some((element) => element.length > 1 || forceLF)) {
        return toLinesWithLineFeed();
    }
    const line =
        indent + open + elements.map(([line]) => line.trim()).join(", ") + close;
    if (line.length > 80) return toLinesWithLineFeed();
    return [line];

    function toLinesWithLineFeed() {
        return [
            indent + open,
            ...elements
                .slice(0, -1)
                .flatMap((element) => [
                    ...element.slice(0, -1),
                    `${element.slice(-1)[0]},`,
                ]),
            ...elements.slice(-1).flat(),
            indent + close,
        ];
    }
}
