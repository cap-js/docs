<template>

<!-- EXCLUDE IN NOTEBOOK START -->
<div id="impl-variants" class="impl-variants-toggle">
  <a impl-variant="node" class="impl-variant" title="Content for Node.js">Node.js</a>
  <a impl-variant="java" class="impl-variant" title="Content for Java">Java</a>
</div>
<!-- EXCLUDE IN NOTEBOOK END -->

</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'

export const knownImplVariants = ['node', 'java']
export function toggleImplVariant(variant, initial) {
  if (!knownImplVariants.includes(variant))  variant = knownImplVariants[0]

  const query = knownImplVariants.map(v => '.impl.'+v).join(',')
  const all = document.querySelectorAll(query)
  all.forEach(element => {
    const on = element.classList.contains(variant)
    element.style.display = on ? '' : 'none'
  })
  document.querySelectorAll('.impl-variant').forEach(element => {
    const myVariant = element.getAttribute('impl-variant')
    element.onclick = function() { toggleImplVariant(myVariant) }
    const isSelected = myVariant === variant
    element.classList.toggle('selected', isSelected)
    element.classList.toggle('deselected', !isSelected)
  })
  if (!initial) {
    const url = new URL(window.location)
    url.searchParams.set('impl-variant', variant)
    window.history.replaceState({}, '', url)
  }
  // always persist so that single page load w/ query param is sufficient
  localStorage['impl-variant'] = variant
}


function queryParam(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export function markStatus() {
  const hashes = {}
  const impls = document.querySelectorAll('.impl.concept, .impl.beta, .impl.internal, .impl.node, .impl.java')
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
  if (classes.contains('concept'))  el.classList.add('concept')
  if (classes.contains('beta'))   el.classList.add('beta')
  if (classes.contains('internal')) el.classList.add('internal')
  if (classes.contains('node'))   el.classList.add('node')
  if (classes.contains('java'))   el.classList.add('java')
}
</script>

<script setup>
  onMounted(() => {
    const initialImplVariant = queryParam('impl-variant') || localStorage['impl-variant']
    markStatus()
    toggleImplVariant(initialImplVariant, true)
  })
</script>

<style scoped>

.impl-variant {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-gray);
  cursor: pointer;
  padding: 0 14px 0 0;
}
a[impl-variant].selected {
  color: var(--vp-c-brand);
}
a[impl-variant].deselected {
  color: var(--vp-c-gray);
}

.impl-variants-toggle::after {
  margin-right: 8px;
  margin-left: 8px;
  width: 1px;
  height: 24px;
  background-color: var(--vp-c-divider);
  content: "";
}

.impl-variants-toggle {
  display: none;
}
@media (min-width: 768px) {
  .impl-variants-toggle {
    display: flex;
    align-items: center;
  }
}

</style>