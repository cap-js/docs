<template>
  <Badge type="info" :text="`since ${of} ${version}`" :title="`This feature is only available as of ${of} version ${version} or higher.`" />
</template>

<script setup lang="ts">
  defineProps(['version', 'of'])
</script>
