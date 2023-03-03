import { TransformContext } from 'vitepress'
import { join, relative } from 'node:path'
import { writeFileSync } from 'node:fs'

export function generate(id:string, ctx:TransformContext) {
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
