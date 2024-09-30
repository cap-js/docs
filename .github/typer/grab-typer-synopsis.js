#!/usr/bin/env node

// cds-typer Synopsis Extractor
// ============================
// runs "npx @cap-js/cds-typer --help" to extract the synopsis and version
// of the latest cds-typer version and writes it to a markdown file
// that is included in the cds-typer documentation page.

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as proc from 'node:child_process'
import * as util from 'node:util'

const exec = util.promisify(proc.exec)
const tool = '@cap-js/cds-typer'
const includingFile = path.join('tools', 'cds-typer.md')
const synopsisFile = path.join('tools', 'cds-typer_help-output.md')

const toMarkdown = (version, synopsis) => [
    '```log',
    `> ${tool}@${version} --help`,
    '',
    synopsis,
    '```'
].join('\n')

try {
    const { stdout: version } = await exec(`npx ${tool} --version`)
    const { stdout: synopsis } = await exec(`npx ${tool} --help`)

    // some very basic plausibility checks to make sure we don't
    // end up with garbage or npx errors in the markdown
    if (!/\d+\.\d+\.\d+/.test(version)) {
        throw new Error(`unexpected version: ${version}`)
    }
    if (!synopsis || !/SYNOPSIS/.test(synopsis)) {
        throw new Error(`unexpected synopsis: ${synopsis}`)
    }
    if (!fs.existsSync(includingFile)) {
        throw new Error(`could not find file '${includingFile}', where to include the synopsis. Has the documentation for cds-typer moved?`)
    }
    fs.writeFileSync(synopsisFile, toMarkdown(version.trim(), synopsis))
} catch (e) {
    console.error(`could not run cds-typer to generate synopsis: ${e.message}`)
}
