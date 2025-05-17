# Unified Semantics

A collection of packages that adds semantic layers to the [unified](https://github.com/unifiedjs/unified) ecosystem. 

## Packages

- **micromark-extension-sentence** is an extension for markdown that adds a `sentence` construct. This is an important missing element in both markdown and HTML, since it's a semantic unit for an idea. Paragraphs are currently the atomic semantic unit in both languages, but in reality they are collections of sentences.
- **mdast-util-semtree** is a transformer utility for markdown AST. It doesn't effect compiled output. More importantly, it semantically nests nodes to their proper meaningful depth. It's implied in most documents that the content that follows an H1 is a child of that H1. Similarly, H2's are subtopics of H1s and themselves should nest lower-level node elements like H3s and paragraphs. This is useful if we want to get the content that belongs to a particular node based on its semantic hiearchy.

## CLI

Process markdown files with various plugins and output options:

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

Options:
- `--output`: Choose output format (`html` or `ast`), default is `html`
- `--sentence`: Enable sentence plugin (enabled by default)
- `--no-sentence`: Disable sentence plugin
- `--semtree`: Apply semantic tree transformation (disabled by default)