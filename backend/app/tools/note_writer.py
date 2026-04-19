import json
from datetime import datetime
from pathlib import Path
from typing import Any

from app.tools.base import BaseTool, ToolResult

NOTES_DIR = Path("user_data/notes")


class NoteWriterTool(BaseTool):
    name = "note_writer"
    description = (
        "Saves or retrieves personal notes. "
        "Use this when users ask to save information, create notes, "
        "or recall something they asked you to remember."
    )
    parameters = {
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["save", "list", "read", "delete"],
                "description": "Operation to perform",
            },
            "title": {
                "type": "string",
                "description": "Note title (required for save/read/delete)",
            },
            "content": {
                "type": "string",
                "description": "Note content (required for save)",
            },
            "user_id": {
                "type": "string",
                "description": "User ID to scope notes",
            },
        },
        "required": ["action"],
    }

    def _notes_path(self, user_id: str) -> Path:
        path = NOTES_DIR / user_id
        path.mkdir(parents=True, exist_ok=True)
        return path

    async def run(
        self,
        action: str,
        title: str | None = None,
        content: str | None = None,
        user_id: str = "default",
        **kwargs: Any,
    ) -> ToolResult:
        notes_path = self._notes_path(user_id)

        if action == "save":
            if not title or not content:
                return ToolResult(success=False, output="", error="Title and content required for save.")
            note = {
                "title": title,
                "content": content,
                "created_at": datetime.now().isoformat(),
            }
            (notes_path / f"{title}.json").write_text(json.dumps(note, ensure_ascii=False, indent=2))
            return ToolResult(success=True, output=f"✅ Note '{title}' saved.")

        elif action == "list":
            files = list(notes_path.glob("*.json"))
            if not files:
                return ToolResult(success=True, output="No notes found.")
            titles = [f.stem for f in files]
            return ToolResult(success=True, output="📓 Your notes:\n" + "\n".join(f"- {t}" for t in titles))

        elif action == "read":
            if not title:
                return ToolResult(success=False, output="", error="Title required for read.")
            file = notes_path / f"{title}.json"
            if not file.exists():
                return ToolResult(success=False, output="", error=f"Note '{title}' not found.")
            note = json.loads(file.read_text())
            return ToolResult(success=True, output=f"## {note['title']}\n\n{note['content']}")

        elif action == "delete":
            if not title:
                return ToolResult(success=False, output="", error="Title required for delete.")
            file = notes_path / f"{title}.json"
            if file.exists():
                file.unlink()
                return ToolResult(success=True, output=f"🗑️ Note '{title}' deleted.")
            return ToolResult(success=False, output="", error=f"Note '{title}' not found.")

        return ToolResult(success=False, output="", error=f"Unknown action: {action}")
