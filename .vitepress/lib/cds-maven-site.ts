import { SiteData } from 'vitepress'
import AdmZip from 'adm-zip'

export async function copySiteAssets(outDir:string, site:SiteData) {
  const { themeConfig: { capire }} = site
  const version = capire.versions.java
  const url = `https://repo1.maven.org/maven2/com/sap/cds/cds-maven-plugin/${version}/cds-maven-plugin-${version}-site.jar`

  console.debug(`✓ fetching CDS Maven Site ${version}`)
  const resp = await fetch(url)
  const jar = await resp.arrayBuffer()

  return new Promise<void>((res, rej) => {
    const zip = new AdmZip(Buffer.from(jar))
    zip.extractAllToAsync(outDir, true, false, (err) => {
      if (err)  return rej(err)
      res()
    })
  })
}

