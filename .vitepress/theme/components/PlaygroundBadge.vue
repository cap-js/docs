<script setup lang="ts">
interface Props {
  name: string;
  kind: 'correct' | 'incorrect';
  rules?: Record<string, string | number | [string, string | number]> | undefined;
  files?: Array<string> | undefined;
  packages?: Record<string, string> | undefined;
}
// @ts-ignore
withDefaults(defineProps<Props>(), {})
import { compress, prettyStringify } from './eslint-online-playground/utils.ts';
// @ts-ignore
import { data } from '../../../tools/lint/examples/examples.data.ts';

const configFileName = ".eslintrc.json";
const packageJsonFileName = "package.json";

const defaultConfig: any = {
    "extends": ["plugin:@sap/cds/recommended"],
    "rules": {}
}

const defaultPackageJson = JSON.parse(data['package.json']);

function mergeJSONs(target: any, add: any) {
    const isObject = (obj: unknown) => typeof obj === 'object';
    Object.entries(add).forEach(([key, addVal]) => {
        const targetVal = target[key];
        if (targetVal && isObject(targetVal) && isObject(addVal)) {
            if ((Array.isArray(targetVal) && Array.isArray(addVal))) {
                targetVal.push(...addVal);
                return;
            }
            mergeJSONs(targetVal, addVal);
        } else {
            target[key] = addVal;
        }
    });
    return target;
}

function link(name: Props['name'] = "", kind: Props['kind'], rules?: Props['rules'], files?: Props['files'], packages?: Props['packages'] ): string {
  let json = {};
  const sources = {} as Record<string, string>;
  if (rules) {
    for (const [key, value] of Object.entries(rules)) {
      defaultConfig.rules[key] = value;
    }
  }
  sources[configFileName] = prettyStringify(defaultConfig);
  if (packages) {
    json = mergeJSONs(defaultPackageJson, packages);
  } else {
    json = defaultPackageJson;
  }
  sources[packageJsonFileName] = prettyStringify(json);
  if (files) {
    for (const file of files) {
      sources[file] = data[`${name}/${kind}/${file}`];
    }
  }
  return `https://eslint-online-playground.netlify.app/#${compress(sources)}`
}

</script>

<template>
  <span class="VPBadge tip">
    <slot>
      <a target="_blank" :href="link(name, kind, rules, files, packages)">Open In Playground</a>
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
  transform: translateX(-15px) translateY(-55px);
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
</style>../../../tools/lint/meta/examples.data.ts