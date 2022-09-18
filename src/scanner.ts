import { Lox } from "./Lox";
import { Token } from "./token";
import { TokenType } from "./tokenType";

export class Scanner {
  private source: string;
  private tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  public scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token("EOF", "", null, this.line));
    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken(): void {
    const c: string = this.advance();
    switch (c) {
      case "(": {
        this.addToken("LEFT_PARENS");
        break;
      }
      case ")": {
        this.addToken("RIGHT_PARENS");
        break;
      }
      case "{": {
        this.addToken("LEFT_BRACE");
        break;
      }
      case "}": {
        this.addToken("RIGHT_BRACE");
        break;
      }
      case ",": {
        this.addToken("COMMA");
        break;
      }
      case ".": {
        this.addToken("DOT");
        break;
      }
      case "-": {
        this.addToken("MINUS");
        break;
      }
      case "+": {
        this.addToken("PLUS");
        break;
      }
      case ";": {
        this.addToken("SEMICOLON");
        break;
      }
      case "*": {
        this.addToken("STAR");
        break;
      }
      case "!": {
        this.addToken(this.match("=") ? "BANG_EQUAL" : "BANG");
        break;
      }
      case "=": {
        this.addToken(this.match("=") ? "EQUAL_EQUAL" : "EQUAL");
        break;
      }
      case "<": {
        this.addToken(this.match("=") ? "LESS_EQUAL" : "LESS");
        break;
      }
      case ">": {
        this.addToken(this.match("=") ? "GREATER_EQUAL" : "GREATER");
        break;
      }
      case "/": {
        if (this.match("/")) {
          // a comment goes until the end of the line
          while (this.peek() != "\n" && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken("SLASH");
        }
        break;
      }
      case " ":
      case "\r":
      case "\t": {
        // Ignore whitespace.
        break;
      }
      case "\n": {
        this.line++;
        break;
      }
      default: {
        Lox.error(this.line, "Unexpected character.");
        break;
      }
    }
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    if (this.source.charAt(this.current) !== expected) {
      return false;
    }

    this.current++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) {
      return "\0";
    }
    return this.source.charAt(this.current);
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType): void;
  private addToken(type: TokenType, literal: any): void;
  private addToken(type: TokenType, literal?: any): void {
    const text: string = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }
}
