import path from 'node:path'
import fs  from 'node:fs'

import rulesSidebar from '../tools/cds-lint/sidebar.js'
const dynamicItems = (item) => {
  if (item.text.includes('#items:rules-sidebar')) {
    item.text = item.text.replace('#items:rules-sidebar', '')
    item.items = rulesSidebar()
    item.collapsed = true
  }
}

/**
 * Construct sidebar from markdown
*/
export function sidebar (file = 'menu.md', filter=(_)=>true) {
  const source = file
  const markdown = fs.readFileSync(source,'utf8')
  const sidebar = []
  let section, item, subitem

  for ( let line of markdown.split('\n').filter(l=>l)) {
    let [, text, link ] = /^###\s*\[(.*)\]\((.*)\)/.exec(line) || /^###\s*(.*)/.exec(line) || []
    if (text && filter(link)) sidebar.push (section = _item({ link, text, items:[], collapsed: true }))
    else {
      let [, text, link ] = /^-\s*\[(.*)\]\((.*)\)/.exec(line) || /^-\s*(.*)/.exec(line) || []
      if (text && filter(link)) section.items.push (item = _item({ link, text }))
      else {
        let [, text, link ] = /^  -\s*\[(.*)\]\((.*)\)/.exec(line) || /^  -\s*(.*)/.exec(line) || []
        if (text && filter(link)) {
          (item.items ??= []).push (subitem = _item({ link, text }))
          item.collapsed = true
        }
        else {
          let [, text, link ] = /^    -\s*\[(.*)\]\((.*)\)/.exec(line) || /^    -\s*(.*)/.exec(line) || []
          if (text && filter(link)) {
            (subitem.items ??= []).push (_item({ link, text }))
            subitem.collapsed = true
          }
        }
      }
    }
  }
  return sidebar
}

const _absolute = link => link && ( link[0] === '/' ? link : '/'+link ).replace('@external/', '')
const _item = ({ link, text, ...etc }) => {
  const item = {
    text: text.replace(/<!--.*-->/, ''), ...(link ? { link: _absolute(link) } : {}),
    ...etc
  }
  dynamicItems(item)
  return item
}

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
