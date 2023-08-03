const cspellRegExp = /^(.*\.md)(:\d+:?\d*)\s*- Unknown word \((.*?)\)\s+-- (.*?) Suggestions: (\[.*\])$/
const markdownlintRegExp = /^(.*\.md)(:\d+:?\d*) (MD\d+)\/\S+\s+(.+) \[(.*:)?\s*(.*)\]$/

const createSuggestionText = (suggestion) => '```suggestion\n' + suggestion + '\n```\n'

const createCspellSuggestionText = (suggestion, other) => createSuggestionText(suggestion) + `Or maybe one of these: ${other.map(el => `**${el}**`).join(', ')}?`

const createWordsWithoutSuggestionsText = (words) => `For the following words no suggestions could be found, consider adding them to the word list:\n${words.map(word => `* ${word}\n`).join('')}`

const createUnknownWordComment = (word) => `Fix the spelling mistake in "**${word}**" or add it to the **project-words.txt** list.`

const createMissingCodeFencesText = (lines) =>
`
\`\`\`\`suggestion
${lines.join('\n')}
\`\`\`\`

Please add a language tag. For plain text add \`txt\` as language tag.
`

const getNoEmptyLinkText = () => 'No empty links. Please provide a link value.'

const getSpellingCorrectionTip = () =>
`
Generally, for each spelling mistake there are 2 ways to fix it:
1. Fix the spelling mistake and commit it.
2. The word is incorrectly reported as misspelled &#8594; put the word on the **project-words.txt** list, located in the root project directory.
`

