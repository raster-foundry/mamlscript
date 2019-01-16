const operatorBindingpower: {
  [key: string]: number;
} = {
  "^": 1000,
  "/": 100,
  "*": 100,
  "+": 10,
  "-": 10,
  "=": 1
};

class Token {
  bp: number;

  constructor(public type: TokenType, public value: string = "") {
    this.bp = operatorBindingpower[value] || 0;
  }

  toString() {
    return this.value;
  }
}

export default Token;
