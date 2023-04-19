<script lang="ts" setup>
import DefaultTheme from 'vitepress/theme'
import ShortcutsList from './components/ShortcutsList.vue'
import ImplVariants from './components/ImplVariants.vue'
import Notebook from './components/Notebook.vue'

const { Layout } = DefaultTheme
</script>

<template>

  <Layout>
    <template #nav-bar-content-before>
      <Notebook/>
      <ImplVariants/>
    </template>
  </Layout>

  <ShortcutsList />

</template>