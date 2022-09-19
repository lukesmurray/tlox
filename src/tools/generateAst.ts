import * as fs from "node:fs";

class GenerateAst {
  static main() {
    const args = process.argv;
    // first arg is ts-node, second is path to src/index.ts
    if (args.length !== 3) {
      process.stderr.write(
        "Usage: ts-node src/tools/generateAst.ts <output_dir>"
      );
      process.exit(64);
    }
    const outputDir: string = args[2];
    this.defineAst(outputDir, "Expr", [
      "Binary   : left: Expr, operator: Token, right: Expr",
      "Grouping : expression: Expr",
      "Literal  : value: any",
      "Unary    : operator: Token, right: Expr",
    ]);
  }

  private static defineAst(
    outputDir: string,
    baseName: string,
    types: string[]
  ) {
    const path: string = `${outputDir}/${baseName.toLocaleLowerCase()}.ts`;
    const writer: fs.WriteStream = fs.createWriteStream(path, "utf-8");

    writer.write(`import { Token } from "./token";`);
    writer.write("\n");

    // define the visitor interface
    this.defineVisitor(writer, baseName, types);
    writer.write("\n");

    // define the base class
    this.defineBase(writer, baseName);
    writer.write("\n");

    // define the sub classes
    for (const type of types) {
      const [className, ...fieldList] = type.split(":").map((s) => s.trim());
      const fields = fieldList.join(": ");
      this.defineType(writer, baseName, className, fields);
      writer.write("\n");
    }

    writer.close();
  }

  private static defineBase(writer: fs.WriteStream, baseName: string) {
    writer.write(`abstract class ${baseName} {\n`);
    writer.write(`  abstract accept<R>(visitor: Visitor<R>): R;\n`);
    writer.write(`}\n`);
  }

  private static defineVisitor(
    writer: fs.WriteStream,
    baseName: string,
    types: string[]
  ) {
    // define the visitor interface
    writer.write(`\n`);
    writer.write(`interface Visitor<R> {\n`);
    for (const type of types) {
      const typeName: string = type.split(":")[0].trim();
      writer.write(
        `  visit${typeName}${baseName}(${baseName.toLocaleLowerCase()}: ${typeName}): R;\n`
      );
    }
    writer.write(`}\n`);
  }

  private static defineType(
    writer: fs.WriteStream,
    baseName: string,
    className: string,
    fieldList: string
  ) {
    // define the class
    writer.write(`class ${className} extends ${baseName} {\n`);

    // define the fields fields
    const fields: string[] = fieldList.split(",").map((s) => s.trim());
    for (const field of fields) {
      writer.write(`  public ${field};\n`);
    }
    writer.write(`\n`);

    // define the constructor
    writer.write(`  constructor(${fieldList}) {\n`);
    writer.write(`    super();\n`);
    for (const field of fields) {
      const [name, _type] = field.split(":").map((s) => s.trim());
      writer.write(`    this.${name} = ${name};\n`);
    }
    writer.write(`  }\n`);

    writer.write(`\n`);

    // implement the accept method
    writer.write(`  public override accept<R>(visitor: Visitor<R>): R {\n`);
    writer.write(`    return visitor.visit${className}${baseName}(this);\n`);
    writer.write(`  }\n`);

    writer.write(`}\n`);
  }
}

GenerateAst.main();
