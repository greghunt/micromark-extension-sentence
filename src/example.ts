import fs from 'node:fs/promises'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { remarkSentence, rehypeSentence } from './index.js'

(async () => {
  const filePath = process.argv[2]
  
  if (!filePath) {
    console.error('Please provide a markdown file path as an argument')
    console.error('Usage: node example.js <markdown-file-path>')
    process.exit(1)
  }

  try {
    const buf = await fs.readFile(filePath)
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
})(); 