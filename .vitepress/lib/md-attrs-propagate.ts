import { MarkdownRenderer } from 'vitepress'

/**
 * Propagates `impl java|node` classes that are set on a header
 * down to sub headers. Example:
 * ```md
 * # Header 1 {.impl .node}
 * Text
 * ## Header 2
 * ```
 * Will result in HTML like this
 * ```html
 * <h1 class="impl node">
 * <p class="impl node">Text</p>
 * <h2 class="impl node">
 * ```
 */
export function install(md: MarkdownRenderer, classRegex=/impl (node|java)/) {

  // propagates class in sub headers as token.attrs
  md.core.ruler.push('propagate_attrs', (state) => {
    let currLevel = 0
    let currClasses = ''

    state.tokens.forEach(t => {
      if (t.type === 'heading_open') {
        const level = parseInt(t.tag.slice(1))
        const classes = t.attrGet('class') ?? ''
        if (classRegex.test(classes)) {
          currLevel = level
          currClasses = classes
          // console.log('CLASS SET', t.tag, t.content, currLevel, currClasses)
        }
        else if (level <= currLevel) {
          currLevel = 0
          currClasses = ''
        }
      }
      if (currClasses && !t.type.endsWith('_close') && !classRegex.test(t.attrGet('class')!)) {
        t.attrJoin('class', currClasses)
        // also store classes for later use in renderers below
        t.meta ??= {}; t.meta.classes = currClasses
        // console.log('PROPAGATE', t.tag, t.type, t.content.trim(), t.attrGet('class'))
      }
    })
  })

  // intercept all container open renderes, like `container_tip_open`
  // because these add additional divs, which need to be instrumented as well
  const { rules } = md.renderer
  // console.log('rules', rules)
  for (let name of Object.keys(rules)) {
    if (name === 'fence' || name === 'html_block' || name.match(/container.*_open/)) {
      rules[name] = interceptingRenderer(rules[name]!)
    }
  }

  function interceptingRenderer (original:Function) {
    return (...args:any) => {
      const [tokens, idx] = args
      const token = tokens[idx]
      if (token.meta?.classes) {
        const classes = token.meta?.classes as string
        // delete classes in token.attrs as these would be rendered in addition,
        // leading to 'Duplicate attribute' errors
        deleteAttr('class', token.attrs)

        let result:string = original(...args)
        if (!classes.split(' ').some(cls => result.includes(cls))) { // some of classes already set?
          if (result.includes(' class="')) { // `class` attribute existing -> augment
            result = result.replace(' class="', ` class="${token.meta.classes} `)
          } else { // no `class` attribute -> set one
            result = result.replace(/<(\w+)/, `<$1 class="${token.meta.classes}"`)
          }
        }
        return result
      }

      return original(...args)
    }
  }

  function deleteAttr(name:string, attrs: [string, string][]|null) {
    attrs?.forEach((a:any[], i) => {
      if (a.indexOf(name) >= 0) {
        attrs.splice(i, 1)
      }
    })
  }

  // Intercepts the [[toc]] renderer and sets the classes on the TOC list (items)
  const render_toc_body = rules.toc_body!
  rules.toc_body = (...args) => {
    // collect all element IDs that have `class` attrs
    const classesById:Record<string, string> = {}
    const [tokens] = args
    tokens.forEach(t => {
      if (t.attrGet('id') && t.attrGet('class')) {
        classesById[t.attrGet('id')!] = t.attrGet('class')!
      }
    })
    // render the classes for all list items that point to the IDs
    let result = render_toc_body(...args)
    for (const [id, classes] of Object.entries(classesById)) {
      result = result.replaceAll(`<li><a href="#${id}"`, `<li class="${classes}"><a href="#${id}"`)
    }
    return result
  }
}
