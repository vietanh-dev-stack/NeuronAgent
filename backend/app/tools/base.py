from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class ToolResult:
    success: bool
    output: str
    error: str | None = None
    metadata: dict | None = None


class BaseTool(ABC):
    """
    Abstract base class for all NeuronAgent tools.

    Every tool must define:
      - name: machine-readable identifier
      - description: shown to the LLM to decide when to use this tool
      - parameters: JSON Schema for function calling
      - run(**kwargs) -> ToolResult
    """

    name: str
    description: str
    parameters: dict  # JSON Schema

    @property
    def schema(self) -> dict:
        """OpenAI function-calling format."""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }

    @abstractmethod
    async def run(self, **kwargs: Any) -> ToolResult:
        """Execute the tool and return a ToolResult."""
        ...
