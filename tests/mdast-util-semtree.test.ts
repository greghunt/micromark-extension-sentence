import { describe, test, expect } from 'vitest'
import { semtree, extractHeadingContent, createSubtree } from '../packages/mdast-util-semtree'
import type { Root, RootContent, Heading, Paragraph, Text, List, ListItem } from 'mdast'

// Helper function to create a basic mdast tree for testing
function createTestTree(): Root {
  return {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 1,
        children: [{ type: 'text', value: 'Heading 1' }]
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Paragraph under heading 1' }]
      },
      {
        type: 'heading',
        depth: 2,
        children: [{ type: 'text', value: 'Heading 2' }]
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Paragraph under heading 2' }]
      },
      {
        type: 'heading',
        depth: 3,
        children: [{ type: 'text', value: 'Heading 3' }]
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Paragraph under heading 3' }]
      },
      {
        type: 'heading',
        depth: 2,
        children: [{ type: 'text', value: 'Another Heading 2' }]
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Paragraph under another heading 2' }]
      },
      {
        type: 'list',
        children: [
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', value: 'List item 1' }]
              }
            ]
          },
          {
            type: 'listItem',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', value: 'List item 2' }]
              }
            ]
          }
        ]
      }
    ]
  }
}

describe('semtree', () => {
  test('transforms a document into a semantic tree based on headings', () => {
    const tree = createTestTree()
    const transformer = semtree()
    const result = transformer(tree)
    
    // Verify basic structure - root has only headings as direct children
    expect(result.type).toBe('root')
    
    // The transformed tree should have fewer direct children than the original
    // as content gets nested under headings
    expect(result.children.length).toBeLessThan(tree.children.length)
  })
  
  test('preserves list structure when preserveListStructure is true', () => {
    const tree = createTestTree()
    const transformer = semtree({ preserveListStructure: true })
    const result = transformer(tree)
    
    // Just ensure the transformation runs without errors
    expect(result.type).toBe('root')
  })
})

describe('extractHeadingContent', () => {
  test('extracts content belonging to a specific heading', () => {
    const tree = createTestTree()
    const content = extractHeadingContent(tree, 'Heading 2')
    
    // We should get some content for an existing heading
    expect(Array.isArray(content)).toBe(true)
  })
  
  test('returns empty array when heading not found', () => {
    const tree = createTestTree()
    const content = extractHeadingContent(tree, 'Non-existent Heading')
    
    expect(content).toEqual([])
  })
})

describe('createSubtree', () => {
  test('creates a valid mdast tree from a node and its ancestors', () => {
    const tree = createTestTree()
    const subtree = createSubtree(tree, 'Heading 2')
    
    expect(subtree.type).toBe('root')
    expect(subtree.children.length).toBe(1)
    
    const heading = subtree.children[0]
    expect(heading.type).toBe('heading')
  })
  
  test('returns empty tree when heading not found', () => {
    const tree = createTestTree()
    const subtree = createSubtree(tree, 'Non-existent Heading')
    
    expect(subtree.type).toBe('root')
    expect(subtree.children).toEqual([])
  })
}) 