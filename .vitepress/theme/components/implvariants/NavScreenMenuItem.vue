<script lang="ts" setup>
import { useData } from 'vitepress'
import { computed } from 'vue'
import ImplVariants from './ImplVariants.vue'
const { frontmatter } = useData()
const supportsVariants = computed(() => !!frontmatter.value['impl-variants'])
</script>

<template>
  <div class="ImplVariantsMenuItem" v-if="supportsVariants">
    <p class="text">
      Node.js / Java Content
    </p>
    <ImplVariants />
  </div>
</template>

<style scoped>
.ImplVariantsMenuItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  padding: 12px 14px 12px 16px;
  background-color: var(--vp-c-bg-soft);
}

.text {
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>
