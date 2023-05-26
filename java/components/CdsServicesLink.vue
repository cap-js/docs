<template>
  <a
    :href="`https://www.javadoc.io/doc/com.sap.cds/cds-services-api/${version}/com/sap/cds/${link}`"
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

  const version = props.latest ? 'latest' : '1.34.1'

</script>