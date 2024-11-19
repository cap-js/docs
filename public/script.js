// Add back-to-top behavior to the outline's 'On this page' title
const e = document.getElementById('doc-outline-aria-label')
if (e) e.onclick = ()=> document.location = '#'

// Restore the last selection re Node/Java
// const v = localStorage.getItem('impl-variant')
// if (v) document.documentElement.classList.add(v)
