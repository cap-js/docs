<template>
  <div ref="player"></div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import 'asciinema-player/dist/bundle/asciinema-player.css'

  const props = withDefaults(
    defineProps<{
      href: string,
      autoPlay?: boolean,
      controls?:boolean|'auto',
      idleTimeLimit?: number,
      loop?: boolean|number,
      poster?: string
      startAt?: string|number,
      speed?: number,
      theme?: string,
    }>(),
    {
      controls: 'auto'
    }
  )
  const player = ref(null)

  onMounted(async () => {
    // @ts-ignore
    const AsciinemaPlayer = await import('asciinema-player/dist/index.mjs')
    AsciinemaPlayer.create(props.href, player.value, props )
  })


</script>
