import { defineConfig } from 'vitepress'
import { join } from 'node:path'
import { promises as fs } from 'node:fs'
import { sidebar as sideb, nav4 } from './menu'
import * as sitemap from './sitemap'
import * as redirects from './redirects'

const siteHostName = process.env.SITE_HOSTNAME || 'http://localhost:4173'
const sitemapLinks: { url:string, lastmod?:number}[] = []
const redirectLinks: Record<string, string> = {}

const sidebar = sideb('menu.md')
const nav = [
  ...nav4(sidebar).filter((i:any) => ['Getting Started', 'Cookbook'].includes(i.text)),
  { text: 'Reference', items: [
    { text: 'CDS',       link: 'cds/' },
    { text: 'Node.js',   link: 'node.js/' },
    { text: 'Java',      link: 'java/' },
  ] },
]

export default defineConfig({
  title: 'CAPire',
  description: 'Documentation for SAP Cloud Application Programming Model',
  base: process.env.GH_BASE || '/docs/',
  srcExclude: ['**/README.md', '**/LICENSE.md', '**/CONTRIBUTING.md', '**/CODE_OF_CONDUCT.md', '**/menu.md'],
  themeConfig: {
    logo: '/images/cap.svg',
    sidebar,
    nav,
    search: {
      provider: 'local'
    },
    footer: {
      message: '<a href="https://www.sap.com/about/legal/impressum.html" target="_blank">Legal Disclosure</a> | <a href="https://www.sap.com/corporate/en/legal/terms-of-use.html" target="_blank">Terms of Use</a> | <a href="https://www.sap.com/about/legal/privacy.html" target="_blank">Privacy</a>',
      copyright: `Copyright © 2019-${new Date().getFullYear()} SAP SE`
    },
    editLink: {
      pattern: 'https://github.com/cap-js/docs/edit/main/:path'
    },
    socialLinks: [
      {icon: 'github', link: 'https://github.com/cap-js/'}
    ],
    outline: [1,3]
  },
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true, // TODO enable again to fix links from here to internal content
  markdown: {
    // lineNumbers: true,
    languages: [
      {
        id: 'cds',
        scopeName: 'source.cds',
        path: join(__dirname, 'syntaxes/cds.tmLanguage.json'), // from https://github.com/SAP/cds-textmate-grammar
        aliases: ['cds']
      },
      {
        id: 'csvs',
        scopeName: 'text.scsv',
        path: join(__dirname, 'syntaxes/scsv.tmLanguage.json'), // from https://github.com/mechatroner/vscode_rainbow_csv
        aliases: ['csv', 'csvs']
      },
      {
        id: 'csvc',
        scopeName: 'text.csv',
        path: join(__dirname, 'syntaxes/csv.tmLanguage.json'), // from https://github.com/mechatroner/vscode_rainbow_csv
        aliases: ['csvc']
      }
    ],
    toc: {
      level: [2,3]
    }
  },
  vite: {
    plugins: [
      redirects.devPlugin()
    ],
    build: {
      chunkSizeWarningLimit: 3000 // chunk for local search index dominates w/ 2.7M
    }
  },
  transformHtml(code, id, ctx) {
    redirects.collect(id, ctx.pageData.frontmatter, ctx.siteConfig, redirectLinks)
    sitemap.collect(id, ctx, sitemapLinks)
  },
  buildEnd: async ({ outDir }) => {
    await redirects.generateJson(outDir, redirectLinks)
    await sitemap.generate(outDir, siteHostName, sitemapLinks)

    // zip assets aren't copied automatically, and `vite.assetInclude` doesn't work either
    const hanaAsset = 'advanced/assets/native-hana-samples.zip'
    await fs.copyFile(join(__dirname, '..', hanaAsset), join(outDir, hanaAsset))
  }
})
