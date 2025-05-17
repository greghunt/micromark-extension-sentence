# mdast-util-semtree

A transformer utility for mdast AST that semantically nests nodes according to their logical hierarchy.

## Features

- Organizes mdast nodes into a semantic tree structure based on heading levels
- All nodes are organized as children of their nearest highest-level heading
- H1 headings are direct children of the root
- H2, H3, etc. headings are children of their nearest highest-level heading
- Paragraphs, lists, etc. are children of their nearest heading
- List items are preserved as children of lists

## Installation

```bash
npm install mdast-util-semtree
# or
pnpm add mdast-util-semtree
```

## Usage

```js
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { semtree, extractHeadingContent } from 'mdast-util-semtree'

// Parse some markdown
const processor = unified().use(remarkParse)
const mdast = processor.parse(`
# Main Heading

Some content under main heading.

## Sub Heading

Content under sub heading.

- List item 1
- List item 2
`)

// Convert to semantic tree
const semanticTree = semtree()(mdast)

// You can now extract content for specific headings
const subHeadingContent = extractHeadingContent(semanticTree, 'Sub Heading')
```

## API

### `semtree([options])`

Returns a transformer that takes an mdast tree and returns a new tree with nodes organized hierarchically.

#### Options

- `preserveListStructure` (boolean, default: `true`): Preserves the list->list item structure.

### `extractHeadingContent(tree, headingText)`

Extracts content belonging to a specific heading.

- `tree`: The semantic tree to extract from
- `headingText`: The text content of the heading to extract from

### `createSubtree(tree, headingText)`

Creates a new valid mdast tree containing just the specified heading and its content.

- `tree`: The semantic tree to extract from
- `headingText`: The text content of the heading to extract 