import { defineConfig } from 'vitepress'
import { join } from 'node:path'
import { sidebar, nav4 } from './sidebar'
import * as sitemap from './sitemap'
import * as redirects from './redirects'


const siteHostName = process.env.SITE_HOSTNAME || 'http://localhost:4173'
const links: { url:string, lastmod?:number}[] = []

const sideb = sidebar('menu.md')
//@ts-ignore
const nav = nav4(sideb).filter(i => ['About', 'Getting Started', 'Cookbook', 'CDS'].includes(i.text))

export default defineConfig({
  title: 'CAPire',
  description: 'Documentation for SAP Cloud Application Programming Model',
  base: process.env.GH_BASE || '/docs/',
  themeConfig: {
    logo: '/images/cap.svg',
    nav,
    sidebar: sideb,
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
    lineNumbers: true,
    languages: [
      {
        id: 'cds',
        scopeName: 'source.cds',
        path: join(__dirname, 'syntaxes/cds.tmLanguage.json'), // from https://github.com/SAP/cds-textmate-grammar
        aliases: ['cds']
      },
      {
        id: 'csv',
        scopeName: 'text.scsv',
        path: join(__dirname, 'syntaxes/csv.tmLanguage.json'), // from https://github.com/mechatroner/vscode_rainbow_csv
        aliases: ['csv', 'csvs']
      }
    ],
    toc: {
      level: [2,3]
    }
  },
  vite: {
    plugins: [],
  },
  transformHtml(code, id, ctx) {
    redirects.generate(id, ctx)
    sitemap.collect(id, ctx, links)
  },
  buildEnd: async ({ outDir }) => {
    await sitemap.generate(outDir, siteHostName, links)
  }
})
