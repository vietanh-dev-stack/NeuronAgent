"""
Agent Orchestrator — the core of NeuronAgent.

Manages the full request lifecycle:
1. Build context (system prompt + long-term memory + short-term history)
2. Stream from LLM
3. Handle tool calls (dispatch → inject result → continue)
4. Persist messages
5. Yield SSE events to the API layer
"""
from __future__ import annotations

import json
import uuid
from typing import AsyncGenerator, TYPE_CHECKING

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.llm.client import llm_client
from app.llm.prompts import get_system_prompt
from app.memory.short_term import short_term_memory
from app.memory.long_term import long_term_memory
from app.tools.registry import registry
from app.models.session import Message

if TYPE_CHECKING:
    pass


class AgentOrchestrator:
    """
    Drives one agent turn: user message → LLM stream → tool execution → response.
    Yields SSE-compatible dicts for the API layer to forward to the client.
    """

    async def run(
        self,
        *,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
        user_message: str,
        mode: str,
        db: AsyncSession,
    ) -> AsyncGenerator[dict, None]:
        return self._run_stream(
            session_id=session_id,
            user_id=user_id,
            user_message=user_message,
            mode=mode,
            db=db,
        )

    async def _run_stream(
        self,
        *,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
        user_message: str,
        mode: str,
        db: AsyncSession,
    ) -> AsyncGenerator[dict, None]:
        sid = str(session_id)

        # ── 1. Add user message to short-term memory ──────────────────────────
        await short_term_memory.add(sid, "user", user_message)

        # ── 2. Load context ───────────────────────────────────────────────────
        lt_entries = await long_term_memory.get_recent(db, user_id, limit=settings.LONG_TERM_TOP_K)
        lt_context = long_term_memory.format_for_context(lt_entries)
        system_prompt = get_system_prompt(mode, lt_context)

        history = await short_term_memory.get(sid)

        messages = [{"role": "system", "content": system_prompt}] + history
        tool_schemas = registry.tool_schemas()

        # ── 3. Persist user message to DB ─────────────────────────────────────
        db.add(Message(
            session_id=session_id,
            role="user",
            content=user_message,
        ))
        await db.flush()

        # ── 4. Stream from LLM (tool-aware loop) ─────────────────────────────
        full_assistant_text = ""
        usage: dict = {}
        tool_calls_in_turn: list[dict] = []

        async for event in llm_client.stream(messages, tools=tool_schemas):
            etype = event["type"]

            if etype == "text_delta":
                full_assistant_text += event["content"]
                yield event

            elif etype == "tool_call":
                tool_calls_in_turn.append(event)
                yield event  # let frontend show tool invocation

            elif etype == "done":
                usage = event.get("usage", {})
                yield event

        # ── 5. Execute tool calls ─────────────────────────────────────────────
        if tool_calls_in_turn:
            # Add assistant turn with tool calls to messages for follow-up call
            follow_up_messages = list(messages)
            if full_assistant_text:
                follow_up_messages.append({"role": "assistant", "content": full_assistant_text})

            for tc in tool_calls_in_turn:
                tool_name = tc["tool"]
                tool_input = tc.get("input", {})
                tool_id = tc.get("id", "")

                tool = registry.get(tool_name)
                if tool:
                    result = await tool.run(**tool_input)
                    tool_output = result.output if result.success else f"Error: {result.error}"
                else:
                    tool_output = f"Tool '{tool_name}' not found."

                yield {"type": "tool_result", "tool": tool_name, "output": tool_output}

                # Persist tool call to DB
                db.add(Message(
                    session_id=session_id,
                    role="tool",
                    content=tool_output,
                    tool_name=tool_name,
                    tool_input=json.dumps(tool_input),
                    tool_output=tool_output,
                ))

                # Add tool result for follow-up LLM call
                follow_up_messages.append({
                    "role": "tool",
                    "tool_call_id": tool_id,
                    "content": tool_output,
                })

            # ── 6. Follow-up LLM call with tool results ───────────────────────
            follow_up_text = ""
            async for event in llm_client.stream(follow_up_messages):
                etype = event["type"]
                if etype == "text_delta":
                    follow_up_text += event["content"]
                    yield event
                elif etype == "done":
                    usage = event.get("usage", {})
                    yield event

            full_assistant_text = follow_up_text

        # ── 7. Persist assistant response ─────────────────────────────────────
        if full_assistant_text:
            await short_term_memory.add(sid, "assistant", full_assistant_text)
            db.add(Message(
                session_id=session_id,
                role="assistant",
                content=full_assistant_text,
                tokens_used=usage.get("output_tokens", 0),
            ))

        await db.flush()


orchestrator = AgentOrchestrator()
