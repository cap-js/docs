<template>
  <VDropdown :distance="6" :triggers="['click', 'hover']" :delay="300" :popperTriggers="['hover']">

    <a class="cfg vp-doc"><code>{{ label }}</code></a>

    <template #popper>
      <div class="vp-code-group vp-doc">

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
  const props = withDefaults(defineProps<{
    config: string,
    showValue: boolean
  }>(), {
    config: 'error: `config` prop is missing',
    showValue: true
  })
  const { config, showValue } = props

  let [key, val] = config.split(/[=:]/)
  let value:any = val
  if (value === 'true')  value = true
  else if (value === 'false')  value = false

  const group = 'group-'+key

  const pkg = toJson(key, value)
  const pkgStr = JSON.stringify(pkg, null, 2)
  const propStr = `${key}=${value}`
  const envStr = `${key.replaceAll('_', '__').replaceAll('.', '_').toUpperCase()}=${value}`

  const label = `${showValue === true ? config : key} ⛭`

  function toJson(key:string, value:string): Record<string, any> {
    let res  = {}
    const parts = key.split('.')
    parts.reduce((r:Record<string,any>, a:string, i:number) => {
      r[a] = r[a] || (i < parts.length-1 ? {} : value)
      return r[a];
    }, res);
    return res
  }
</script>
