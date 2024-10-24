<template>

  <VDropdown v-if="popperVisible" :ariaId="`aria-`+cfgKey" theme="cfgPopper" :distance="6" :triggers="['click', 'hover']" :delay="300" :popperTriggers="['hover']"
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
  <code v-else>{{ label }}</code> <!-- intermdiate fallback -->
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
  import { onMounted, ref, useSlots } from 'vue'
  import FloatingVue from 'floating-vue'
  import yaml from 'yaml'

  const { java, keyOnly } = defineProps<{
    java?: boolean,
    keyOnly?: boolean
  }>()
  FloatingVue.options.themes.cfgPopper = { $extend: 'dropdown' }

  const slots = useSlots()
  const slotVal = slots.default?.().at(0)?.children?.toString() ?? 'error: provide <Config>your_key:value</Config>'

  const [key, val] = slotVal.split(/\s*[:=]\s*/)
  const label = `${keyOnly ? key: slotVal} ⛭`

  const cfgKey = ref()
  const popperVisible = ref(false)
  const group = ref()
  const pkgStr = ref()
  const propStr = ref()
  const envStr = ref()
  const javaAppyml = ref()
  const javaEnvStr = ref()

  onMounted(() => {
    popperVisible.value = true

    cfgKey.value = key
    let value:any = val
    if (val === 'true')  value = true
    else if (val === 'false')  value = false
    else if (val === 'null')  value = null
    else if (parseInt(val).toString() === val)  value = parseInt(val)
    else if (parseFloat(val).toString() === val)  value = parseFloat(val)
    else if (!val)  value = '…'

    group.value = 'group-'+key

    let jsonVal
    if (typeof value === 'string' && value.trim().match(/^[[{].*[\]}]$/)) { try { jsonVal = JSON.parse(value) } catch {/*ignore*/ } }
    const pkg = toJson(key, jsonVal ?? value)

    pkgStr.value = JSON.stringify(pkg, null, 2)
    propStr.value = `${key}=${jsonVal ? JSON.stringify(jsonVal) : value}`
    envStr.value = `${key.replaceAll('_', '__').replaceAll('.', '_').toUpperCase()}=${jsonVal ? JSON.stringify(jsonVal) : value}`

    javaAppyml.value = yaml.stringify(pkg)
    javaEnvStr.value = `-D${propStr.value}`

  })

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
