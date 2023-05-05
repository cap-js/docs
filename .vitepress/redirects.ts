import { SiteConfig } from 'vitepress'
import { dirname, join, relative, resolve } from 'node:path'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { type Plugin as VitePlugin } from 'vite'
import matter from 'gray-matter'

declare global {
  var VITEPRESS_CONFIG: SiteConfig
}

export function collect(id:string, frontmatter:Record<string, any>, siteConfig:SiteConfig, links: Record<string, string>) {
  let redirects:string[] = frontmatter['redirect_from']
  if (!redirects)  return
  redirects = (typeof redirects === 'string') ? [redirects] : redirects

  const base = siteConfig.site.base
  const {outDir, rewrites, srcDir} = siteConfig
  let to = id
    .replace(/\\/g, '/')
    .replace(outDir, '')
    .replace(srcDir, '') // dev only
    .replace(base, '')
    .replace(/^\//, '') // remove leading slash
    .replace(/(\.html)$/, '')

  if (rewrites.map[to])  to = rewrites.map[to] as string  // dev only
  to = to
    .replace(/(\.md)$/, '') // dev only
    .replace('/index', '/')

  redirects.forEach(redirect => links[redirect] = to)
}

export function generate(outDir: string, base: string, links: Record<string, string>) {
  // create a classic html page w/ redirect for welcome page of VSCode plugin
  generateReleaseLatest(outDir, base, links)

  links = sortObject(links)
  const file = resolve(outDir, 'redirects.json')
  console.log(`⤳ redirects: saving index to ${relative(process.cwd(), file)} (${Object.keys(links).length} entries)`)
  writeFileSync(file, JSON.stringify(links))
}

function generateReleaseLatest(outDir: string, base: string, links: Record<string, string>) {
  let latestTo = links['releases/latest']
  if (latestTo) {
    latestTo = join(base, latestTo)
    const html =`<!DOCTYPE html>
<html>
  <head><meta http-equiv="refresh" content="0; url=${latestTo}" /></head>
  <body><p>Please follow <a href="${latestTo}">this link</a>.</p></body>
</html>`
    const htmlFile = join(outDir, 'releases/latest.html')
    mkdirSync(dirname(outDir), {recursive:true})
    writeFileSync(htmlFile, html)

    // add a new entry instead, which is used e.g. from home page
    links['releases/current'] = links['releases/latest']
    delete links['releases/latest']
  }
}

function sortObject (o:Record<string, any>): Record<string, any> {
  return Object.keys(o).sort().reduce((r:any, k:string) => (r[k] = o[k], r), {})
}

export function devPlugin (): VitePlugin {
  let redirects:Record<string, any>|null = null
  return {
    name: 'plugin-redirects',
    configureServer: (server) => {
      server.watcher.on('all', () => redirects = null)

      return () => { server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('/redirects.json')) {
          if (!redirects) {
            redirects = {}
            console.log('⤳ redirects: indexing, stay patient...')
            const vpConfig = global.VITEPRESS_CONFIG
            const { pages, srcDir } = vpConfig
            pages.map(page => join(srcDir, page))
              .filter(file => existsSync(file))
              .forEach(file => {
                const fm = matter.read(file).data
                collect(file, fm, vpConfig, redirects!)
            })
            console.log('⤳ redirects: indexing done')
          }
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(redirects))
        }
        else next()
      })
    }}
  }
}
