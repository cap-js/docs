import { TransformContext } from 'vitepress'
import { resolve } from 'node:path'
import { createWriteStream, } from 'node:fs'
import { SitemapStream } from 'sitemap'

const ignorePages = [/\.fragment\.html$/, /\/404\.html$/, /\/README\.html/, /\/CONTRIB.*\.html/, /\/CODE_OF.*\.html/, /\/links\.html/]

export function collect(id:string, ctx:TransformContext, links: { url:string, lastmod?:number}[]) {
  if (ignorePages.find(p => p.test(id)))  return
  const url = ctx.siteData.base + ctx.pageData.relativePath.replace(/index\.md$/, '').replace(/\.md$/, '')
  links.push({ url, lastmod: ctx.pageData.lastUpdated })
}

export function generate(outDir: string, hostname:string, links: { url:string, lastmod?:number}[]) {
  const sitemap = new SitemapStream({ hostname })
  const writeStream = createWriteStream(resolve(outDir, 'sitemap.xml'))
  sitemap.pipe(writeStream)
  links.sort((l1, l2) => l1.url.localeCompare(l2.url)).forEach((link) => sitemap.write(link))
  sitemap.end()
  return new Promise((r, e) => writeStream.on('finish', r).on('error', e))
}
