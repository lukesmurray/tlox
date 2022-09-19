import { Expr } from "./expr";

class AstPrinter implements Expr.Visitor<String> {
  print(expr: Expr.Expr): String {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Expr.Binary): String {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Expr.Grouping): String {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: Expr.Literal): String {
    if (expr.value == null) return "nil";
    return expr.value.toString();
  }

  visitUnaryExpr(expr: Expr.Unary): String {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  private parenthesize(name: String, ...exprs: Expr.Expr[]): String {
    let result = `(${name}`;
    for (const expr of exprs) {
      result += ` ${expr.accept(this)}`;
    }
    result += ")";
    return result;
  }
}
