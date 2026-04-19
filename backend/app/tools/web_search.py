import asyncio
from typing import Any

from app.tools.base import BaseTool, ToolResult


class WebSearchTool(BaseTool):
    name = "web_search"
    description = (
        "Searches the web for current information about a topic. "
        "Use this for questions about recent events, documentation, or "
        "any information that may not be in training data."
    )
    parameters = {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query",
            },
            "num_results": {
                "type": "integer",
                "description": "Number of results to return (1-5)",
                "default": 3,
            },
        },
        "required": ["query"],
    }

    async def run(self, query: str, num_results: int = 3, **kwargs: Any) -> ToolResult:
        try:
            # Uses DuckDuckGo via duckduckgo-search library (no API key needed)
            from duckduckgo_search import AsyncDDGS

            async with AsyncDDGS() as ddgs:
                results = await ddgs.atext(query, max_results=min(num_results, 5))

            if not results:
                return ToolResult(success=False, output="", error="No results found.")

            formatted = []
            for i, r in enumerate(results, 1):
                formatted.append(
                    f"**{i}. {r.get('title', 'No title')}**\n"
                    f"{r.get('body', 'No description')}\n"
                    f"Source: {r.get('href', '')}"
                )

            output = f"Search results for: **{query}**\n\n" + "\n\n---\n\n".join(formatted)
            return ToolResult(success=True, output=output)

        except ImportError:
            return ToolResult(
                success=False,
                output="",
                error="duckduckgo-search not installed. Run: pip install duckduckgo-search",
            )
        except Exception as e:
            return ToolResult(success=False, output="", error=f"Search failed: {e}")
