<template>
  <Teleport to="body">
    <dialog id="shortcuts" ref="dialog" class="modal-dialog" v-show="visible">
      <div class="modal-content" v-if="visible">
        <div class="modal-header">
          <span class="modal-close" title="Close dialog" @click="visible = false">&times;</span>
          <h5 class="no-anchor">Keyboard Shortcuts</h5>
        </div>
        <div id="shortcuts-list" class="modal-body">
          <table>
            <tr v-for="cmd in enabledCommands()" :key="cmd.name">
              <td>{{ cmd.name }}</td>
              <td class="keybinding">
                <template v-for="(key, i) in cmd.keys" :key="key">
                  <span v-if="i > 0"> or </span>
                  <kbd>{{ key.length ? `${key[0].value} ${key[1].value}` : key.value }}</kbd>
                </template>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useData } from 'vitepress'

const { site, theme } = useData()
const metaKey = ref('Meta')

onMounted(() => {
  metaKey.value = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? `⌘` : `Ctrl`
  document.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))

const keyStrokesSearch = [[metaKey, ref('K')], ref('/')]
const querySelectorSearchInput = 'input[class=search-input]'
const commands = ref([
  { name:'Search', keys:keyStrokesSearch }, // VP search has the actual logic
  DOMCommand('Toggle dark/light mode', 'VPSwitchAppearance', '.'),
  DOMCommand('Toggle Node.js or Java', 'SwitchImplVariant', 'v'),
  DOMCommand('Edit on Github', 'div.edit-link > a', 'e'),
  ...commandsFromConfig(),
  { name:'Show keyboard shortcuts', keys:[ref('?')], run: () => { visible.value = !visible.value } },
  { name:'Close dialog', keys:[ref('Escape')], hidden:true, run: () => visible.value = false },
])

const visible = ref(false)
const dialog = ref(null) // must match to ref="dialog" from template

// Close when the user clicks anywhere outside of the dialog.
// This is not a true 'modal' behavior, but still more convenient than not.
const onClickOutside = event => { if (event.target === dialog.value)  visible.value = false }

watch(visible, isVisible => {
  if (isVisible) {
    window.addEventListener('click', onClickOutside)
    dialog.value.showModal()
  } else {
    window.removeEventListener('click', onClickOutside)
    dialog.value.close()
  }
})

function enabledCommands() {
  return commands.value.filter(cmd => !cmd.hidden && ('enabled' in cmd ? cmd.enabled() : true))
}

function onKeyDown(event) {
  if (document.activeElement === document.querySelectorAll(querySelectorSearchInput)[0])  return // search is active
  if (event.altKey || event.ctrlKey || event.metaKey)  return // only simple keys for now
  const cmd = commands.value.find(cmd => !!cmd.keys.find(k => k.value === event.key))
  const enabled = cmd && cmd.run && ('enabled' in cmd ? cmd.enabled() : true)
  if (enabled)  {
    event.preventDefault()
    cmd.run(event)
  }
}

function DOMCommand(name, idQuerySel, ...keys) {
  const enabled = () => {
    let element = document.getElementById(idQuerySel)
    if (element)  return element
    const elements = document.getElementsByClassName(idQuerySel)
    if (elements.length)  return elements[0]
    const sel = document.querySelectorAll(idQuerySel)
    if (sel.length)  return sel[0]
  }
  return {name, keys: keys.map(k => k.value ? k : ref(k)), enabled, run: () => {
    let element = enabled()
    if (element) {
      element.hash = window.location.hash
      element.click()
    }
  }}
}

function commandsFromConfig() {
  return (theme.value.capire?.gotoLinks||[]).filter(link => !!link.key || !!link.href).map(link => {
    const { hostname } = new URL(link.href)
    return {
      name: `Go to ${link.name || hostname}`,
      enabled: () => window.location.hostname !== hostname,
      run: () => {
        const url = new URL(link.href)
        url.pathname += window.location.pathname.slice(site.value.base.length) // base path may be different on the target site
        url.search = window.location.search
        url.hash = window.location.hash
        window.open(url, '_blank');
      },
      keys: [ref(link.key)],
      hidden: !!link.hidden
    }
  })
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
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  max-width: unset;
  max-height: unset;
  border-style: unset;
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

/* Modal Content */
.modal-content {
  position: relative;
  background-color: var(--vp-c-bg);
  margin: 10% auto;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
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
  color: gray;
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
