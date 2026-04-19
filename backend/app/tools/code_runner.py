import asyncio
import sys
from io import StringIO
from typing import Any

from app.tools.base import BaseTool, ToolResult


class CodeRunnerTool(BaseTool):
    name = "code_runner"
    description = (
        "Executes Python code in a sandboxed environment and returns the output. "
        "Use this to run calculations, data transformations, or small scripts. "
        "Only Python is supported. Network and file system access is restricted."
    )
    parameters = {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "Python code to execute",
            },
        },
        "required": ["code"],
    }

    # Blocked dangerous modules
    BLOCKED = {"os", "sys", "subprocess", "shutil", "socket", "requests",
               "urllib", "httpx", "aiohttp", "importlib", "pickle", "ctypes"}

    def _is_safe(self, code: str) -> tuple[bool, str]:
        """Basic static check for dangerous imports."""
        import ast
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            return False, f"Syntax error: {e}"

        for node in ast.walk(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                names = [a.name for a in node.names] if isinstance(node, ast.Import) else [node.module or ""]
                for name in names:
                    top = name.split(".")[0]
                    if top in self.BLOCKED:
                        return False, f"Import of '{top}' is not allowed in sandbox."
        return True, ""

    async def run(self, code: str, **kwargs: Any) -> ToolResult:
        safe, reason = self._is_safe(code)
        if not safe:
            return ToolResult(success=False, output="", error=f"Sandbox violation: {reason}")

        stdout_capture = StringIO()
        stderr_capture = StringIO()

        # Run in executor to avoid blocking the event loop
        def _exec():
            import sys as _sys
            old_stdout, old_stderr = _sys.stdout, _sys.stderr
            _sys.stdout, _sys.stderr = stdout_capture, stderr_capture
            try:
                local_ns = {}
                exec(compile(code, "<sandbox>", "exec"), {"__builtins__": __builtins__}, local_ns)
                return None
            except Exception as e:
                return str(e)
            finally:
                _sys.stdout, _sys.stderr = old_stdout, old_stderr

        loop = asyncio.get_event_loop()
        error = await asyncio.wait_for(loop.run_in_executor(None, _exec), timeout=10.0)

        stdout_val = stdout_capture.getvalue()
        stderr_val = stderr_capture.getvalue()

        if error:
            return ToolResult(
                success=False,
                output=stdout_val,
                error=f"Runtime error: {error}\n{stderr_val}",
            )

        output = stdout_val or "(No output)"
        return ToolResult(success=True, output=f"```\n{output}\n```")
