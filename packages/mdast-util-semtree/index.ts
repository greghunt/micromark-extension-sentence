import { visit } from 'unist-util-visit'
import type { Root, RootContent, Heading, Paragraph, List, ListItem, Parent } from 'mdast'

/**
 * mdast-util-semtree
 * 
 * A transformer for mdast AST that organizes nodes into a semantic tree structure based on headings.
 * The transformer follows these rules:
 * - All nodes are organized as children of their nearest highest-level heading
 * - H1 headings are direct children of the root
 * - H2, H3, etc. headings are children of their nearest highest-level heading
 * - Paragraphs, lists, etc. are children of their nearest heading
 * - List items are preserved as children of lists
 */

// Type to identify headings by their level
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

/**
 * Configuration options for the semantic tree transformer
 */
export interface SemtreeOptions {
  /**
   * Whether to preserve the original list item structure (default: true)
   */
  preserveListStructure?: boolean
}

/**
 * The default options for the semantic tree transformer
 */
const defaultOptions: SemtreeOptions = {
  preserveListStructure: true
}

/**
 * Creates a transformer function that organizes mdast nodes into a semantic hierarchy
 * based on their heading levels
 */
export function semtree(options: SemtreeOptions = {}) {
  const opts = { ...defaultOptions, ...options }

  return function transformer(tree: Root): Root {
    // Create a new tree with the same type as the original
    const newTree: Root = { type: 'root', children: [] }
    
    // Track the current parent nodes at each heading level
    const parents: Record<HeadingLevel, Parent> = {
      1: newTree,
      2: newTree,
      3: newTree,
      4: newTree,
      5: newTree,
      6: newTree
    }
    
    // Keep track of the current heading level
    let currentLevel: HeadingLevel = 1
    
    // Process each node in the original tree
    tree.children.forEach(node => {
      if (node.type === 'heading') {
        const level = node.depth as HeadingLevel
        currentLevel = level
        
        // Determine the parent for this heading based on its level
        let parentNode: Parent = newTree // Initialize with root as default
        
        if (level === 1) {
          // H1 headings are direct children of the root
          parentNode = newTree
        } else {
          // Find the nearest heading of higher level to be the parent
          for (let i = level - 1; i >= 1; i--) {
            if (parents[i as HeadingLevel] !== newTree) {
              parentNode = parents[i as HeadingLevel]
              break
            }
          }
        }
        
        // Clone the heading node
        const headingNode: Heading = { ...node, children: [...node.children] }
        
        // If the heading doesn't have a children array, add one
        if (!('children' in headingNode)) {
          (headingNode as Parent).children = []
        }
        
        // Add the heading to its parent
        parentNode.children.push(headingNode)
        
        // Set this heading as the current parent for its level and all lower levels
        parents[level] = headingNode as Parent
        for (let i = level + 1; i <= 6; i++) {
          parents[i as HeadingLevel] = headingNode as Parent
        }
      } else if (node.type === 'list' && opts.preserveListStructure) {
        // For lists, we want to preserve the list->list item structure
        // Clone the list and its items
        const listNode: List = { 
          ...node, 
          children: node.children.map(item => {
            if (item.type === 'listItem') {
              return {
                ...item,
                children: [...item.children]
              } as ListItem
            }
            return item
          })
        }
        
        // Add the list to the current parent based on heading level
        parents[currentLevel].children.push(listNode)
      } else {
        // For other content (paragraphs, code blocks, etc.)
        // Clone the node
        const contentNode = { ...node }
        
        // If it has children, clone those too
        if ('children' in node && Array.isArray(node.children)) {
          (contentNode as Parent).children = [...node.children]
        }
        
        // Add to the current parent based on heading level
        parents[currentLevel].children.push(contentNode as RootContent)
      }
    })
    
    return newTree
  }
}

/**
 * Utility function to extract content belonging to a specific heading
 */
export function extractHeadingContent(tree: Root, headingText: string): RootContent[] {
  const result: RootContent[] = []
  
  // Find the heading node by its text content
  visit(tree, 'heading', (node: Heading) => {
    // Check if the heading text matches
    const headingTextContent = node.children
      .filter(child => child.type === 'text')
      .map(child => (child as any).value)
      .join('')
      
    if (headingTextContent === headingText) {
      // Return the children of this heading, which represent its content
      if ('children' in node) {
        result.push(...(node as Parent).children.filter(child => child.type !== 'heading'))
      }
    }
  })
  
  return result
}

/**
 * Creates a valid mdast tree from a node and its ancestors
 */
export function createSubtree(tree: Root, headingText: string): Root {
  const newTree: Root = { type: 'root', children: [] }
  
  // Find the heading node and its content
  let foundHeading = false
  
  visit(tree, 'heading', (node: Heading) => {
    if (foundHeading) return
    
    // Check if the heading text matches
    const headingTextContent = node.children
      .filter(child => child.type === 'text')
      .map(child => (child as any).value)
      .join('')
      
    if (headingTextContent === headingText) {
      foundHeading = true
      
      // Add this heading and all its content to the new tree
      if ('children' in node) {
        newTree.children.push(node as RootContent)
      }
    }
  })
  
  return newTree
}
