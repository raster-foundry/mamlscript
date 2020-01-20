import request from "supertest";

import { Parser } from "../src/parser";
import TokenType from "../src/tokenType";

const api = request("localhost:8801");

const VALIDATE = false;

const validateAST = (ast, done) => {
  if (VALIDATE) {
    api
      .post("/validate")
      .send(JSON.stringify(ast))
      .set("Accept", "application/json")
      .expect(200)
      .end((e, r) => (e ? done(e) : done()));
  }
  done();
};

describe("Parse tests", () => {
  const parser = new Parser();

  describe("Parsing a single token expression:\n\t", () => {
    it("should parse whitespace only", () => {
      const ast = parser.parse(" ");

      expect(ast).toEqual({});
    });

    it("should parse a single identifier", done => {
      const ast = parser.parse("A");

      expect(ast).toEqual({
        value: "A",
        type: TokenType.Identifier,
        bp: 0
      });

      ast = {
        symbol: "int",
        value: 4
      };

      validateAST(ast, done);
    });

    it("should parse a single constant", done => {
      const ast = parser.parse("1.2");

      expect(ast).toEqual({
        value: "1.2",
        type: TokenType.Constant,
        bp: 0
      });

      validateAST(ast, done);
    });
  });

  describe("Parsing simple expressions:\n\t", () => {
    it("should parse addition", done => {
      const ast = parser.parse("A + B");

      expect(ast).toEqual({
        value: "+",
        type: TokenType.Operator,
        bp: 10,
        args: [
          {
            value: "A",
            type: TokenType.Identifier,
            bp: 0
          },
          {
            value: "B",
            type: TokenType.Identifier,
            bp: 0
          }
        ]
      });

      validateAST(ast, done);
    });

    it("should parse addition and multiplication", done => {
      const ast = parser.parse("A + B * C");

      expect(ast).toEqual({
        value: "+",
        type: TokenType.Operator,
        bp: 10,
        args: [
          {
            value: "A",
            type: TokenType.Identifier,
            bp: 0
          },
          {
            value: "*",
            type: TokenType.Operator,
            bp: 100,
            args: [
              {
                value: "B",
                type: TokenType.Identifier,
                bp: 0
              },
              {
                value: "C",
                type: TokenType.Identifier,
                bp: 0
              }
            ]
          }
        ]
      });

      validateAST(ast, done);
    });

    it("should parse multiplication and division", done => {
      const ast = parser.parse("A * B / C");

      expect(ast).toEqual({
        value: "/",
        type: TokenType.Operator,
        bp: 100,
        args: [
          {
            value: "C",
            type: TokenType.Identifier,
            bp: 0
          },
          {
            value: "*",
            type: TokenType.Operator,
            bp: 100,
            args: [
              {
                value: "A",
                type: TokenType.Identifier,
                bp: 0
              },
              {
                value: "B",
                type: TokenType.Identifier,
                bp: 0
              }
            ]
          }
        ]
      });

      validateAST(ast, done);
    });
  });
});
