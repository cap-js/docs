<template>
  <VDropdown theme="cfgPopper" :distance="6" :triggers="['click', 'hover']" :delay="300" :popperTriggers="['hover']"
  >
  <!-- :hideTriggers="[]" :shown="true" -->

    <a class="cfg vp-doc"><code>{{ label }}</code></a>

    <template #popper>
      <div class="vp-code-group vp-doc" v-if="java">
        <div class="tabs">
          <input type="radio" :name="group" :id="`${group}-java-appyml`" checked="true">
          <label :for="`${group}-java-appyml`">application.yml</label>

          <input type="radio" :name="group" :id="`${group}-java-sysprop`">
          <label :for="`${group}-java-sysprop`">System property</label>
        </div>
        <div class="blocks">
          <div class="language-yml active">
            <button title="Copy Code" class="copy"></button>
            <span class="lang">yml</span>
            <pre class="shiki"><code><span class="line"><span>{{ javaAppyml }}</span></span></code></pre>
          </div>
          <div class="language-properties">
            <button title="Copy Code" class="copy"></button>
            <span class="lang">properties</span>
            <pre class="shiki"><code><span class="line"><span>{{ javaEnvStr }}</span></span></code></pre>
          </div>
        </div>
      </div>

      <div class="vp-code-group vp-doc" v-else>
        <div class="tabs">
          <input type="radio" :name="group" :id="`${group}-pkg`" checked="true">
          <label :for="`${group}-pkg`">package/.cdsrc.json</label>

          <input type="radio" :name="group" :id="`${group}-env`">
          <label :for="`${group}-env`">.env file</label>

          <input type="radio" :name="group" :id="`${group}-shl`">
          <label :for="`${group}-shl`">Linux/macOS Shells</label>

          <input type="radio" :name="group" :id="`${group}-shp`">
          <label :for="`${group}-shp`">Powershell</label>

          <input type="radio" :name="group" :id="`${group}-shw`">
          <label :for="`${group}-shw`">Cmd Shell</label>
        </div>
        <div class="blocks">
          <div class="language-json active">
            <button title="Copy Code" class="copy"></button>
            <span class="lang">json</span>
            <pre class="shiki"><code><span class="line"><span>{{ pkgStr }}</span></span></code></pre>
          </div>
          <div class="language-properties">
            <button title="Copy Code" class="copy"></button>
            <span class="lang">properties</span>
            <pre class="shiki"><code><span class="line"><span>{{ propStr }}</span></span></code></pre>
          </div>
          <div class="language-properties">
            <button title="Copy Code" class="copy"></button>
            <span class="lang">sh</span>
            <pre class="shiki"><code><span class="line"><span>{{ envStr }}</span></span></code></pre>
          </div>
          <div class="language-properties">
            <button title="Copy Code" class="copy"></button>
            <span class="lang">powershell</span>
            <pre class="shiki"><code><span class="line"><span>$Env:{{ envStr }}</span></span></code></pre>
          </div>
          <div class="language-properties">
            <button title="Copy Code" class="copy"></button>
            <span class="lang">cmd</span>
            <pre class="shiki"><code><span class="line"><span>set {{ envStr }}</span></span></code></pre>
          </div>
        </div>
      </div>
    </template>
  </VDropdown>
</template>

<style>
  .v-popper--theme-cfgPopper .v-popper__inner {
    background-color: var(--vp-code-block-bg) !important;
  }
</style>

<style scoped>
  .v-popper {
    display: inline;
  }
  a.cfg {
    color: var(--vp-c-text-1);
    text-decoration:none;
  }
  a.cfg:hover {
    text-decoration:none;
  }
  a.cfg:active {
    text-decoration:none;
  }
</style>

<script setup lang="ts">
  import FloatingVue from 'floating-vue'
  FloatingVue.options.themes.cfgPopper = { $extend: 'dropdown' }

  import { useSlots } from 'vue'

  const slots = useSlots()
  const slotVal = slots.default?.().at(0)?.children?.toString() ?? 'error: provide <Config>your_key:value</Config>'

  const { java, keyOnly } = defineProps<{
    java?: boolean,
    keyOnly?: boolean
  }>()

  const [key, val] = slotVal.split(/\s*[:=]\s*/)
  let value:any = val
  if (val === 'true')  value = true
  else if (val === 'false')  value = false
  else if (!val)  value = '…'

  const group = 'group-'+key

  const pkg = toJson(key, value)
  const pkgStr = JSON.stringify(pkg, null, 2)
  const propStr = `${key}=${value}`
  const envStr = `${key.replaceAll('_', '__').replaceAll('.', '_').toUpperCase()}=${value}`

  import yaml from 'yaml'
  const javaAppyml = yaml.stringify(pkg)

  const javaEnvStr = `-D${propStr}`

  const label = `${keyOnly ? key: slotVal} ⛭`

  function toJson(key:string, value:string): Record<string, any> {
    let res  = {}
    const parts = key.split('.')
    parts.reduce((r:Record<string,any>, a, i) => {
      r[a] = r[a] || (i < parts.length-1 ? {} : value)
      return r[a];
    }, res)
    return res
  }

</script>
