import * as fs from "node:fs";
import * as process from "node:process";
import * as readline from "node:readline";

class Lox {
  private static hadError: boolean = false;

  public static main() {
    const args = process.argv;
    if (args.length > 1) {
      process.stderr.write("Usage: ts-node src/index.ts [script]");
      process.exit(64);
    } else if (args.length == 1) {
      Lox.runFile(args[0]);
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

    for (const token of tokens) {
      process.stdout.write(token);
    }
  }

  private static error(line: number, message: string) {
    Lox.report(line, "", message);
  }

  private static report(line: number, where: string, message: string) {
    process.stderr.write(`[line ${line}] Error${where}: ${message}`);
    Lox.hadError = true;
  }
}
