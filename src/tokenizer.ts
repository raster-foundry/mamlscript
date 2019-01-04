export enum TokenType {
  Identifier,
  Constant,
  AssociativeMapping,
  Operator,
  GroupingStart,
  GroupingEnd,
  BlockStart,
  BlockEnd,
  Whitespace,
  ArgumentDelimiter
}

const tokenMatchers = [
  {
    type: TokenType.Whitespace,
    matcher: /^(\s)+/
  },
  {
    type: TokenType.Identifier,
    matcher: /^(\b[A-Za-z_]+[A-za-z0-9_]*)/
  },
  {
    type: TokenType.Constant,
    matcher: /^(\b[0-9.]+)/
  },
  {
    type: TokenType.AssociativeMapping,
    matcher: /^(->)/
  },
  {
    type: TokenType.Operator,
    matcher: /^(\+|\-|\/|\*|=|\^)/
  },
  {
    type: TokenType.GroupingStart,
    matcher: /^(\()/
  },
  {
    type: TokenType.GroupingEnd,
    matcher: /^(\))/
  },
  {
    type: TokenType.BlockStart,
    matcher: /^({)/
  },
  {
    type: TokenType.BlockEnd,
    matcher: /^(})/
  },
  {
    type: TokenType.ArgumentDelimiter,
    matcher: /^(,)/
  }
]

const operatorBindingpower: {
  [key: string]: number
} = {
  '^': 1000,
  '/': 100,
  '*': 100,
  '+': 10,
  '-': 10,
  '=': 1
}

export class Token {
  bp: number
  led: any
  nud: any

  constructor(public value: string, public type: TokenType) {
    this.bp = operatorBindingpower[value] || 0
  }

  toString() {
    return this.value
  }
}

export class Tokenizer {
  tokenize(expression: string): Token[] {
    let pExpression = expression
    let tokens: Token[] = []
    let col = 0

    while (pExpression.length) {
      let matched = false
      tokenMatchers.forEach(m => {
        if (!matched) {
          const result = m.matcher.exec(pExpression)
          if (result) {
            const value = result[0]
            const charCount = value.length
            tokens = [...tokens, new Token(value, m.type)]
            pExpression = pExpression.substr(charCount)
            col += charCount
            matched = true
          }
        }
        // noop if a match has already been found
        // for this reason the order of matchers needs to be
        // carefully considered. For example, a mapping operator `->`
        // needs to be checked before normal operators, where if a `-`
        // would be matched first it would result in invalid tokenization
      })
      if (!matched) {
        throw SyntaxError(`Unrecognized token at position ${col}`)
      }
    }
    return tokens
  }
}
