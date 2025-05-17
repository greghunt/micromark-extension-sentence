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

async function parseCommand(argv: { file: string }) {
    try {
        const buf = await fs.readFile(argv.file)
        const input = buf.toString()

        const processor = unified()
            .use(remarkParse)
            .use(remarkSentence)
            .use(remarkRehype)
            .use(rehypeSentence)
            .use(rehypeStringify)

        const result = processor.processSync(input).toString()
        console.log(result)
    } catch (error) {
        console.error('Error processing file:', error instanceof Error ? error.message : error)
        process.exit(1)
    }
}

async function astCommand(argv: { file: string; html?: boolean }) {
    try {
        const buf = await fs.readFile(argv.file)
        const input = buf.toString()

        const processor = unified()
            .use(remarkParse)
            .use(remarkSentence)

        if (argv.html) {
            processor.use(remarkRehype)
            processor.use(rehypeSentence)
        }

        const finalAST = processor.runSync(
            processor.parse(input)
        )

        console.log(inspect(finalAST, { depth: null, colors: true }))
    } catch (error) {
        console.error('Error processing file:', error instanceof Error ? error.message : error)
        process.exit(1)
    }
}

yargs(hideBin(process.argv))
    .command('parse <file>', 'Parse a markdown file and output HTML', (yargs: Argv) => {
        return yargs.positional('file', {
            describe: 'Path to the markdown file',
            type: 'string',
            demandOption: true
        })
    }, parseCommand)
    .command('ast <file>', 'Show the AST of a markdown file', (yargs: Argv) => {
        return yargs
            .positional('file', {
                describe: 'Path to the markdown file',
                type: 'string',
                demandOption: true
            })
            .option('html', {
                describe: 'Include HTML transformation in AST',
                type: 'boolean',
                default: false
            })
    }, astCommand)
    .demandCommand(1, 'You need to specify a command')
    .help()
    .parse()
