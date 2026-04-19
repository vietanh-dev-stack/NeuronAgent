import ast
import operator
from typing import Any

from app.tools.base import BaseTool, ToolResult


# Safe math operators only
_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
    ast.FloorDiv: operator.floordiv,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def _safe_eval(node):
    if isinstance(node, ast.Constant):
        return node.value
    elif isinstance(node, ast.BinOp):
        left = _safe_eval(node.left)
        right = _safe_eval(node.right)
        op = _OPERATORS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported operator: {node.op}")
        return op(left, right)
    elif isinstance(node, ast.UnaryOp):
        operand = _safe_eval(node.operand)
        op = _OPERATORS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported unary operator: {node.op}")
        return op(operand)
    elif isinstance(node, ast.Call):
        # Allow basic math functions
        import math
        allowed_funcs = {"abs": abs, "round": round, "sqrt": math.sqrt,
                         "sin": math.sin, "cos": math.cos, "log": math.log}
        if isinstance(node.func, ast.Name) and node.func.id in allowed_funcs:
            args = [_safe_eval(a) for a in node.args]
            return allowed_funcs[node.func.id](*args)
    raise ValueError(f"Unsupported expression: {ast.dump(node)}")


class CalculatorTool(BaseTool):
    name = "calculator"
    description = (
        "Evaluates mathematical expressions safely. "
        "Supports +, -, *, /, **, %, //, abs(), round(), sqrt(), sin(), cos(), log(). "
        "Use this for any numerical calculation."
    )
    parameters = {
        "type": "object",
        "properties": {
            "expression": {
                "type": "string",
                "description": "The math expression to evaluate, e.g. '2 ** 10 + sqrt(144)'",
            }
        },
        "required": ["expression"],
    }

    async def run(self, expression: str, **kwargs: Any) -> ToolResult:
        try:
            tree = ast.parse(expression.strip(), mode="eval")
            result = _safe_eval(tree.body)
            return ToolResult(success=True, output=f"{expression} = {result}")
        except Exception as e:
            return ToolResult(success=False, output="", error=f"Calculation error: {e}")
