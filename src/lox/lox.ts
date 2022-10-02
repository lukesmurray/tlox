import * as fs from "node:fs";
import * as process from "node:process";
import * as readline from "node:readline";
import { AstPrinter } from "./astPrinter";
import { Expr } from "./expr";
import { Parser } from "./parser";
import { Scanner } from "./scanner";
import { Token } from "./token";

export class Lox {
  private static hadError: boolean = false;

  public static main() {
    const args = process.argv;
    // first arg is ts-node, second is path to src/index.ts
    if (args.length > 3) {
      process.stderr.write("Usage: ts-node src/index.ts [script]");
      process.exit(64);
    } else if (args.length === 3) {
      Lox.runFile(args[2]);
    } else {
      Lox.runPrompt();
    }
  }

  private static runFile(path: string) {
    const buffer = fs.readFileSync(path);
    Lox.run(buffer.toString("utf-8"));

    if (Lox.hadError) {
      process.exit(65);
    }
  }

  private static runPrompt() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "> ",
    });
    rl.prompt();
    rl.on("line", (line) => {
      Lox.run(line);
      Lox.hadError = false;
      rl.prompt();
    }).on("close", () => {
      process.stdout.write("Have a great day!");
      process.exit(0);
    });
  }

  private static run(source: string) {
    const scanner: Scanner = new Scanner(source);
    const tokens: Token[] = scanner.scanTokens();
    const parser: Parser = new Parser(tokens);
    const expression: Expr.Expr | null = parser.parse();
    if (this.hadError) {
      return;
    }

    process.stdout.write(`${new AstPrinter().print(expression!)}\n`);
  }

  public static error(line: number, message: string): void;
  public static error(token: Token, message: string): void;
  public static error(context: number | Token, message: string): void {
    if (typeof context === "number") {
      Lox.report(context, "", message);
    } else if (context.type === "EOF") {
      Lox.report(context.line, " at end", message);
    } else {
      Lox.report(context.line, ` at '${context.lexeme}'`, message);
    }
  }

  private static report(line: number, where: string, message: string) {
    process.stderr.write(`[line ${line}] Error${where}: ${message}`);
    Lox.hadError = true;
  }
}
