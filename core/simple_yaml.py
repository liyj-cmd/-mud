from __future__ import annotations

from typing import Any


def safe_load(text: str) -> Any:
    lines = text.splitlines()
    index = 0

    def next_non_empty(idx: int) -> int:
        while idx < len(lines) and (not lines[idx].strip() or lines[idx].lstrip().startswith("#")):
            idx += 1
        return idx

    def indent_of(line: str) -> int:
        return len(line) - len(line.lstrip(" "))

    def parse_scalar(value: str) -> Any:
        value = value.strip()
        if value == "{}":
            return {}
        if value.startswith("\"") and value.endswith("\""):
            return value[1:-1]
        if value.startswith("'") and value.endswith("'"):
            return value[1:-1]
        if value.startswith("[") and value.endswith("]"):
            inner = value[1:-1].strip()
            if not inner:
                return []
            return [parse_scalar(part.strip()) for part in inner.split(",")]
        if value.isdigit() or (value.startswith("-") and value[1:].isdigit()):
            return int(value)
        try:
            return float(value)
        except ValueError:
            return value

    def parse_block(idx: int, indent: int) -> tuple[Any, int]:
        idx = next_non_empty(idx)
        if idx >= len(lines):
            return {}, idx
        line = lines[idx]
        current_indent = indent_of(line)
        if current_indent < indent:
            return {}, idx
        if line.strip().startswith("- "):
            return parse_list(idx, indent)
        return parse_mapping(idx, indent)

    def parse_list(idx: int, indent: int) -> tuple[list[Any], int]:
        items: list[Any] = []
        while idx < len(lines):
            idx = next_non_empty(idx)
            if idx >= len(lines):
                break
            line = lines[idx]
            current_indent = indent_of(line)
            if current_indent < indent or not line.strip().startswith("- "):
                break
            item_text = line.strip()[2:]
            if not item_text:
                item, idx = parse_block(idx + 1, indent + 2)
                items.append(item)
                continue
            if ":" in item_text:
                key, value_token = item_text.split(":", 1)
                key = key.strip()
                value_token = value_token.strip()
                item_dict: dict[str, Any] = {}
                if value_token == "|":
                    value, idx = parse_multiline(idx + 1, indent + 2)
                elif value_token == "":
                    value, idx = parse_block(idx + 1, indent + 2)
                else:
                    value = parse_scalar(value_token)
                    idx += 1
                item_dict[key] = value
                if idx < len(lines):
                    next_indent = indent_of(lines[idx])
                    if next_indent >= indent + 2:
                        extra, idx = parse_mapping(idx, indent + 2)
                        if isinstance(extra, dict):
                            item_dict.update(extra)
                items.append(item_dict)
                continue
            items.append(parse_scalar(item_text))
            idx += 1
        return items, idx

    def parse_multiline(idx: int, indent: int) -> tuple[str, int]:
        parts: list[str] = []
        while idx < len(lines):
            line = lines[idx]
            current_indent = indent_of(line)
            if current_indent < indent:
                break
            parts.append(line[indent:])
            idx += 1
        return "\n".join(parts).rstrip("\n"), idx

    def parse_mapping(idx: int, indent: int) -> tuple[dict[str, Any], int]:
        mapping: dict[str, Any] = {}
        while idx < len(lines):
            idx = next_non_empty(idx)
            if idx >= len(lines):
                break
            line = lines[idx]
            current_indent = indent_of(line)
            if current_indent < indent:
                break
            if line.strip().startswith("- "):
                break
            if ":" not in line:
                idx += 1
                continue
            key, value_token = line.strip().split(":", 1)
            value_token = value_token.strip()
            if value_token == "|":
                value, idx = parse_multiline(idx + 1, indent + 2)
            elif value_token == "":
                value, idx = parse_block(idx + 1, indent + 2)
            else:
                value = parse_scalar(value_token)
                idx += 1
            mapping[key] = value
        return mapping, idx

    data, _ = parse_block(index, 0)
    return data
