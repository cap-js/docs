import { MarkdownRenderer } from 'vitepress'
import { execSync } from 'node:child_process'
import { dirname, join, relative, resolve } from 'node:path'
import { existsSync } from 'node:fs'

type mdItEnv = { frontmatter: Record<string, any>, path: string, realPath: string }
const modelOut = '@cds-models'

/**
 * A markdown renderer that runs cds-typer for all code fences in .md pages configured
 * with `typedModel` frontmatter entries.
 *
 * 1. Runs cds-typer for each `typedModel` path
 * 2. Replaces `%typedModels:...:resolved%` strings with the resolved typer model,
 *    e.g. `%typedModels:${modelKey}:resolved%` -> `tools/assets/bookshop/@cds-models/*`
 *
 * It's implemented as a Markdown renderer because the whole Shiki/Twoslash renderer runs there.
 */
export function install(md: MarkdownRenderer) {
  const fence = md.renderer.rules.fence
  md.renderer.rules.fence = (tokens, idx, options, env: mdItEnv, ...args) => {
    const typedModels = env.frontmatter.typedModels as Record<string,string>|undefined
    if (typedModels) {
      const mdDir = dirname(env.realPath ?? env.path) // realPath is only set if Vitepress path rewrites are in place
      for (const modelKey in typedModels) {
        const modelPath = typedModels[modelKey]

        const srcDir = join(mdDir, modelPath)
        if (!existsSync(srcDir)) throw new Error(`${srcDir} does not exist. Check the '${modelPath}' path in frontmatter.`)

        runTyper(srcDir, modelOut)

        const resolvedPath = resolve(mdDir, modelPath, modelOut, '*')
        tokens[idx].content = tokens[idx].content.replaceAll(`%typedModels:${modelKey}:resolved%`, resolvedPath)
      }
    }

    return fence!(tokens, idx, options, env, ...args)
  }
}

function runTyper(srcDir:string, out:string) {
  const outPath = resolve(srcDir, out)
  // If target dir exists, stop here.  Delta compilation is done through cds-typer ion VS Code.
  if (existsSync(outPath)) return

  const label = '✓ running cds-typer in ' + relative(process.cwd(), srcDir)
  console.time(label)
  execSync(`npm exec --prefix ${srcDir} -- cds-typer '*' --outputDirectory ${out}`, {cwd: srcDir})
  console.timeEnd(label)
}
