const { base, themeConfig: { sidebar }} = global.VITEPRESS_CONFIG.site
import { join } from 'node:path'

export default (pages, basePath, _filter) => {
  let items = findInItems(basePath, sidebar) || []
  items = items.map(item => { return { ...item, link: item.link?.replace(/\.md$/, '') }})
  const itemLinks = items.map(item => join(base, item.link||''))

  return pages
    .map(p => {
      p.url = p.url?.replaceAll('@external/', '')?.replace(/\/index$/, '/') || ''
      p.url = join(base, p.url)
      return p
    })
    .filter(p => {
      const item = items.find(item => p.url.endsWith(item.link))
      if (item)  p.title = item.text
      return !!item
    })
    .filter(_filter)
    .sort((p1, p2) => itemLinks.indexOf(p1.url) - itemLinks.indexOf(p2.url))
    .map(p => {
      // this data is inlined in each index page, so sparsely construct the final object
      return {
        url: p.url,
        title: p.title,
        frontmatter: {
          synopsis: p.frontmatter.synopsis
        }
      }
    })
}

function findInItems(url, items=[]) {
  let res = items.find(item => item.link?.includes(url))
  if (res)  return res.items
  for (const item of items) {
    res = findInItems(url, item.items)
    if (res)  return res
  }
}
