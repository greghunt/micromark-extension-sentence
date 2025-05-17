import fs from 'node:fs/promises'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { inspect } from 'util'
import { remarkSentence, rehypeSentence } from './index.js'

(async () => {
  const args = process.argv.slice(2)
  const html = args.includes('--html')

  const buf = await fs.readFile('example.md')
  const input = buf.toString()

  const processor = unified()
      .use(remarkParse)
      .use(remarkSentence)

  if (html) {
      processor.use(remarkRehype)
      processor.use(rehypeSentence)
  }

  const finalAST = processor.runSync(
      processor.parse(input)
  )

  console.log(inspect(finalAST, { depth: null, colors: true }))
})(); 