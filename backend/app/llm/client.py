from typing import AsyncGenerator
from openai import AsyncOpenAI

from app.config import settings


class LLMClient:
    """
    Provider-agnostic LLM client.
    Currently wraps OpenAI's async client with streaming support.
    Swap out the underlying client to support other providers.
    """

    def __init__(self):
        self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self.temperature = settings.OPENAI_TEMPERATURE

    async def stream(
        self,
        messages: list[dict],
        tools: list[dict] | None = None,
    ) -> AsyncGenerator[dict, None]:
        """
        Yields SSE-ready event dicts:
          {"type": "text_delta",  "content": "..."}
          {"type": "tool_call",   "tool": "...", "input": {...}}
          {"type": "done",        "usage": {...}}
        """
        kwargs = dict(
            model=self.model,
            messages=messages,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            stream=True,
        )
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"

        tool_calls_buffer: dict[int, dict] = {}

        async with self._client.beta.chat.completions.stream(**kwargs) as stream:
            async for event in stream:
                # Text delta
                if event.type == "content.delta":
                    yield {"type": "text_delta", "content": event.delta}

                # Tool call chunks
                elif event.type == "chunk":
                    chunk = event.chunk
                    for choice in chunk.choices:
                        if choice.delta.tool_calls:
                            for tc in choice.delta.tool_calls:
                                idx = tc.index
                                if idx not in tool_calls_buffer:
                                    tool_calls_buffer[idx] = {
                                        "id": tc.id or "",
                                        "name": tc.function.name or "" if tc.function else "",
                                        "args_str": "",
                                    }
                                if tc.function and tc.function.arguments:
                                    tool_calls_buffer[idx]["args_str"] += tc.function.arguments

                # End of stream — emit accumulated tool calls
                elif event.type == "content.done":
                    pass

            # Emit tool calls after stream ends
            import json
            for tc in tool_calls_buffer.values():
                try:
                    args = json.loads(tc["args_str"]) if tc["args_str"] else {}
                except json.JSONDecodeError:
                    args = {"raw": tc["args_str"]}
                yield {"type": "tool_call", "tool": tc["name"], "input": args, "id": tc["id"]}

            final_usage = stream.get_final_completion()
            usage = {}
            if final_usage and final_usage.usage:
                usage = {
                    "input_tokens": final_usage.usage.prompt_tokens,
                    "output_tokens": final_usage.usage.completion_tokens,
                }
            yield {"type": "done", "usage": usage}

    async def complete(self, messages: list[dict], tools: list[dict] | None = None) -> dict:
        """Non-streaming completion for internal use."""
        kwargs = dict(
            model=self.model,
            messages=messages,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
        )
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"

        response = await self._client.chat.completions.create(**kwargs)
        return response


# Singleton
llm_client = LLMClient()
