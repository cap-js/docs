<script lang="ts" setup>
import ImplVariants from './ImplVariants.vue'
</script>

<template>
  <div class="ImplVariantsMenuItem">
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
