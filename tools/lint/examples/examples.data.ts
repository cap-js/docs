import * as fs from 'fs'
import * as path from 'path'

let data: Record<string, string> = {};

export default {
  watch: ['./**/**/*'],
  load(watchedFiles: any[]) {
    watchedFiles.forEach((file) => {
      const parsedPath = path.parse(file);
      const fileName = parsedPath.base
      const type = path.basename(parsedPath.dir)
      const rule = path.parse(parsedPath.dir.replace(type, '')).base
      const key = `${rule}_${type}_${fileName}`;
        data[key] = fs.readFileSync(file, 'utf-8')
    })
    return data;
  }
}
