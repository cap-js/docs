<script lang="ts" setup>
import DefaultTheme from 'vitepress/theme'
import ShortcutsList from './components/ShortcutsList.vue'
import ImplVariants from './components/implvariants/ImplVariants.vue'
import NavScreenMenuItem from './components/implvariants/NavScreenMenuItem.vue'
import Notebook from './components/Notebook.vue'
import NotFound from './components/NotFound.vue'

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
      <Notebook />
    </template>
    <template #nav-bar-content-after>
      <slot name="nav-bar-content-after" />
    </template>
    <template #nav-screen-content-after>
      <NavScreenMenuItem/>
      <slot name="nav-screen-content-after" />
    </template>
  </Layout>

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