<template>
    <span class="notebook" v-if="supportsNotebook">
        <button type="button" class="button" aria-haspopup="true" aria-expanded="false">
            <span class="button sap-icons">&#xe096;
                <div class="menu">
                    <div>
                        <a class="link download" v-bind:href="notebookUrl" download>
                            <span class="button sap-icons">&#xe03a;<text>Download Notebook</text></span>
                        </a>
                    </div>
                    <div>
                        <a class="link open" @click="getNotebook('open')">
                            <span class="button sap-icons">&#xe097;<text>Open in Visual Studio Code</text></span>
                        </a>
                    </div>
                </div>
            </span>
        </button>
    </span>
</template>


<script setup>

import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

const { frontmatter, site, theme, page } = useData()
const supportsNotebook = computed(() => !!frontmatter.value['notebook'])

const baseUrl = new URL(window.location);
const origin = baseUrl.origin;
const hasImplVariant = (document.querySelectorAll('.impl-variant').length > 0);
const linkedLanguage = /^\/java/.test(baseUrl.pathname) ? 'java' : 'node';
const language = hasImplVariant ? localStorage['impl-variant'] : linkedLanguage;
const notebookUrl = `${origin}/docs/notebooks/as-saas.capnb`;

function getNotebook(option) {

    const redirectUrl = option === 'download'
        ? notebookUrl
        : `vscode://sapse.vscode-cds/openNotebook?url=${notebookUrl}`;
    window.location.href = redirectUrl;
}

</script>

<style scoped>
.notebook {
    height: 100% !important;
    align-items: stretch !important;
    margin-left: 24px;
}

.button {
    font-size: 14px;
    font-weight: 500;
    display: flex;
    justify-content: center;
    align-items: center;
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

.notebook::after {
    margin-right: 20px;
    margin-left: 25px;
    width: 1px;
    height: 24px;
    background-color: var(--vp-c-divider);
    color: var(--vp-c-gray);
    content: "";
}

@media (min-width: 768px) {
    .notebook {
        display: flex;
        align-items: center;
    }
}
</style>