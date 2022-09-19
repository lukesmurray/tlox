import { Expr } from "./expr";
import { Token } from "./token";

export class RpnPrinter implements Expr.Visitor<string> {
  print(expr: Expr.Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Expr.Binary): string {
    let result = "";
    for (const operand of [expr.left, expr.right]) {
      result += `${operand.accept(this)} `;
    }
    result += `${expr.operator.lexeme}`;
    return result;
  }

  visitGroupingExpr(expr: Expr.Grouping): string {
    return expr.expression.accept(this);
  }

  visitLiteralExpr(expr: Expr.Literal): string {
    if (expr.value == null) return "nil";
    return expr.value.toString();
  }

  visitUnaryExpr(expr: Expr.Unary): string {
    // TODO(lukemurray): not sure if this is correct for negation (-) and bang (!)
    let result = "";
    result += expr.operator.lexeme;
    result += expr.right.accept(this);
    return result;
  }
}

// (1 + 2) * (4 - 3)
console.log(
  new RpnPrinter().print(
    new Expr.Binary(
      new Expr.Grouping(
        new Expr.Binary(
          new Expr.Literal(1),
          new Token("PLUS", "+", null, 1),
          new Expr.Literal(2)
        )
      ),
      new Token("STAR", "*", null, 1),

      new Expr.Grouping(
        new Expr.Binary(
          new Expr.Literal(4),
          new Token("MINUS", "-", null, 1),
          new Expr.Literal(3)
        )
      )
    )
  )
);

// -123 * (45.67)
console.log(
  new RpnPrinter().print(
    new Expr.Binary(
      new Expr.Unary(new Token("MINUS", "-", null, 1), new Expr.Literal(123)),
      new Token("STAR", "*", null, 1),
      new Expr.Grouping(new Expr.Literal(45.67))
    )
  )
);

// -(1 + 2) * -(4 - 3)
// outputs -1 2 + -4 3 - * which feels wrong
console.log(
  new RpnPrinter().print(
    new Expr.Binary(
      new Expr.Unary(
        new Token("MINUS", "-", null, 1),
        new Expr.Grouping(
          new Expr.Binary(
            new Expr.Literal(1),
            new Token("PLUS", "+", null, 1),
            new Expr.Literal(2)
          )
        )
      ),
      new Token("STAR", "*", null, 1),
      new Expr.Unary(
        new Token("MINUS", "-", null, 1),
        new Expr.Grouping(
          new Expr.Binary(
            new Expr.Literal(4),
            new Token("MINUS", "-", null, 1),
            new Expr.Literal(3)
          )
        )
      )
    )
  )
);
