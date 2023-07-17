<script lang="ts" setup>
import DefaultTheme from 'vitepress/theme'
import ShortcutsList from './components/ShortcutsList.vue'
import ImplVariants from './components/implvariants/ImplVariants.vue'
import NavScreenMenuItem from './components/implvariants/NavScreenMenuItem.vue'
import NotFound from './components/NotFound.vue'
import Ribbon from './components/Ribbon.vue'

const isPreview = !!import.meta.env.VITE_CAPIRE_PREVIEW

const { Layout } = DefaultTheme
</script>

<template>

  <Layout>
    <template #layout-top>
      <slot name="layout-top" />
    </template>
    <template #not-found>
      <NotFound />
    </template>
    <template #nav-bar-content-before>
      <slot name="nav-bar-content-before" />
      <div class="ImplVariantsInNavbar">
        <ImplVariants/>
      </div>
      <slot name="nav-bar-implvariants-after" />
    </template>
    <template #nav-bar-content-after>
      <slot name="nav-bar-content-after" />
    </template>
    <template #nav-screen-content-after>
      <NavScreenMenuItem/>
      <slot name="nav-screen-content-after" />
    </template>
  </Layout>

  <Ribbon v-if="isPreview">
    DEV PREVIEW.<br>
    Use <a href="https://cap.cloud.sap" target="_blank" rel="noopener noreferrer">cap.cloud.sap</a>
  </Ribbon>

  <ShortcutsList />

</template>

<style scoped>

.ImplVariantsInNavbar {
  padding-left: 32px
}

@media (max-width: 768px) {
  .ImplVariantsInNavbar {
    display: none;
  }
}

</style>