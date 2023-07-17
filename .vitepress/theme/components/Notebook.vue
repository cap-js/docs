<template>
  <span class="notebook" v-if="supportsNotebook">
    <button type="button" class="button" aria-haspopup="true" aria-expanded="false">
      <span class="button sap-icons">&#xe096;
        <div class="menu">
          <div>
            <a class="link nb-download" @click="linkNotebook($event)">
              <span class="button sap-icons">&#xe03a;<text>Download Notebook</text></span>
            </a>
          </div>
          <div v-if="isExternal">
            <a class="link nb-open" @click="linkNotebook($event)">
              <span class="button sap-icons">&#xe097;<text>Open in Visual Studio Code</text></span>
            </a>
          </div>
        </div>
      </span>
    </button>
  </span>
</template>

<script setup>

import { onMounted, computed, ref } from 'vue'
import { useData, useRoute } from 'vitepress'

const { frontmatter, base, page, site } = useData()
const { path } = useRoute()

const supportsNotebook = computed(() => !!frontmatter.value['notebook'])
const isExternal = import.meta.env.VITE_CAPIRE_ENV === 'external'

function linkNotebook($event) {
  return typeof localStorage !== 'undefined' ? useNotebook($event) : () => {}
}

function useNotebook(event) {
  function getNotebook(event) {
    const baseUrl = new URL(window.location);
    const urlParams = new URLSearchParams(window.location.search)
    const implVariant = urlParams.get('impl-variant')
    let base = site.value.base;
    const pathname = base ? baseUrl.pathname.split(base)[1] : baseUrl.pathname;
    const language = implVariant ? implVariant : localStorage['impl-variant'];
    const capnbFile = language ? `${pathname.replace(/\//g, '-')}-${language}.capnb`: `${pathname.replace(/\//g, '-')}.capnb`;
    const notebookUrl = `${baseUrl.origin}${base}notebooks/${capnbFile}`;
    const link = document.createElement('a');
    if (event.target.innerHTML.includes('Download')) {
      link.href = notebookUrl;
      link.download = capnbFile;
    } else {
      link.href =  `vscode://sapse.vscode-cds/openNotebook?url=${notebookUrl}`;
    }
    link.click();
    URL.revokeObjectURL(link.href);
  }
  return getNotebook(event)
}

</script>

<style scoped>
.notebook {
  height: 100% !important;
  align-items: stretch !important;
  margin-left: 24px;
  display: none;
}

.button {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100% !important;
}

.menu {
  display: none;
  position: absolute;
  top: calc(var(--vp-nav-height) / 2 + 20px);
  border-radius: 12px;
  padding: 12px;
  min-width: 128px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
  transition: background-color 0.5s;
  max-height: calc(100vh - var(--vp-nav-height));
  overflow-y: auto;
}

.link {
  display: flex;
  border-radius: 6px;
  padding: 0 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  justify-content: space-between;
  transition: background-color 0.25s, color 0.25s;
}

text {
  font-family: var(--vp-font-family-base);
  padding-left: 10px !important;
}

.button:hover {
  color: var(--vp-c-brand);
}

.button:hover .menu {
  display: block;
}

.menu:hover .menu {
  display: block;
}

.button .sap-icons {
  left: 0;
}

@font-face {
  font-family: 'SAP-icons';
  src: url('SAP-icons.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}

.sap-icons {
  font-family: 'SAP-icons' !important;
}

@media (min-width: 1024px) {
  .notebook {
    display: flex;
    align-items: center;
  }
}
</style>