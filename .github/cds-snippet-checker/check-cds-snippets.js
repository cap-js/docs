#!/usr/bin/env node

// CDS Snippet Checker
// ===================
//
// Checks all `cds` snippets for syntax errors. Runs some heuristics
// to allow common syntax shortcuts such as annotations without
// corresponding artifact.
//
// Usage
// -----
// Go into this file's directory and run `npm run check`.
//

'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import compiler from '@sap/cds-compiler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectDir = path.resolve(__dirname, '../..');
const verbose = process.argv[2] === '--verbose';

// Get base directories
const excludedDirs = [
  '.git',
  '.github',
  'node_modules',
  '.reuse',
  '.vitepress',
  '.idea',
  '.vscode'
]
const baseDirs = fs.readdirSync(projectDir)
  .filter(file => fs.statSync(path.join(projectDir, file)).isDirectory() && !excludedDirs.includes(file))
  .map(file => path.join(projectDir, file));

const CDS_MODE_SYNTAX = 'syntax';
const CDS_MODE_PARSE = 'parse';
const CDS_MODE_COMPILE = 'compile';
const CDS_MODE_CQL = 'cql';
const CDS_MODE_EXPRESSION = 'xpr'; // used in CSN
const CDS_MODE_EXPRESSION_ALT = 'cxn'; //used in CAPire
const CDS_MODE_IGNORE = 'ignore';
const CDS_MODE_UPCOMING = 'upcoming';
const cdsModes = [
  CDS_MODE_COMPILE,
  CDS_MODE_PARSE,
  CDS_MODE_CQL,
  CDS_MODE_EXPRESSION,
  CDS_MODE_EXPRESSION_ALT,
  CDS_MODE_SYNTAX,
  CDS_MODE_IGNORE,
  CDS_MODE_UPCOMING
]

let counter = 0;
let hasErrors = false;

// Logging should always go to stderr. Have some convenience functions to minimize verbosity.
const log   = (...args) => { console.error(...args); };
const error = (...args) => { console.error(...args); };
const debug = (...args) => { verbose && console.error(...args); };

for (const dir of baseDirs) {
  const files = getFilesInDirectory(dir, /[.]md/);
  log(`Checking ${files.length} markdown documents in ${path.relative(projectDir, dir)}`);

  for (const snippet of extractSnippetsFromFiles(files)) {
    ++counter;

    snippet.messages = [];

    compileSnippet(snippet);

    if (compiler.hasErrors(snippet.messages)) {
      hasErrors = true;
      printErrorForSnippet(snippet, snippet.messages);

    } else if (verbose) {
      log(`Snippet ${counter}`);
      log(snippet.content);
    }
  }

  log('');
}

log(`Checked ${counter} snippets.`);

if (hasErrors) {
  error('\nError! Found syntax errors!');
  process.exit(1);

} else {
  log('Success! Found no syntax errors.');
  process.exit(0);
}

// ----------------------------------------------------------------------------

function printErrorForSnippet(snippet, messages) {
  const sourceLines = snippet.content.split(/\n/);
  log('--------------------------------------------------------------------')
  log(`Errors in file ./${path.relative(projectDir, snippet.file)}`)
  log(`With mode: ${snippet.mode}\n`);
  log('In following snippet\n')
  if (snippet.original !== snippet.content) {
    log('  ```cds')
    log(indentLines(snippet.original, 2))
    log('  ```')
    log('')
    log('which was modified and compiled again as:\n')
  }
  log('  ```cds')
  log(indentLines(snippet.content, 2))
  log('  ```')
  log('')

  log('Compiler Errors:')
  log('')
  for (const msg of messages) {
    msg.$location.file = path.relative(projectDir, msg.$location.file);
    log(indentLines(compiler.messageStringMultiline(msg, { withLineSpacer: true }), 2));
    log(indentLines(compiler.messageContext(sourceLines, msg), 2));
    log('')
  }


}

/**
 * @param {object} snippet
 */
