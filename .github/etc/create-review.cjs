const cspellRegExp = /^(.*\.md)(:\d+:?\d*)\s*- Unknown word \((.*?)\)\s+-- (.*?) Suggestions: (\[.*\])$/
const markdownlintRegExp = /^(.*\.md)(:\d+:?\d*) ([^\s]+) (.*?)(\[.*?\])?( \[Context: .*\])?$/

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

const getInvalidUrlText = (text, link) => {
    const updatedLink = link.replace('http', 'https')

    return createSuggestionText(`${text}(${updatedLink})`)
}

const escapeMarkdownlink = (link) => link.replace(/(\[|\(|\]|\))/g, "\\$1")

const createSuggestContainerTypeText = (suggestion) => createSuggestionText(suggestion) + 'You have to specify a container type. Possible values: **info**, **tip**, **warning**, **danger**, **details**, **code-group**, **raw**.'

module.exports = async ({ github, require, exec, core }) => {
    const { readFileSync, existsSync } = require('fs')
    const { join } = require('path')
    const { SHA, BASE_DIR, BASE_SHA, PULL_NUMBER, HEAD_SHA, REPO, REPO_OWNER } = process.env

    const cspellLogFile = join(BASE_DIR, 'CSPELL.log')
    const markdownlintLogFile = join(BASE_DIR, 'MARKDOWNLINT.log')

    const comments = []
    let body = ''
    let lintErrorsText = ''
    let spellingMistakesText = ''

    const result = await github.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
        owner: REPO_OWNER,
        repo: REPO,
        pull_number: PULL_NUMBER
    })

    const linterErrors = []
    const spellingMistakes = []

    result.data
        .map(review => review.body.includes('<!-- Linter Review -->'))
        .forEach(review => {
            spellingMistakes.add(...review.match(/\*(.*) <!--Spelling Mistake-->/g))
            linterErrors.add(...review.match(/\*(.*) <!--Linter Errors-->/g))
        })

    if (existsSync(markdownlintLogFile)) {
        const matches = readFileSync(markdownlintLogFile, 'utf-8')
            .split('\n')
            .filter(Boolean)
            .map(line => line.replace(`${BASE_DIR}/`, '').match(markdownlintRegExp))

        /*
        test.md:15:1 MD011/no-reversed-links Reversed link syntax [(test)[link.de]] ->

            test.md:15:1 MD011/no-reversed-links Reversed link syntax [(test)[link.de]]
            test.md
            :15:1
            MD011/no-reversed-links
            Reversed link syntax
            [(test)[link.de]]

        */
        for (let [error, path, pointer, rule, description, details, context] of matches) {
            let contextText = ''
            let comment;

            if (rule === 'MD011/no-reversed-links') {
                const detailValue = details.slice(1, -1)

                contextText = `[Context: "${detailValue}"]`

                const { line, position } = await findPositionInDiff(detailValue, path)

                if (!line || position < 0) {
                    continue
                }

                const [, link, text] = detailValue.match(/\((.*?)\)\[(.*?)\]/)

                const suggestion = line.replace(detailValue, `[${text}](${link})`).replace('+', '')

                const commentBody = createSuggestionText(suggestion)

                comment = { path, position, body: commentBody }
            }

            if (rule === 'MD042/no-empty-links') {
                const link = context.match(/\[Context: "(\[.*?\]\(\))"/)[1]

                contextText = `[Context: "${escapeMarkdownlink(link)}"]`

                const { position } = await findPositionInDiff(link, path)

                if (position < 0) {
                    continue
                }

                comment = { path, position, body: getNoEmptyLinkText() }
            }

            if (rule === 'MD040/fenced-code-language') {
                contextText = ''

                const codeBlockLines = findCodeBlock(path, +pointer.slice(1))

                const { start, end } = await findCodeBlockInDiff(codeBlockLines, path)

                if (start < 0 || end < 0) {
                    continue
                }

                codeBlockLines[0] = codeBlockLines[0] + 'txt'

                comment = { path, body: createMissingCodeFencesText(codeBlockLines), start_line: start, line: end }
            }

            if (rule === 'search-replace') {
                // [prefer-https-links: https links should be prefered] -> prefer-https-links
                const ruleName = details.split(':')[0].slice(1)

                if (ruleName === 'prefer-https-links') {
                    const [, text, link] = context.match(/\[Context:.*(\[.*\])(\(.*\)).*\]/)

                    description = 'https links should be preferred'
                    contextText = `[Context: "${escapeMarkdownlink(text + link)}"]`

                    const { line, position } = await findPositionInDiff(text + link, path)

                    if (!line || position < 0) {
                        continue
                    }

                    comment = { path, position, body: getInvalidUrlText(text, link.slice(1, -1)) }
                }

                if (ruleName === 'custom-containers-requires-type') {
                    const [, row, column] = pointer.split(':')

                    const affectedLine = getLineFromFile(path, +row)

                    const containerType = suggestContainerType(affectedLine) || 'info'

                    const { line, position } = await findPositionInDiff(affectedLine, path)

                    if (!line || position < 0) {
                        continue
                    }

                    const correctedLine = `::: ${containerType} ${affectedLine.split(':::').slice(1).join('').trim()}`

                    description = 'container type should be specified'
                    contextText = `[Context: "${affectedLine}"]`

                    comment = { path, position, body: createSuggestContainerTypeText(correctedLine) }
                }
            }

            const text = `* **${path}**${pointer} ${description} ${contextText} <!--Linter Error-->\n`

            if (!linterErrors.find(text)) {
                lintErrorsText += text
                comments.push(comment)
            }
        }
    }

    if (existsSync(cspellLogFile)) {
        let lines = readFileSync(cspellLogFile, 'utf-8').split('\n')
        lines = Array.from({ length: lines.length / 2 }, (_el, idx) => lines[idx * 2] + lines[idx * 2 + 1].replace(/\t/g, ''))

        // we will create a review comment for each match
        const matches = lines.map(line => line.replace(`${BASE_DIR}/`, '').match(cspellRegExp))

        const wordsWithoutSuggestions = []

        for (const [error, path, pointer, word, context, suggestionString] of matches) {

            const text = `* **${path}**${pointer} Unknown word "**${word}**" <!--Spelling Mistake-->\n`

            if (spellingMistakes.find(text)) continue

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

            // Github requires that no path starts with './', but cspell provides the paths exactly in this format
            const properlyStructuredPath = path.replace(/^\.\//, '')

            if (suggestions.length > 0) {
                // replace word with first suggestions and remove first "+" sign
                const suggestion = line.replace(word, suggestions[0]).replace('+', '')

                const commentBody = createCspellSuggestionText(suggestion, suggestions.slice(1))

                comments.push({ path: properlyStructuredPath, position, body: commentBody })
            } else {
                comments.push({ path: properlyStructuredPath, position, body: createUnknownWordComment(word) })

                wordsWithoutSuggestions.push(word)
            }

            spellingMistakesText += text
        }

        if (wordsWithoutSuggestions.length > 0 && comments.length > 0) {
            spellingMistakesText += `\n${createWordsWithoutSuggestionsText(wordsWithoutSuggestions)}\n`
        }

        if (matches.length > 0 && comments.length > 0) {
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
        body = '<!-- Linter Review -->\n' + body

        await github.rest.pulls.createReview({
            owner: REPO_OWNER,
            repo: REPO,
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
            },
            cwd: BASE_DIR
        }

        await exec.exec(`git diff ${BASE_SHA} ${SHA} -- ${file}`, [], opts)

        return diff.split('\n')
    }

    async function findPositionInDiff(context, file) {
        const diff = await getDiff(file)

        const idxToStartingCoutingFrom = diff.findIndex(line => line.startsWith('@@') && !line.includes('<!--'))
        const idxOfLineToSearch = diff.findIndex(line => line.trim().startsWith('+') && line.replace(/ /g, '').includes(context.replace(/ /g, '')) && !line.includes('<!--'))

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
        const lines = readFileSync(join(BASE_DIR, file), 'utf-8').split(/\n\r?/)

        const endIdx = lines.findIndex((el, idx) => idx >= startIdx && /`{3,}/.test(el.trim()))

        return lines.slice(startIdx - 1, endIdx + 1)
    }

    function suggestContainerType(line) {
        return (line.toLowerCase().match(/(info|tip|warning|danger|details|code-group|raw)/) || [])[0]
    }

    function getLineFromFile(file, lineNumber) {
        return readFileSync(join(BASE_DIR, file), 'utf-8').split(/\n\r?/)[lineNumber - 1]
    }
}
