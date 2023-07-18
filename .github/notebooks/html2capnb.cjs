const fs = require('fs');
const path = require('path');

const { html2notebook } = require('html2notebook');
const { DomUtils } = require('htmlparser2');
const CSSselect = require("css-select");

// Capire (Vitepress) specifics
const IMPL_VARIANTS = {
 "node": "Node.js",
 "java": "Java"
}
const NOTEBOOK_TYPE = "cap";
const LANG_MAPPINGS = {
    "cds": "cds",
    "console": "markdown",
    "csv": "csv",
    "java": "java",
    "js": "javascript",
    "log": "markdown",
    "sh": "shell"
}
const STYLES = fs.readFileSync(path.join(__dirname, "notebookStyles.scss"), "utf8");

// Generate notebooks for all HTML files which contain class="notebook"
try {
  buildNotebooks(scanPaths(process.argv.slice(2)[0],  "notebooks"));
} catch (err) {
  console.log(`An error while occured while building the pages notebooks:\n\n`, err);
}

function buildNotebooks(_paths) {
  const { sourcePath, destPath, rootPath } = _paths;
  var files = fs.readdirSync(sourcePath);
  for (var i = 0; i < files.length; i++) {
      var filename = path.join(sourcePath, files[i]);
      var stat = fs.lstatSync(filename);
      if (stat.isDirectory()) {
          _paths.sourcePath = filename
          buildNotebooks(_paths);
      } else if (filename.endsWith(".html")) {
          const data = fs.readFileSync(filename, 'utf8')
          const impls = detectImplVariants(data);
          if (data.includes('class="notebook"')) {
            // Build notebooks for all toggleable languages
            const urlPath = sourcePath.replace(`${rootPath}`, '')
            const baseUrl = process.env.SITE_HOSTNAME || 'http://localhost:5173/docs/';
            impls.forEach(impl => {
              const capnbFile = getNotebookFilename(rootPath, filename, impl)
              const capnbFilepath = path.join(destPath, capnbFile);
              const config = {
                type: NOTEBOOK_TYPE,
                outputFile: capnbFilepath,
                getRootNode,
                replaceNode: (node) => replaceNode(node, baseUrl, urlPath),
                nodeIsIgnored: (node) => nodeIsIgnored(node, impl),
                nodeIsCode,
                getCodeCells: (node) => getCodeCells(node, impl),
                styles: STYLES
              }

              // Generate notebook from HTML
              html2notebook(filename, config);

            })
          }
      }
  }
}
console.log("\n> Done");

function getRootNode(dom) {
  return CSSselect.selectOne("[class~=vp-doc]", dom);
}

function replaceNode(node, baseUrl, urlPath) {
    // Fixes link refs
    if (node?.attribs?.href) {
      // RULE: Links starting with './..' prepend baseUrl
      if (node?.attribs?.href.startsWith('./..')) {
        const permalinkDots = node?.attribs?.href.split('./../').splice(1)[0]
        node.attribs.href = `${baseUrl}${permalinkDots}`
      // RULE: Links starting with './' prepend baseUrl/path
      } else if (node?.attribs?.href.startsWith('./')) {
        const permalinkDots = node?.attribs?.href.split('.')[1]
        node.attribs.href = `${baseUrl}${urlPath}${permalinkDots}`
      }
    }
    // Fixes image sources
    if (node?.attribs?.src) {
       // RULE: Image sources starting with '/docs' prepend external baseUrl
      if (node?.attribs?.src.startsWith('/docs')) {
        node.attribs.src = node.attribs.src.replace('/docs/', 'https://cap.cloud.sap/docs/')
      }
    }
    return node
}

function nodeIsIgnored(node, impl) {
  return CSSselect.is(node, "button") ||
         CSSselect.is(node, "[class~=line-numbers-wrapper]") ||
         CSSselect.is(node, `.impl:not(.impl.${impl})`) ||
         CSSselect.is(node, ".language-console > .lang, .language-log > .lang") ||
         CSSselect.is(node, "[class~=notebook-skip]")
}

