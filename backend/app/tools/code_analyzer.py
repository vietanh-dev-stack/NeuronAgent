from typing import Any

from app.tools.base import BaseTool, ToolResult


class CodeAnalyzerTool(BaseTool):
    name = "code_analyzer"
    description = (
        "Analyzes code to explain what it does, identify bugs, security issues, "
        "performance bottlenecks, and suggest improvements. "
        "Always use this when the user asks to debug, explain, or optimize code."
    )
    parameters = {
        "type": "object",
        "properties": {
            "code": {
                "type": "string",
                "description": "The code to analyze",
            },
            "language": {
                "type": "string",
                "description": "Programming language (python, javascript, typescript, etc.)",
                "default": "python",
            },
            "task": {
                "type": "string",
                "enum": ["explain", "debug", "optimize", "security_review", "full"],
                "description": "What kind of analysis to perform",
                "default": "full",
            },
        },
        "required": ["code"],
    }

    async def run(
        self,
        code: str,
        language: str = "python",
        task: str = "full",
        **kwargs: Any,
    ) -> ToolResult:
        """
        The actual deep analysis is done by the LLM — this tool
        preprocesses inputs and returns structured context for the model.
        """
        line_count = len(code.strip().splitlines())

        task_instructions = {
            "explain": "Provide a clear, line-by-line explanation of what this code does.",
            "debug": "Find all bugs, logical errors, and potential runtime exceptions. Provide fixes.",
            "optimize": "Identify performance bottlenecks, redundant operations, and suggest optimizations.",
            "security_review": "Identify security vulnerabilities (injection, unsafe deserialization, hardcoded secrets, etc.).",
            "full": "Explain the code, find bugs, suggest optimizations, and flag security issues.",
        }

        instruction = task_instructions.get(task, task_instructions["full"])

        analysis_prompt = f"""
## Code Analysis Request

**Language:** {language}
**Lines:** {line_count}
**Task:** {instruction}

```{language}
{code}
```

Please provide a structured analysis with sections for:
1. Summary (what the code does)
2. Issues Found (bugs, errors — if any)
3. Recommendations (improvements)
4. Fixed Code (if applicable)
"""
        return ToolResult(
            success=True,
            output=analysis_prompt,
            metadata={"language": language, "lines": line_count, "task": task},
        )