module.exports = async ({ github, require, exec, core }) => {
    const { readFileSync, existsSync } = require('fs')
    const { join } = require('path')
    const { SHA, BASE_DIR, BASE_SHA, PULL_NUMBER, HEAD_SHA } = process.env

    const cspellLogFile = join(BASE_DIR, 'CSPELL.log')
    const markdownlintLogFile = join(BASE_DIR, 'MARKDOWNLINT.log')
    console.log(cspellLogFile)
    console.log(markdownlintLogFile)
    const comments = []
    let body = ''
    let lintErrorsText = ''
    let spellingMistakesText = ''
    console.log(existsSync(markdownlintLogFile))
    if (existsSync(markdownlintLogFile)) {
        const matches = readFileSync(markdownlintLogFile, 'utf-8')
            .split('\n')
            .filter(Boolean)
            .map(line => line.replace(`${BASE_DIR}/`, '').match(markdownlintRegExp))

        for(let [error, path, pointer, rule, description, contextKey = '', contextValue] of matches) {
            console.log(error)
            // MD011/no-reversed-links
            if (rule === 'MD011') {
                const { line, position } = await findPositionInDiff(contextValue, path)

                if (!line || position < 0) {
                    continue
                }

                const [, link, text] = contextValue.match(/\((.*?)\)\[(.*?)\]/)

                const suggestion = line.replace(contextValue, `[${text}](${link})`).replace('+', '')

                const commentBody = createSuggestionText(suggestion)

                comments.push({ path, position, body: commentBody })
            }

            let context = `[${contextKey ? contextKey + ' ' : ''}${contextValue}]`.trim()

            // Rule MD042/no-empty-links
            if (rule === 'MD042') {
                context = context.replace(/(\[|\(|\]|\))/g, "\\$1")

                const emptyLink = contextValue.slice(1, -1)

                const { position } = await findPositionInDiff(emptyLink, path)

                if (position < 0) {
                    continue
                }

                comments.push({ path, position, body: getNoEmptyLinkText() })
            }

            // Rule MD040/fenced-code-language
            if (rule === 'MD040') {
                context = ''

                const codeBlockLines = findCodeBlock(path, +pointer.slice(1))

                const { start, end } = await findCodeBlockInDiff(codeBlockLines, path)

                if (start < 0 || end < 0) {
                    continue
                }

                codeBlockLines[0] = codeBlockLines[0] + 'txt'

                comments.push({ path, body: createMissingCodeFencesText(codeBlockLines), start_line: start, line: end })
            }

            lintErrorsText += `* **${path}**${pointer} ${description} ${context}\n`
        }
    }

    if (existsSync(cspellLogFile)) {
        let lines = readFileSync(cspellLogFile, 'utf-8').split('\n')
        lines = Array.from({ length: lines.length / 2 }, (_el, idx) => lines[idx * 2] + lines[idx * 2 + 1].replace(/\t/g, ''))

        // we will create a review comment for each match
        const matches = lines.map(line => line.replace(`${BASE_DIR}/`, '').match(cspellRegExp))

        const wordsWithoutSuggestions = []

        for (const [error, path, pointer , word, context, suggestionString] of matches) {

            // from "[s1, s2, s3]" to [ "s1", "s2", "s3" ]
            const suggestions = suggestionString
                .slice(1, -1) // remove brackets
                .replace(/ /g, '')
                .split(',')
                .filter(Boolean) // remove empty strings

            const { line, position } = await findPositionInDiff(context, path)

            if (!line || position < 0) {
                continue
            }

            if (suggestions.length > 0) {
                // replace word with first suggestions and remove first "+" sign
                const suggestion = line.replace(word, suggestions[0]).replace('+', '')

                const commentBody = createCspellSuggestionText(suggestion, suggestions.slice(1))

                comments.push({ path, position, body: commentBody })
            } else {
                comments.push({ path, position, body: createUnknownWordComment(word) })

                wordsWithoutSuggestions.push(word)
            }

            spellingMistakesText += `* **${path}**${pointer} Unknown word "**${word}**"\n`
        }

        if (wordsWithoutSuggestions.length > 0) {
            spellingMistakesText += `\n${createWordsWithoutSuggestionsText(wordsWithoutSuggestions)}\n`
        }

        if (matches.length > 0) {
            spellingMistakesText += `${getSpellingCorrectionTip()}\n`
        }

    }

    if (lintErrorsText) {
        body += `Linting Errors\n---\n${lintErrorsText}`
    }

    if (spellingMistakesText) {
        body += `\nSpelling Mistakes\n---\n${spellingMistakesText}`
    }

    if (body) {
        await github.rest.pulls.createReview({
            owner: 'cap',
            repo: 'docs',
            pull_number: PULL_NUMBER,
            commit_id: HEAD_SHA,
            body,
            event: 'COMMENT',
            comments
        })
    }

    async function getDiff(file) {
        let diff = ''
        const opts = {
            listeners: {

                stdout: (data) => {
                    diff += data.toString();
                }
            }
        }

        await exec.exec(`git diff ${BASE_SHA} ${SHA} -- ${file}`, [], opts)

        return diff.split('\n')
    }

    async function findPositionInDiff(context, file) {
        const diff = await getDiff(file)

        const idxToStartingCoutingFrom = diff.findIndex(line => line.startsWith('@@'))
        const idxOfLineToSearch = diff.findIndex(line => line.trim().startsWith('+') && line.replace(/ /g, '').includes(context.replace(/ /g, '')))

        // context does not exist in diff --> errors is in file with diff, but errors was not introduced with current PR
        if (idxToStartingCoutingFrom === -1 || idxOfLineToSearch === -1) {
            return { position: -1 }
        }

        const position = idxOfLineToSearch - idxToStartingCoutingFrom

        return { line: diff[idxOfLineToSearch], position }
    }

    async function findCodeBlockInDiff(lines, file) {
        const diff = await getDiff(file)

        let start = -1
        let end = -1
        for (let i = 0; i < diff.length; i++) {
            for (let j = 0; j < lines.length; j++) {
                if (diff[i + j].replace(/[-+]/, '') !== lines[j]) {
                    break
                }

                if (j === lines.length - 1) {
                    start = i
                    end = i + j
                }
            }
        }

        if (start === -1 || end === -1) {
            return { start: -1, end: -1 }
        }

        const idxToStartingCoutingFrom = diff.findIndex(line => line.startsWith('@@'))

        return { start: start - idxToStartingCoutingFrom, end: end - idxToStartingCoutingFrom }
    }

    // startIdx starts at 1
    function findCodeBlock(file, startIdx) {
        const lines = readFileSync(file, 'utf-8').split(/\n\r?/)

        const endIdx = lines.findIndex((el, idx) => idx >= startIdx && /`{3,}/.test(el.trim()))

        return lines.slice(startIdx - 1, endIdx + 1)
    }
}
