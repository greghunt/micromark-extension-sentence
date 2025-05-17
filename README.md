# Unified Semantics

A collection of packages that adds semantic layers to the [unified](https://github.com/unifiedjs/unified) ecosystem. These tools enhance markdown processing by introducing semantic constructs and transformations that better represent the natural structure of documents.

## Packages

### [micromark-extension-sentence](packages/micromark-extension-sentence)

[![npm version](https://img.shields.io/npm/v/micromark-extension-sentence.svg)](https://www.npmjs.com/package/micromark-extension-sentence)

An extension for markdown that adds a `sentence` construct. This is an important missing element in both markdown and HTML, since it's a semantic unit for an idea. Paragraphs are currently the atomic semantic unit in both languages, but in reality they are collections of sentences.

### [mdast-util-semtree](packages/mdast-util-semtree)

[![npm version](https://img.shields.io/npm/v/mdast-util-semtree.svg)](https://www.npmjs.com/package/mdast-util-semtree)

A transformer utility for markdown AST that semantically nests nodes to their proper meaningful depth. It doesn't affect compiled output, but provides a more accurate representation of document structure:

- Content following an H1 is treated as a child of that H1
- H2s are recognized as subtopics of H1s
- Lower-level elements (H3s, paragraphs) are properly nested under their parent headings

This semantic hierarchy makes it easier to extract content that belongs to a particular node based on its structural context.

## CLI

The `unified-semantics` CLI tool processes markdown files with various plugins and output options.

### Usage

```bash
# Basic usage (outputs HTML with sentence plugin enabled by default)
pnpm cli process tests/fixtures/markdown/simple.md

# Output the AST instead of HTML
pnpm cli process tests/fixtures/markdown/simple.md --output ast

# Apply semantic tree transformation
pnpm cli process tests/fixtures/markdown/simple.md --semtree

# Disable sentence plugin
pnpm cli process tests/fixtures/markdown/simple.md --no-sentence

# Output AST with semtree transformation
pnpm cli process tests/fixtures/markdown/simple.md --output ast --semtree

# Full options example
pnpm cli process tests/fixtures/markdown/simple.md --output ast --semtree --sentence
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--output` | Output format (`html` or `ast`) | `html` |
| `--sentence` | Enable sentence plugin | `true` |
| `--no-sentence` | Disable sentence plugin | - |
| `--semtree` | Apply semantic tree transformation | `false` |