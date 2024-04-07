// This script ingests all files in the examples/ folder
// and makes them available to the Playground template.

import * as fs from 'fs'

let data: Record<string, string> = {};

export default {
  // Watch files in <rule>/<type>/
  watch: ['./**/.*', './**/**'],
  load(watchedFiles: any[]) {
    watchedFiles.forEach((file) => {
      const key = file.replace(`${__dirname}/`, '')
        // Watch globs ignore 'node_modules', so in examples, we call them 'node-mdules' to avoid being ignored.
        // Once ingested, we need to change it back to 'node_modules' so they can be used by the Playground template.
        .replace('node-modules', 'node_modules')
      if (key !== 'examples.data.ts') {
        data[key] = fs.readFileSync(file, 'utf-8')
      }
    })
    return data;
  }
}
