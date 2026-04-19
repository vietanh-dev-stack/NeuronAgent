from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.tools.base import BaseTool


class ToolRegistry:
    """
    Central registry for all tools.
    Tools are registered at startup and looked up by name during agent execution.
    """

    def __init__(self):
        self._tools: dict[str, "BaseTool"] = {}

    def register(self, tool: "BaseTool") -> None:
        self._tools[tool.name] = tool

    def get(self, name: str) -> "BaseTool | None":
        return self._tools.get(name)

    def all_tools(self) -> list["BaseTool"]:
        return list(self._tools.values())

    def tool_schemas(self) -> list[dict]:
        """Return all tool schemas in OpenAI function-calling format."""
        return [t.schema for t in self._tools.values()]

    def __repr__(self) -> str:
        return f"ToolRegistry({list(self._tools.keys())})"


# Global singleton registry
registry = ToolRegistry()


def register_all_tools():
    """Import and register all tools into the global registry."""
    from app.tools.calculator import CalculatorTool
    from app.tools.code_analyzer import CodeAnalyzerTool
    from app.tools.web_search import WebSearchTool
    from app.tools.note_writer import NoteWriterTool
    from app.tools.code_runner import CodeRunnerTool

    for tool_cls in [
        CalculatorTool,
        CodeAnalyzerTool,
        WebSearchTool,
        NoteWriterTool,
        CodeRunnerTool,
    ]:
        registry.register(tool_cls())
