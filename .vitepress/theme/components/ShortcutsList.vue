<template>
  <Teleport to="body">
    <div id="shortcuts" ref="shortcuts" class="modal-dialog" v-if="visible">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-close" title="Close dialog" @click="visible = false">&times;</span>
          <h5 class="no-anchor">Keyboard Shortcuts</h5>
        </div>
        <div id="shortcuts-list" class="modal-body">
          <table>
            <tr v-for="cmd in enabledCommands()" :key="cmd.name">
              <td>{{ cmd.name }}</td>
              <td v-for="key in cmd.keys" :key="key" class="keybinding">
                <kbd>{{ key }}</kbd>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { knownImplVariants, toggleImplVariant } from './ImplVariants.vue'

onMounted(()   => document.addEventListener('keydown', onKeyDown))
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))

const querySelectorSearchInput = 'input[class=search-input]'
const commands = ref([
  clickCommand('Edit on Github', ['e'], 'div.edit-link > a'),
  clickCommand('Search', ['/'], querySelectorSearchInput),
  clickCommand('Toggle dark/light mode', ['.'], 'VPSwitchAppearance'),
  {
    name:'Toggle Node.js or Java', keys:['v'],
    run: () => {
      let currentIndex = knownImplVariants.indexOf(localStorage['impl-variant']||knownImplVariants[0])
      const next = knownImplVariants[++currentIndex % knownImplVariants.length]
      toggleImplVariant(next)
    }
  },
  { name:'Show keyboard shortcuts', keys:['?'], run: () => { visible.value = !visible.value } },
  { name:'Close dialog', keys:['Escape'], hidden:true, run: () => visible.value = false },
])

const visible = ref(false)
const shortcuts = ref(null) // must match to ref="shortcuts" from template

// close when the user clicks anywhere outside of the modal
const onClickOutside = event => { if (event.target === shortcuts.value)  visible.value = false }
watch(visible, (isVisible) => isVisible
  ? window.addEventListener('click', onClickOutside)
  : window.removeEventListener('click', onClickOutside)
)

function enabledCommands() {
  return commands.value.filter(cmd => !cmd.hidden && ('enabled' in cmd ? cmd.enabled() : true))
}

function onKeyDown(event) {
  if (document.activeElement === document.querySelectorAll(querySelectorSearchInput)[0])  return // search is active
  if (event.altKey || event.ctrlKey || event.metaKey)  return // only simple keys for now
  const cmd = commands.value.find(cmd => !!cmd.keys.find(k => k === event.key))
  const enabled = cmd && cmd.run && ('enabled' in cmd ? cmd.enabled() : true)
  if (enabled)  {
    event.preventDefault()
    cmd.run(event)
  }
}

function clickCommand(name, keys, idQuerySel) {
  const enabled = () => {
    let element = document.getElementById(idQuerySel)
    if (element)  return element
    const elements = document.getElementsByClassName(idQuerySel)
    if (elements.length)  return elements[0]
    const sel = document.querySelectorAll(idQuerySel)
    if (sel.length)  return sel[0]
  }
  return {name, keys, enabled, run: () => {
    let element = enabled()
    if (element) {
      element.hash = window.location.hash
      element.click()
    }
  }}
}

</script>

<style scoped>
table {
  width: 100%;
  display: table;
  margin: 0px;
}
table, td { border: none; }

/* Modal Dialog */
.modal-dialog {
  position: fixed; /* Stay in place */
  z-index: 5000; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

/* Modal Content */
.modal-content {
  position: relative;
  background-color: var(--vp-c-bg);
  margin: 10% auto;
  padding: 0;
  border: 1px solid var(--vp-c-brand);
  width: 450px;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
  animation-name: fadeIn;
  animation-duration: 0.3s
}

/* Modal Header */
.modal-header {
  padding: 2px 16px;
  background-color: var(--vp-c-bg-soft);
}

.modal-header h5 { margin: 5px auto; text-align: center;}

/* Modal Body */
.modal-body {
  padding: 2px 16px;
  font-size: 13px;
}

/* The Close Button */
.modal-close {
  color: var(--vp-button-brand-hover-bg);
  float: right;
  font-size: 20px;
  font-weight: bold;
}

.modal-close:hover,
.modal-close:focus {
  color: var(--vp-button-brand-hover-bg);
  text-decoration: none;
  cursor: pointer;
}

.keybinding {
  text-align: right;
}

/* Add Animation */
@keyframes fadeIn {
  0%   { opacity:0; }
  100% { opacity:1; }
}

</style>
