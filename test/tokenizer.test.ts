import { Tokenizer, TokenType } from '../src/tokenizer'

describe('Tokenizer Tests', () => {
  const tokenizer = new Tokenizer()

  describe('Tokenizing a single token:\n\t', () => {
    it('should tokenize whitespace', () => {
      const t = tokenizer.tokenize('    ')

      expect(t).toEqual([
        {
          value: '    ',
          type: TokenType.Whitespace,
          bp: 0
        }
      ])
    })

    it('should tokenize an identifier', () => {
      const t = tokenizer.tokenize('ABC')

      expect(t).toEqual([
        {
          value: 'ABC',
          type: TokenType.Identifier,
          bp: 0
        }
      ])
    })

    it('should throw on an invalid character', () => {
      expect(() => tokenizer.tokenize('$')).toThrow()
    })

    it('should tokenize an operation', () => {
      const t = tokenizer.tokenize('+')

      expect(t).toEqual([
        {
          value: '+',
          type: TokenType.Operator,
          bp: 10
        }
      ])
    })
  })

  describe('Tokenizing expressions:\n\t', () => {
    it('should tokenize a simple statement - 1', () => {
      const t = tokenizer.tokenize('NIR+R')

      expect(t).toEqual([
        {
          value: 'NIR',
          type: TokenType.Identifier,
          bp: 0
        },
        {
          value: '+',
          type: TokenType.Operator,
          bp: 10
        },
        {
          value: 'R',
          type: TokenType.Identifier,
          bp: 0
        }
      ])
    })

    it('should tokenize a simple statement - 2', () => {
      const t = tokenizer.tokenize('(NIR+R)')

      expect(t).toEqual([
        {
          value: '(',
          type: TokenType.GroupingStart,
          bp: 0
        },
        {
          value: 'NIR',
          type: TokenType.Identifier,
          bp: 0
        },
        {
          value: '+',
          type: TokenType.Operator,
          bp: 10
        },
        {
          value: 'R',
          type: TokenType.Identifier,
          bp: 0
        },
        {
          value: ')',
          type: TokenType.GroupingEnd,
          bp: 0
        }
      ])
    })

    it('should tokenize a complex statement - 1', () => {
      const t = tokenizer.tokenize('(NIR-R)/(NIR + R)')

      expect(t).toEqual([
        {
          value: '(',
          type: TokenType.GroupingStart,
          bp: 0
        },
        {
          value: 'NIR',
          type: TokenType.Identifier,
          bp: 0
        },
        {
          value: '-',
          type: TokenType.Operator,
          bp: 10
        },
        {
          value: 'R',
          type: TokenType.Identifier,
          bp: 0
        },
        {
          value: ')',
          type: TokenType.GroupingEnd,
          bp: 0
        },
        {
          value: '/',
          type: TokenType.Operator,
          bp: 100
        },
        {
          value: '(',
          type: TokenType.GroupingStart,
          bp: 0
        },
        {
          value: 'NIR',
          type: TokenType.Identifier,
          bp: 0
        },
        {
          value: ' ',
          type: TokenType.Whitespace,
          bp: 0
        },
        {
          value: '+',
          type: TokenType.Operator,
          bp: 10
        },
        {
          value: ' ',
          type: TokenType.Whitespace,
          bp: 0
        },
        {
          value: 'R',
          type: TokenType.Identifier,
          bp: 0
        },
        {
          value: ')',
          type: TokenType.GroupingEnd,
          bp: 0
        }
      ])
    })

    it('should tokenize a complex statement - 2', () => {
      const t = tokenizer.tokenize(
        'classify((NIR-R)/(NIR + R), { 0 -> 0, 1.2 -> 1 })'
      )

      expect(t).toEqual([
        {
          value: 'classify',
          type: TokenType.Identifier,
          bp: 0
        },
        {
          value: '(',
          type: TokenType.GroupingStart,
          bp: 0
        },
        {
          value: '(',
          type: TokenType.GroupingStart,
          bp: 0
        },
        {
          value: 'NIR',
          type: TokenType.Identifier,
          bp: 0
        },
        {
          value: '-',
          type: TokenType.Operator,
          bp: 10
        },
        {
          value: 'R',
          type: TokenType.Identifier,
          bp: 0
        },
        {
          value: ')',
          type: TokenType.GroupingEnd,
          bp: 0
        },
        {
          value: '/',
          type: TokenType.Operator,
          bp: 100
        },
        {
          value: '(',
          type: TokenType.GroupingStart,
          bp: 0
        },
        {
          value: 'NIR',
          type: TokenType.Identifier,
          bp: 0
        },
        {
          value: ' ',
          type: TokenType.Whitespace,
          bp: 0
        },
        {
          value: '+',
          type: TokenType.Operator,
          bp: 10
        },
        {
          value: ' ',
          type: TokenType.Whitespace,
          bp: 0
        },
        {
          value: 'R',
          type: TokenType.Identifier,
          bp: 0
        },
        {
          value: ')',
          type: TokenType.GroupingEnd,
          bp: 0
        },
        {
          value: ',',
          type: TokenType.ArgumentDelimiter,
          bp: 0
        },
        {
          value: ' ',
          type: TokenType.Whitespace,
          bp: 0
        },
        {
          value: '{',
          type: TokenType.BlockStart,
          bp: 0
        },
        {
          value: ' ',
          type: TokenType.Whitespace,
          bp: 0
        },
        {
          value: '0',
          type: TokenType.Constant,
          bp: 0
        },
        {
          value: ' ',
          type: TokenType.Whitespace,
          bp: 0
        },
        {
          value: '->',
          type: TokenType.AssociativeMapping,
          bp: 0
        },
        {
          value: ' ',
          type: TokenType.Whitespace,
          bp: 0
        },
        {
          value: '0',
          type: TokenType.Constant,
          bp: 0
        },
        {
          value: ',',
          type: TokenType.ArgumentDelimiter,
          bp: 0
        },
        {
          value: ' ',
          type: TokenType.Whitespace,
          bp: 0
        },
        {
          value: '1.2',
          type: TokenType.Constant,
          bp: 0
        },
        {
          value: ' ',
          type: TokenType.Whitespace,
          bp: 0
        },
        {
          value: '->',
          type: TokenType.AssociativeMapping,
          bp: 0
        },
        {
          value: ' ',
          type: TokenType.Whitespace,
          bp: 0
        },
        {
          value: '1',
          type: TokenType.Constant,
          bp: 0
        },
        {
          value: ' ',
          type: TokenType.Whitespace,
          bp: 0
        },
        {
          value: '}',
          type: TokenType.BlockEnd,
          bp: 0
        },
        {
          value: ')',
          type: TokenType.GroupingEnd,
          bp: 0
        }
      ])

      expect(t.map(t => t.toString()).join('')).toEqual(
        'classify((NIR-R)/(NIR + R), { 0 -> 0, 1.2 -> 1 })'
      )
    })
  })
})
