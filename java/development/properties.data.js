import { defineLoader } from 'vitepress'
import AdmZip from 'adm-zip'

const { themeConfig: { capire }} = global.VITEPRESS_CONFIG.site
const version = capire.versions.java_services
const url = `https://repo1.maven.org/maven2/com/sap/cds/cds-services-api/${version}/cds-services-api-${version}-sources.jar`

export default defineLoader({
  async load() {
    let properties = await fetchProperties()
    properties = massageProperties(properties)
    return { properties, version }
  }
})

async function fetchProperties() {
  // console.debug(`\n  fetching properties of CDS Java ${version}`)
  const resp = await fetch(url)
  const jar = await resp.arrayBuffer()

  return new Promise((res, rej) => {
    const zip = new AdmZip(Buffer.from(jar))
    zip.readAsTextAsync('properties.json', (data, err) => {
      if (err)  return rej(err)
      res(JSON.parse(data).properties)
    })
  })
}


function massageProperties(properties) {
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
