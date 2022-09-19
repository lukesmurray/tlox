import { Expr } from "./expr";
import { Token } from "./token";

export class AstPrinter implements Expr.Visitor<string> {
  print(expr: Expr.Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Expr.Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Expr.Grouping): string {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: Expr.Literal): string {
    if (expr.value == null) return "nil";
    return expr.value.toString();
  }

  visitUnaryExpr(expr: Expr.Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  private parenthesize(name: string, ...exprs: Expr.Expr[]): string {
    let result = `(${name}`;
    for (const expr of exprs) {
      result += ` ${expr.accept(this)}`;
    }
    result += ")";
    return result;
  }
}

// -123 * (45.67)
console.log(
  new AstPrinter().print(
    new Expr.Binary(
      new Expr.Unary(new Token("MINUS", "-", null, 1), new Expr.Literal(123)),
      new Token("STAR", "*", null, 1),
      new Expr.Grouping(new Expr.Literal(45.67))
    )
  )
);
