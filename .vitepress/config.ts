import { UserConfig, DefaultTheme } from 'vitepress'
import type { LanguageInput, RawGrammar } from 'shiki'
import { join, resolve } from 'node:path'
import { promises as fs } from 'node:fs'
import { URL } from 'node:url'
import { sidebar, nav4 } from './menu'
import * as redirects from './lib/redirects'
import * as cdsMavenSite from './lib/cds-maven-site'
import * as MdAttrsPropagate from './lib/md-attrs-propagate'

export type CapireThemeConfig = DefaultTheme.Config & {
  capire: {
    versions: { [key: string]: string },
    gotoLinks: { href:string, key:string, name?:string, hidden?:boolean }[]
  }
}

const base =  process.env.GH_BASE || '/docs'
const siteURL = new URL(process.env.SITE_HOSTNAME || 'http://localhost:4173/docs')
if (!siteURL.pathname.endsWith('/'))  siteURL.pathname += '/'

const redirectLinks: Record<string, string> = {}

const latestVersions = {
  java_services: '2.9.1',
  java_cds4j: '2.9.2'
}

const localSearchOptions = {
  provider: 'local',
  options: {
    miniSearch: {
      options: {
        tokenize: text => text.split( /[\n\r #%*,=/:;?[\]{}()&]+/u ), // simplified charset: removed [-_.@] and non-english chars (diacritics etc.)
        processTerm: (term, fieldName) => {
          term = term.trim().toLowerCase().replace(/^\.+/, '').replace(/\.+$/, '')
          const stopWords = ['frontmatter', '$frontmatter.synopsis', 'and', 'about', 'but', 'now', 'the', 'with', 'you']
          if (term.length < 2 || stopWords.includes(term))  return false

          if (fieldName === 'text') {
            // as we don't tokenize along . to keep expressions like `cds.requires.db`, split and add the single parts as extra terms
            const parts = term.split('.')
            if (parts.length > 1) {
              const newTerms = [term, ...parts].filter(t => t.length >= 2).filter(t => !stopWords.includes(t))
              return newTerms
            }
          }
          return term
        },
      },
      searchOptions: {
        combineWith: 'AND',
        fuzzy: false, // produces too many bad results, like 'watch' finds 'patch' or 'batch'
        // @ts-ignore
        boostDocument: (documentId, term, storedFields:Record<string, string|string[]>) => {
          // downrate matches in archives, changelogs etc.
          if (documentId.match(/\/archive|changelog|old-mtx-apis|java\/multitenancy/)) return -5

          // downrate Java matches if Node is toggled and vice versa
          const toggled = localStorage.getItem('impl-variant')
          const titles = (storedFields?.titles as string[]).filter(t => !!t).map(t => t.toLowerCase())
          if (toggled === 'node' && (documentId.includes('/java/')    || titles.includes('java')))    return -1
          if (toggled === 'java' && (documentId.includes('/node.js/') || titles.includes('node.js'))) return -1

          // Uprate if term appears in titles. Add bonus for higher levels (i.e. lower index)
          const titleIndex = titles.map((t, i) => t?.includes(term) ? i : -1).find(i => i>=0) ?? -1
          if (titleIndex >=0)  return 10000 - titleIndex

          return 1
        }
      }
    }
  }
} as { provider: 'local'; options?: DefaultTheme.LocalSearchOptions }

const menu = sidebar()
const nav = nav4(menu) as DefaultTheme.NavItem[]
const loadSyntax = async (file:string, name:string, alias:string=name):Promise<LanguageInput> => {
  const src = await fs.readFile(join(__dirname, file))
  const grammar:RawGrammar = JSON.parse(src.toString())
  return { name, aliases: [name, alias], ...grammar }
}

const config:UserConfig<CapireThemeConfig> = {
  title: 'cap≽ire',
  description: 'Documentation for SAP Cloud Application Programming Model',
  base,
  srcExclude: ['**/.github/**', '**/README.md', '**/LICENSE.md', '**/CONTRIBUTING.md', '**/CODE_OF_CONDUCT.md', '**/menu.md', '**/-*.md'],
  themeConfig: {
    logo: '/assets/logos/cap.svg',
    // IMPORTANT: Don't use getters here, as they are called again and again!
    sidebar: menu,
    nav: [
      Object.assign(nav.find(i => i.text === 'Getting Started')!, {text:'Get Started'}),
      Object.assign(nav.find(i => i.text === 'Cookbook')!, {text:'Guides'}),
      nav.find(i => i.text === 'CDS'),
      nav.find(i => i.text === 'Node'),
      nav.find(i => i.text === 'Java'),
      nav.find(i => i.text === 'Tools'),
      nav.find(i => i.text === 'Plugins'),
    ] as DefaultTheme.NavItem[],
    search: localSearchOptions,
    footer: {
      message: '<a href="https://www.sap.com/about/legal/impressum.html" target="_blank">Legal Disclosure</a> | <a href="https://www.sap.com/corporate/en/legal/terms-of-use.html" target="_blank">Terms of Use</a> | <a href="https://www.sap.com/about/legal/privacy.html" target="_blank">Privacy</a>',
      copyright: `Copyright © 2019-${new Date().getFullYear()} SAP SE`
    },
    editLink: {
      pattern: 'https://github.com/cap-js/docs/edit/main/:path'
    },
    externalLinkIcon: true,
    socialLinks: [
      {icon: 'github', link: 'https://github.com/cap-js/docs'}
    ],
    outline: [2,3],
    capire: { versions: latestVersions, gotoLinks: [] }
  },
  head: [
    ['meta', { name: 'theme-color', content: '#db8b0b' }],
    ['link', { rel: 'shortcut icon', href: base+'/assets/logos/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: base+'/assets/logos/apple-touch-icon.png' }],
    ['script', {}, ` const variant = localStorage.getItem('impl-variant') ?? 'node'; document.documentElement.classList.add(variant)`]
  ],
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true, // TODO enable again to fix links from here to internal content
  markdown: {
    languages: [
      await loadSyntax('syntaxes/cds.tmLanguage.json',  'cds'), // from https://github.com/SAP/cds-textmate-grammar
      await loadSyntax('syntaxes/scsv.tmLanguage.json', 'csv', 'csvs'), // from https://github.com/mechatroner/vscode_rainbow_csv
      await loadSyntax('syntaxes/csv.tmLanguage.json',  'csvc'), // from https://github.com/mechatroner/vscode_rainbow_csv
      await loadSyntax('syntaxes/log.tmLanguage.json',  'log', 'logs'), // find here mappings from color -> tm language key https://github.com/shikijs/shiki/blob/main/packages/shiki/themes/github-dark.json
    ],
    toc: {
      level: [2,3]
    },
    config: md => {
      MdAttrsPropagate.install(md)
    },
  },
  sitemap: {
    hostname: siteURL.href
  },
  vite: {
    plugins: [
      //@ts-ignore
      redirects.devPlugin()
    ],
    build: {
      chunkSizeWarningLimit: 5000 // chunk for local search index dominates
    }
  },
  transformHtml(code, id, ctx) {
    redirects.collect(id, ctx.pageData.frontmatter, ctx.siteConfig, redirectLinks)
  },
  buildEnd: async ({ outDir, site }) => {
    await redirects.generate(outDir, site.base, redirectLinks)
    const sitemapURL = new URL(siteURL.href)
    sitemapURL.pathname = join(sitemapURL.pathname, 'sitemap.xml')
    await fs.writeFile(resolve(outDir, 'robots.txt'), `Sitemap: ${sitemapURL}\n`)

    // zip assets aren't copied automatically, and `vite.assetInclude` doesn't work either
    const hanaAssetDir = 'advanced/assets'
    const hanaAsset = join(hanaAssetDir, 'native-hana-samples.zip')
    await fs.mkdir(join(outDir, hanaAssetDir), {recursive: true})
    console.debug('✓ copying HANA assets to ', join(outDir, hanaAsset))
    await fs.copyFile(join(__dirname, '..', hanaAsset), join(outDir, hanaAsset))

    await cdsMavenSite.copySiteAssets(join(outDir, 'java/assets/cds-maven-plugin-site'), site)

  }
}

if (process.env.VITE_CAPIRE_PREVIEW) {
  config.head!.push(['meta', { name: 'robots', content: 'noindex,nofollow' }])
}

if (process.env.NODE_ENV !== 'production') {
  // open in VS Code
  const srcDir = resolve(__dirname, '..')
  let href = 'vscode://' + join('file', srcDir, '${filePath}').replaceAll(/\\/g, '/').replace('@external/', '')
  config.themeConfig!.capire!.gotoLinks!.push({ href, key: 'o', name: 'VS Code' })
}


export default config
