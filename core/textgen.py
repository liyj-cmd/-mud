from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class StyleGuide:
    banned_words: list[str]

    @classmethod
    def from_markdown(cls, path: Path) -> "StyleGuide":
        text = path.read_text(encoding="utf-8")
        banned: list[str] = []
        capture = False
        for line in text.splitlines():
            if line.strip().startswith("## 禁用词"):
                capture = True
                continue
            if capture and line.strip().startswith("## "):
                break
            if capture and line.strip():
                banned.extend([word.strip() for word in line.split("、") if word.strip()])
        return cls(banned_words=banned)


class TextGenerator:
    def __init__(self, lexicon: dict[str, Any], rng: Any, style: StyleGuide, dev_mode: bool) -> None:
        self.lexicon = lexicon
        self.rng = rng
        self.style = style
        self.dev_mode = dev_mode

    def _choose(self, items: list[str]) -> str:
        return items[self.rng.randrange(len(items))]

    def _check_banned(self, text: str) -> str:
        if not self.style.banned_words:
            return text
        for word in self.style.banned_words:
            if word and word in text:
                if self.dev_mode:
                    return f"【警示】{text}"
        return text

    def render_movement(self, npc: str, direction_text: str) -> str:
        templates = self.lexicon["movement_templates"]
        template = self._choose(templates)
        return self._check_banned(template.format(npc=npc, direction_text=direction_text))

    def render_say(self, template_key: str, context: dict[str, str]) -> str:
        templates = self.lexicon["say_templates"][template_key]
        template = self._choose(templates)
        return self._check_banned(template.format(**context))

    def render_rumor(self, rumor_key: str, context: dict[str, str]) -> str:
        templates = self.lexicon["rumor_templates"][rumor_key]
        template = self._choose(templates)
        return self._check_banned(template.format(**context))
