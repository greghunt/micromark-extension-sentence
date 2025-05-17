# Unified Semantics

A collection of packages that adds semantic layers to the [unified](https://github.com/unifiedjs/unified) ecosystem. 

## Packages

- **micromark-extension-sentence** is an extension for markdown that adds a `sentence` construct. This is an important missing element in both markdown and HTML, since it's a semantic unit for an idea. Paragraphs are currently the atomic semantic unit in both languages, but in reality they are collections of sentences.
- **mdast-util-semtree** is a transformer utility for markdown AST. It doesn't effect compiled output. More importantly, it semantically nests nodes to their proper meaningful depth. It's implied in most documents that the content that follows an H1 is a child of that H1. Similarly, H2's are subtopics of H1s and themselves should nest lower-level node elements like H3s and paragraphs. This is useful if we want to get the content that belongs to a particular node based on its semantic hiearchy.

## CLI

- `pnpm cli parse tests/fixtures/markdown/simple.md`
- `pnpm cli ast tests/fixtures/markdown/simple.md`