import uuidv4 from "uuid/v4";
import { ops } from "./builtins";
import { Tokenizer } from "./tokenizer";
import Token from "./token";
import TokenType from "./tokenType";

export class Parser {
  constructor() {
    this.tokenizer = new Tokenizer();
  }

  rules = {
    [TokenType.Identifier]: [this.identifier, null],
    [TokenType.Constant]: [this.constant, null],
    [TokenType.Operator]: [null, this.infix]
  };

  identifier(token: Token) {
    return { ...token };
  }

  constant(token: Token) {
    return { ...token };
  }

  infix(token: Token, left: Token, tokens: Token[]) {
    console.log("infix", token, left, tokens);
    return { ...token, args: [left, this.doParse(tokens, token.bp)] };
  }

  parse(expression: String): any {
    let tokens = this.tokenizer
      .tokenize(expression)
      .filter(t => t.type !== TokenType.Whitespace);

    if (tokens.length) {
      return this.doParse(tokens);
    }
    return {};
  }

  doParse(tokens: Token[], rbp = 0): any {
    console.log("doParse", tokens);
    let [currentToken, nextToken, ...restTokens] = tokens;
    let left = this.rules[currentToken.type][0].call(this, currentToken);
    console.log("currentToken", currentToken);
    console.log("nextToken", nextToken);
    while (nextToken && rbp < nextToken.bp) {
      [currentToken, nextToken, ...restTokens] = [nextToken, ...restTokens];
      left = this.rules[currentToken.type][1].call(this, currentToken, left, [
        nextToken,
        ...restTokens
      ]);
    }
    return left;
  }
}
