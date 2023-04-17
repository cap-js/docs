import { defineLoader } from 'vitepress'
import { properties } from './properties.json'

export default defineLoader({
  async load() { return getProperties() }
})

function getProperties() {
  return properties.map(({ name, header, type, default:defaultValue, doc }) => {
    return {
      name: name.replaceAll(/<(index|key)>/g, '<i>&lt;$1&gt;</i>'),  // decorate special <key> and <index> names
      type,
      description: md2Html(doc),
      defaultValue: defaultValue ? `<code>${defaultValue}</code>` : '',
      header,
      anchor: name.replaceAll('.', '-')
    }
  })
}

function md2Html(string) {
  return string
    .replaceAll(/`(.*?)`/g, '<code>$1</code>')
    .replaceAll(/(https?:\/\/.*?)(\s)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>$2')
}
