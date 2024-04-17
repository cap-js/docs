<template>
  <Badge type="info" :text="`since ${of} ${version}`" />
</template>

<script setup lang="ts">
  defineProps(['version', 'of'])
</script>