function nodeIsCode(node) {
  return !node?.parent?.attribs?.class?.includes("notebook-nonexec") && (
    node?.attribs?.class?.includes("vp-code-group") || (
      node?.attribs?.class?.includes("language-") &&
      !["language-console", "language-log"].includes(node?.attribs?.class)
    )
  )
}

function getCodeCells(node, impl) {
  const isCode = true;
  let texts;
  let codeCells = [];
  const labels = DomUtils.getElementsByTagName("label", node).map(n => n?.children[0]?.data);
  const index = labels.indexOf(IMPL_VARIANTS[impl]);
  if (index !== -1) {
      // For code with language tabs (i.e. Node.js, Java)
      const codeNode = node ? DomUtils.getElementsByTagName("code", node)[index] : [];
      let text = codeNode ? DomUtils.getElementsByTagType("text", codeNode).map(n => n?.data)?.join('') : '';
      text = replaceCodeByCd(text);
      const lang = DomUtils.getElements({ class: "lang" }, node)[0]?.children[0]?.data || '';
      let language = LANG_MAPPINGS[lang] || 'shell';
      language = addCDSServerLanguage(language, text);
      codeCells.push({ text, isCode, language });
  } else {
      if (labels.length) {
          // For code cells with file tabs
          let l = 0;
          for (let label of labels) {
              const codeNode = node ? DomUtils.getElementsByTagName("code", node)[l] : [];
              const lang = DomUtils.getElements({ class: "lang" }, node)[0]?.children[0]?.data || '';
              let language = LANG_MAPPINGS[lang] || 'shell';
              texts = codeNode ? DomUtils.getElementsByTagType("text", codeNode).map(n => n?.data) : [];
              let text = texts?.join('')
              text = replaceCodeByCd(text);
              text = addWriteFileMagic(text, language, label);
              language = addCDSServerLanguage(language, text);
              codeCells.push({ text: text ?? '', isCode, language });
              l++
          }
      } else {
          // For all other code cells
          const codeNode = node ? DomUtils.getElementsByTagName("code", node)[0] : [];
          texts = codeNode ? DomUtils.getElementsByTagType("text", codeNode).map(n => n?.data) : [];
          let text = texts?.join('') ?? '';
          text = replaceCodeByCd(text);
          const lang = DomUtils.getElements({ class: "lang" }, node)[0]?.children[0]?.data || '';
          let language = LANG_MAPPINGS[lang] || 'shell';
          language = addCDSServerLanguage(language, text);
          codeCells.push({ text, isCode, language });
      }
      return codeCells;
  }
  return codeCells
}

function scanPaths(inputDir, outDir) {
  const sourcePath = path.resolve(inputDir);
  const destPath = path.resolve(sourcePath, outDir);
  if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
  }
  console.log(`> Scanning HTML pages in ${inputDir}\n`)
  return { sourcePath, destPath, rootPath: sourcePath }
}

function detectImplVariants(data) {
  let impls = [];
  if (data.includes('class="impl java"')) {
      impls.push("java")
  }
  if (data.includes('class="impl node"')) {
      impls.push("node");
  }
  return impls;
}

function getNotebookFilename(rootPath, filename, impl) {
  const prefix = path.dirname(filename)
    .replace(rootPath + path.sep, '')
    .replaceAll(path.sep, '-');
  return `${prefix}-${path.basename(filename).replace('.html', '')}-${impl}.capnb`;
}

// RULE: Prepend `%%writefile [file]` magic command to the top of all code cells
function addWriteFileMagic(text, language, label) {
  const magic = language === "javascript" ? `// %%writefile "${label}"\n` : `%%writefile "${label}"\n`;
  return magic + text;
}

// RULE: Code cells containg cds watch/ serve commands are of type 'CDS server'
function addCDSServerLanguage(language, text) {
  if (text.trim().includes('cds watch') ||
      text.trim().includes('cds serve') ||
      text.trim().includes('cds run') ||
      text.trim().includes('mvn cds:watch')
    ) {
    return 'cds server'
  }
  return language
}

// RULE: CAP Notebooks are native in VS Code so the command `code` becomes `cd`
function replaceCodeByCd(text) {
  if (text.trim().startsWith('code ')) {
    return text.replace(/^code/g, 'cd')
  }
  return text
}
