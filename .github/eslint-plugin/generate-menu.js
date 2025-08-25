#!/usr/bin/env node

// menu generator
// ============================
// generates the _menu.md file to make sure all rules are included.

import * as fs from 'node:fs'
import * as path from 'node:path'

const RULES_BASE_PATH = path.join('tools', 'cds-lint', 'rules');
const MENU_FILE_NAME = '_menu.md';

const getRuleDescriptionFiles = () =>
    fs.readdirSync(RULES_BASE_PATH)
        .filter(file => file.endsWith('.md'))
        .filter(file => !['index.md', MENU_FILE_NAME].includes(file))
        .sort()

function generateMenuMarkdown () {
    const rules = getRuleDescriptionFiles();
    const menu = rules.map(rule => {
        const clean = rule.replace('.md', '');
        return `# [${clean}](${clean})`
    }).join('\n');
    console.log(menu)
    fs.writeFileSync(path.join(RULES_BASE_PATH, '_menu.md'), menu);
}

generateMenuMarkdown();