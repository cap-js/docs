<script setup lang="ts">
interface Props {
  name: string;
  kind: 'correct' | 'incorrect';
  rules?: Record<string, string | number | [string, string | number]> | undefined;
  files?: Array<string> | undefined;
  packages?: Record<string, string> | undefined;
  nolink?: boolean;
}
// @ts-ignore
withDefaults(defineProps<Props>(), { nolink: false })
import { compress, prettyStringify } from './eslint-online-playground/utils';
// @ts-ignore
import { data } from '../examples/examples.data.ts';

const configFileName = "eslint.config.js";
const packageJsonFileName = "package.json";

const defaultConfig: string = `import cds from '@sap/eslint-plugin-cds'

export default [
  cds.configs.recommended,
  {
    rules: {
      // ...cds.configs.recommended.rules,
    }
  }
]
`

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
    let rulesList:string[] = []
    for (const [key, value] of Object.entries(rules)) {
      rulesList.push(`"${key}": ${JSON.stringify(value)}`);
    }
    sources[configFileName] = defaultConfig.replace(/\/\/ ...cds.configs.recommended.rules,/, `// ...cds.configs.recommended.rules,\n      ${rulesList.join(',\n')}`);
  } else{
    sources[configFileName] = defaultConfig;
  }
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
  <span class="VPBadge tip" v-if="!nolink">
    <slot>
      <a target="_blank" :href="link(name, kind, rules, files, packages)">Open In Playground</a>
    </slot>
  </span>
  <span class="VPBadge tip nolink" v-if="nolink">
    <slot>
      <a class="nolink" target="_blank">Playground link coming soon!</a>
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

.VPBadge.tip.nolink {
  border-color: var(--vp-badge-info-border);
  color: var(--vp-badge-info-text);
  background-color: var(--vp-badge-info-bg);
}

a.nolink {
  color: var(--vp-badge-info-text);
  text-decoration: none;
  pointer-events: none;
  cursor: default;
}

.headerless.th {
  display: none;
}
.vp-code {
  overflow-x: hidden !important;
}
</style>