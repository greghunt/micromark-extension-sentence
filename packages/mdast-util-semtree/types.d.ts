import type { Root, RootContent, Heading, Parent } from 'mdast'

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
 * Creates a transformer function that organizes mdast nodes into a semantic hierarchy
 * based on their heading levels
 */
export function semtree(options?: SemtreeOptions): (tree: Root) => Root

/**
 * Utility function to extract content belonging to a specific heading
 */
export function extractHeadingContent(tree: Root, headingText: string): RootContent[]

/**
 * Creates a valid mdast tree from a node and its ancestors
 */
export function createSubtree(tree: Root, headingText: string): Root 