
import { defineLoader } from 'vitepress'
import { parse } from 'csv-parse'
import fs from 'node:fs'
import path from 'node:path'

async function getProperties() {

  return new Promise((resolve, reject) => {
    const records = [];
    fs.createReadStream(path.resolve(__dirname, 'properties.csv'))
      .pipe(parse({ delimiter: ';', relax_quotes: true}))
      .on('data', ([property, type, description, , isGroup, defaultValue]) => {
        if (property === 'cds')  return
        isGroup = isGroup === 'true'
        records.push({
          property,
          type: isGroup ? '': type,
          description,
          defaultValue: isGroup ? '': defaultValue,
          isGroup,
          anchor: property.replaceAll('.', '-')
        })
      })
      .on('end', () => resolve(records))
      .on('error', reject)
  })
}

export default defineLoader({
  async load() { return await getProperties() }
})
