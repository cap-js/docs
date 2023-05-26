<template>
  <a
    :href="`https://www.javadoc.io/doc/com.sap.cds/cds4j-api/${version}/com/sap/cds/${link}`"
    target="_blank"
    rel="noopener noreferrer"
  >
    <slot />
  </a>
</template>

<script setup>

  const props = defineProps({
    link: String,
    latest: Boolean
  })

  const version = props.latest ? 'latest' : '1.38.1'

</script>