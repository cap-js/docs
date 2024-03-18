<script setup lang="ts">
interface Props {
  name: string;
  kind: 'correct' | 'incorrect';
  rules?: Record<string, string | number | [string, string | number]> | undefined;
}
// @ts-ignore
withDefaults(defineProps<Props>(), {})

import { zlibSync, strToU8, strFromU8 } from 'fflate';
// @ts-ignore
import { data } from '../../../tools/lint/examples/examples.data.ts';

const configFileName = ".eslintrc.json";
const packageJsonFileName = "package.json";

const defaultConfig: any = {
    "extends": ["plugin:@sap/cds/recommended"],
    "rules": {}
}

const defaultPackageJson = {
    "devDependencies": {
        "eslint": "latest",
        "@sap/eslint-plugin-cds": "latest",
        "@sap/cds-dk": "latest"
    }
}

function link(name: Props['name'] = "", kind: Props['kind'], rules?: Props['rules'] ): string {
  const sources = {} as Record<string, string>;
  if (rules) {
    for (const [key, value] of Object.entries(rules)) {
      defaultConfig.rules[key] = value;
    }
  }
  sources[configFileName] = prettyStringify(defaultConfig);
  sources[packageJsonFileName] = prettyStringify(defaultPackageJson);
  sources[`examples/${name}.cds`] = data[`${name}_${kind}`];
  return `https://eslint-online-playground.netlify.app/#${compress(sources)}`
}

function compress(sources: any): string {
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
function prettyStringify(object: unknown): string {
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
</script>

<template>
  <span class="VPBadge tip">
    <slot>
      <a :href="link(name, kind, rules)">Open In Playground</a>
    </slot>
  </span>
</template>

<style scoped>
.VPBadge {
  position: relative;
  margin-left: 2px;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 0 10px;
  line-height: 22px;
  font-size: 12px;
  font-weight: 500;
  float: right;
  transform: translateX(-1rem) translateY(-3.5rem);
  z-index: 1000
}

.VPBadge.tip {
  border-color: var(--vp-badge-tip-border);
  color: var(--vp-badge-tip-text);
  background-color: var(--vp-badge-tip-bg);
}

.headerless.th {
  display: none;
}
</style>