import { Parser } from "../src/parser";
import TokenType from "../src/tokenType";

describe("Parse tests", () => {
  const parser = new Parser();

  // describe("Parsing a single token expression:\n\t", () => {
  //   it("should parse whitespace only", () => {
  //     const ast = parser.parse(" ");

  //     expect(ast).toEqual({});
  //   });

  //   it("should parse a single identifier", () => {
  //     const ast = parser.parse("A");

  //     expect(ast).toEqual({
  //       value: "A",
  //       type: TokenType.Identifier,
  //       bp: 0
  //     });
  //   });

  //   it("should parse a single constant", () => {
  //     const ast = parser.parse("1.2");

  //     expect(ast).toEqual({
  //       value: "1.2",
  //       type: TokenType.Constant,
  //       bp: 0
  //     });
  //   });
  // });

  describe("Parsing simple expressions:\n\t", () => {
    // it("should parse addition", () => {
    //   const ast = parser.parse("A + B");

    //   expect(ast).toEqual({
    //     value: "+",
    //     type: TokenType.Operator,
    //     bp: 10,
    //     args: [
    //       {
    //         value: "A",
    //         type: TokenType.Identifier,
    //         bp: 0
    //       },
    //       {
    //         value: "B",
    //         type: TokenType.Identifier,
    //         bp: 0
    //       }
    //     ]
    //   });
    // });

    // it("should parse addition and multiplication", () => {
    //   const ast = parser.parse("A + B * C");

    //   expect(ast).toEqual({
    //     value: "+",
    //     type: TokenType.Operator,
    //     bp: 10,
    //     args: [
    //       {
    //         value: "A",
    //         type: TokenType.Identifier,
    //         bp: 0
    //       },
    //       {
    //         value: "*",
    //         type: TokenType.Operator,
    //         bp: 100,
    //         args: [
    //           {
    //             value: "B",
    //             type: TokenType.Identifier,
    //             bp: 0
    //           },
    //           {
    //             value: "C",
    //             type: TokenType.Identifier,
    //             bp: 0
    //           }
    //         ]
    //       }
    //     ]
    //   });
    // });
    it("should parse multiplication and division", () => {
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
    });
  });
});