function compileSnippet(snippet) {
  const options = { messages: snippet.messages };

  const compile = () => {
    try {
      if (snippet.mode === CDS_MODE_CQL) {
        compiler.parse.cql(snippet.content, snippet.file, options);
      }
      else if (snippet.mode === CDS_MODE_EXPRESSION || snippet.mode === CDS_MODE_EXPRESSION_ALT) {
        compiler.parse.expr(snippet.content, snippet.file, options);
      }
      else if (snippet.mode === CDS_MODE_SYNTAX) {
        options.parseOnly = true;
        compiler.$lsp.parse(snippet.content, `${snippet.file}.cds`, options);
      }
      else if (snippet.mode === CDS_MODE_PARSE) {
        options.parseCdl = true;
        const fileCache = Object.create(null);
        fileCache[`${snippet.file}.cds`] = snippet.content;
        compiler.compileSync([`${snippet.file}.cds`], projectDir, options, fileCache)
      }
      else if (snippet.mode === CDS_MODE_COMPILE) {
        const fileCache = Object.create(null);
        fileCache[`${snippet.file}.cds`] = snippet.content;
        compiler.compileSync([`${snippet.file}.cds`], projectDir, options, fileCache)
      }
      else if (snippet.mode === CDS_MODE_IGNORE || snippet.mode === CDS_MODE_UPCOMING) {
        return;
      }
      else {
        throw new Error(`Unknown compilation mode: ${snippet.mode}`);
      }
    } catch (e) {
      if (!(e instanceof compiler.CompilationError))
        throw e;
      // Ignore compilation error; is also part of options.messages
    }
  }

  compile();

  if (compiler.hasErrors(options.messages)) {
    // In case that the original snippet can't be compiled, we try to preprocess it.
    //
    // Why don't we directly preprocess it?  Because many snippets contain `...` to
    // indicate that there is "further content".  If we replace it by a comment, we
    // would also change the meaning of `...` in cds-compiler v2's array syntax.
    // Simply testing both versions seems to be the best approach.
    options.messages.length = 0;
    preprocessSnippet(snippet);
    compile();
  }

  for (const msg of options.messages) {
    if (msg.messageId.match(/syntax-.*-token/)) {
      // There may be snippets that just contain annotations. Without any
      // entity or similar.  Here, we simply add an entity and test again.
      snippet.content += '\n\nentity ENTITY_FOR_ANNOTATION_ONLY { };';
      options.messages.length = 0;
      compile();
      break;
    }
  }
}

/**
 * @param {object} snippet
 */
function preprocessSnippet(snippet) {
  if (snippet.mode === CDS_MODE_CQL) {
    // Many CQL snippets start with this comment.
    snippet.content = snippet.content.replace(/^--.*$/gm, '');
    // Comments in CQL are... difficult. Ignore those for now.
    if (['...', '…'].some(ellipsis => snippet.content.includes(ellipsis)))
      snippet.mode = CDS_MODE_IGNORE;

  } else {
    snippet.content = snippet.content.replace(/(?<![*])[.][.][.],/g, '/*..,*/') // "...," is often used for further elements
      .replace(/(?<![*] ?)\[?[.][.][.]\]?(?! ?up)|…/g, '/*...*/') // '...' but not '... up to'
      .replace(/\${[^}]+}/g, 'EXAMPLE_VALUE');
  }
}

/**
 * @param {string[]} files
 */
function* extractSnippetsFromFiles(files) {
  for (const filename of files) {
    // Compiler-v2/ contains a lot of negative-examples. Skip for now.
    if (filename.includes('attic/') || filename.includes('attic1/') || filename.includes('attic2/') ||
        filename.includes('former/')) {
      continue;
    }

    for (const section of extractSections(filename)) {

      if (section.isConcept) {
        debug(`Skipping concept section "${section.heading}"`);
        continue;
      }

      for (const snippet of extractSnippets(section.content)) {
        if (snippet.content.match(/(PUT|DELETE|GET|POST|UPDATE)[ :]/)) {
          // Ignore HTTP examples
          continue;
        }

        yield { file: filename, content: snippet.content, original: snippet.content, mode: snippet.mode };
      }
    }
  }
}

/**
 * @param {string} file
 */
