import { readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url));
const sampleDir = join(__dirname, 'examples');
const truncate = s => s.replace(/(.{20})..+/, '$1&hellip;')

/**
 * @returns {import('vitepress').DefaultTheme.NavItem[]} a sidebar entry for each directory with examples
 */
export default () => {
  return readdirSync(sampleDir)
    .filter(f => statSync(join(sampleDir, f)).isDirectory())
    .sort()
    .map(f => ({ link: '/tools/cds-lint/meta/'+f, text: truncate(f) }))
}
