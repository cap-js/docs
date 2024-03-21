import * as fs from 'fs'

let data: Record<string, string> = {};

export default {
  // Watch files in <rule>/<type>/
  watch: ['./**/**/**/**/*'],
  load(watchedFiles: any[]) {
    watchedFiles.forEach((file) => {
      const key = file.replace(`${__dirname}/`, '')
        .replace('node-modules', 'node_modules')
      if (key !== 'examples.data.ts') {
        data[key] = fs.readFileSync(file, 'utf-8')
      }
    })
    return data;
  }
}
