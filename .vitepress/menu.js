import path from 'node:path'
import fs  from 'node:fs'

/**
 * Construct sidebar from markdown
*/
export function sidebar (file = 'menu.md') {
  const source = file
  const markdown = fs.readFileSync(source,'utf8')
  const sidebar = []
  let section, item

  for ( let line of markdown.split('\n').filter(l=>l)) {
    let [, text, link ] = /^###\s*\[(.*)\]\((.*)\)/.exec(line) || /^###\s*(.*)/.exec(line) || []
    if (text) sidebar.push (section = _item({ link, text, items:[], collapsed: true }))
    else {
      let [, text, link ] = /^-\s*\[(.*)\]\((.*)\)/.exec(line) || /^-\s*(.*)/.exec(line) || []
      if (text) section.items.push (item = _item({ link, text }))
      else {
        let [, text, link ] = /^  -\s*\[(.*)\]\((.*)\)/.exec(line) || /^  -\s*(.*)/.exec(line) || []
        if (text) {
          (item.items ??= []).push (_item({ link, text }))
          item.collapsed = true
        }
      }
    }
  }
  return sidebar
}

const _absolute = link => link && ( link[0] === '/' ? link : '/'+link ).replace('@external/', '')
const _item = ({ link, text, ...etc }) => ({
  text: text.replace(/<!--.*-->/, ''), ...(link ? { link: _absolute(link) } : {}),
  ...etc
})

/**
 * Use sidebar as nav
 */
export function nav4(sidebar) {
  return sidebar.map(({text,items}) => ({ text, items: items.filter(i => i.link) }))
}

if (process.argv[1] === import.meta.url.slice(7)) {
  let {inspect} = await import ('node:util')
  console.log(inspect(sidebar('menu.md'),{depth:11,colors:true}))
}