function* extractSections(file) {
  const content = fs.readFileSync(file, 'utf-8');

  const sections = content.split(/^#/gm);

  for (const content of sections) {
    // Skip empty parts
    if (content.trim() === "")
      continue;

    const heading = content.slice(0, content.indexOf('\n'));
    yield {
      heading: heading,
      isConcept: content.includes('.impl.concept'),
      content,
    };
  }
}

/**
 * Extract snippets from the given string.  Snippets are enclosed in markdown fences
 * with type "swift".  A snippet may be preceded by a configuration HTML comment.
 * Such comments have the following syntax.
 *
 *   <!-- cds-mode: MODE -->
 *
 * Where "MODE" is currently either "parse", "compile", "cql" or "ignore".
 * Snippets that have a cds mode but non-swift language are still checked.
 *
 * @param {string} section
 */
function* extractSnippets(section) {
  // Note: [^] matches any character, including newlines
  // TODO: We can't match indented code blocks because of CDL text blocks starting with ``` as of now.
  const re = /^(?:\s*<!--(.+)-->\n)?```([a-zA-Z]+)\s*\n([^]*?)\n```\s*$/gm;

  let snippets;
  while ((snippets = re.exec(section)) !== null) {
    const language = snippets[2].toLowerCase();
    const content = snippets[3];
    let mode;

    // Code snippets may have a configuration in form of an HTML comment.
    // When a cds-mode comment exists, we ignore the language.
    if (snippets[1]) {
      const modeRegEx = /cds-mode: ([^,]+)$/;
      const result = modeRegEx.exec(snippets[1]);
      if (result && result[1])
        mode =  validateMode(result[1].trim());
      else
        continue;

    } else if ('swift' === language || 'cds' === language) {
      // Simple heuristic for swift snippets
      mode = /^SELECT/i.test(content) ? CDS_MODE_CQL : CDS_MODE_SYNTAX;

    } else if ('sql' === language) {
      // Heuristic: If we have SQL statements, those with `CREATE`, an SQL comment, ...
      //            are actually SQL and not CQL. Those starting with `let` are JS ones.
      if (/^CREATE/i.test(content) || content.startsWith('--') || content.startsWith('let ') ||
          content.startsWith('const '))
        continue;
      // Enable once all SQL snippets are fixed or have a IGNORE comment.
      // mode = CDS_MODE_CQL;
      continue;

    } else {
      continue;
    }

    // JavaScript snippets marked as `swift` due to large percentage of CQL.
    // Extract the CQL snippet.
    const cqlRegEx = /CQL`([^]+?)`/gm;
    if (cqlRegEx.test(content)) {
      cqlRegEx.lastIndex = 0; // reset regex after test()
      let cqlSnippets;
      while ((cqlSnippets = cqlRegEx.exec(content)) !== null) {
        yield {
          mode: CDS_MODE_CQL,
          content: cqlSnippets[1],
        };
      }
      continue;
    }

    // JavaScript snippets marked as `swift` due to large percentage of CDL.
    // Extract the CDL snippet.
    const cdlRegEx = /(?:CDL|cds\.compile\s*\()`([^]+?)`/gm;
    if (cdlRegEx.test(content)) {
      cqlRegEx.lastIndex = 0; // reset regex after test()
      let cdlSnippets;
      while ((cdlSnippets = cdlRegEx.exec(content)) !== null) {
        yield {
          mode: mode,
          content: cdlSnippets[1],
        };
      }
      continue;
    }

    yield { mode, content };
  }
}

/**
 * @param {string} dir
 * @param {RegExp} fileRegEx
 * @returns {string[]}
 */
function getFilesInDirectory(dir, fileRegEx) {
  let results = [];
  const files = fs.readdirSync(dir);

  for (let file of files) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesInDirectory(file));
    } else {
      if (!fileRegEx || file.match(fileRegEx))
        results.push(file);
    }
  }
  return results;
}

/**
 * @param {string} str
 * @returns {string|null}
 */
function validateMode(str) {
  if (!str)
    return null;
  if (!cdsModes.includes(str)) {
    error(`Unknown cds-mode: ${str}`);
    return null;
  }
  return str;
}

/**
 * Indent the given string by `indent` whitespace characters.
 *
 * @param {string} str
 * @param {number} indent
 * @returns {string}
 */
function indentLines(str, indent) {
  const indentStr = ' '.repeat(indent);
  const lines = str.split(/\r\n?|\n/);
  return lines.map(s => indentStr + s).join('\n');
}

