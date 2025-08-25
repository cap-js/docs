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
    const menuFilePath = path.join(RULES_BASE_PATH, '_menu.md')
    fs.writeFileSync(menuFilePath, menu);
    console.info(`generated menu to ${menuFilePath}`)
}

function generateStub (ruleName) {
    if (!ruleName) {
        console.error('Please provide a rule name, e.g. "no-shared-handler-variables"');
        process.exit(1);
    }
    const stubFilePath = path.join(RULES_BASE_PATH, ruleName + '.md');
    if (fs.existsSync(stubFilePath)) {
        console.error(`file ${stubFilePath} already exists, will not overwrite`);
        process.exit(2);
    }
    fs.writeFileSync(stubFilePath, `# ${ruleName}\n\nTODO: Describe the rule here.`);
    console.info(`generated stub to ${stubFilePath}`);
}

function main (argv) {
    switch (argv[0]) {
        case 'generate-menu':
            generateMenuMarkdown();
            break;
        case 'generate-stub':
            generateStub(argv[1]);
            break;
        default:
            console.log(`Unknown command: ${argv[0]}`);
    }
}

main(process.argv.slice(2));