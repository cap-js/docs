import { MarkdownRenderer } from 'vitepress'

export function install(md: MarkdownRenderer, classRegex=/impl (node|java)/) {

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
        // console.log('PROPAGATE', t.tag, t.type, t.content.trim(), t.attrGet('class'))
        t.meta ??= {}
        t.meta.classes = currClasses
      }
    })

    const toc = state.tokens.find(t => t.type === 'toc_body')
    if (toc) {
      toc.meta ??= {}
      toc.meta.classesById = classesById
    }

  })

  const { rules } = md.renderer
  // console.log('rules', rules)
  for (let name of Object.keys(rules)) {
    if (name === 'fence' || name.match(/container.*_open/)) {
      rules[name] = interceptingRenderer(rules[name]!)
    }
  }

  function interceptingRenderer (original:Function) {
    return (...args:any) => {
      const [tokens, idx] = args
      const token = tokens[idx]
      if (token.meta?.classes) {
        deleteAttr('class', token.attrs)
        const result = original(...args).replace('class="', `class="${token.meta.classes} `)
        return result
      }

      return original(...args)
    }
  }

  function deleteAttr(name:string, attrs?: [string, string][]|null) {
    attrs?.forEach(a => { const i = a.indexOf(name);  if (i>=0) delete a[i]; })
  }

  const classesById:Record<string, string> = {}
  const toc_body = rules.toc_body!
  rules.toc_body = (...args) => {
    const [tokens] = args
    tokens.forEach(t => {
      if (t.attrGet('id') && t.attrGet('class'))
        classesById[t.attrGet('id')!] = t.attrGet('class')!
    })
    let result = toc_body(...args)
    for (const [id, classes] of Object.entries(classesById)) {
      result = result
        .replaceAll(`<li><a href="#${id}"`, `<li class="${classes}"><a href="#${id}"`)
    }
    // console.log(result)
    return result
  }
}

