import type { RootContent } from 'mdast'
import type { TokenTypeMap } from 'micromark-util-types'
import type { Element, Text } from 'hast'

declare module 'micromark-util-types' {
    interface TokenTypeMap {
        sentenceBoundary: string
        sentenceDelimiter: string
    }
}

declare module 'mdast' {
    interface RootContentMap {
        sentence: SentenceNode
        sentenceDelimiter: SentenceDelimiterNode
    }
}

declare module 'hast' {
    interface ElementContentMap {
        sentenceDelimiter: {
            type: 'sentenceDelimiter'
            value: string
        }
    }
}

export interface SentenceNode {
    type: 'sentence'
    children: Array<RootContent | SentenceDelimiterNode>
    data?: {
        hName: string
        hProperties: {
            className: string[]
        }
    }
}

export interface SentenceDelimiterNode {
    type: 'sentenceDelimiter'
    value: string
} 