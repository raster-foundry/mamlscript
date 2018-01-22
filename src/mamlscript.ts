import * as math from 'mathjs'
import uuidv4 from 'uuid/v4'

export interface Metadata {
  label: string
}

export abstract class Node {
  // UUID
  id: string
  metadata: Metadata
  args: Node[]

  constructor() {
    this.id = uuidv4()
    this.metadata = {
      label: ''
    }
  }

  toString(): string {
    return JSON.stringify(this)
  }
}
export abstract class Leaf extends Node {
  type: string
}

export class ExpressionParser {
  symbols: any[] = []

  validOps: string[] = [
    '+',
    '-',
    '*',
    '/',
    '==',
    '!=',
    '>',
    '<',
    '>=',
    '<=',
    'and',
    'or',
    'xor',
    '^',
    'sqrt',
    'log10',
    'ceil',
    'floor',
    'round',
    'abs',
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'sinh',
    'cosh',
    'tanh',
    'atan2',
    'classify'
  ]

  advancedOps: {
    [key: string]: (node: any) => Operation
  } = {
    classify: (node: any) => {
      const args = [node.args[0]]
      const classifications = this.classificationsFromObjectNode(node.args[1])
      let op = new Operation(
        node.fn.name,
        args.map(a => this.transformMathNode(a))
      )
      op.classMap = { classifications }
      return op
    }
  }

  parse(expression: string): any {
    this.symbols = []
    return this.transformMathNode(math.parse(expression))
  }

  getMatchingSymbol<T extends Leaf>(
    node: T,
    constructor: { new (...args: any[]): T }
  ): T {
    const matching = this.symbols.find(
      s => s instanceof constructor && s.metadata.label === node.metadata.label
    )
    // If a matching constant is found return it
    if (matching) {
      return matching
    }
    // Otherwise, add the unique constant to the list
    this.symbols.push(node)
    return node
  }

  transformMathNode(node: any, collapseable: boolean = true): Node {
    switch (node.type) {
      case 'AssignmentNode':
        // Constants with default values are the only current use of assignments (=)
        return this.constantFromMathNode(node)
      case 'SymbolNode':
        // Constants are denoted with a leading underscore
        if (node.name.startsWith('_')) {
          return this.constantFromMathNode(node)
        }
        // All other symbols are raster inputs
        return this.sourceFromMathNode(node)
      case 'ConstantNode':
        return this.constantFromMathNode(node)
      case 'OperatorNode':
        return this.operationFromMathNode(node, collapseable)
      case 'ParenthesisNode':
        return this.transformMathNode(node.content, false)
      case 'FunctionNode':
        return this.operationFromMathNode(node)
      default:
        throw SyntaxError(`Can't parse node type: ${node.type}`)
    }
  }

  sourceFromMathNode(node: any): Source {
    return this.getMatchingSymbol(new Source(node.name), Source)
  }

  constantFromMathNode(node: any): Constant {
    if (node.type === 'ConstantNode') {
      // The incoming mathjs node is a number
      return new Constant(node.value, node.value)
    } else if (node.type === 'AssignmentNode') {
      // The incoming mathjs node is an assignment (constant w/ default)
      return this.getMatchingSymbol(
        new Constant(node.object.name.substring(1), +node.value.value),
        Constant
      )
    }
    // The incoming mathjs node is a plain constant
    return this.getMatchingSymbol(
      new Constant(node.name.substring(1), null),
      Constant
    )
  }

  operationFromMathNode(node: any, collapseable: boolean = true): Operation {
    // Both OperatorNode and FunctionNode MathJS node types get converted to
    // MAML Operations.
    if (node.type === 'OperatorNode' && this.validOps.indexOf(node.op) >= 0) {
      let args = node.args.map((a: any) => this.transformMathNode(a))
      // If the operations is collapseable, check arguments to find suitable nodes
      // for merging
      args.forEach((a: any, i: number) => {
        if (a instanceof Operation && a.apply === node.op && a.collapseable) {
          args = [
            ...args.slice(0, i),
            ...a.args,
            ...args.slice(i + 1, args.length)
          ]
        }
      })
      return new Operation(node.op, args, collapseable)
    } else if (
      node.type === 'FunctionNode' &&
      this.validOps.indexOf(node.fn.name) >= 0
    ) {
      if (this.advancedOps.hasOwnProperty(node.fn.name)) {
        return this.advancedOps[node.fn.name](node)
      }
      return new Operation(
        node.fn.name,
        node.args.map((a: any) => this.transformMathNode(a)),
        false
      )
    }
    throw new Error(`Invalid operation '${node.op}'`)
  }

  classificationsFromObjectNode(node: any) {
    if (node && node.type === 'ObjectNode') {
      return Object.keys(node.properties).reduce((acc: any, p) => {
        acc[`${parseFloat(p)}`] = parseInt(node.properties[p].value, 10)
        return acc
      }, {})
    }
    throw new Error(`Expected ObjectNode, got ${node.type}`)
  }
}

export class Operation extends Node {
  apply: string
  args: any[]
  collapseable: boolean
  classMap: any = {}

  constructor(apply: string, args: any[], collapseable: boolean = true) {
    super()
    this.apply = apply
    this.args = args
    this.collapseable = collapseable
  }
}

export class Source extends Leaf {
  type = 'src'
  constructor(label: string) {
    super()
    this.metadata.label = label
  }
}

export class Constant extends Leaf {
  type = 'const'
  constant: number | null
  constructor(label: string, constant: number | null) {
    super()
    this.constant = constant
    this.metadata.label = label
  }
}
