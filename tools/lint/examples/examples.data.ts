import fs from 'node:fs'
import Path from 'node:path'

let data: Record<string, string> = {};

export default {
  watch: ['./*'],
  load(watchedFiles: any[]) {
    watchedFiles.forEach((file) => {
        data[Path.parse(file).name] = fs.readFileSync(file, 'utf-8')
    })
    return data;
  }
}
