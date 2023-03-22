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
    if (text) sidebar.push (section = {
      link: _absolute(link),
      text: text.replace(/<!--.*-->/, ''),
      items:[],
      collapsed: true
    })
    else {
      let [, text, link ] = /^-\s*\[(.*)\]\((.*)\)/.exec(line) || /^-\s*(.*)/.exec(line) || []
      if (text) section.items.push (item = {
        link: _absolute(link),
        text: text.replace(/<!--.*-->/, ''),
      })
      else {
        let [, text, link ] = /^  -\s*\[(.*)\]\((.*)\)/.exec(line) || /^  -\s*(.*)/.exec(line) || []
        if (text) {
          (item.items ??= []).push ({
            link: _absolute(link),
            text: text.replace(/<!--.*-->/, ''),
          })
          item.collapsed = true
        }
      }
    }
  }
  return sidebar
}

const _absolute = link => link && ( link[0] === '/' ? link : '/'+link )


/**
 * Use sidebar as nav
 */
export function nav4(sidebar) {
  return sidebar.map(({text,items}) => ({ text, items: items.filter(i => i.link) }))
}

if (process.argv[1] === __filename) {
  let sidebar = exports.sidebar ('menu.md')
  console.log(require('util').inspect(sidebar,{depth:11,colors:true}))
}