#!/usr/bin/env node
import fs from 'node:fs/promises'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { inspect } from 'util'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import type { Argv } from 'yargs'
import { remarkSentence, rehypeSentence } from '@/micromark-extension-sentence/index.js'
import { semtree } from '@/mdast-util-semtree/index.js'
import type { Root } from 'mdast'

type OutputFormat = 'html' | 'ast'

interface ProcessOptions {
    file: string
    useSentence?: boolean
    useSemtree?: boolean
    output: OutputFormat
}

async function processMarkdown(options: ProcessOptions) {
    try {
        const buf = await fs.readFile(options.file)
        const input = buf.toString()

        // Create a processor for parsing and initial transformations
        const parseProcessor = unified()
            .use(remarkParse)

        // Apply sentence plugin if requested
        if (options.useSentence) {
            parseProcessor.use(remarkSentence)
        }

        // Parse the input and run initial transformations
        let tree = parseProcessor.parse(input)
        let result = parseProcessor.runSync(tree) as Root

        // Apply semtree transformation if requested
        if (options.useSemtree) {
            result = semtree()(result)
        }

        // If the output should be HTML, create a new processor for HTML generation
        if (options.output === 'html') {
            const htmlProcessor = unified()
                .use(remarkRehype)
            
            // Apply rehype-sentence if the sentence option is enabled
            if (options.useSentence) {
                htmlProcessor.use(rehypeSentence)
            }
            
            htmlProcessor.use(rehypeStringify)
            
            // Generate HTML using the new processor
            const html = htmlProcessor.stringify(htmlProcessor.runSync(result))
            console.log(String(html))
        } else {
            // Output the AST
            console.log(inspect(result, { depth: null, colors: true }))
        }
    } catch (error) {
        console.error('Error processing file:', error instanceof Error ? error.message : error)
        process.exit(1)
    }
}

yargs(hideBin(process.argv))
    .command('process <file>', 'Process a markdown file with specified plugins and output format', (yargs: Argv) => {
        return yargs
            .positional('file', {
                describe: 'Path to the markdown file',
                type: 'string',
                demandOption: true
            })
            .option('sentence', {
                describe: 'Use the sentence plugin',
                type: 'boolean',
                default: true
            })
            .option('semtree', {
                describe: 'Apply semantic tree transformation',
                type: 'boolean',
                default: false
            })
            .option('output', {
                describe: 'Output format (ast or html)',
                type: 'string',
                choices: ['ast', 'html'],
                default: 'html'
            })
    }, (argv) => {
        return processMarkdown({
            file: argv.file,
            useSentence: argv.sentence,
            useSemtree: argv.semtree,
            output: argv.output as OutputFormat
        })
    })
    .demandCommand(1, 'You need to specify a command')
    .help()
    .parse()
