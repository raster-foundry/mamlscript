import {
  ExpressionParser,
  Source,
  Constant,
  Operation
} from '../src/mamlscript'

describe('Expression parsing', () => {
  const parser = new ExpressionParser()

  describe('Parsing an invalid expression:\n\t+', () => {
    it('should throw an error', () => {
      // Need to provide a function (without params) that you
      // expect to throw
      expect(() => parser.parse('+')).toThrow()
    })
  })

  describe('Parsing a single source:\n\tA', () => {
    const result = parser.parse('A')
    it('should be of type Source', () => {
      expect(result).toBeInstanceOf(Source)
    })
    it('should have the right type parameter', () => {
      expect(result.type).toEqual('src')
    })
    it('should have the right metadata', () => {
      expect(result.metadata.label).toEqual('A')
    })
  })

  describe('An AST can be stringifed:\n\tA', () => {
    const ast = parser.parse('A')
    const stringifiedAST = ast.toString()
    it('should be of type Source', () => {
      expect(stringifiedAST).toEqual(
        `{"id":"${ast.id}","metadata":{"label":"A"},"type":"src"}`
      )
    })
  })

  describe('Parsing a single constant WITHOUT a default value:\n\t_A', () => {
    const result = parser.parse('_A')
    it('should be of type Source', () => {
      expect(result).toBeInstanceOf(Constant)
    })
    it('should have the right type parameter', () => {
      expect(result.type).toEqual('const')
    })
    it('should have the right metadata', () => {
      expect(result.metadata.label).toEqual('A')
    })
  })

  describe('Parsing a single constant WITH a default value:\n\t_A=1', () => {
    const result = parser.parse('_A=1')
    it('should be of type Constant', () => {
      expect(result).toBeInstanceOf(Constant)
    })
    it('should have the right type parameter', () => {
      expect(result.type).toEqual('const')
    })
    it('should have the right metadata', () => {
      expect(result.metadata.label).toEqual('A')
    })
    it('should have a constant value', () => {
      expect(result.constant).toEqual(1)
    })
  })

  describe('Parsing an operation with two sources:\n\tA + B', () => {
    const result = parser.parse('A + B')
    it('should be of type Operation', () => {
      expect(result).toBeInstanceOf(Operation)
    })
    it('should have two arguments', () => {
      expect(result.args).toHaveLength(2)
    })
    it('should have sources as arguments', () => {
      expect(result.args.filter(a => a instanceof Source)).toHaveLength(2)
    })
  })

  describe('Parsing an invalid operation with two sources:\n\tA % B', () => {
    it('should throw', () => {
      expect(() => parser.parse('A % B')).toThrow()
    })
  })

  describe('Parsing an invalid expression:\n\tA + B; C + D;', () => {
    it('should throw', () => {
      expect(() => parser.parse('A + B; C + D;')).toThrow()
    })
  })

  describe('Parsing a wide operation:\n\tA + B + C + D', () => {
    const result = parser.parse('A + B + C + D')
    it('should be of type Operation', () => {
      expect(result).toBeInstanceOf(Operation)
    })
    it('should have four arguments', () => {
      expect(result.args).toHaveLength(4)
    })
    it('should have sources as arguments', () => {
      expect(result.args.filter(a => a instanceof Source)).toHaveLength(4)
    })
  })

  describe('Parsing a wide operation with groupings:\n\tA + B + C + (D + E)', () => {
    const result = parser.parse('A + B + C + (D + E)')
    it('should be of type Operation', () => {
      expect(result).toBeInstanceOf(Operation)
    })
    it('should have four arguments', () => {
      expect(result.args).toHaveLength(4)
    })
    it('should have three sources as arguments', () => {
      expect(result.args.filter(a => a instanceof Source)).toHaveLength(3)
    })
    it('should have an operation as an argument', () => {
      expect(result.args.filter(a => a instanceof Operation)).toHaveLength(1)
    })
  })

  describe('Parsing an wide operation with wide groupings:\n\tA + B + C + D + E + (F + G + H + I)', () => {
    const result = parser.parse('A + B + C + D + E + (F + G + H + I)')
    it('should be of type Operation', () => {
      expect(result).toBeInstanceOf(Operation)
    })
    it('should have six arguments', () => {
      expect(result.args).toHaveLength(6)
    })
    it('should have five Sources as arguments', () => {
      expect(result.args.filter(a => a instanceof Source)).toHaveLength(5)
    })
    it('should have an Operation as an argument', () => {
      expect(result.args.filter(a => a instanceof Operation)).toHaveLength(1)
    })
    it('should have an Operation as an argument with 4 arguments', () => {
      expect(result.args[5].args).toHaveLength(4)
    })
  })

  describe('Parsing a wide operation with groupings and constants:\n\tA + 3.4 + _C + (D + E)', () => {
    const result = parser.parse('A + 3.4 + _C + (D + E)')
    it('should be of type Operation', () => {
      expect(result).toBeInstanceOf(Operation)
    })
    it('should have four arguments', () => {
      expect(result.args).toHaveLength(4)
    })
    it('should have one Source as an argument', () => {
      expect(result.args.filter(a => a instanceof Source)).toHaveLength(1)
    })
    it('should have two Constants as arguments', () => {
      expect(result.args.filter(a => a instanceof Constant)).toHaveLength(2)
    })
    it('should have an Operation as an argument', () => {
      expect(result.args.filter(a => a instanceof Operation)).toHaveLength(1)
    })
  })

  describe('Parsing duplicate sources:\n\t_A + _A + _B + _B', () => {
    const result = parser.parse('_A + _A + _B + _B')
    it('should be of type Operation', () => {
      expect(result).toBeInstanceOf(Operation)
    })
    it('should have four arguments', () => {
      expect(result.args).toHaveLength(4)
    })
    it('should have four Sources as arguments', () => {
      expect(result.args.filter(a => a instanceof Constant)).toHaveLength(4)
    })
    it('should have identical source ids for like sources (A)', () => {
      expect(result.args[0].id).toEqual(result.args[1].id)
    })
    it('should have identical source ids for like sources (B)', () => {
      expect(result.args[2].id).toEqual(result.args[3].id)
    })
  })

  describe('Parsing duplicate sources:\n\tA + A + B + B', () => {
    const result = parser.parse('A + A + B + B')
    it('should be of type Operation', () => {
      expect(result).toBeInstanceOf(Operation)
    })
    it('should have four arguments', () => {
      expect(result.args).toHaveLength(4)
    })
    it('should have four Sources as arguments', () => {
      expect(result.args.filter(a => a instanceof Source)).toHaveLength(4)
    })
    it('should have identical source ids for like sources (A)', () => {
      expect(result.args[0].id).toEqual(result.args[1].id)
    })
    it('should have identical source ids for like sources (B)', () => {
      expect(result.args[2].id).toEqual(result.args[3].id)
    })
  })

  describe('Parsing non-unary ops:\n\tsqrt(A)', () => {
    const result = parser.parse('sqrt(A)')
    it('should be of type Operation', () => {
      expect(result).toBeInstanceOf(Operation)
    })
    it('should have one argument', () => {
      expect(result.args).toHaveLength(1)
    })
    it('should have one Source as an argument', () => {
      expect(result.args.filter(a => a instanceof Source)).toHaveLength(1)
    })
  })

  describe('Parsing non-unary ops:\n\tatan(A + B * C)', () => {
    const result = parser.parse('atan(A + B * C)')
    it('should be of type Operation', () => {
      expect(result).toBeInstanceOf(Operation)
    })
    it('should have one argument', () => {
      expect(result.args).toHaveLength(1)
    })
    it('which should then have two arguments', () => {
      expect(result.args[0].args).toHaveLength(2)
    })
  })

  describe('Parsing advanced ops:\n\tclassify(A + B * C, { "50.0": 1 })', () => {
    const result = parser.parse('classify(A + B * C, { "50.0": 1 })')
    it('should be of type Source', () => {
      expect(result).toBeInstanceOf(Operation)
    })
    it('should have one argument', () => {
      expect(result.args).toHaveLength(1)
    })
    it('which should then have two arguments', () => {
      expect(result.args[0].args).toHaveLength(2)
    })
    it('should have a classMap', () => {
      expect(result).toHaveProperty('classMap')
    })
    it('which should have classifications', () => {
      expect(result.classMap).toHaveProperty('classifications')
    })
    it('which should be correct', () => {
      const key = `${parseFloat('50.0')}`
      expect(result.classMap.classifications).toHaveProperty(key)
      expect(result.classMap.classifications[key]).toEqual(1)
    })
  })

  describe('Parsing invalid classifications ops:\n\tclassify(A + B * C, 3)', () => {
    it('should throw', () => {
      expect(() => parser.parse('classify(A + B * C, 3)')).toThrow()
    })
  })

  describe('Parsing invalid advanced ops:\n\tsuperClassify(A + B * C, { "50.0": 1 })', () => {
    it('should throw', () => {
      expect(() =>
        parser.parse('superClassify(A + B * C, { "50.0": 1 })')
      ).toThrow()
    })
  })
})
