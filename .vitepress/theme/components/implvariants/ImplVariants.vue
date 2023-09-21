<script setup>
import { onMounted, computed, ref, watchEffect } from 'vue'
import { useData } from 'vitepress'
import VPSwitch from '../VPSwitch.vue'
import IconNode from './IconNode.vue'
import IconJava from './IconJava.vue'

const { frontmatter } = useData()
const supportsVariants = computed(() => !!frontmatter.value['impl-variants'])
const checked = ref(false)
const toggle = typeof localStorage !== 'undefined' ? useVariant() : () => {}
const knownImplVariants = ['node', 'java']

onMounted(() => {
  if (!supportsVariants.value)  return
  let check = currentCheckState()
  setClass(check)
  // Persist value even intially. If query param was used, users expect to get this value from now on, even if not using the query.
  const variantNew = check ? 'java' : 'node'
  localStorage.setItem('impl-variant', variantNew)
})

function currentCheckState() {
  const url = new URL(window.location)
  let variant = url.searchParams.get('impl-variant')
  if (url.searchParams.has('impl-variant'))
    return url.searchParams.get('impl-variant') === 'java'
  return localStorage.getItem('impl-variant') === 'java'
}

function setClass(check) {
  checked.value = check

  for (let swtch of document.getElementsByClassName('SwitchImplVariant')) {
    swtch.classList[check ? 'add' : 'remove']('checked')
  }
  for (let container of document.getElementsByClassName('SwitchImplVariantContainer')) {
    container.title = check ? 'Java content. Toggle to see Node.js.' : 'Node.js content. Toggle to see Java.'
  }

  markOutlineItems()
  toggleContent(check ? 'java' : 'node')

}

function useVariant() {
  function toggle() {
    let check = currentCheckState()
    setClass((check = !check))
    const variantNew = check ? 'java' : 'node'
    localStorage.setItem('impl-variant', variantNew)

    const url = new URL(window.location)
    url.searchParams.set('impl-variant', variantNew)
    window.history.replaceState({}, '', url)
  }
  return toggle
}

function animationsOff(cb) {
  let css
  css = document.createElement('style')
  css.appendChild(
    document.createTextNode(
    `:not(.VPSwitchAppearance):not(.VPSwitchAppearance *) {
-webkit-transition: none !important;
-moz-transition: none !important;
-o-transition: none !important;
-ms-transition: none !important;
transition: none !important;
}`
  ))
  document.head.appendChild(css)

  cb()

  // @ts-expect-error keep unused declaration, used to force the browser to redraw
  const _ = window.getComputedStyle(css).opacity
  document.head.removeChild(css)
}

watchEffect(() => {
  if (!supportsVariants.value)  return
  setTimeout(() => { // otherwise DOM is not ready
    if (typeof document !== 'undefined') {
      animationsOff(() => setClass(currentCheckState()) )
    }
  }, 20)
})

function toggleContent(variant, initial) {
  const htmlClassList = document.documentElement.classList
  knownImplVariants.forEach(v => htmlClassList.remove(v))
  htmlClassList.add(variant)
}

function markOutlineItems() {
  const hashes = {}
  const impls = document.querySelectorAll('.impl.node, .impl.java')
  for (let each of impls) {
    hashes['#' + each.id] = each
  }
  const anchors = document.querySelectorAll('li > a.outline-link')
  for (const a of anchors) {
    const li = a.parentElement
    if (li.firstChild !== a)  continue
    const target = hashes[a.hash]
    if (target)  markClasses(li, target.classList)
  }
}

function markClasses(el, classes) {
  el.classList.add('impl') // in IE, add() only accepts one element
  if (classes.contains('node'))   el.classList.add('node')
  if (classes.contains('java'))   el.classList.add('java')
}

</script>

<template>

<label title="Toggle Node/Java" class="SwitchImplVariantContainer" v-if="supportsVariants">
  <VPSwitch
      class="SwitchImplVariant"
      :aria-checked="checked"
      @click="toggle">
    <IconNode class="icon-node" />
    <IconJava class="icon-java" />
  </VPSwitch>
</label>

</template>

<style scoped>

.icon-node {
  opacity: 1;
}

.icon-java {
  opacity: 0;
}
.checked .icon-node  {
  opacity: 0;
}

.checked .icon-java {
  opacity: 1;
}

.checked :deep(.check) {
  /*rtl:ignore*/
  transform: translateX(18px);
}

</style>
