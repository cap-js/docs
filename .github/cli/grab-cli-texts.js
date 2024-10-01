#!/usr/bin/env node

// CLI Help Extractor
// ============================
// runs "npm exec --package=<tool> -c <cmd>" to extract the synopsis and version
// of the latest tool version and writes it to a markdown file
// that is included in a documentation page.

import * as proc from 'node:child_process'
import * as util from 'node:util'

const exec = util.promisify(proc.exec)
const pkg = process.argv[2]
if (!pkg) throw new Error('Missing package')
const cmd = process.argv[3] || pkg.split('/').pop()
const cwd = process.argv[4] || process.cwd()
const unstyled = process.argv.some(a => a === '--unstyled')

const toOutput = (version, str) => [
    '<!-- this file is automatically generated and updated by a github action -->',
    `${unstyled ? '```log' : '<pre class="log">'}`,
    `> ${cmd}`,
    '',
    str
        .replace(/\n.*home.*[|:].*/g, '') // remove absolute cds home path as it's system-specific
        .replace(/\<(.*?)\>/g, '&lt;$1&gt;') // <foo> -> &lt;foo&gt;
        .replace(/^\x1b\[1m(.*?)\x1b\[0m\n/gm, '<strong>$1</strong>') // bold at beginning of line -> strong
        .replace(/(\s*)\x1b\[4m(.*?)\x1b\[0m/g, '$1<i>$2</i>') // underline -> i
        .replace(/(\s*)\x1b\[\d+m(.*?)\x1b\[0m/g, '$1<em>$2</em>') // other colors -> em
    , `${unstyled ? '```' : '</pre>'}`
].join('\n')

try {
    const version = (await exec(`npm view ${pkg} version`)).stdout.trim()
    const cmdString = `npm exec --package=${pkg}@${version} -c "${cmd}"`
    console.error(`> ${cmdString}`)
    const { stdout: cmdOut }   = await exec(cmdString, {cwd, env: { FORCE_COLOR: 'true', ...process.env }})

    // some very basic plausibility checks to make sure we don't
    // end up with garbage or npx errors in the markdown
    if (!/\d+\.\d+\.\d+/.test(version)) {
        throw new Error(`unexpected version: ${version}`)
    }
    if (!cmdOut) {
        throw new Error(`no output from: ${cmdString}`)
    }
    if (cmd.includes('help') && !/SYNOPSIS|USAGE/.test(cmdOut)) {
        throw new Error(`unexpected synopsis: ${cmdOut}`)
    }
    console.log(toOutput(version.trim(), cmdOut.trim()))
} catch (e) {
    console.error(`could not generate synopsis: ${e.message}`, e)
}