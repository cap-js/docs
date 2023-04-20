<script setup>
import { onMounted, computed, ref, watchEffect } from 'vue'
import { useData } from 'vitepress'
import VPSwitch from './VPSwitch.vue'
import IconNode from './IconNode.vue'
import IconJava from './IconJava.vue'

const { frontmatter } = useData()
const supportsVariants = computed(() => !!frontmatter.value['impl-variants'])
const checked = ref(false)
const toggle = typeof localStorage !== 'undefined' ? useVariant() : () => {}
const knownImplVariants = ['node', 'java']

onMounted(() => {
  if (!supportsVariants.value)  return
  let check = localStorage.getItem('impl-variant') === 'java'
  checked.value = check
  setClass(check)
})

function setClass(check) {
  checked.value = check
  if (typeof document !== 'undefined') {
    const swtch = document.getElementsByClassName('SwitchImplVariant')[0]
    swtch.classList[check ? 'add' : 'remove']('checked')

    const container = document.getElementsByClassName('SwitchImplVariantContainer')[0]
    container.title = check ? 'Java content. Toggle to see Node.js.' : 'Node.js content. Toggle to see Java.'

    markStatus()
    toggleContent(check ? 'java' : 'node')
  }
}

function useVariant() {
  function toggle() {
    let check = localStorage.getItem('impl-variant') === 'java'
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
  if (typeof document !== 'undefined') {
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
  }

  cb()

  if (typeof document !== 'undefined') {
    // @ts-expect-error keep unused declaration, used to force the browser to redraw
    const _ = window.getComputedStyle(css).opacity
    document.head.removeChild(css)
  }
}

watchEffect(() => {
  if (!supportsVariants.value)  return
  setTimeout(() => { // otherwise DOM is not ready
    animationsOff(() => setClass(checked.value))
  }, 20)
})

function toggleContent(variant, initial) {
  const query = knownImplVariants.map(v => '.impl.'+v).join(',')
  const all = document.querySelectorAll(query)
  all.forEach(element => {
    const on = element.classList.contains(variant)
    element.style.display = on ? '' : 'none'
  })
}

function markStatus() {
  const hashes = {}
  const impls = document.querySelectorAll('.impl.node, .impl.java')
  for (let each of impls) {
    hashes['#' + each.id] = each
    let level = level4(each);
    if (!level) continue
    let classes = each.classList
    while ((each = each.nextElementSibling) && level4(each) > level) {
      if (each.id) hashes['#' + each.id] = each
      markClasses(each, classes)
    }
  }
  const allHeaderIDs = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(h => h.id)
  const anchors = document.querySelectorAll('li > a')
  for (const a of anchors) {
    const li = a.parentElement
    if (li.firstChild !== a)  continue
    const target = hashes[a.hash]
    if (target)  markClasses(li, target.classList)
    // also hide all items w/o a link target on this page, i.e. target that was removed during build
    else if (a.pathname === window.location.pathname && allHeaderIDs.indexOf(a.hash.slice(1)) < 0)
      li.style.display = 'none'
  }

  function level4(node) {
    return node.tagName.match(/^H(\d)$/) ? RegExp.$1 : 99
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
    @click="toggle"
  >
    <IconNode class="icon-node" />
    <IconJava class="icon-java" />
    </VPSwitch>
</label>

</template>

<style scoped>

.SwitchImplVariantContainer {
  padding-left: 32px
}

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
