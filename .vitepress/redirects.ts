import { SiteConfig } from 'vitepress'
import { dirname, join, relative, resolve } from 'node:path'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { type Plugin as VitePlugin } from 'vite'
import matter from 'gray-matter'

declare global {
  var VITEPRESS_CONFIG: SiteConfig
}

export function collect(file:string, frontmatter:Record<string, any>, siteConfig:SiteConfig, links: Record<string, string>) {
  const urlPath = fileToUrlPath(file, siteConfig)

  let tos:string[] = frontmatter['redirect_to']
  if (tos) {
    tos = (typeof tos === 'string') ? [tos] : tos
    tos.forEach(to => links[urlPath] = to)
  }

  let froms:string[] = frontmatter['redirect_from']
  if (froms) {
    froms = (typeof froms === 'string') ? [froms] : froms
    froms.forEach(from => links[from] = urlPath)
  }
}

function fileToUrlPath(file: string, siteConfig:SiteConfig):string {
  const base = siteConfig.site.base
  const {outDir, rewrites, srcDir} = siteConfig
  let path = file
    .replace(/\\/g, '/')
    .replace(outDir, '')
    .replace(srcDir, '') // dev only
    .replace(base, '')
    .replace(/^\//, '') // remove leading slash
    .replace(/(\.html)$/, '')

  if (rewrites.map[path])  path = rewrites.map[path] as string // dev only
  path = path
    .replace(/(\.md)$/, '') // dev only
    .replace('/index', '/')
  return path
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
            redirects['releases/current'] = 'releases/latest'
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
