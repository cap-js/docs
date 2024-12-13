<!-- eslint-disable vue/valid-template-root -->
<template />

<script setup>
  import { onMounted } from 'vue'

  // Add back-to-top behavior to the outline's 'On this page' title
  onMounted(() => {
    const e = document.getElementById('doc-outline-aria-label')
    if (e) e.onclick = ()=> document.location = '#'
  })
</script>
