import { describe, test, expect } from 'vitest'
import { sentenceExtension, remarkSentence, rehypeSentence } from '../packages/micromark-extension-sentence'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkStringify from 'remark-stringify'
import { micromark } from 'micromark'
import { u } from 'unist-builder'
import { visit } from 'unist-util-visit'
import type { Root, Text } from 'mdast'

describe('sentenceExtension', () => {
  test('should be a function', () => {
    expect(typeof sentenceExtension).toBe('function')
  })

  test('should return an extension object', () => {
    const extension = sentenceExtension()
    expect(extension).toHaveProperty('text')
  })
})

describe('remarkSentence', () => {
  test('transforms text nodes with sentence delimiters', () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkSentence)
    
    const markdown = 'This is a sentence. This is another sentence.'
    const result = processor.parse(markdown) as Root
    
    // Apply transformer manually since we can't process without compiler
    const transformedResult = remarkSentence()(result)
    
    // Check that text nodes containing sentences are processed
    let foundSentence = false
    visit(transformedResult, (node) => {
      if (node.type === 'sentence') {
        foundSentence = true
      }
    })
    
    expect(foundSentence).toBe(true)
  })
  
  test('handles text without sentence delimiters', () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkSentence)
    
    const markdown = 'This is a text without delimiters'
    const result = processor.parse(markdown) as Root
    
    // Apply transformer manually
    const transformedResult = remarkSentence()(result)
    
    // The text should remain unprocessed
    let textNodeFound = false
    visit(transformedResult, 'text', (node: Text) => {
      if (node.value === 'This is a text without delimiters') {
        textNodeFound = true
      }
    })
    
    expect(textNodeFound).toBe(true)
  })
})

describe('end-to-end integration', () => {
  test('processes sentences in a Markdown document', () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkSentence)
      .use(remarkRehype)
      .use(rehypeSentence)
      .use(rehypeStringify)
    
    const markdown = 'This is a test. This is another test!'
    const html = processor.processSync(markdown).toString()
    
    // Check if the output contains spans with sentence classes
    expect(html).toContain('<span class="sentence">')
  })
}) 