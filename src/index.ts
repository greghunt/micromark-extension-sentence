import { visit } from 'unist-util-visit'
import { u } from 'unist-builder'
import type { Extension, State, Code, Effects } from 'micromark-util-types'
import type { Root as MdastRoot, Text, Parent } from 'mdast'
import type { Root as HastRoot, Element } from 'hast'
import type { SentenceNode } from './types'

/**
 * Micromark extension for sentence constructs
 * This extension allows parsing and processing text at the sentence level,
 * with sentences defined by '.', '!', or '?' delimiters.
 */

// Constants
const DELIMITERS = ['.', '!', '?'] as const
const SENTENCE_END_REGEX = new RegExp(`([${DELIMITERS.join('')}])(?:\\s+|$|"|'|\\)|\\]|})`, 'g')

// Types
type Delimiter = typeof DELIMITERS[number]

interface SentenceMatch {
    text: string
    delimiter: Delimiter
    remainingText: string
}

/**
 * Create an extension for micromark to handle sentence parsing
 */
export function sentenceExtension(): Extension {
    const textExtension: Extension['text'] = {}
    
    // Create tokenizers for each delimiter
    DELIMITERS.forEach(delimiter => {
        textExtension[delimiter.charCodeAt(0)] = {
            name: 'sentenceDelimiter',
            tokenize: tokenizeSentenceDelimiter(delimiter)
        }
    })

    return {
        text: textExtension
    }
}

interface SentenceHtmlExtension {
    enter: {
        sentenceBoundary: (this: { tag: (tag: string) => void }) => void;
        sentenceDelimiter: (this: { tag: (tag: string) => void }) => void;
    };
    exit: {
        sentenceBoundary: (this: { tag: (tag: string) => void }) => void;
        sentenceDelimiter: (this: { tag: (tag: string) => void }) => void;
    };
}

/**
 * HTML extension for sentence constructs in micromark
 */
export function sentenceHtmlExtension(): SentenceHtmlExtension {
    return {
        enter: {
            sentenceBoundary(this) {
                this.tag('<span class="sentence-boundary">')
            },
            sentenceDelimiter(this) {
                this.tag('<span class="sentence-delimiter">')
            }
        },
        exit: {
            sentenceBoundary(this) {
                this.tag('</span>')
            },
            sentenceDelimiter(this) {
                this.tag('</span>')
            }
        }
    }
}

/**
 * A Remark plugin for handling sentence constructs
 * This approach wraps entire sentences, not just delimiters
 */
export function remarkSentence() {
    return function transformer(tree: MdastRoot): MdastRoot {
        // Process text nodes to find and mark sentences
        const processTextNode = (node: Text, index: number | undefined, parent: Parent | undefined) => {
            if (!parent || index === undefined) return

            // Skip nodes that don't contain sentence endings
            if (!node.value.match(/[.!?]/)) return

            // Split the text by sentence delimiters
            const sentences: Array<SentenceNode | Text> = []
            let lastIndex = 0
            let match: RegExpExecArray | null

            while ((match = SENTENCE_END_REGEX.exec(node.value)) !== null) {
                const { text, delimiter, remainingText } = processSentenceMatch(match, node.value, lastIndex)
                
                sentences.push(createSentenceNode(text, delimiter))

                if (match[0].length > 1) {
                    sentences.push(u('text', ' '))
                }

                lastIndex = match.index + match[0].length
            }

            if (lastIndex < node.value.length) {
                sentences.push(u('text', node.value.substring(lastIndex)))
            }

            // Only replace if we found sentences
            if (sentences.length > 0) {
                // Replace the original text node with our sentence nodes
                parent.children.splice(index, 1, ...sentences)
            }
        }

        // Visit all text nodes
        visit(tree, 'text', processTextNode)

        return tree
    }
}

/**
 * HTML handler for sentence nodes in rehype
 */
export function rehypeSentence() {
    return function transformer(tree: HastRoot): HastRoot {
        // First pass - handle sentence delimiters inside sentences
        visit(tree, 'element', (node: Element) => {
            if (node.children) {
                // Look for sentenceDelimiter nodes to convert to span elements
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    if (child.type === 'sentenceDelimiter' && 'value' in child) {
                        // Replace with proper span element using u
                        node.children[i] = u('element', {
                            tagName: 'span',
                            properties: { className: ['sentence-delimiter'] }
                        }, [u('text', child.value as string)])
                    }
                }
            }
        });

        // Second pass - process plain text nodes that contain sentence endings
        visit(tree, 'element', (node: Element) => {
            if (node.tagName === 'p' && node.children) {
                let modified = false;

                // Process each text node in the paragraph
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];

                    // Only process text nodes that contain sentence endings
                    if (child.type === 'text' && 'value' in child && /[.!?]/.test(child.value as string)) {
                        let lastIndex = 0
                        let match: RegExpExecArray | null
                        const text = child.value as string

                        while ((match = SENTENCE_END_REGEX.exec(text)) !== null) {
                            const { text: sentenceText, delimiter, remainingText } = processSentenceMatch(match, text, lastIndex)
                            
                            node.children.splice(i, 1, createSentenceElement(sentenceText, delimiter))

                            if (match[0].length > 1) {
                                node.children.splice(i + 1, 0, u('element', { tagName: 'span', properties: {} }, [u('text', ' ')]))
                            }

                            lastIndex = match.index + match[0].length
                        }

                        if (lastIndex < text.length) {
                            node.children.splice(i, 1, u('element', { tagName: 'span', properties: {} }, [u('text', text.substring(lastIndex))]))
                        }

                        modified = true;
                        // Adjust index to account for the new nodes
                        i += node.children.length - 1;
                    }
                }
            }
        });

        return tree;
    }
}

// Utility functions
function createSentenceNode(text: string, delimiter: Delimiter): SentenceNode {
    return u('sentence', {
        data: {
            hName: 'span',
            hProperties: { className: ['sentence'] }
        }
    }, [
        u('text', text),
        u('sentenceDelimiter', delimiter)
    ])
}

function createSentenceElement(text: string, delimiter: Delimiter): Element {
    return u('element', {
        tagName: 'span',
        properties: { className: ['sentence'] }
    }, [
        u('text', text),
        u('element', {
            tagName: 'span',
            properties: { className: ['sentence-delimiter'] }
        }, [u('text', delimiter)])
    ])
}

function processSentenceMatch(match: RegExpExecArray, text: string, lastIndex: number): SentenceMatch {
    const sentenceWithDelimiter = text.substring(lastIndex, match.index + 1)
    const delimiter = match[1] as Delimiter
    const sentenceText = sentenceWithDelimiter.substring(0, sentenceWithDelimiter.length - 1)
    const remainingText = text.substring(match.index + match[0].length)
    
    return { text: sentenceText, delimiter, remainingText }
}

/**
 * Factory function to create tokenizers for different sentence delimiters
 */
function tokenizeSentenceDelimiter(delimiter: Delimiter) {
    const delimiterCode = delimiter.charCodeAt(0)

    /**
     * Tokenize a sentence delimiter
     */
    return function tokenize(effects: Effects, ok: State, nok: State): State {
        return function start(code: Code): State {
            if (code !== delimiterCode) return nok(code) as State

            effects.enter('sentenceBoundary')
            effects.enter('sentenceDelimiter')
            effects.consume(code)
            effects.exit('sentenceDelimiter')
            effects.exit('sentenceBoundary')

            return ok
        }
    }
} 