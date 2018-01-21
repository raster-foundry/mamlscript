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

  parse(expression: string): any {
    this.symbols = []
    return this.transformMathNode(math.parse(expression))
  }

  getMatchingConstant(node: Constant): Constant {
    const matching = this.symbols.find(
      s => s instanceof Constant && s.metadata.label === node.metadata.label
    )
    // If a matching constant is found return it
    if (matching) {
      return matching
    }
    // Otherwise, add the unique constant to the list
    this.symbols.push(node)
    return node
  }

  getMatchingSource(node: Source): Source {
    const matching = this.symbols.find(
      s => s instanceof Source && s.metadata.label === node.metadata.label
    )
    // If a matching source is found return it
    if (matching) {
      return matching
    }
    // Otherwise, add the unique source to the list
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
    return this.getMatchingSource(new Source(node.name))
  }

  constantFromMathNode(node: any): Constant {
    if (node.type === 'ConstantNode') {
      // The incoming mathjs node is a number
      return new Constant(node.value, node.value)
    } else if (node.type === 'AssignmentNode') {
      // The incoming mathjs node is an assignment (constant w/ default)
      return this.getMatchingConstant(
        new Constant(node.object.name.substring(1), +node.value.value)
      )
    }
    // The incoming mathjs node is a plain constant
    return this.getMatchingConstant(new Constant(node.name.substring(1), null))
  }

  operationFromMathNode(node: any, collapseable: boolean = true): Operation {
    // Runtime errors will be thrown for operations not in the list
    const validOps = [
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

    // The following operations require special handling which is defined
    // in the `advancedOperationFromMathNode` function
    const advancedOps: {
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

    // Both OperatorNode and FunctionNode MathJS node types get converted to
    // MAML Operations.
    if (node.type === 'OperatorNode' && validOps.indexOf(node.op) >= 0) {
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
      validOps.indexOf(node.fn.name) >= 0
    ) {
      if (advancedOps.hasOwnProperty(node.fn.name)) {
        return advancedOps[node.fn.name](node)
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
