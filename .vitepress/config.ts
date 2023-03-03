import { defineConfig, TransformContext } from 'vitepress'
import { join, relative } from 'node:path'
import { writeFileSync } from 'node:fs'

import sidebar from './sidebar'
import { SearchPlugin } from 'vitepress-plugin-search'

const nav = [
  { text: 'About', link: '/about/' },
  { text: 'Get Started', link: '/get-started/' },
  { text: 'Cookbook', link: '/guides/' },
  // { text: 'Advanced', link: '/advanced/' },
  // { text: 'Tools', link: '/tools/' },
  // { text: 'CDS', link: '/cds/' },
  // { text: 'Java', link: '/java/' },
  // { text: 'Node.js', link: '/node.js/' },
  // { text: 'Releases', link: '/releases/' },
  { text: 'Resources', link: '/resources/' },
]

export default defineConfig({
  title: 'CAPire',
  description: 'Documentation for SAP Cloud Application Programming Model',
  base: process.env.GH_BASE || '/docs/',
  themeConfig: {
    logo: '/images/cap.svg',
    nav,
    sidebar,
    footer: {
      message: '<a href="https://www.sap.com/about/legal/impressum.html" target="_blank">Legal Disclosure</a> | <a href="https://www.sap.com/corporate/en/legal/terms-of-use.html" target="_blank">Terms of Use</a> | <a href="https://www.sap.com/about/legal/privacy.html" target="_blank">Privacy</a>',
      copyright: `Copyright © 2019-${new Date().getFullYear()} SAP SE`
    },
    editLink: {
      pattern: 'https://github.com/cap-js/docs/edit/main/:path'
    },
    socialLinks: [
      {icon: 'github', link: 'https://github.com/cap-js/'}
    ]
  },
  // lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true, // TODO remove
  markdown: {
    lineNumbers: true,
    attrs: {
      leftDelimiter: '{:',
      rightDelimiter: '}',
      allowedAttributes: []  // empty array = all attributes are allowed
    },
    languages: [
      {
        id: 'cds',
        scopeName: 'source.cds',
        path: join(__dirname, 'cds.tmLanguage.json'),
        aliases: ['cds']
      }
    ]
  },
  vite: {
    plugins: [
      //@ts-ignore
      SearchPlugin({
        previewLength: 62,
        buttonLabel: 'Search',
        placeholder: 'Search docs',
      })
    ],
  },
  transformHtml(code, id, ctx) {
    generateRedirects(id, ctx)
  }
})

function generateRedirects(id:string, ctx:TransformContext) {
  let redirects = ctx.pageData.frontmatter['redirect_from']
  if (!redirects)  return
  if (typeof redirects === 'string')  redirects = [redirects]
  const base = ctx.siteData.base
  const {outDir} = ctx.siteConfig
  const to = join(base, relative(outDir, id)
    .replace(/(index\.html)$/, '/')
    .replace(/(\.html)$/, ''))
  const source =`<!DOCTYPE html>
<html>
  <head><meta http-equiv="refresh" content="0; url='${to}'" /></head>
  <body><p>Please follow <a href="${to}">this link</a>.</p></body>
</html>`
  for (let redirect of redirects) {
    redirect = redirect.replace(/\/$/, '') // remove trailing sep.
    const file = join(outDir, redirect+'.html')
    writeFileSync(file, source)
  }
}
