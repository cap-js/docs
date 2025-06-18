import { SiteData } from 'vitepress'
import AdmZip from 'adm-zip'

export async function copySiteAssets(outDir:string, site:SiteData) {
  const { themeConfig: { capire }} = site
  const version = capire.versions.java_services
  if (!capire.maven_host_base) {
    return console.debug(`⊗ skipped fetching CDS Maven Site ${version}`)
  }
  const url = capire.maven_host_base + `/com/sap/cds/cds-maven-plugin/${version}/cds-maven-plugin-${version}-site.jar`

  const resp = await fetch(url)
  const jar = await resp.arrayBuffer()

  console.debug(`✓ fetching CDS Maven Site ${version}`)
  const zip = new AdmZip(Buffer.from(jar))
  zip.extractAllTo(outDir, true, false)

}

